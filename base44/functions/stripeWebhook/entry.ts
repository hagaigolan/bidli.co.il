import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { ensureEscrowFrozen } from '../../shared/stripe.ts';

// Stripe webhook endpoint. Verifies the signature, then:
//  - payment_intent.requires_capture → card authorized at winning → freeze escrow
//  - payment_intent.payment_failed    → record the error on the product
async function verifySignature(body: string, sig: string, secret: string): Promise<any | null> {
  const parts: Record<string, string> = {};
  for (const chunk of sig.split(',')) {
    const [k, v] = chunk.split('=');
    if (k && v) parts[k.trim()] = v.trim();
  }
  const ts = parts.t;
  const v1 = parts.v1;
  if (!ts || !v1) return null;
  // טריות חתימה כמו ב-SDK הרשמי של Stripe — חתימה בת יותר מ-5 דקות נדחית,
  // כך שלא ניתן לשחזר (replay) בקשת webhook תקיפה שנחטפה בדרך
  if (!Number.isFinite(Number(ts)) || Date.now() - Number(ts) * 1000 > 5 * 60 * 1000) {
    return null;
  }
  const payload = `${ts}.${body}`;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  // השוואה בזמן קבוע — לא ניתן להסיק את החתימה מזמן ההשוואה
  if (hex.length !== v1.length) return null;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  if (diff !== 0) return null;
  return JSON.parse(body);
}

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature') || '';
    const secret = secrets.get('STRIPE_WEBHOOK_SECRET');
    if (!secret) return Response.json({ error: 'webhook secret not set' }, { status: 500 });

    const event = await verifySignature(body, sig, secret);
    if (!event) return Response.json({ error: 'invalid signature' }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const data = event.data?.object;

    if (event.type === 'payment_intent.requires_capture') {
      const productId = data?.metadata?.product_id;
      if (productId) await ensureEscrowFrozen(base44, productId, data);
    } else if (event.type === 'payment_intent.payment_failed') {
      const productId = data?.metadata?.product_id;
      if (productId) {
        const msg = data?.last_payment_error?.message || 'payment failed';
        await base44.asServiceRole.entities.Product.update(productId, { payment_error: msg });
      }
    }

    return Response.json({ received: true, type: event.type });
  } catch (error) {
    console.error('stripeWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}