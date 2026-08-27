import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Clock, Tag, MapPin, Sparkles } from "lucide-react";

function useCountdown(endsAt) {
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
  return left;
}

function MiniCard({ product }) {
  const ended = new Date(product.ends_at) <= new Date();
  const left = useCountdown(product.ends_at);
  return (
    <Link to={`/auction/${product.id}`}
      className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">🏺</div>}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: ended ? "#f3f4f6" : "linear-gradient(135deg,#f700ff,#9d00ff)", color: ended ? "#6b7280" : "white" }}>
          <Clock className="h-3 w-3" />
          {ended ? "הסתיים" : left ? `${String(left.h).padStart(2,"0")}:${String(left.m).padStart(2,"0")}:${String(left.s).padStart(2,"0")}` : ""}
        </div>
      </div>
      <div className="p-3" dir="rtl">
        <h3 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{product.title}</h3>
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <Tag className="h-3 w-3" /><span>{product.category}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p className="font-black text-sm text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
          <span className="text-xs text-gray-400">{product.bid_count || 0} הצעות</span>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedProducts({ category, excludeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) { setLoading(false); return; }
    base44.entities.Product.filter({ category }, "-created_date", 12)
      .then(items => setProducts(items.filter(p => p.id !== excludeId).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, excludeId]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-gray-100" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4" style={{ color: "#f700ff" }} />
        <h2 className="text-sm font-black text-gray-900">עוד מכרזים בקטגוריית {category}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products.map(p => <MiniCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}