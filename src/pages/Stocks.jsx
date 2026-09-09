import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, TrendingUp, Plus } from "lucide-react";

function CountdownBadge({ endsAt }) {
  const calc = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!left) return <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white bg-gray-400">הסתיים</span>;

  const critical = left.total < 3600000;
  const bg = critical ? "#ef4444" : "#2d4f68";
  const time = left.h > 0
    ? `${String(left.h).padStart(2,"0")}:${String(left.m).padStart(2,"0")}:${String(left.s).padStart(2,"0")}`
    : `${String(left.m).padStart(2,"0")}:${String(left.s).padStart(2,"0")}`;

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-black text-white font-mono flex items-center gap-1 ${critical ? "animate-pulse" : ""}`}
      style={{ background: bg }}>
      <Clock className="h-3 w-3" />{time}
    </span>
  );
}

export default function Stocks() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ status: "active" }, "-created_date", 50)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-10 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">סטוקים</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1 mb-6">פריטים שאנשים מוכרים כרגע — הגש הצעה וזכה</p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{products.length} פריטים פעילים</span>
            <Link to="/upload-product"
              className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
              <Plus className="h-4 w-4" /> פרסם פריט
            </Link>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📦</p>
            <h2 className="text-xl font-bold text-gray-800 mb-2">אין פריטים כרגע</h2>
            <p className="text-gray-400 text-sm mb-6">היה הראשון לפרסם פריט!</p>
            <Link to="/upload-product"
              className="inline-block text-white text-sm font-bold px-6 py-3 rounded-xl"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              פרסם עכשיו
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <Link key={product.id} to={`/auction/${product.id}`}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="relative overflow-hidden aspect-square bg-gray-50">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                  {product.ends_at && (
                    <div className="absolute top-2 right-2">
                      <CountdownBadge endsAt={product.ends_at} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1 line-clamp-2">{product.title}</h3>
                  {product.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
                    {product.bid_count > 0 && (
                      <span className="text-xs text-gray-400">{product.bid_count} הצעות</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}