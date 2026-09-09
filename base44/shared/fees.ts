// ── מנוע העמלות המרכזי של bid-it ──
// כל נקודות התשלום צורכות מכאן: הגבייה (createPayment / stripe.ts) והתצוגה בצד הלקוח
// (דרך הפונקציה getFeeConfig).
// להפעלת המוניטיזציה בעתיד: עדכן את שני המספרים הבאים בלבד. 0 = ללא גבייה.
export const SELLER_COMMISSION_RATE = 0; // עמלת מוכר — אחוז ממחיר המכירה
export const BUYER_HANDLING_RATE = 0;    // דמי טיפול מקונה — אחוז ממחיר הזכייה

export function computeFees(salePrice: number) {
  const sale = Number(salePrice) || 0;
  const commission = Math.round(sale * SELLER_COMMISSION_RATE * 100) / 100;
  const handlingFee = Math.round(sale * BUYER_HANDLING_RATE * 100) / 100;
  return {
    sale,
    commission,
    handlingFee,
    buyerTotal: sale + handlingFee,
    sellerPayout: sale - commission,
  };
}