// ── מנהל מטא-תגיות SEO/GEO לכל עמוד ──
// כותרת, תיאור, Open Graph, Twitter, canonical, robots ו-JSON-LD (נתונים מובנים)

export const DEFAULT_TITLE = "bidli — מכרזים אונליין בישראל | אמנות, תכשיטים, אספנות ועתיקות";
export const DEFAULT_DESCRIPTION = "bidli — פורטל המכרזים המוביל בישראל. מכרזים חיים של אמנות, יודאיקה, תכשיטים, שעונים, מטבעות ובולים — הצע מחיר בזמן אמת, מכרזים נסגרים תוך 24 שעות, ללא עמלות נסתרות.";
export const DEFAULT_OG_IMAGE = "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c6330b626_res_cloudinary_com_portal_AuctionHouse_54dd1a37e4b02fd6852a9470_hallPicture_bd51fb3c.jpg";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function setRobotsMeta(noindex) {
  upsertMeta("name", "robots", noindex ? "noindex, follow" : "index, follow");
}

function removeMeta(attr, key) {
  document.head.querySelectorAll(`meta[${attr}="${key}"]`).forEach(el => el.remove());
}

// ogTitle/ogDescription/ogType/product/url — מאפשרים תגי שיתוף ייעודיים לעמוד (למשל מכרז),
// ותגי product:* מוסרים אוטומטית כשעוברים לעמוד שאין בו מחיר אמיתי.
export function setPageMeta({ title, description, image, noindex, keywords, jsonLd, ogTitle, ogDescription, ogType, product, url } = {}) {
  document.title = title || DEFAULT_TITLE;
  upsertMeta("name", "description", description || DEFAULT_DESCRIPTION);
  if (keywords && Array.isArray(keywords)) upsertMeta("name", "keywords", keywords.filter(Boolean).join(", "));
  setRobotsMeta(!!noindex);

  const pageUrl = url || window.location.href;
  const shareTitle = ogTitle || title || DEFAULT_TITLE;
  const shareDesc = ogDescription || description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_OG_IMAGE;

  upsertMeta("property", "og:title", shareTitle);
  upsertMeta("property", "og:description", shareDesc);
  upsertMeta("property", "og:image", ogImage);
  upsertMeta("property", "og:url", pageUrl);
  upsertMeta("property", "og:type", ogType || "website");
  upsertMeta("property", "og:site_name", "bidli");
  upsertMeta("property", "og:locale", "he_IL");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", shareTitle);
  upsertMeta("name", "twitter:description", shareDesc);
  upsertMeta("name", "twitter:image", ogImage);

  // product:price — מספר בלבד, ורק כשיש מחיר אמיתי על הפריט
  const priceAmount = Number(product?.price);
  if (priceAmount > 0) {
    upsertMeta("property", "product:price:amount", String(priceAmount));
    upsertMeta("property", "product:price:currency", product?.currency || "ILS");
  } else {
    removeMeta("property", "product:price:amount");
    removeMeta("property", "product:price:currency");
  }

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", pageUrl);

  setPageJsonLd(jsonLd);
}

// מעדכן אך ורק נתונים מובנים (JSON-LD) בלי לגעת בשאר המטא-תגיות —
// שימושי בעמודים שבהם הרשימה מגיעה אחרי טעינת הנתונים
export function setPageJsonLd(jsonLd) {
  document.head.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
  if (!jsonLd) return;
  // מקבל גרף אחד או מערך של גרפים — כל אחד נכתב כבלוק JSON-LD נפרד
  const graphs = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
  graphs.forEach(graph => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(graph);
    document.head.appendChild(script);
  });
}