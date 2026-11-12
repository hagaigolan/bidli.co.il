// פרסום מנת מכרזי ההדגמה היומית לחשבון האינסטגרם העסקי (shared connector).
// פוסט אחד ליום עם כל החלונות של אותו יום — קישור לעמוד, והבהרה שהתוכן הוא
// פרסומת לדוגמה. Instagram Graph API בלבד (graph.instagram.com).

const IG_API = "https://graph.instagram.com/v23.0";
const SITE = "https://bidli.co.il";
const sleep = (ms: number) => new Promise((r: any) => setTimeout(r, ms));

function slotLabel(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem", weekday: "short", day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function buildDemoBatchCaption(deals: any[]): string {
  const lines = deals.map((d) => {
    const list = Number(d.list_price || 0).toLocaleString("he-IL");
    const floor = Number(d.floor_price || 0).toLocaleString("he-IL");
    const when = slotLabel(d.slot_start);
    return `• ${d.title} · ${d.business_name}${d.city ? ` (${d.city})` : ""}\n  מחירון ₪${list} — המחיר יורד עד ₪${floor}${when ? ` · ${when}` : ""}`;
  });

  return [
    "פרסומת לדוגמה — כך נראים החלונות של ברגע האחרון ב-bidli ⚡",
    "המחיר מתחיל במחירון ויורד כל שעה, עד שמישהו תופס את החלון:",
    "",
    ...lines,
    "",
    `כל החלונות הפתוחים: ${SITE}/last-minute`,
    "#bidli #ברגע_האחרון #מכרז_הפוך #דילים",
  ].join("\n");
}

export async function postDemoBatchToInstagram(base44: any, deals: any[]): Promise<{ ok: boolean; post_id?: string; error?: string }> {
  if (!Array.isArray(deals) || !deals.length) return { ok: false, error: "אין מכרזים לפרסום" };

  let accessToken = "";
  try {
    const conn = await base44.asServiceRole.connectors.getConnection("instagram");
    accessToken = conn?.accessToken || "";
  } catch {
    return { ok: false, error: "אין חיבור לאינסטגרם" };
  }
  if (!accessToken) return { ok: false, error: "אין חיבור לאינסטגרם" };

  // תמונת קאבר — בלי טקסט בתמונה כדי שלא ייווצרו שגיאות כתיב
  let imageUrl = "";
  try {
    const img = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: "Social media cover for a last-minute deals marketplace: an elegant golden hourglass next to a small calendar and a key on a soft surface, warm orange to deep blue gradient background, premium editorial product photography, soft studio light, no text, no letters, no logos, square crop.",
    });
    imageUrl = img?.url || "";
  } catch (e: any) {
    return { ok: false, error: e?.message || "יצירת התמונה נכשלה" };
  }
  if (!imageUrl) return { ok: false, error: "יצירת התמונה נכשלה" };

  const token = `access_token=${encodeURIComponent(accessToken)}`;
  const call = async (path: string, params: Record<string, string>, method = "GET") => {
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const res = await fetch(`${IG_API}${path}?${qs}&${token}`, { method, signal: AbortSignal.timeout(30000) });
    return res.json().catch(() => ({}));
  };

  const me = await call("/me", { fields: "id,username" });
  if (!me?.id) return { ok: false, error: me?.error?.message || "זיהוי חשבון האינסטגרם נכשל" };

  const caption = buildDemoBatchCaption(deals).slice(0, 2100);
  const container = await call(`/${me.id}/media`, { image_url: imageUrl, caption }, "POST");
  if (!container?.id) return { ok: false, error: container?.error?.message || "יצירת הפוסט נכשלה" };

  for (let i = 0; i < 6; i++) {
    const st = await call(`/${container.id}`, { fields: "status_code" });
    if (st?.status_code === "FINISHED") break;
    if (st?.status_code === "ERROR") return { ok: false, error: st?.status || "עיבוד התמונה נכשל" };
    await sleep(1500);
  }

  const published = await call(`/${me.id}/media_publish`, { creation_id: container.id }, "POST");
  if (!published?.id) return { ok: false, error: published?.error?.message || "הפרסום נכשל" };
  return { ok: true, post_id: published.id };
}