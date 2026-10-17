import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Coins, Zap } from "lucide-react";

// רצועת אמון בראש עמוד הפרסום — אותו מקור נתונים כמו בדף הבית (LiveStatsBar):
// סך מכירות מצטבר, מכרזים פעילים כרגע, ופרסום חינם. ללא מספרים מומצאים —
// בזמן טעינה מוצג מקף עד שהנתון האמיתי מגיע מהשרת.
export default function UploadTrustStrip() {
  const [totalSales, setTotalSales] = useState(null);
  const [activeCount, setActiveCount] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.count({ status: "active", ends_at: { $gte: new Date().toISOString() } }),
      base44.entities.Product.aggregate({
        query: {
          $or: [
            { status: { $in: ["paid", "escrow", "delivered", "released"] } },
            { status: "ended", highest_bidder: { $ne: "" } },
          ],
        },
        sum: "current_price",
      }),
    ]).then(([active, soldAgg]) => {
      setActiveCount(active || 0);
      setTotalSales(soldAgg?.rows?.[0]?.sum_current_price || 0);
    }).catch(() => {});
  }, []);

  const items = [
    { icon: Coins, text: totalSales != null ? `₪${totalSales.toLocaleString("he-IL")}` : null, label: "סך מכירות מצטבר", color: "#3e6b8a" },
    { icon: Zap, text: activeCount != null ? String(activeCount) : null, label: "מכרזים פעילים כרגע", color: "#e5893d" },
    { icon: CheckCircle, text: "0 ₪", label: "פרסום חינם — בלי עמלות", color: "#00a844" },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-2 py-3 grid grid-cols-3 gap-1" dir="rtl">
      {items.map(({ icon: Icon, text, label, color }) => (
        <div key={label} className="flex flex-col items-center text-center gap-0.5 min-w-0">
          <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
          <p className="text-sm font-black text-gray-900 truncate max-w-full">{text || "—"}</p>
          <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}