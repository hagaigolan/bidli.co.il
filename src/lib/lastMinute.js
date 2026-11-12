// ── מנוע "תשואה דינמית" ──
// חלון זמן שהתפנה = מלאי שפג תוקפו. המכרז ההפוך מתחיל במחיר המחירון
// ויורד לינארית עד רצפת המחיר לאורך כל חלון המכרז. המחיר נגזר מהשעה,
// ולכן הוא זהה בכל רגע אצל כולם — ואין צורך לעדכן רשומות כל דקה.

export const BUSINESS_TYPES = [
  "אולפן הקלטות",
  "מספרה / ספר",
  "קליניקה וטיפולים",
  "קוסמטיקה וציפורניים",
  "צילום",
  "כושר ואימון אישי",
  "שיעורים פרטיים",
  "אחר",
];

// עמלת ההצלה — נגבית רק מעסקה שנסגרה בפועל
export const RESCUE_FEE_RATE = 12;

export function dealPriceAt(deal, now = Date.now()) {
  const list = Number(deal?.list_price) || 0;
  const floor = Number(deal?.floor_price) || 0;
  const start = new Date(deal?.auction_starts_at || deal?.created_date || 0).getTime();
  const end = new Date(deal?.auction_ends_at || 0).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return floor || list;
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return Math.max(floor, Math.round(list - (list - floor) * progress));
}

// כמה אחוזים מהמחירון כבר ירדו
export function savingsPercent(deal, price = dealPriceAt(deal)) {
  const list = Number(deal?.list_price) || 0;
  if (!list) return 0;
  return Math.max(0, Math.round((1 - price / list) * 100));
}

// קצב הירידה לשעה — "יורד ב-₪90 לשעה"
export function dropPerHour(deal) {
  const list = Number(deal?.list_price) || 0;
  const floor = Number(deal?.floor_price) || 0;
  const start = new Date(deal?.auction_starts_at || deal?.created_date || 0).getTime();
  const end = new Date(deal?.auction_ends_at || 0).getTime();
  const hours = (end - start) / 3600000;
  if (!Number.isFinite(hours) || hours <= 0) return 0;
  return Math.round((list - floor) / hours);
}

// סטטוס אמיתי לתצוגה — "active" ברשומה שעבר זמנה הוא כבר חלון שפקע
export function dealStatus(deal, now = Date.now()) {
  if (!deal) return "expired";
  if (deal.status === "sold" || deal.status === "cancelled") return deal.status;
  const end = new Date(deal.auction_ends_at).getTime();
  return Number.isFinite(end) && end > now ? "active" : "expired";
}

export function dealProgress(deal, now = Date.now()) {
  const start = new Date(deal?.auction_starts_at || deal?.created_date || 0).getTime();
  const end = new Date(deal?.auction_ends_at || 0).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

// תאריך ושעה בעברית — "היום, 18:30" / "מחר, 09:00"
export function formatSlotTime(iso) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  const today = new Date();
  const isSameDay = d.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 86400000);
  if (isSameDay) return `היום, ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `מחר, ${time}`;
  return `${d.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}, ${time}`;
}

export function dealUrl(id) {
  return `${window.location.origin}/last-minute/${id}`;
}