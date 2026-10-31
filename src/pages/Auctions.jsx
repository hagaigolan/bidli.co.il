import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta, setPageJsonLd } from "@/lib/seo";
import { Plus, Clock, MapPin, Tag, Bookmark, Map, CalendarDays } from "lucide-react";
import { SellerFomoBlock } from "@/components/SellerFomo";
import SavedSearchModal from "@/components/SavedSearchModal";
import AuctionsFilterPanel from "@/components/AuctionsFilterPanel";
import LiveCardStats from "@/components/LiveCardStats";
import CompareButton from "@/components/CompareButton";
import PullToRefresh from "@/components/PullToRefresh";
import PriceDropBadge from "@/components/PriceDropBadge";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import { isPromoted, promotedFirst } from "@/lib/promotion";
import SortBar from "@/components/SortBar";
import { AUCTIONS_SORT_OPTIONS, sortProducts } from "@/lib/auctionSort";
import { resolveCenter, withinRadius } from "@/lib/distance";

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
    <div className="relative">
      <CompareButton productId={product.id} />
    <Link to={`/auction/${product.id}`} className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-50 to-gray-100">🏺</div>}
        {isPromoted(product) && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-[11px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #6aa3cd, #3e6b8a)", boxShadow: "0 2px 8px #3e6b8a55" }}>
            ★ מקודם
          </span>
        )}
        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
          style={{ background: ended ? "#f3f4f6" : "linear-gradient(135deg,#e5893d,#3e6b8a)", color: ended ? "#6b7280" : "white" }}>
          <Clock className="h-3 w-3" />
          {ended ? "הסתיים" : <CountdownBadge endsAt={product.ends_at} small />}
        </div>
        <PriceDropBadge product={product} className="absolute bottom-2 right-2" />
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
        <div className="flex items-center justify-between gap-2">
          <LiveCardStats product={product} />
          {!ended && <AddToCalendarButton product={product} className="flex-shrink-0" />}
        </div>
      </div>
    </Link>
    </div>
  );
}

