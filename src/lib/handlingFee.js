// דמי טיפול — הצגה בלבד, לא נגבים בפועל.
// לשינוי האחוז, עדכן את HANDLING_FEE_RATE.
export const HANDLING_FEE_RATE = 0.03;

export function getFeeBreakdown(price) {
  const base = Number(price) || 0;
  const fee = Math.round(base * HANDLING_FEE_RATE * 100) / 100;
  return { base, fee, total: base + fee };
}