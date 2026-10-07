// סינון מילים פוגעניות בצד הלקוח — רשימה זהה לזו שבשרת (base44/shared/contentSafety.ts).
// מוגן פעמיים: הצד השרת אוכף סופית, הצד הלקוח מספק משוב מיידי למשתמש.

const PROFANITY_WORDS = [
  "זין", "זיין", "זיינת", "כוס אמך", "כוסאמך", "כוס אחותך", "כוסאחותך",
  "זונה", "זונות", "בן זונה", "בןזונה", "בת זונה", "מזדיין", "פוצי",
  "חרא", "פאקינג", "שרמוטה", "טיפש", "אידיוט", "מניאק", "פרא אדם",
  "fuck", "fck", "fuk", "shit", "bitch", "asshole", "cunt", "whore",
  "slut", "dick", "nigg", "wtf",
];

function normalizeText(s) {
  return String(s)
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[ךכ]/g, "כ").replace(/[םמ]/g, "מ")
    .replace(/[ןנ]/g, "נ").replace(/[ףפ]/g, "פ").replace(/[ץצ]/g, "צ");
}

export function containsProfanity(text) {
  if (!text) return false;
  const normalized = normalizeText(text);
  for (const w of PROFANITY_WORDS) {
    const nw = normalizeText(w);
    if (!nw) continue;
    if (normalized.includes(nw)) return true;
  }
  return false;
}