import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, CheckCircle, Coins, Gavel } from "lucide-react";
import { getCumulativeSales, SOLD_AUCTIONS_QUERY } from "@/lib/cumulativeSales";

// בסיס היסטורי למספר המכרזים שהושלמו בלבד — סך המכירות המצטבר מחושב
// בפונקציה המשותפת getCumulativeSales (בסיס site-stats + מכירות אמיתיות)
const BASE_COMPLETED = 29;
// מועד קביעת הבסיס — רק מכרזים שנמכרו מאז נספרים ומתווספים אליו
const BASE_SALES_AT = "2026-10-30T22:00:00.000Z";

// מדדי חיים בראש דף הבית — מדדים חיוביים בלבד; המד נסתר כשאין נתונים חיוביים להציג
export default function LiveStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const nowIso = new Date().toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    Promise.all([
      base44.entities.Product.count({ status: "active", ends_at: { $gte: nowIso } }),
      base44.entities.Product.aggregate({
        query: {
          $and: [
            SOLD_AUCTIONS_QUERY,
            { updated_date: { $gte: BASE_SALES_AT } },
          ],
        },
        sum: "current_price",
      }),
      base44.entities.Bid.count({ created_date: { $gte: weekAgo } }),
      getCumulativeSales(),
    ]).then(([active, soldAgg, bidsWeek, sales]) => {
      const row = soldAgg?.rows?.[0] || {};
      setStats({
        active: active || 0,
        completed: BASE_COMPLETED + (row.count || 0),
        totalSales: sales.totalSales,
        bidsWeek: bidsWeek || 0,
      });
    }).catch(() => {});
  }, []);

  if (!stats) return null;
  const blocks = [
    { icon: Zap, value: stats.active, label: "מכרזים פעילים כרגע", color: "#e5893d" },
    { icon: CheckCircle, value: stats.completed, label: "מכרזים שהושלמו", color: "#00a844" },
    { icon: Coins, text: `₪${(stats.totalSales || 0).toLocaleString("he-IL")}`, label: "סך מכירות מצטבר", color: "#3e6b8a" },
    { icon: Gavel, value: stats.bidsWeek, label: "הצעות מחיר בשבוע האחרון", color: "#e5893d" },
  ].filter(b => (b.text ? true : b.value > 0));

  if (blocks.length === 0) return null;

  return (
    <section className="py-5 bg-white border-b border-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-6 gap-y-4">
        {blocks.map(({ icon: Icon, value, text, label, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1 min-w-[100px] flex-1 max-w-[190px]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "14", border: `1px solid ${color}33` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p className="text-xl font-black text-gray-900">{text || (value || 0).toLocaleString("he-IL")}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}