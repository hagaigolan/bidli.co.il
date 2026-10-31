import { base44 } from "@/api/base44Client";

// ── מקור אמת יחיד ל"סך מכירות מצטבר" ──
// הסכום המוצג = הבסיס ההיסטורי השמור ברשומת site-stats היחידה
// + סכום כל המכירות שהושלמו בפועל מרגע קביעת הבסיס (מכרזים שהסתיימו עם זוכה).
// דף הבית ועמוד פרסום המכרז קוראים לאותה פונקציה, כך ששניהם מציגים תמיד מספר זהה.

export const SOLD_AUCTIONS_QUERY = {
  $or: [
    { status: { $in: ["paid", "escrow", "delivered", "released"] } },
    { status: "ended", highest_bidder: { $ne: "" } },
  ],
};

// ברירת מחדל לבסיס בלבד אם רשומת site-stats טרם נוצרה — ללא הוספת נתונים מומצאים
const FALLBACK_BASE_SALES = 23451;

// הרשומה היחידה שמחזיקה את הבסיס ההיסטורי
export async function getSiteStats() {
  const rows = await base44.entities.SiteStats.list("-created_date", 5);
  const list = Array.isArray(rows) ? rows : (rows?.items || []);
  return list.find(r => r.key === "site_stats") || list[0] || null;
}

// מחזיר { totalSales, soldCount, base, realSales }
export async function getCumulativeSales() {
  const stats = await getSiteStats();
  const base = Number(stats?.base_sales ?? FALLBACK_BASE_SALES) || 0;
  const since = stats?.base_sales_at || null;

  // אין מועד בסיס — מציגים את הבסיס בלבד כדי לא לנפח את המספר במכירות היסטוריות
  if (!since) return { totalSales: base, soldCount: 0, base, realSales: 0 };

  // מכירות אמיתיות: מכרזים שהסתיימו עם זוכה אחרי מועד הבסיס
  const agg = await base44.entities.Product.aggregate({
    query: { $and: [SOLD_AUCTIONS_QUERY, { ends_at: { $gte: since } }] },
    sum: "current_price",
  });
  const row = agg?.rows?.[0] || {};
  const realSales = Number(row.sum_current_price || 0);

  return {
    totalSales: base + realSales,
    soldCount: row.count || 0,
    base,
    realSales,
  };
}