import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Zap, Gavel, CheckCircle } from "lucide-react";

// מדדי חיים בראש דף הבית — מכרזים פעילים, הצעות בשבוע האחרון ומכירות ב-30 הימים
export default function LiveStatsBar() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("-created_date", 500),
      base44.entities.Bid.list("-created_date", 500),
    ]).then(([products, bids]) => {
      const now = Date.now();
      const active = products.filter(p => p.status === "active" && p.ends_at && new Date(p.ends_at) > now).length;
      const bidsWeek = bids.filter(b => new Date(b.created_date) > now - 7 * 24 * 3600 * 1000).length;
      const soldMonth = products.filter(p =>
        ["paid", "escrow", "delivered", "released"].includes(p.status) &&
        p.updated_date && new Date(p.updated_date) > now - 30 * 24 * 3600 * 1000).length;
      setStats({ active, bidsWeek, soldMonth });
    }).catch(() => {});
  }, []);

  if (!stats) return null;
  const blocks = [
    { icon: Zap, value: stats.active, label: "מכרזים פעילים כרגע", color: "#e5893d" },
    { icon: Gavel, value: stats.bidsWeek, label: "הצעות מחיר בשבוע האחרון", color: "#3e6b8a" },
    { icon: CheckCircle, value: stats.soldMonth, label: "נמכרו ב-30 הימים האחרונים", color: "#00a844" },
  ];

  return (
    <section className="py-5 bg-white border-b border-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-3">
        {blocks.map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + "14", border: `1px solid ${color}33` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <p className="text-xl font-black text-gray-900">{(value || 0).toLocaleString("he-IL")}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}