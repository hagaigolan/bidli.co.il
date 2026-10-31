// ── היסטוריית חיפושים אישית (נשמר במכשיר) ──
// כל חיפוש שמבוצע בפועל נרשם כאן, כדי לאפשר חזרה מהירה לחיפוש קודם.
const KEY = "recent_searches";
const MAX = 10;

export function getRecentSearches() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(list)) return [];
    return list.filter((t) => typeof t === "string" && t.trim()).slice(0, MAX);
  } catch {
    return [];
  }
}

export function addRecentSearch(term) {
  const clean = String(term || "").trim();
  if (!clean) return getRecentSearches();
  const next = [clean, ...getRecentSearches().filter((t) => t !== clean)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}