import { Flame, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

// מדור "המדוברים כרגע באתר" — המכרזים הפעילים עם הכי הרבה הצעות (נתונים אמיתיים)
function MiniCountdown({ endsAt }) {
  const calc = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  if (!left) return <span className="text-xs text-gray-400">הסתיים</span>;
  return (
    <span className="text-xs font-mono font-bold" style={{ color: left.h === 0 ? "#ef4444" : "#2d4f68" }}>
      {String(left.h).padStart(2, "0")}:{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
    </span>
  );
}

export default function TrendingSection({ products }) {
  const trending = (products || [])
    .filter(p => p.status === "active" && p.ends_at && new Date(p.ends_at) > new Date() && (p.bid_count || 0) > 0)
    .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0))
    .slice(0, 6);
  if (trending.length === 0) return null;

  return (
    <section className="py-6 sm:py-8" style={{ background: "linear-gradient(180deg, #ffffff, #fafafa)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#ef444418", border: "1px solid #ef444444" }}>
            <Flame className="h-4 w-4" style={{ color: "#ef4444" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">המדוברים כרגע באתר</h2>
          <span className="text-xs text-gray-400">לפי מספר ההצעות האמיתיות</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {trending.map((p, i) => (
            <a key={p.id} href={`/auction/${p.id}`}
              className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black text-white flex items-center gap-1"
                  style={{ background: "linear-gradient(135deg, #ef4444, #e5893d)", boxShadow: "0 0 10px #ef444455" }}>
                  <Flame className="h-3 w-3" /> {i === 0 ? "🏆 המוביל באתר · " : ""}{p.bid_count} הצעות
                </span>
              </div>
              <div className="p-3" dir="rtl">
                <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{p.title}</h3>
                {p.location && (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{p.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="font-black text-sm text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</p>
                  {p.ends_at && <MiniCountdown endsAt={p.ends_at} />}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}