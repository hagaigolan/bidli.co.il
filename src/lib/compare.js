// השוואת פריטים — רשימת המזהים נשמרת במכשיר, ועדכון שלה משדר אירוע
// כדי שכל הכפתורים וסרגל ההשוואה יתעדכנו מיד.

const KEY = "bidli_compare_ids";
export const MAX_COMPARE = 4;
export const COMPARE_EVENT = "bidli:compare";

export function getCompareIds() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(ids) ? ids.filter(Boolean).slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function save(ids) {
  try { localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_COMPARE))); } catch {}
  window.dispatchEvent(new Event(COMPARE_EVENT));
}

export function isInCompare(id) {
  return getCompareIds().includes(id);
}

// מחזיר { added, full } — full = הרשימה מלאה ולא ניתן להוסיף
export function toggleCompare(id) {
  const ids = getCompareIds();
  if (ids.includes(id)) {
    save(ids.filter((i) => i !== id));
    return { added: false, full: false };
  }
  if (ids.length >= MAX_COMPARE) return { added: false, full: true };
  save([...ids, id]);
  return { added: true, full: false };
}

export function removeFromCompare(id) {
  save(getCompareIds().filter((i) => i !== id));
}

export function clearCompare() {
  save([]);
}