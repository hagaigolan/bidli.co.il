import { base44 } from "@/api/base44Client";

// ── מקור אמת יחיד ל"סך מכירות מצטבר" ──
// מכרזים שהושלמו עם סכום זכייה בפועל בלבד. גם דף הבית וגם עמוד פרסום המכרז
// קוראים לפונקציה הזו, כך ששניהם מציגים תמיד את אותו מספר בדיוק.
export const SOLD_AUCTIONS_QUERY = {
  $or: [
    { status: { $in: ["paid", "escrow", "delivered", "released"] } },
    { status: "ended", highest_bidder: { $ne: "" } },
  ],
};

// מחזיר { totalSales, soldCount } — סכום הזכיות בפועל ומספר המכרזים שנמכרו
export async function getCumulativeSales() {
  const agg = await base44.entities.Product.aggregate({
    query: SOLD_AUCTIONS_QUERY,
    sum: "current_price",
  });
  const row = agg?.rows?.[0] || {};
  return {
    totalSales: row.sum_current_price || 0,
    soldCount: row.count || 0,
  };
}