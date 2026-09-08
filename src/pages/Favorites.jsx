import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { getOwnerKey } from "@/lib/favorites";

function useCountdown(endsAt) {
  const calcLeft = () => {
    if (!endsAt) return null;
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

function FavCard({ fav, onRemove }) {
  const left = useCountdown(fav.product_ends_at);
  const ended = fav.product_ends_at && new Date(fav.product_ends_at) <= new Date();

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <Link to={`/auction/${fav.product_id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
          {fav.product_image_url
            ? <img src={fav.product_image_url} alt={fav.product_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
          {fav.product_ends_at && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1"
              style={{
                background: ended ? "#f3f4f6" : "linear-gradient(135deg,#f700ff,#9d00ff)",
                color: ended ? "#6b7280" : "white"
              }}>
              {ended ? "הסתיים" : left
                ? `⏳ ${String(left.h).padStart(2, "0")}:${String(left.m).padStart(2, "0")}:${String(left.s).padStart(2, "0")}`
                : "הסתיים"}
            </div>
          )}
        </div>
        <div className="p-3" dir="rtl">
          <h3 className="font-bold text-gray-900 text-xs line-clamp-1">{fav.product_title || "פריט"}</h3>
        </div>
      </Link>
      <button onClick={onRemove}
        className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 hover:bg-red-500 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        title="הסר מהמועדפים">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Favorites() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Favorite.filter({ owner_key: getOwnerKey() }, "-created_date", 100)
      .then(setFavs)
      .catch(() => setFavs([]))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (fav) => {
    try {
      await base44.entities.Favorite.delete(fav.id);
      setFavs(prev => prev.filter(f => f.id !== fav.id));
    } catch {}
  };

  const active = favs.filter(f => !f.product_ends_at || new Date(f.product_ends_at) > new Date());
  const ended = favs.filter(f => f.product_ends_at && new Date(f.product_ends_at) <= new Date());

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #f700ff08, #ffffff)" }}>
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
              <Heart className="h-5 w-5" style={{ color: "#f700ff" }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">המועדפים שלי</h1>
              <p className="text-xs text-gray-400 mt-0.5">התכשיטים והעתיקות ששמרת למעקב</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
          </div>
        ) : favs.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 mx-auto mb-4 text-gray-200" />
            <h2 className="text-lg font-bold text-gray-700 mb-2">אין עדיין מועדפים</h2>
            <p className="text-sm text-gray-400 mb-6">היכנס למוצר ולחץ על "שמור למועדפים" כדי לעקוב אחריו</p>
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
                  {active.map(fav => <FavCard key={fav.id} fav={fav} onRemove={() => remove(fav)} />)}
                </div>
              </div>
            )}
            {ended.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-4">הסתיימו ({ended.length})</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-80">
                  {ended.map(fav => <FavCard key={fav.id} fav={fav} onRemove={() => remove(fav)} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}