import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta, setPageJsonLd } from "@/lib/seo";
import { Plus, Clock, MapPin, Tag, Bookmark, Map } from "lucide-react";
import { SellerFomoBlock } from "@/components/SellerFomo";
import SavedSearchModal from "@/components/SavedSearchModal";

const urlParams = new URLSearchParams(window.location.search);
const ARCHIVE_MODE = urlParams.get("view") === "archive";
// מסננים מה-URL — מופעלים מצ'יפי החיפוש הפופולריים בדף הבית ומהחיפושים השמורים
const PARAM_CATEGORY = (urlParams.get("category") || "").trim();
const PARAM_MAX = Number(urlParams.get("max")) || 0;

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

function CountdownBadge({ endsAt, small }) {
  const left = useCountdown(endsAt);
  if (!left) return <span className="text-xs font-bold text-gray-400">הסתיים</span>;
  const urgent = left.total < 3600000;
  return (
    <span className={`font-mono font-bold ${small ? "text-xs" : "text-sm"}`}
      style={{ color: urgent ? "#e5893d" : "#2d4f68" }}>
      {String(left.h).padStart(2,"0")}:{String(left.m).padStart(2,"0")}:{String(left.s).padStart(2,"0")}
    </span>
  );
}

function AuctionCard({ product }) {
  const ended = new Date(product.ends_at) < new Date();
  return (
    <Link to={`/auction/${product.id}`} className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">🏺</div>}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: ended ? "#f3f4f6" : "linear-gradient(135deg,#e5893d,#3e6b8a)", color: ended ? "#6b7280" : "white" }}>
          <Clock className="h-3 w-3" />
          {ended ? "הסתיים" : <CountdownBadge endsAt={product.ends_at} small />}
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

export default function Auctions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.entities.Product.list("-created_date", 50)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // SEO: כותרת ותיאור לעמוד המכרזים
  useEffect(() => {
    setPageMeta({
      title: ARCHIVE_MODE ? "ארכיון מכרזים — מכרזים שהסתיימו | bidli" : "מכרזים אונליין בישראל — כל המכרזים הפעילים | bidli",
      description: "כל המכרזים הפעילים ב-bidli: אמנות, תכשיטים, יודאיקה, שעונים, מטבעות, בולים ואספנות. הצע מחיר בזמן אמת — המכרזים נסגרים תוך 24 שעות.",
      noindex: ARCHIVE_MODE,
    });
  }, []);

  // SEO: ItemList — נתונים מובנים של המכרזים הפעילים לתוצאות עשירות בגוגל
  useEffect(() => {
    if (ARCHIVE_MODE) return;
    const active = products.filter(p => p.status === "active" && new Date(p.ends_at) > new Date());
    if (!active.length) return;
    setPageJsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "מכרזים פעילים ב-bidli",
      numberOfItems: active.length,
      itemListElement: active.slice(0, 25).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/auction/${p.id}`,
        name: p.title,
      })),
    });
  }, [products]);

  const active = products.filter(p => {
    if (p.status === "cancelled" || new Date(p.ends_at) <= new Date()) return false;
    if (PARAM_CATEGORY && p.category !== PARAM_CATEGORY) return false;
    if (PARAM_MAX && (p.starting_price || 0) > PARAM_MAX) return false;
    return true;
  });
  const ended = products.filter(p => new Date(p.ends_at) <= new Date());
  const hasFilters = PARAM_CATEGORY || PARAM_MAX;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{ARCHIVE_MODE ? "ארכיון מכרזים" : "כל המכרזים"}</h1>
            <p className="text-sm text-gray-400 mt-1">{ARCHIVE_MODE ? `${ended.length} מכרזים שהסתיימו` : `${active.length} מכרזים פעילים`}</p>
          </div>
          <button onClick={() => navigate("/upload-product")}
            className="flex items-center gap-2 text-white text-sm px-5 py-2.5 rounded-xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
            <Plus className="h-4 w-4" />
            פרסם מכרז
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <SellerFomoBlock />

        {/* מסננים פעילים + שמירת חיפוש + תצוגת מפה */}
        {!ARCHIVE_MODE && (
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap" dir="rtl">
            <div className="flex items-center gap-2 flex-wrap">
              {hasFilters && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: "#e5893d0f", color: "#e5893d", border: "1px solid #e5893d44" }}>
                  {PARAM_CATEGORY && <span>קטגוריה: {PARAM_CATEGORY}</span>}
                  {PARAM_CATEGORY && PARAM_MAX && <span>·</span>}
                  {PARAM_MAX && <span>עד ₪{PARAM_MAX.toLocaleString()}</span>}
                  <Link to="/auctions" aria-label="ניקוי מסננים" className="hover:opacity-70">✕</Link>
                </span>
              )}
              <Link to="/auctions-map"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:border-[#3e6b8a66] hover:text-[#3e6b8a] transition-all">
                <Map className="h-3.5 w-3.5" />
                תצוגת מפה
              </Link>
            </div>
            <button onClick={() => setShowSaveSearch(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02]"
              style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
              <Bookmark className="h-3.5 w-3.5" />
              שמור חיפוש — התרא על מכרזים חדשים
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏺</p>
            <h2 className="text-lg font-bold text-gray-700 mb-2">אין מכרזים עדיין</h2>
            <p className="text-sm text-gray-400 mb-6">היה הראשון לפרסם מוצר!</p>
            <button onClick={() => navigate("/upload-product")}
              className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              פרסם מכרז
            </button>
          </div>
        ) : (
          <>
            {ARCHIVE_MODE ? (
              ended.length > 0 ? (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-80">
                    {ended.map(p => <AuctionCard key={p.id} product={p} />)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">📦</p>
                  <h2 className="text-lg font-bold text-gray-700 mb-2">אין מכרזים שהסתיימו עדיין</h2>
                </div>
              )
            ) : (
              <>
                {active.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      מכרזים פעילים ({active.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {active.map(p => <AuctionCard key={p.id} product={p} />)}
                    </div>
                  </div>
                )}

                {hasFilters && active.length === 0 && (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-bold text-gray-700 mb-1">אין מכרזים תואמים למסננים</p>
                    <p className="text-sm text-gray-400 mb-4">נסה להרחיב את המסננים, או שמור את החיפוש ונעדכן אותך כשמכרז חדש ייפתח</p>
                    <Link to="/auctions" className="text-sm font-bold underline" style={{ color: "#e5893d" }}>
                      נקה מסננים והצג הכל
                    </Link>
                  </div>
                )}

              </>
            )}
          </>
        )}
      </div>

      {showSaveSearch && (
        <SavedSearchModal
          category={PARAM_CATEGORY}
          maxPrice={PARAM_MAX}
          defaultLabel={PARAM_CATEGORY
            ? `${PARAM_CATEGORY}${PARAM_MAX ? ` עד ₪${PARAM_MAX.toLocaleString()}` : ""}`
            : PARAM_MAX ? `מכרזים עד ₪${PARAM_MAX.toLocaleString()}` : "כל המכרזים"}
          onClose={() => setShowSaveSearch(false)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
}