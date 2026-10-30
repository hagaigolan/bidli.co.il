// ── מכרזים שנצפו לאחרונה (נשמר במכשיר) ──
// מאפשר לחזור לפריט שהתעניינת בו, גם בלי להתחבר.
const KEY = "bidli_recently_viewed";
const MAX = 8;

export function getRecentlyViewed() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function recordRecentlyViewed(product) {
  if (!product?.id) return;
  const entry = {
    id: product.id,
    title: product.title || "",
    image_url: product.image_url || (product.image_urls?.[0] || ""),
    price: product.current_price || product.starting_price || 0,
    ends_at: product.ends_at || "",
  };
  const rest = getRecentlyViewed().filter((p) => p.id !== entry.id);
  try {
    localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)));
  } catch {}
}