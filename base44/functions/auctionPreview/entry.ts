import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

const SITE = "https://bidli.co.il";
const DEFAULT_IMAGE =
  "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c6330b626_res_cloudinary_com_portal_AuctionHouse_54dd1a37e4b02fd6852a9470_hallPicture_bd51fb3c.jpg";

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const absolute = (value: unknown): string => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  if (/^https?:\/\//.test(raw)) return raw;
  return `${SITE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

// תצוגה מקדימה לשיתוף מכרז: HTML מינימלי עם תגי OG/Twitter/product מהנתונים החיים,
// והפנייה לדף המכרז האמיתי בדפדפן אנושי. סורקי רשתות חברתיות לא מריצים JS ולכן קוראים את התגים מכאן.
export default async function (req: Request): Promise<Response> {
  try {
    const id = new URL(req.url).searchParams.get("id")?.trim();
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const product = await base44.asServiceRole.entities.Product.get(id).catch((e: any) =>
      e?.status === 404 ? null : Promise.reject(e)
    );
    if (!product) return Response.json({ error: "Not found" }, { status: 404 });

    const currentPrice = Number(product.current_price) || 0;
    const startingPrice = Number(product.starting_price) || 0;
    const price = currentPrice > 0 ? currentPrice : startingPrice;
    const canonical = `${SITE}/auction/${product.id}`;
    const image = absolute(
      [...(Array.isArray(product.image_urls) ? product.image_urls : []), product.image_url].find(Boolean)
    ) || DEFAULT_IMAGE;
    // "הצעה נוכחית" רק כשיש הצעות בפועל — אחרת מחיר הפתיחה, גם אם current_price כבר מוגדר
    const hasBids = Number(product.bid_count) > 0;
    const priceLabel = hasBids
      ? `הצעה נוכחית: ₪${(currentPrice > 0 ? currentPrice : startingPrice).toLocaleString("he-IL")}`
      : startingPrice > 0
        ? `מחיר פתיחה: ₪${startingPrice.toLocaleString("he-IL")}`
        : "";
    const description = [priceLabel, "מכרז 24 שעות בבידלי", product.category]
      .filter(Boolean)
      .join(" | ");
    const title = String(product.title || "מכרז בבידלי");
    const priceTags = price > 0
      ? `<meta property="product:price:amount" content="${esc(price)}" />
    <meta property="product:price:currency" content="ILS" />`
      : "";

    const html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(canonical)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(image)}" />
    <meta property="og:url" content="${esc(canonical)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="bidli" />
    <meta property="og:locale" content="he_IL" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(image)}" />
    ${priceTags}
    <meta http-equiv="refresh" content="0; url=${esc(canonical)}" />
    <script>window.location.replace(${JSON.stringify(canonical)});</script>
  </head>
  <body style="font-family:system-ui,sans-serif;direction:rtl;padding:24px">
    <h1>${esc(title)}</h1>
    <p>${esc(description)}</p>
    <p><a href="${esc(canonical)}">לעמוד המכרז בבידלי</a></p>
  </body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}