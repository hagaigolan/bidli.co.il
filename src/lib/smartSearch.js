// ── חיפוש מילות מפתח חכם (ללא AI) ──
// מפצל ביטוי חופשי לטוקנים, מזהה סינון "עד N" ועיר מתוך רשימת הערים,
// ומדרג תוצאות: התאמה בכותרת שווה יותר מהתאמה בתיאור, ויותר מילים = דירוג גבוה יותר.
import { CITY_COORDS } from "./cityCoords";

const norm = (v) =>
  String(v || "")
    .toLowerCase()
    .replace(/["'״׳]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const CITY_NAMES = Object.keys(CITY_COORDS).sort((a, b) => b.length - a.length);

const STOPWORDS = new Set([
  "של", "את", "עם", "על", "או", "גם", "זה", "זו", "כל", "אל", "לא", "כן",
  "יש", "אין", "מאוד", "אשר", "הוא", "היא", "עוד",
]);

export function parseQuery(raw) {
  let rest = norm(raw);
  let maxPrice = null;

  // "עד 3000" / "עד ₪3,000"
  const priceMatch = rest.match(/עד\s*₪?\s*([\d,.]{1,9})/);
  if (priceMatch) {
    const num = Number(priceMatch[1].replace(/[,.]/g, ""));
    if (Number.isFinite(num) && num > 0) maxPrice = num;
    rest = rest.replace(priceMatch[0], " ");
  }

  // עיר מתוך רשימת הערים המוכרות
  let city = "";
  for (const name of CITY_NAMES) {
    const n = norm(name);
    if (n && rest.includes(n)) {
      city = name;
      rest = rest.replace(n, " ");
      break;
    }
  }

  const tokens = rest
    .split(/[\s,.\-/|()]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

  return { tokens, maxPrice, city, text: rest.trim() };
}

export function searchProducts(products = [], raw = "") {
  const { tokens, maxPrice, city } = parseQuery(raw);
  if (!tokens.length && !maxPrice && !city) return [];
  const cityNorm = norm(city);
  const scored = [];

  products.forEach((p) => {
    if (maxPrice) {
      const price = Number(p.current_price || p.starting_price || 0);
      if (price > maxPrice) return;
    }
    if (cityNorm && !norm(p.location).includes(cityNorm)) return;

    let matched = 0;
    let score = 0;
    if (tokens.length) {
      const title = norm(p.title);
      const desc = norm(p.description);
      const cat = `${norm(p.category)} ${norm(p.subcategory)}`;
      tokens.forEach((t) => {
        let hit = 0;
        if (title.includes(t)) hit += 3;
        if (cat.includes(t)) hit += 2;
        if (desc.includes(t)) hit += 1;
        if (hit) {
          matched += 1;
          score += hit;
        }
      });
      if (!matched) return;
    }

    scored.push({ product: p, matched, score });
  });

  scored.sort((a, b) => b.matched - a.matched || b.score - a.score);
  return scored.map((s) => s.product);
}

// הצעות השלמה אוטומטית מתוך נתוני המודעות האמיתיים: קטגוריות, ערים ומונחים/מותגים
export function buildSuggestions(query, products = []) {
  const term = norm(query);
  const empty = { categories: [], cities: [], terms: [] };
  if (term.length < 2) return empty;

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]
    .filter((c) => norm(c).includes(term))
    .slice(0, 4);

  const cityPool = new Set();
  products.forEach((p) => {
    const loc = norm(p.location);
    if (!loc) return;
    CITY_NAMES.forEach((c) => {
      if (loc.includes(norm(c))) cityPool.add(c);
    });
  });
  const cities = [...cityPool]
    .filter((c) => norm(c).includes(term) && norm(c) !== term)
    .sort((a, b) => a.localeCompare(b, "he"))
    .slice(0, 4);

  const freq = new Map();
  products.forEach((p) => {
    `${p.title || ""} ${p.subcategory || ""}`
      .split(/[\s,.\-/|()]+/)
      .forEach((w) => {
        const clean = w.replace(/["'״׳:;!?]/g, "").trim();
        if (clean.length < 3) return;
        if (STOPWORDS.has(clean.toLowerCase())) return;
        if (!/^[A-Za-z\u0590-\u05FF]/.test(clean)) return;
        freq.set(clean, (freq.get(clean) || 0) + 1);
      });
  });
  const terms = [...freq.entries()]
    .filter(([w]) => norm(w).includes(term) && norm(w) !== term)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "he"))
    .slice(0, 6)
    .map(([w]) => w);

  return { categories, cities, terms };
}