import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, MessageSquare, TrendingUp, Zap } from "lucide-react";

function Stars({ avg, small = false }) {
  const cls = small ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => {
        const filled = avg >= s - 0.5;
        return <Star key={s} className={cls}
          fill={filled ? "#f59e0b" : "none"}
          style={{ color: filled ? "#f59e0b" : "#d1d5db" }} />;
      })}
    </div>
  );
}

// ציון סטטיסטי שהתקבל מחוות דעת קונים + נתוני מכירות
export default function ProfileStatsCard({ email }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!email) { setLoading(false); return; }
    const load = async () => {
      try {
        const [reviews, myProducts] = await Promise.all([
          base44.entities.Review.filter({ seller_email: email }),
          base44.entities.Product.filter({ seller_email: email }, "-created_date", 100),
        ]);
        const now = Date.now();
        const total = reviews.length;
        const avg = total ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / total : 0;
        const sold = myProducts.filter(p => p.highest_bidder && new Date(p.ends_at) <= now).length;
        const active = myProducts.filter(p => new Date(p.ends_at) > now).length;
        setStats({ avg, total, sold, active, latest: reviews.slice(0, 2) });
      } catch {}
      setLoading(false);
    };
    load();
  }, [email]);

  if (!email) return null;

  return (
    <div className="rounded-2xl border border-gray-100 mb-6 overflow-hidden" dir="rtl"
      style={{ background: "linear-gradient(135deg, #f59e0b06, #e5893d05)", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Star className="h-4 w-4" style={{ color: "#f59e0b" }} fill="#f59e0b" />
        <h3 className="text-sm font-black text-gray-900">הציון שלי כמוכר</h3>
        <span className="text-xs text-gray-400 mr-auto">מבוסס על חוות דעת קונים</span>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-3">
            <div className="w-6 h-6 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : !stats || stats.total === 0 ? (
          <div className="text-center py-3">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-semibold text-gray-600">טרם התקבלו חוות דעת</p>
            <p className="text-xs text-gray-400 mt-1">לאחר שקונים יזכו במכרזים שלך וידרגו אותך — הציון יופיע כאן</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: "#f59e0b" }}>{stats.avg.toFixed(1)}</p>
                <p className="text-xs text-gray-400">מתוך 5</p>
              </div>
              <div className="flex-1">
                <Stars avg={stats.avg} />
                <p className="text-xs text-gray-500 mt-1">{stats.total} חוות דעת של קונים</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-2.5 rounded-xl text-center" style={{ background: "#3e6b8a08", border: "1px solid #3e6b8a22" }}>
                <TrendingUp className="h-4 w-4 mx-auto mb-1" style={{ color: "#3e6b8a" }} />
                <p className="text-lg font-black" style={{ color: "#3e6b8a" }}>{stats.sold}</p>
                <p className="text-xs text-gray-400">מכירות שהסתיימו</p>
              </div>
              <div className="p-2.5 rounded-xl text-center" style={{ background: "#e5893d08", border: "1px solid #e5893d22" }}>
                <Zap className="h-4 w-4 mx-auto mb-1" style={{ color: "#e5893d" }} />
                <p className="text-lg font-black" style={{ color: "#e5893d" }}>{stats.active}</p>
                <p className="text-xs text-gray-400">מכרזים פעילים</p>
              </div>
            </div>

            {stats.latest.map(r => (
              <div key={r.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 mb-2 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-700">{r.reviewer_name || "קונה"}</span>
                  <Stars avg={r.rating || 0} small />
                </div>
                {r.comment && <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}