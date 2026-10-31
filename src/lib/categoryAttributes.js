// מפרט מובנה לפי קטגוריה — שדות מאפיינים אופציונליים שנשמרים עם המכרז
// כל שדה: key (נשמר במכרז) + label (הטקסט שבעברית שמוצג למוכר ולקונה)
export const CATEGORY_ATTRIBUTES = {
  "שעונים": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "year", label: "שנת ייצור" },
    { key: "movement", label: "מנגנון" },
    { key: "case_material", label: "חומר המארז" },
  ],
  "אמנות": [
    { key: "artist", label: "אמן" },
    { key: "technique", label: "טכניקה" },
    { key: "material", label: "חומר" },
    { key: "year", label: "שנה" },
    { key: "dimensions", label: "מידות" },
  ],
  "אלקטרוניקה": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "battery", label: "מצב סוללה" },
    { key: "year", label: "שנת ייצור" },
  ],
  "תכשיטים": [
    { key: "material", label: "חומר/מתכת" },
    { key: "weight", label: "משקל (גרם)" },
    { key: "gemstone", label: "אבן" },
    { key: "size", label: "מידה" },
  ],
  "רכבים": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "year", label: "שנת ייצור" },
    { key: "mileage", label: "קילומטראז׳" },
    { key: "fuel", label: "סוג דלק" },
  ],
  "כלי נגינה": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "instrument_type", label: "סוג הכלי" },
    { key: "year", label: "שנת ייצור" },
  ],
  "עיצוב הבית": [
    { key: "maker", label: "מעצב/יצרן" },
    { key: "model", label: "דגם" },
    { key: "material", label: "חומר" },
    { key: "style", label: "סגנון/תקופה" },
    { key: "dimensions", label: "מידות" },
  ],
  "אופנה": [
    { key: "brand", label: "מותג" },
    { key: "size", label: "מידה" },
    { key: "material", label: "חומר" },
    { key: "year", label: "שנה" },
  ],
  "ספרים": [
    { key: "author", label: "מחבר" },
    { key: "year", label: "שנת הוצאה" },
    { key: "publisher", label: "הוצאה" },
    { key: "language", label: "שפה" },
  ],
  "יין ואלכוהול": [
    { key: "maker", label: "יקב/יצרן" },
    { key: "model", label: "שם היין" },
    { key: "vintage", label: "בציר" },
    { key: "volume", label: "נפח" },
  ],
  "אספנות": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "style", label: "תקופה" },
    { key: "origin", label: "ארץ מקור" },
    { key: "material", label: "חומר" },
  ],
  "יודאיקה": [
    { key: "maker", label: "יוצר/יצרן" },
    { key: "style", label: "תקופה" },
    { key: "material", label: "חומר" },
    { key: "origin", label: "ארץ מקור" },
  ],
  "נומיסמטיקה": [
    { key: "maker", label: "מטבעה" },
    { key: "year", label: "שנה" },
    { key: "material", label: "מתכת" },
    { key: "grade", label: "דירוג" },
  ],
  "מטבעות": [
    { key: "maker", label: "מטבעה" },
    { key: "year", label: "שנה" },
    { key: "material", label: "מתכת" },
    { key: "grade", label: "דירוג" },
  ],
  "בולים": [
    { key: "origin", label: "ארץ מקור" },
    { key: "year", label: "שנה" },
    { key: "catalog", label: "קטלוג" },
    { key: "grade", label: "דירוג" },
  ],
  'נדל"ן': [
    { key: "property_type", label: "סוג הנכס" },
    { key: "rooms", label: "חדרים" },
    { key: "area", label: "שטח (מ״ר)" },
    { key: "floor", label: "קומה" },
  ],
  "אחר": [
    { key: "maker", label: "יצרן" },
    { key: "model", label: "דגם" },
    { key: "year", label: "שנה" },
  ],
};

export const getCategoryAttributes = (category) => CATEGORY_ATTRIBUTES[category] || [];

// מפתחות שמתייחסים ליצרן/מותג — לסינון בעמוד המכרזים
export const MAKER_KEYS = ["maker", "brand", "producer"];
export const MODEL_KEYS = ["model"];

const ALL_LABELS = Object.values(CATEGORY_ATTRIBUTES).flat().reduce((acc, f) => {
  if (!acc[f.key]) acc[f.key] = f.label;
  return acc;
}, {});

export const attributeLabel = (key, category) => {
  const local = getCategoryAttributes(category).find(f => f.key === key);
  return local?.label || ALL_LABELS[key] || key;
};

// המאפיינים שמולאו בפועל — לתצוגת "פרטים נוספים" בעמוד המכרז
export const filledAttributes = (product) => {
  const attrs = product?.attributes;
  if (!attrs || typeof attrs !== "object") return [];
  return Object.entries(attrs)
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(([key, v]) => ({ key, label: attributeLabel(key, product.category), value: String(v).trim() }));
};