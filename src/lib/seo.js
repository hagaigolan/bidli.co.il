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
  upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
}

export function setPageMeta({ title, description, image, noindex, jsonLd } = {}) {
  document.title = title || DEFAULT_TITLE;
  upsertMeta("name", "description", description || DEFAULT_DESCRIPTION);
  setRobotsMeta(!!noindex);

  const url = window.location.href;
  const ogTitle = title || DEFAULT_TITLE;
  const ogDesc = description || DEFAULT_DESCRIPTION;
  const ogImage = image || DEFAULT_OG_IMAGE;

  upsertMeta("property", "og:title", ogTitle);
  upsertMeta("property", "og:description", ogDesc);
  upsertMeta("property", "og:image", ogImage);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "bidli");
  upsertMeta("property", "og:locale", "he_IL");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", ogTitle);
  upsertMeta("name", "twitter:description", ogDesc);
  upsertMeta("name", "twitter:image", ogImage);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", url);

  document.head.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
  if (jsonLd) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-jsonld", "true");
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}