export const SITE_URL = "https://bidli.co.il";

export type SitemapEntry = {
  path: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

// עמודים ציבוריים סטטיים. התאריך הוא תאריך השינוי האמיתי של קובץ העמוד (git).
export const STATIC_PAGES: SitemapEntry[] = [
  { path: "/", lastmod: "2026-11-14", changefreq: "daily", priority: "1.0" },
  { path: "/auctions", lastmod: "2026-11-18", changefreq: "hourly", priority: "0.9" },
  { path: "/what-is-bidli", lastmod: "2026-11-18", changefreq: "monthly", priority: "0.8" },
  { path: "/how-much-is-it-worth", lastmod: "2026-11-18", changefreq: "monthly", priority: "0.8" },
  { path: "/bidli-vs-yad2-ebay", lastmod: "2026-11-18", changefreq: "monthly", priority: "0.8" },
  { path: "/articles", lastmod: "2026-11-18", changefreq: "daily", priority: "0.8" },
  { path: "/about", lastmod: "2026-11-18", changefreq: "monthly", priority: "0.6" },
  { path: "/valuation", lastmod: "2026-10-31", changefreq: "monthly", priority: "0.7" },
  { path: "/last-minute", lastmod: "2026-11-12", changefreq: "daily", priority: "0.7" },
  { path: "/experts", lastmod: "2026-10-31", changefreq: "monthly", priority: "0.6" },
  { path: "/barter", lastmod: "2026-10-31", changefreq: "weekly", priority: "0.6" },
  { path: "/contact", lastmod: "2026-10-31", changefreq: "yearly", priority: "0.5" },
  { path: "/stocks", lastmod: "2026-10-02", changefreq: "weekly", priority: "0.5" },
  { path: "/shop-support", lastmod: "2026-09-20", changefreq: "monthly", priority: "0.4" },
  { path: "/terms", lastmod: "2026-10-17", changefreq: "yearly", priority: "0.3" },
];

// הקטגוריות שמוגדרות בפועל בעמוד הקטגוריה (src/pages/Category.jsx)
export const CATEGORY_NAMES: string[] = [
  "אמנות",
  "יודאיקה",
  "אספנות",
  "נומיסמטיקה",
  "מטבעות",
  "בולים",
  "תכשיטים",
  "שעונים",
  "עיצוב הבית",
  "אופנה",
  "ספרים",
  "כלי נגינה",
  "יין ואלכוהול",
  "אלקטרוניקה",
  "רכבים",
  'נדל"ן',
];

// תאריך השינוי האחרון של תבנית עמוד הקטגוריה
const CATEGORY_PAGE_LASTMOD = "2026-11-18";

// מאמרי המדור שנשמרים בקוד (src/pages/ArticlesData.jsx + articles-extra-*). תאריך הפרסום שלהם.
export const STATIC_ARTICLES: { id: string; date: string }[] = [
  { id: "auction-guide", date: "2026-06-15" },
  { id: "art-collecting-guide", date: "2026-06-10" },
  { id: "spot-fakes", date: "2026-06-05" },
  { id: "investment-guide", date: "2026-05-28" },
  { id: "vintage-furniture", date: "2026-05-20" },
  { id: "coins-guide", date: "2026-05-15" },
  { id: "jewelry-authentication", date: "2026-05-10" },
  { id: "stamps-collecting", date: "2026-05-05" },
  { id: "wine-collecting", date: "2026-04-28" },
  { id: "watch-collecting", date: "2026-04-20" },
  { id: "auctions-israel-guide", date: "2026-11-13" },
  { id: "online-auctions-rules", date: "2026-11-12" },
  { id: "public-auction-backstage", date: "2026-11-11" },
  { id: "choosing-auction-site", date: "2026-11-10" },
  { id: "product-sales-auction-channel", date: "2026-11-09" },
  { id: "second-hand-selling-price", date: "2026-11-08" },
  { id: "selling-at-auction-checklist", date: "2026-11-07" },
  { id: "smart-second-hand-buying", date: "2026-11-06" },
  { id: "bidding-ceiling-strategy", date: "2026-11-05" },
  { id: "best-auction-products", date: "2026-11-04" },
  { id: "second-hand-bargains", date: "2026-11-03" },
  { id: "electronics-auctions", date: "2026-11-02" },
  { id: "furniture-auctions", date: "2026-11-01" },
  { id: "wine-auctions", date: "2026-10-30" },
  { id: "watch-auctions", date: "2026-10-29" },
  { id: "jewelry-auctions", date: "2026-10-28" },
  { id: "fashion-auctions", date: "2026-10-27" },
  { id: "24-hour-auction", date: "2026-10-26" },
  { id: "how-to-sell-at-auction", date: "2026-10-25" },
  { id: "auction-house-vs-site", date: "2026-10-24" },
  { id: "car-auctions-selling", date: "2026-11-14" },
  { id: "real-estate-auction-guide", date: "2026-11-14" },
  { id: "selling-jewelry-second-hand", date: "2026-11-13" },
  { id: "selling-luxury-watches", date: "2026-11-13" },
  { id: "selling-designer-bags", date: "2026-11-12" },
  { id: "selling-art-online", date: "2026-11-12" },
  { id: "israeli-artists-selling", date: "2026-11-11" },
  { id: "selling-antiques-judaica", date: "2026-11-11" },
  { id: "selling-silverware", date: "2026-11-10" },
  { id: "selling-carpets-textiles", date: "2026-11-10" },
  { id: "selling-furniture-second-hand", date: "2026-11-09" },
  { id: "selling-rare-books", date: "2026-11-09" },
  { id: "selling-musical-instruments", date: "2026-11-08" },
  { id: "selling-stamp-collection", date: "2026-11-08" },
  { id: "selling-coin-collection", date: "2026-11-07" },
  { id: "selling-used-phone", date: "2026-11-07" },
  { id: "selling-sports-equipment", date: "2026-11-06" },
  { id: "selling-collectible-toys", date: "2026-11-06" },
  { id: "selling-whole-collection", date: "2026-11-05" },
  { id: "auction-glossary", date: "2026-11-05" },
];

const encodeUrl = (path: string): string =>
  SITE_URL + path.split("/").map((seg, i) => (i === 0 ? seg : encodeURIComponent(seg))).join("/");

const day = (value: unknown): string | null => {
  const raw = typeof value === "string" ? value : "";
  return raw ? raw.slice(0, 10) : null;
};

const urlRow = (path: string, lastmod: string, changefreq: string, priority: string): string =>
  `  <url><loc>${encodeUrl(path)}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

export type LiveSitemapInput = {
  auctions: { id: string; updated_date?: string }[];
  articles: { id: string; published_date?: string; updated_date?: string }[];
};

/** בונה sitemap.xml מתוך הנתונים החיים: מכרזים פעילים ומאמרים מפורסמים. */
export function buildSitemapXml({ auctions, articles }: LiveSitemapInput): string {
  const rows: string[] = [];

  for (const page of STATIC_PAGES) {
    rows.push(urlRow(page.path, page.lastmod, page.changefreq, page.priority));
  }

  for (const name of CATEGORY_NAMES) {
    rows.push(urlRow(`/category/${name}`, CATEGORY_PAGE_LASTMOD, "daily", "0.7"));
  }

  for (const auction of auctions) {
    const lastmod = day(auction.updated_date);
    if (!auction.id || !lastmod) continue;
    rows.push(urlRow(`/auction/${auction.id}`, lastmod, "daily", "0.9"));
  }

  for (const article of STATIC_ARTICLES) {
    rows.push(urlRow(`/articles/${article.id}`, article.date, "monthly", "0.6"));
  }

  for (const article of articles) {
    const lastmod = day(article.published_date) || day(article.updated_date);
    if (!article.id || !lastmod) continue;
    rows.push(urlRow(`/articles/${article.id}`, lastmod, "monthly", "0.6"));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}