export default function Auctions() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // מסננים מה-URL של העמוד הנוכחי — נקראים מחדש בכל ניווט, כך שצ'יפי החיפוש
  // הפופולריים והחיפושים השמורים מסננים בדיוק לפי הבחירה שנשלחה בקישור
  const urlParams = new URLSearchParams(location.search);
  const ARCHIVE_MODE = urlParams.get("view") === "archive";
  const PARAM_CATEGORY = (urlParams.get("category") || "").trim();
  const PARAM_MAX = Number(urlParams.get("max")) || 0;
  const PARAM_MIN = Number(urlParams.get("min")) || 0;
  const PARAM_CITY = (urlParams.get("city") || "").trim();
  const PARAM_KEYWORD = (urlParams.get("q") || "").trim();
  const PARAM_CONDITION = (urlParams.get("condition") || "").trim();
  const PARAM_STORE = urlParams.get("store") === "1";

  // מסנני העמוד — מאותחלים מפרמטרי ה-URL (קישורים חיצוניים עם סינון נשמרים)
  const [filterCategory, setFilterCategory] = useState(PARAM_CATEGORY);
  const [filterKeyword, setFilterKeyword] = useState(PARAM_KEYWORD);
  const [filterMin, setFilterMin] = useState(PARAM_MIN);
  const [filterMax, setFilterMax] = useState(PARAM_MAX);
  const [filterCondition, setFilterCondition] = useState(PARAM_CONDITION);
  const [filterCity, setFilterCity] = useState(PARAM_CITY);
  const [storeOnly, setStoreOnly] = useState(PARAM_STORE);
  const [endingSoon, setEndingSoon] = useState(false);
  const [sort, setSort] = useState("relevance");
  // סינון לפי מרחק — עיר מרכזית + רדיוס, או המיקום מהדפדפן (רק לאחר לחיצה על "קרוב אליי")
  const [distanceCity, setDistanceCity] = useState("");
  const [radius, setRadius] = useState(0);
  const [geoPoint, setGeoPoint] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  const loadProducts = () => base44.entities.Product.list("-created_date", 50)
    .then(setProducts)
    .catch(() => {});

  useEffect(() => {
    loadProducts().finally(() => setLoading(false));
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

  const priceOf = p => (p.current_price || p.starting_price || 0);
  const distanceCenter = radius > 0 ? resolveCenter({ geoPoint, city: distanceCity }) : null;
  const distanceActive = !!distanceCenter;
  const active = products.filter(p => {
    if (p.status === "cancelled" || new Date(p.ends_at) <= new Date()) return false;
    // סינון לפי המחיר בפועל כרגע (המחיר הנוכחי, או ההתחלתי כשאין הצעות)
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterKeyword.trim()) {
      const term = filterKeyword.trim().toLowerCase();
      const hay = `${p.title || ""} ${p.description || ""}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    if (storeOnly && !p.is_stock) return false;
    if (filterMin && priceOf(p) < filterMin) return false;
    if (filterMax && priceOf(p) > filterMax) return false;
    if (filterCondition && p.condition !== filterCondition) return false;
    if (filterCity && !(p.location || "").includes(filterCity)) return false;
    // סינון לפי מרחק מנקודת המוצא — עד הרדיוס שנבחר
    if (distanceActive && !withinRadius(p, distanceCenter, radius)) return false;
    // מסתיים בקרוב — תוך 24 שעות
    if (endingSoon && new Date(p.ends_at) - Date.now() > 24 * 3600000) return false;
    return true;
  });
  const ended = products.filter(p => new Date(p.ends_at) <= new Date());
  const activeTotal = products.filter(p => p.status !== "cancelled" && new Date(p.ends_at) > new Date()).length;
  const hasFilters = filterCategory || filterKeyword || filterMin || filterMax || filterCondition || filterCity || storeOnly || endingSoon || distanceActive;
  const cities = [...new Set(products.map(p => p.location).filter(Boolean))];
  // מכרזים מקודמים מוצגים ראשונים — המיון פועל יחד עם כל המסננים
  const activeList = promotedFirst(sortProducts(active, sort));
  const resetFilters = () => {
    setFilterCategory(""); setFilterKeyword(""); setFilterMin(0); setFilterMax(0);
    setFilterCondition(""); setFilterCity(""); setStoreOnly(false); setEndingSoon(false);
    setRadius(0); setDistanceCity(""); setGeoPoint(null); setGeoError("");
  };

  // "קרוב אליי" — בקשת הרשאת המיקום מופיעה רק לאחר לחיצה על הכפתור
  const handleNearMe = () => {
    setGeoError("");
    if (!navigator.geolocation) {
      setGeoError("הדפדפן הזה לא תומך באיתור מיקום — אפשר לבחור עיר מרכזית ולסנן לפי רדיוס");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDistanceCity("");
        setRadius(r => (r > 0 ? r : 25));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setGeoError(err && err.code === 1
          ? "לא אישרתם גישה למיקום — אפשר לבחור עיר מרכזית ולסנן לפי רדיוס"
          : "לא הצלחנו לאתר את המיקום — נסו שוב או בחרו עיר מרכזית");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };
  const chooseDistanceCity = (city) => {
    setGeoPoint(null);
    setDistanceCity(city);
    if (city && !radius) setRadius(25);
  };
  const clearDistance = () => { setRadius(0); setDistanceCity(""); setGeoPoint(null); setGeoError(""); };

  return (
    <PullToRefresh onRefresh={loadProducts}>
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{ARCHIVE_MODE ? "ארכיון מכרזים" : "מכרזים פעילים"}</h1>
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

        {/* לוח סינון + שמירת חיפוש + תצוגת מפה */}
        {!ARCHIVE_MODE && (
          <>
            <AuctionsFilterPanel
              category={filterCategory} setCategory={setFilterCategory}
              keyword={filterKeyword} setKeyword={setFilterKeyword}
              minPrice={filterMin} setMinPrice={setFilterMin}
              maxPrice={filterMax} setMaxPrice={setFilterMax}
              condition={filterCondition} setCondition={setFilterCondition}
              city={filterCity} setCity={setFilterCity}
              endingSoon={endingSoon} setEndingSoon={setEndingSoon}
              storeOnly={storeOnly} setStoreOnly={setStoreOnly}
              cities={cities} count={active.length} totalCount={activeTotal}
              onReset={resetFilters}
              distanceActive={distanceActive}
              distanceCity={distanceCity} setDistanceCity={chooseDistanceCity}
              radius={radius} setRadius={setRadius}
              onNearMe={handleNearMe} locating={locating} geoError={geoError}
              usingGeo={!!geoPoint} onClearDistance={clearDistance}
            />
            <div className="flex items-center justify-end gap-3 mb-5" dir="rtl">
              <Link to="/auction-calendar"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:border-[#3e6b8a66] hover:text-[#3e6b8a] transition-all">
                <CalendarDays className="h-3.5 w-3.5" />
                לוח מכרזים
              </Link>
              <Link to="/auctions-map"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200 text-gray-600 hover:border-[#3e6b8a66] hover:text-[#3e6b8a] transition-all">
                <Map className="h-3.5 w-3.5" />
                תצוגת מפה
              </Link>
              <button onClick={() => setShowSaveSearch(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.02]"
                style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                <Bookmark className="h-3.5 w-3.5" />
                שמור חיפוש — התרא על מכרזים חדשים
              </button>
            </div>
          </>
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
                <SortBar sort={sort} onChange={setSort} options={AUCTIONS_SORT_OPTIONS} />

                {active.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      מכרזים פעילים ({active.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {activeList.map(p => <AuctionCard key={p.id} product={p} />)}
                    </div>
                  </div>
                )}

                {hasFilters && active.length === 0 && (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="font-bold text-gray-700 mb-1">אין מכרזים תואמים למסננים</p>
                    <p className="text-sm text-gray-400 mb-4">נסה להרחיב את המסננים, או שמור את החיפוש ונעדכן אותך כשמכרז חדש ייפתח</p>
                    <button onClick={resetFilters} className="text-sm font-bold underline" style={{ color: "#e5893d" }}>
                      נקה מסננים והצג הכל
                    </button>
                  </div>
                )}

              </>
            )}
          </>
        )}
      </div>

      {showSaveSearch && (
        <SavedSearchModal
          category={filterCategory}
          keyword={filterKeyword}
          minPrice={filterMin}
          maxPrice={filterMax}
          condition={filterCondition}
          city={filterCity}
          defaultLabel={[filterCategory || "כל המכרזים",
            filterKeyword ? `«${filterKeyword}»` : null,
            filterMax ? `עד ₪${filterMax.toLocaleString()}` : null].filter(Boolean).join(" · ")}
          onClose={() => setShowSaveSearch(false)}
          onSaved={() => {}}
        />
      )}
    </div>
    </PullToRefresh>
  );
}