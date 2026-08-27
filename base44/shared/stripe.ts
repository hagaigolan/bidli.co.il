import { secrets } from "base44:runtime";

const STRIPE_VERSION = "2025-10-29.clover";
const API = "https://api.stripe.com/v1";

export function stripePublishableKey(): string {
  return secrets.get("STRIPE_PUBLISHABLE_KEY") || "";
}

export function appMetadata(productId: string): Record<string, string> {
  return { base44_app_id: secrets.get("BASE44_APP_ID") || "", product_id: productId };
}

export function toMinorUnits(amount: number): number {
  return Math.round((Number(amount) || 0) * 100);
}

export async function stripeRequest(
  method: string,
  path: string,
  params?: URLSearchParams,
  idempotencyKey?: string
): Promise<any> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
    "Stripe-Version": STRIPE_VERSION,
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const init: RequestInit = { method, headers };
  let url = `${API}${path}`;
  if (params) {
    if (method === "POST") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      init.body = params.toString();
    } else {
      url += `?${params.toString()}`;
    }
  }
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Stripe ${path} failed (${res.status})`);
  }
  return data;
}

export async function getOrCreateCustomer(email: string, name?: string): Promise<string> {
  const search = new URLSearchParams();
  search.set("query", `email:'${email.replace(/'/g, "\\'")}'`);
  const found = await stripeRequest("GET", "/customers/search", search);
  if (found.data && found.data.length) return found.data[0].id;
  const create = new URLSearchParams();
  create.set("email", email);
  if (name) create.set("name", name);
  const cust = await stripeRequest("POST", "/customers", create, crypto.randomUUID());
  return cust.id;
}

// Create/retrieve the frozen Escrow record once a payment is authorized (requires_capture).
export async function ensureEscrowFrozen(base44: any, productId: string, pi: any): Promise<void> {
  const items = await base44.asServiceRole.entities.Product.filter({ id: productId });
  if (!items.length) return;
  const product = items[0];
  const now = new Date();
  const releaseAfter = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const escrows = await base44.asServiceRole.entities.Escrow.filter({ product_id: productId });
  if (!escrows.length) {
    await base44.asServiceRole.entities.Escrow.create({
      product_id: productId,
      product_title: product.title,
      buyer_name: product.highest_bidder || "",
      buyer_email: product.highest_bidder_email || "",
      seller_name: product.seller_name || "",
      seller_email: product.seller_email || "",
      amount: product.current_price || product.starting_price || 0,
      status: "frozen",
      paid_at: now.toISOString(),
      release_after: releaseAfter,
    });
  }

  await base44.asServiceRole.entities.Product.update(productId, {
    status: "escrow",
    payment_status: "frozen",
    stripe_payment_intent_id: pi.id,
    card_registered: true,
    payment_error: "",
  });

  try {
    if (product.highest_bidder_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: product.highest_bidder_email,
        subject: `✅ תשלום אושר עבור ${product.title}`,
        body: `שלום ${product.highest_bidder},\n\nהתשלום עבור "${product.title}" בסך ₪${(product.current_price || 0).toLocaleString()} אושר ומוחזק באסקרו.\nהכסף יועבר למוכר תוך 3 ימים או לאחר שתאשר/י קבלת המוצר באזור האישי.\n\nצוות bid-it`,
      });
    }
    if (product.seller_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: product.seller_email,
        subject: `💰 תשלום התקבל עבור ${product.title}`,
        body: `שלום ${product.seller_name || ""},\n\nהקונה שילם עבור "${product.title}" בסך ₪${(product.current_price || 0).toLocaleString()}.\nהכסף מוחזק באסקרו ויועבר אליך תוך 3 ימים או לאחר שהקונה יאשר קבלת המוצר.\nיש לשלוח את המוצר בהקדם.\n\nצוות bid-it`,
      });
    }
  } catch {}
}

// Capture an authorized payment (if not yet captured) and mark escrow + product as released.
export async function captureAndRelease(base44: any, product: any, resolvedBy = "auto"): Promise<void> {
  const piId = product.stripe_payment_intent_id;
  if (piId) {
    const pi = await stripeRequest("GET", `/payment_intents/${piId}`);
    if (pi.status === "requires_capture") {
      await stripeRequest("POST", `/payment_intents/${piId}/capture`, new URLSearchParams(), crypto.randomUUID());
    }
  }
  const now = new Date().toISOString();
  const escrows = await base44.asServiceRole.entities.Escrow.filter({ product_id: product.id });
  if (escrows.length) {
    await base44.asServiceRole.entities.Escrow.update(escrows[0].id, {
      status: "released",
      released_at: now,
      resolved_by: resolvedBy,
    });
  }
  await base44.asServiceRole.entities.Product.update(product.id, {
    status: "released",
    payment_status: "released",
    delivered_at: now,
  });
}