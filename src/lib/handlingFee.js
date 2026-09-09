// דמי טיפול — תצוגה בלבד. האחוז מגיע ממנוע העמלות המרכזי (base44/shared/fees.ts)
// דרך הפונקציה getFeeConfig. 0 = ללא דמי טיפול.
export function getFeeBreakdown(price, rate = 0) {
  const base = Number(price) || 0;
  const fee = Math.round(base * (Number(rate) || 0) * 100) / 100;
  return { base, fee, total: base + fee };
}