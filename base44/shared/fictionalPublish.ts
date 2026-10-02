// עזרים משותפים לפרסום פריטים פיקטיביים (מכרזים וסטוקים) — חלון שעות יומי ונרמול כותרות

export function localNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date());
  const str = (t) => parts.find(p => p.type === t)?.value || "";
  return { dateKey: `${str("year")}-${str("month")}-${str("day")}`, hour: Number(str("hour")), minute: Number(str("minute")) };
}

// חלון יומי קבוע: 9:00 עד 22:00 (כולל), כל יום
export function inPublishWindow() {
  const { hour, minute } = localNow();
  if (hour < 9) return false;
  if (hour > 22) return false;
  if (hour === 22 && minute > 0) return false;
  return true;
}

// נרמול כותרת לצורך זיהוי כפילויות — השוואה ללא תלות בריווח, בסימני פיסוק וברישיות
export function normalizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[".,:;!()\[\]״׳"׳\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}