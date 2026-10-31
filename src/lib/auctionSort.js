// מיון מכרזים — לוגיקה משותפת לעמוד הבית ולעמוד כל המכרזים
export const SORT_OPTIONS = [
  { id: "newest", label: "מכרז חדש יותר" },
  { id: "oldest", label: "מכרז ישן יותר" },
  { id: "ending_soon", label: "מסתיים בזמן הקרוב" },
  { id: "price_low", label: "מחיר: מהנמוך לגבוה" },
  { id: "price_high", label: "מחיר: מהגבוה לנמוך" },
  { id: "bids", label: "הכי הרבה הצעות" },
];

// אפשרויות המיון בעמוד כל המכרזים — אותן אפשרויות בדיוק, עם רלוונטיות כברירת מחדל
export const AUCTIONS_SORT_OPTIONS = [
  { id: "relevance", label: "רלוונטיות" },
  { id: "ending_soon", label: "מסתיים בזמן הקרוב" },
  { id: "price_low", label: "מחיר: מהנמוך לגבוה" },
  { id: "price_high", label: "מחיר: מהגבוה לנמוך" },
  { id: "bids", label: "הכי הרבה הצעות" },
];

export function sortProducts(items, sort) {
  const price = p => Number(p.current_price || p.starting_price) || 0;
  switch (sort) {
    case "newest": return [...items].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    case "oldest": return [...items].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    case "ending_soon": return [...items].sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));
    case "price_low": return [...items].sort((a, b) => price(a) - price(b));
    case "price_high": return [...items].sort((a, b) => price(b) - price(a));
    case "bids": return [...items].sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
    default: return items;
  }
}