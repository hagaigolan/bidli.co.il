import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

function DealCountdown({ endsAt }) {
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
  const time = left.h > 0
    ? `${String(left.h).padStart(2,"0")}:${String(left.m).padStart(2,"0")}:${String(left.s).padStart(2,"0")}`
    : `${String(left.m).padStart(2,"0")}:${String(left.s).padStart(2,"0")}`;

  return (
    <span className="px-2 py-1 rounded-lg text-xs font-black text-white font-mono inline-flex items-center gap-1"
      style={{ background: "#ff2200" }}>
      <Flame className="h-3 w-3" />{time}
    </span>
  );
}

export default function DealsEndingSoon({ products }) {
  if (!products || products.length === 0) return null;

  const now = Date.now();
  const deals = products
    .filter(p =>
      (p.status || "active") === "active" &&
      p.ends_at &&
      new Date(p.ends_at).getTime() > now &&
      new Date(p.ends_at).getTime() - now < 6 * 60 * 60 * 1000 &&
      (p.bid_count || 0) <= 2
    )
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at))
    .slice(0, 8);

  if (!deals.length) return null;

  return (
    <section className="py-8 border-b border-gray-100" style={{ background: "linear-gradient(135deg, #ff220008, #e5893d0a)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #ff2200, #e5893d)", boxShadow: "0 0 12px #ff220033" }}>
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">מציאות שנגמרות עוד מעט</h2>
            <p className="text-xs text-gray-400">פריטים שנסגרים בקרוב ועוד לא קיבלו הרבה הצעות — זה הרגע להציע</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {deals.map(p => (
            <Link key={p.id} to={`/auction/${p.id}`}
              className="flex-shrink-0 w-44 bg-white border border-gray-100 rounded-2xl overflow-hidden group card-neon transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #ff2200, #e5893d)" }}>מציאה</span>
              </div>
              <div className="p-2.5">
                <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-1 mb-1">{p.title}</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-black text-sm text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</p>
                  <DealCountdown endsAt={p.ends_at} />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {(p.bid_count || 0) === 0 ? "טרם קיבל הצעות — היה הראשון!" : `${p.bid_count} הצעות בלבד`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}