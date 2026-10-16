import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Heart } from "lucide-react";
import LiveCardStats from "@/components/LiveCardStats";
import { getOwnerKey } from "@/lib/favorites";

// "בשבילך" — המלצות אישיות לפי הקטגוריות שהמשתמש שמר במועדפים
export default function JustForYou() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.Favorite.filter({ owner_key: getOwnerKey() }).catch(() => []),
      base44.entities.Product.list("-created_date", 100).catch(() => []),
    ]).then(([favs, products]) => {
      if (!alive) return;
      const favIds = new Set(favs.map((f) => f.product_id));
      const cats = new Set(products.filter((p) => favIds.has(p.id)).map((p) => p.category).filter(Boolean));
      const recs = products
        .filter((p) =>
          p.status === "active" && p.ends_at && new Date(p.ends_at) > new Date() &&
          p.category && cats.has(p.category) && !favIds.has(p.id))
        .slice(0, 8);
      setItems(recs);
    });
    return () => { alive = false; };
  }, []);

  if (!items.length) return null;

  return (
    <section className="py-6 sm:py-8" style={{ background: "linear-gradient(180deg, #faf5ff, #ffffff)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
            <Heart className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">בשבילך — לפי הטעם שלך</h2>
          <span className="text-xs text-gray-400 hidden sm:inline">מבוסס על הפריטים ששמרת במועדפים</span>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {items.map((p) => (
            <Link key={p.id} to={`/auction/${p.id}`}
              className="flex-shrink-0 w-44 bg-white border border-gray-100 rounded-2xl overflow-hidden group card-neon transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
              </div>
              <div className="p-2.5">
                <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-1 mb-1">{p.title}</p>
                <p className="font-black text-sm text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</p>
                <LiveCardStats product={p} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}