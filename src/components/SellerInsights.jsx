import { Eye, Gavel, TrendingUp, Trophy } from "lucide-react";

// מדדי ביצוע למוכר — צפיות, הצעות ושיעור המרה מכלל הפרסומים
export default function SellerInsights({ products }) {
  if (!products?.length) return null;

  const totalViews = products.reduce((s, p) => s + (p.views || 0), 0);
  const totalBids = products.reduce((s, p) => s + (p.bid_count || 0), 0);
  const conversion = totalViews ? Math.round((totalBids / totalViews) * 100) : 0;
  const top = [...products].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  const stats = [
    { label: "צפיות במכרזים", value: totalViews.toLocaleString(), color: "#3e6b8a", icon: Eye },
    { label: "הצעות שהתקבלו", value: totalBids.toLocaleString(), color: "#e5893d", icon: Gavel },
    { label: "צפייה ← הצעה", value: `${conversion}%`, color: "#00a35c", icon: TrendingUp },
    { label: "הנצפה ביותר", value: top?.views ? `${(top.views || 0).toLocaleString()}` : "—", color: "#6aa3cd", icon: Trophy },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 mb-5" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <h2 className="text-sm font-black text-gray-900">ביצועי הפרסומים שלי</h2>
        {top?.views > 0 && (
          <p className="text-xs text-gray-400 truncate max-w-[60%]">הנצפה ביותר: {top.title}</p>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="p-3 rounded-xl text-center" style={{ background: color + "08" }}>
            <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} aria-hidden="true" />
            <p className="text-lg font-black" style={{ color }}>{value}</p>
            <p className="text-[11px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 mt-2">הנתונים מצטברים מרגע העלאת המכרז. שיעור המרה נמוך? נסו תמונות חדות יותר ותיאור מפורט.</p>
    </div>
  );
}