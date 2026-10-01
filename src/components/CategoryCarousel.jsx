import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";

// קרוסלה אופקית של מכרזים לקטגוריה — סטנדרט "עכשיו בלוח" עם חצי ניווט
function MiniTimer({ endsAt }) {
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
  if (!left) return null;
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-black text-white font-mono"
      style={{ background: "#2d4f68" }}>
      <Clock className="h-3 w-3" />
      {left.h > 0 && `${String(left.h).padStart(2, "0")}:`}{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
    </span>
  );
}

function CarouselStrip({ category, items, accent }) {
  const scrollRef = useRef(null);
  const scroll = dir => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: accent + "18", border: `1px solid ${accent}44` }}>
            <TrendingUp className="h-4 w-4" style={{ color: accent }} />
          </div>
          <h3 className="font-bold text-gray-900">עכשיו ב{category}</h3>
          <Link to={`/auctions?category=${encodeURIComponent(category)}`}
            className="text-xs font-bold hover:underline" style={{ color: accent }}>
            לכל המכרזים ←
          </Link>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => scroll(-1)} aria-label="הקודם"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="הבא"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1">
        {items.map(p => (
          <Link key={p.id} to={`/auction/${p.id}`}
            className="block bg-white border border-gray-100 rounded-2xl overflow-hidden flex-shrink-0 w-40 sm:w-48 group hover:border-transparent transition-all duration-300 card-neon"
            style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
              {p.image_url
                ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
            </div>
            <div className="p-2.5" dir="rtl">
              <h4 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{p.title}</h4>
              <div className="flex items-center justify-between gap-1.5">
                <p className="font-black text-sm text-gray-900 whitespace-nowrap">
                  ₪{(p.current_price || p.starting_price || 0).toLocaleString()}
                </p>
                {p.ends_at && <MiniTimer endsAt={p.ends_at} />}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const ACCENTS = ["#e5893d", "#3e6b8a", "#6aa3cd", "#2d4f68", "#e5893d", "#3e6b8a"];

export default function CategoryCarousel({ products }) {
  const now = Date.now();
  const byCategory = {};
  for (const p of products) {
    if (p.status === "cancelled" || !p.ends_at || new Date(p.ends_at) <= now || !p.category) continue;
    (byCategory[p.category] ||= []).push(p);
  }
  const categories = Object.entries(byCategory)
    .filter(([, items]) => items.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6);

  if (categories.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">עכשיו בלוח</h2>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, #e5893d55, transparent)" }} />
        </div>
        {categories.map(([category, items], i) => (
          <CarouselStrip key={category} category={category} items={items.slice(0, 12)} accent={ACCENTS[i % ACCENTS.length]} />
        ))}
      </div>
    </section>
  );
}