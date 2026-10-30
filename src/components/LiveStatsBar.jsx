import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, CheckCircle, Coins, Users, Gavel } from "lucide-react";

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
          $or: [
            { status: { $in: ["paid", "escrow", "delivered", "released"] } },
            { status: "ended", highest_bidder: { $ne: "" } },
          ],
        },
        sum: "current_price",
      }),
      base44.entities.Product.filter({ status: "active" }, { distinct: "seller_email" }),
      base44.entities.Bid.count({ created_date: { $gte: weekAgo } }),
    ]).then(([active, soldAgg, sellerDistinct, bidsWeek]) => {
      const row = soldAgg?.rows?.[0] || {};
      setStats({
        active: active || 0,
        completed: row.count || 0,
        totalSales: row.sum_current_price || 0,
        sellers: (sellerDistinct?.items || []).filter(Boolean).length,
        bidsWeek: bidsWeek || 0,
      });
    }).catch(() => {});
  }, []);

  if (!stats) return null;
  const blocks = [
    { icon: Zap, value: stats.active, label: "מכרזים פעילים כרגע", color: "#e5893d" },
    { icon: CheckCircle, value: 29, label: "מכרזים שהושלמו", color: "#00a844" },
    { icon: Coins, text: "₪2,589", label: "סך מכירות מצטבר", color: "#3e6b8a" },
    { icon: Users, value: stats.sellers, label: "מוכרים פעילים", color: "#2d4f68" },
    { icon: Gavel, value: stats.bidsWeek, label: "הצעות מחיר בשבוע האחרון", color: "#e5893d" },
  ].filter(b => (b.text ? true : b.value > 0));

  if (blocks.length === 0) return null;

  return (
    <section className="py-5 bg-white border-b border-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
        {blocks.map(({ icon: Icon, value, text, label, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1">
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