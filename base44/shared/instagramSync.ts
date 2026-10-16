// פרסום גלריית מכרז כקרוסלה בחשבון האינסטגרם העסקי — חיבור משותף (shared connector)
// Instagram Graph API בלבד (graph.instagram.com) — access_token כפרמטר URL, לא בכותרת Authorization

const IG_API = "https://graph.instagram.com/v23.0";
const sleep = (ms: number) => new Promise((r: any) => setTimeout(r, ms));

export async function postProductToInstagram(base44: any, product: any): Promise<{ ok: boolean; post_id?: string; error?: string }> {
  let accessToken = "";
  try {
    const conn = await base44.asServiceRole.connectors.getConnection("instagram");
    accessToken = conn?.accessToken || "";
  } catch {
    return { ok: false, error: "אין חיבור לאינסטגרם" };
  }
  if (!accessToken) return { ok: false, error: "אין חיבור לאינסטגרם" };

  // התמונות — עד 10 לקרוסלה
  const images = [...(Array.isArray(product.image_urls) ? product.image_urls : []), product.image_url]
    .filter((u: any) => typeof u === "string" && u.startsWith("http"))
    .slice(0, 10);
  if (!images.length) return { ok: false, error: "אין תמונות לפרסום" };

  const token = `access_token=${encodeURIComponent(accessToken)}`;
  const call = async (path: string, params: Record<string, string>, method = "GET") => {
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const res = await fetch(`${IG_API}${path}?${qs}&${token}`, { method, signal: AbortSignal.timeout(30000) });
    return res.json().catch(() => ({}));
  };

  // זיהוי חשבון האינסטגרם
  const me = await call("/me", { fields: "id,username" });
  if (!me?.id) return { ok: false, error: me?.error?.message || "זיהוי חשבון האינסטגרם נכשל" };

  // כתובית הפוסט
  const price = product.starting_price || 0;
  const caption = [
    String(product.title || "").slice(0, 200),
    `מכרז חי ב-bidli — פתיחה ב-₪${price.toLocaleString("he-IL")}`,
    product.location ? `מיקום: ${product.location}` : "",
    "#bidli #מכרז #אספנות",
  ].filter(Boolean).join("\n");

  let creationId = "";
  if (images.length === 1) {
    const single = await call(`/${me.id}/media`, { image_url: images[0], caption }, "POST");
    if (!single?.id) return { ok: false, error: single?.error?.message || "יצירת הפוסט נכשלה" };
    creationId = single.id;
  } else {
    // קונטיינרים של התמונות — במקביל
    const children = await Promise.all(images.map(async (url: string) => {
      const c = await call(`/${me.id}/media`, { image_url: url, is_carousel_item: "true" }, "POST");
      return c?.id || null;
    }));
    const childIds = children.filter(Boolean);
    if (childIds.length < 2) return { ok: false, error: "הקרוסלה דורשת לפחות 2 תמונות" };
    const carousel = await call(`/${me.id}/media`, { media_type: "CAROUSEL", children: childIds.join(","), caption }, "POST");
    if (!carousel?.id) return { ok: false, error: carousel?.error?.message || "יצירת הקרוסלה נכשלה" };
    creationId = carousel.id;
  }

  // המתנה לעיבוד הקונטיינר לפני הפרסום
  for (let i = 0; i < 5; i++) {
    const st = await call(`/${creationId}`, { fields: "status_code" });
    if (st?.status_code === "FINISHED") break;
    if (st?.status_code === "ERROR") return { ok: false, error: st?.status || "עיבוד התמונות נכשל" };
    await sleep(1500);
  }

  const published = await call(`/${me.id}/media_publish`, { creation_id: creationId }, "POST");
  if (!published?.id) return { ok: false, error: published?.error?.message || "הפרסום נכשל" };
  return { ok: true, post_id: published.id };
}