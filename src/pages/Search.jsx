import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Search as SearchIcon, ArrowRight, MapPin, Tag, Clock } from "lucide-react";

function useCountdown(endsAt) {
  const calcLeft = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff };
  };
  const [left, setLeft] = useState(calcLeft);
  useEffect(() => {
    const t = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function CountdownBadge({ endsAt }) {
  const left = useCountdown(endsAt);
  if (!left) return <span className="text-xs font-bold text-gray-400">הסתיים</span>;
  const urgent = left.total < 3600000;
  return (
    <span className="font-mono font-bold text-xs" style={{ color: urgent ? "#f700ff" : "#0088ff" }}>
      {String(left.h).padStart(2,"0")}:{String(left.m).padStart(2,"0")}:{String(left.s).padStart(2,"0")}
    </span>
  );
}

function ResultCard({ product }) {
  const ended = new Date(product.ends_at) < new Date();
  return (
    <Link to={`/auction/${product.id}`} className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">🏺</div>}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: ended ? "#f3f4f6" : "linear-gradient(135deg,#f700ff,#9d00ff)", color: ended ? "#6b7280" : "white" }}>
          <Clock className="h-3 w-3" />
          {ended ? "הסתיים" : <CountdownBadge endsAt={product.ends_at} />}
        </div>
      </div>
      <div className="p-3" dir="rtl">
        <h3 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{product.title}</h3>
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
            <Tag className="h-3 w-3" /><span>{product.category}</span>
          </div>
        )}
        {product.location && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin className="h-3 w-3" /><span>{product.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">מחיר נוכחי</p>
            <p className="font-black text-base text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
          </div>
          <span className="text-xs text-gray-400">{product.bid_count || 0} הצעות</span>
        </div>
      </div>
    </Link>
  );
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products once
  useEffect(() => {
    base44.entities.Product.list("-created_date", 100)
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Live filtering — starts from the 2nd character
  const results = (() => {
    const term = q.trim().toLowerCase();
    if (!term || term.length < 2) return allProducts;
    return allProducts.filter((p) =>
      [p.title, p.description, p.category, p.location, p.seller_name, p.condition]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  })();

  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  const active = results.filter((p) => new Date(p.ends_at) > new Date());
  const ended = results.filter((p) => new Date(p.ends_at) <= new Date());

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #f700ff08, #ffffff)" }}>
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <h1 className="text-2xl font-black text-gray-900 mb-3">חיפוש מכרזים</h1>
          <form onSubmit={submit} className="max-w-lg relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חפש פריטים, קטגוריות, מיקומים..."
              className="w-full pr-10 pl-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right"
            />
          </form>
          {!loading && q.trim().length >= 2 && (
            <p className="text-sm text-gray-400 mt-3">
              {results.length} תוצאות עבור «{q.trim()}»
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-lg font-bold text-gray-700 mb-2">לא נמצאו תוצאות</h2>
            <p className="text-sm text-gray-400 mb-6">נסה מילות חיפוש אחרות או דפדף בכל המכרזים</p>
            <Link to="/auctions" className="text-white text-sm px-6 py-2.5 rounded-xl font-bold inline-block"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              לכל המכרזים
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  מכרזים פעילים ({active.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {active.map((p) => <ResultCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
            {ended.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-4">מכרזים שהסתיימו ({ended.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-80">
                  {ended.map((p) => <ResultCard key={p.id} product={p} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}