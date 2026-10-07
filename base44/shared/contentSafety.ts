// הגנת תוכן משותפת לכל פונקציות השרת:
// 1. sanitizeText — ניקוי קלט משתמש מתוכן פעיל (XSS): הסרת תגיות HTML, תכונות אירוע
//    (onclick= וכדומה), סכמות javascript: ותווי בקרה נסתרים.
// 2. containsProfanity — סינון מילים פוגעניות בעברית ובאנגלית.
// הערה לגבי SQL Injection: ה-SDK שולח שאילתות פרמטריות (אין SQL גולמי באפליקציה),
// כך שהווקטור אינו קיים מלכתחילה — הניקוי כאן שומר על שדות הטקסט מתוכן פעיל.

const TAG_RE = /<\/?[a-zA-Z][^>]*>/g;
const DANGEROUS_RE = /(on[a-z]+\s*=|javascript\s*:|vbscript\s*:|data\s*:\s*text\/html)/gi;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(v: unknown, max = 5000): string {
  if (v == null) return "";
  let s = String(v).slice(0, max * 3);
  s = s.replace(TAG_RE, " ").replace(DANGEROUS_RE, " ").replace(CONTROL_RE, " ");
  return s.trim().slice(0, max);
}

const PROFANITY_WORDS = [
  // עברית
  "זין", "זיין", "זיינת", "כוס אמך", "כוסאמך", "כוס אחותך", "כוסאחותך",
  "זונה", "זונות", "בן זונה", "בןזונה", "בת זונה", "מזדיין", "פוצי",
  "חרא", "פאקינג", "שרמוטה", "טיפש", "אידיוט", "מניאק", "פרא אדם",
  // אנגלית
  "fuck", "fck", "fuk", "shit", "bitch", "asshole", "cunt", "whore",
  "slut", "dick", "nigg", "wtf",
];

// נירמול: אותיות סופיות → רגילות, הסרת ניקוד, אותיות קטנות
function normalizeText(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[ךכ]/g, "כ").replace(/[םמ]/g, "מ")
    .replace(/[ןנ]/g, "נ").replace(/[ףפ]/g, "פ").replace(/[ץצ]/g, "צ");
}

export function containsProfanity(text: string): boolean {
  if (!text) return false;
  const normalized = normalizeText(text);
  for (const w of PROFANITY_WORDS) {
    const nw = normalizeText(w);
    if (!nw) continue;
    if (normalized.includes(nw)) return true;
  }
  return false;
}