// WhatsApp Cloud API (Meta) helpers — שליחת הודעות וואצאפ מהשרת
import { secrets } from "base44:runtime";

const GRAPH_VERSION = "v23.0";

// נרמול מספר טלפון ישראלי לפורמט בינלאומי ללא "+"
export function normalizeWhatsappPhone(raw) {
  if (!raw) return "";
  let digits = String(raw).replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("9720")) digits = "972" + digits.slice(4);
  else if (digits.startsWith("0")) digits = "972" + digits.slice(1);
  return digits;
}

// שליחת הודעת טקסט בוואצאפ. מחזיר { ok, error?, messageId? } — לעולם לא זורק.
export async function sendWhatsAppText(to, body) {
  const phoneNumberId = secrets.get("WHATSAPP_PHONE_NUMBER_ID");
  const token = secrets.get("WHATSAPP_ACCESS_TOKEN");
  if (!phoneNumberId || !token) {
    return { ok: false, error: "missing WhatsApp credentials" };
  }
  const target = normalizeWhatsappPhone(to);
  if (!target) return { ok: false, error: "invalid phone number" };
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: target,
        type: "text",
        text: { body },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (data && data.error && data.error.message) || `HTTP ${res.status}` };
    }
    return { ok: true, messageId: data?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}