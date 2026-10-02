import { useParams, Link } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import LiveCardStats from "@/components/LiveCardStats";
import CategoryHero from "@/components/CategoryHero";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { setPageMeta, setPageJsonLd } from "@/lib/seo";
import { SUBCATEGORIES } from "@/lib/subcategories";

const CATEGORIES = {
  "אמנות": { icon: "🎨", description: "ציורים, פסלים, הדפסים ועבודות אמנות מקוריות מאמנים ישראליים ובינלאומיים." },
  "יודאיקה": { icon: "✡️", description: "חפצי קודש, ספרי תורה, מזוזות, חנוכיות ופריטי הירושה היהודית." },
  "אספנות": { icon: "🏺", description: "פריטים נדירים, מזכרות, צעצועים עתיקים, כרטיסי ספורט וכל מה שאוהבי אספנות מחפשים." },
  "נומיסמטיקה": { icon: "🪙", description: "מטבעות, שטרות ובולים נדירים מכל תקופות ההיסטוריה." },
  "מטבעות": { icon: "🪙", description: "מטבעות עתיקים ומודרניים, מדליות ושטרות נדירים מכל העולם." },
  "בולים": { icon: "📮", description: "בולים נדירים מישראל ומהעולם, אוספים מיוחדים ובולים היסטוריים." },
  "תכשיטים": { icon: "💎", description: "תכשיטים יוקרתיים, שעונים, אבני חן ותכשיטי וינטג'." },
  "שעונים": { icon: "⌚", description: "שעוני יוקרה, שעונים עתיקים, שעוני כיס ומותגים מובילים." },
  "עיצוב הבית": { icon: "🏠", description: "רהיטים, יצירות דקורטיביות, שטיחים וכלי בית עתיקים ומעוצבים." },
  "אופנה": { icon: "👗", description: "בגדים, תיקים ואביזרי אופנה מעצבים מובילים ופריטי וינטג' נדירים." },
  "ספרים": { icon: "📚", description: "ספרים נדירים, כתבי יד, ספרי ילדים עתיקים ואוספי ספרים ייחודיים." },
  "כלי נגינה": { icon: "🎸", description: "גיטרות, כינורות, פסנתרים וכלי נגינה נדירים ווינטג'." },
  "יין ואלכוהול": { icon: "🍷", description: "יינות יוקרה, וויסקי נדיר, קוניאק ואספי אלכוהול מיוחדים." },
  "אלקטרוניקה": { icon: "💻", description: "מחשבים, טלפונים, מצלמות וגאדג'טים טכנולוגיים." },
  "רכבים": { icon: "🚗", description: "רכבים, אופנועים, כלי רכב קלאסיים וחלקי חילוף." },
  'נדל"ן': { icon: "🏢", description: 'דירות, בתים, קרקעות ונכסים מסחריים למכירה במכרז.' },
};

export default function Category() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const cat = CATEGORIES[decodedName];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("ending_soon");
  const [condition, setCondition] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // סינון ומיון — חיפוש חופשי, מצב פריט, מחיר מקסימלי ומיון לפי בחירה
  const filtered = (() => {
    let list = items;
    const term = query.trim().toLowerCase();
    if (term) list = list.filter((p) => (p.title || "").toLowerCase().includes(term));
    if (condition) list = list.filter((p) => p.condition === condition);
    if (maxPrice) list = list.filter((p) => (Number(p.current_price || p.starting_price) || 0) <= Number(maxPrice));
    const price = (p) => Number(p.current_price || p.starting_price) || 0;
    const sorters = {
      ending_soon: (a, b) => new Date(a.ends_at) - new Date(b.ends_at),
      newest: (a, b) => new Date(b.created_date) - new Date(a.created_date),
      popular: (a, b) => (b.bid_count || 0) - (a.bid_count || 0),
      price_low: (a, b) => price(a) - price(b),
      price_high: (a, b) => price(b) - price(a),
    };
    return [...list].sort(sorters[sort] || sorters.ending_soon);
  })();

  useEffect(() => {
    base44.entities.Product.filter({ category: decodedName, status: "active" }, "-created_date", 50)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedName]);

  // SEO: כותרת ותיאור ייחודיים לכל קטגוריה
  useEffect(() => {
    if (!cat) return;
    setPageMeta({
      title: `מכרזי ${decodedName} — קנה ומכור במכרז אונליין | bidli`,
      description: `${cat.description} מכרזים חיים של ${decodedName} ב-bidli, פורטל המכרזים בישראל — הצע מחיר בזמן אמת, המכרזים נסגרים תוך 24 שעות.`,
    });
  }, [decodedName]);

  // SEO: ItemList — נתונים מובנים של פריטי הקטגוריה לתוצאות עשירות בגוגל
  useEffect(() => {
    if (!items.length) return;
    setPageJsonLd({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `מכרזי ${decodedName} ב-bidli`,
      numberOfItems: items.length,
      itemListElement: items.slice(0, 25).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${window.location.origin}/auction/${item.id}`,
        name: item.title,
      })),
    });
  }, [items, decodedName]);

  if (!cat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">קטגוריה לא נמצאה</h2>
          <a href="/" className="text-sm" style={{ color: "#e5893d" }}>חזרה לדף הבית</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <CategoryHero name={decodedName} cat={{ ...cat, subcategories: SUBCATEGORIES[decodedName] || [] }} />

      {/* Search + filter bar */}
      <div className="border-y border-gray-100 bg-gray-50 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`חפש ב${decodedName}...`}
              className="w-full pr-10 pl-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none transition-all text-right"
              style={{ '--tw-ring-color': cat.color }}
            />
          </div>
          <button type="button" onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${showFilters ? "text-white border-transparent" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"}`}
            style={showFilters ? { background: cat.color } : undefined}>
            <Filter className="h-4 w-4" />
            סינון
          </button>
        </div>
        {showFilters && (
          <div className="max-w-5xl mx-auto mt-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3" dir="rtl">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">מיון</p>
              <div className="flex flex-wrap gap-2">
                {[{ id: "ending_soon", label: "מסתיים בקרוב" }, { id: "newest", label: "חדשים" }, { id: "popular", label: "הכי הרבה הצעות" }, { id: "price_low", label: "מחיר: נמוך ← גבוה" }, { id: "price_high", label: "מחיר: גבוה ← נמוך" }].map((o) => (
                  <button key={o.id} type="button" onClick={() => setSort(o.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sort === o.id ? "text-white" : "bg-gray-50 text-gray-600 border border-gray-200"}`}
                    style={sort === o.id ? { background: cat.color } : undefined}>{o.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">מצב הפריט</p>
              <div className="flex flex-wrap gap-2">
                {["", "חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"].map((c) => (
                  <button key={c || "all"} type="button" onClick={() => setCondition(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${condition === c ? "text-white" : "bg-gray-50 text-gray-600 border border-gray-200"}`}
                    style={condition === c ? { background: cat.color } : undefined}>{c || "הכל"}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2">מחיר מקסימלי (₪)</p>
              <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="ללא הגבלה"
                className="w-40 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none text-right" />
            </div>
            {(query || condition || maxPrice || sort !== "ending_soon") && (
              <button type="button" onClick={() => { setQuery(""); setCondition(""); setMaxPrice(""); setSort("ending_soon"); }}
                className="flex items-center gap-1 text-xs font-bold" style={{ color: "#e5893d" }}>
                <X className="h-3.5 w-3.5" aria-hidden="true" /> איפוס כל הסינונים
              </button>
            )}
          </div>
        )}
      </div>

      {/* Items grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center p-8 rounded-2xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-bold text-gray-700 mb-1">אין פריטים פעילים כרגע</h3>
            <p className="text-sm text-gray-400">הירשם לקבלת עדכונים כשמכרזים חדשים יתווספו לקטגוריה זו</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">{filtered.length} פריטים נמצאו</p>
            {filtered.length === 0 && (
              <div className="text-center p-8 rounded-2xl border border-dashed border-gray-200">
                <p className="text-3xl mb-2">🔍</p>
                <h3 className="font-bold text-gray-700 mb-1">אין תוצאות לסינון שהוגדר</h3>
                <button type="button" onClick={() => { setQuery(""); setCondition(""); setMaxPrice(""); }}
                  className="text-sm font-bold" style={{ color: "#e5893d" }}>איפוס סינון</button>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <Link key={item.id} to={`/auction/${item.id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">{cat.icon}</div>
                    }
                    {(item.bid_count || 0) >= 3 && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black text-white"
                        style={{ background: "linear-gradient(135deg, #ef4444, #e5893d)" }}>🔥 מדובר</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-xs mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">₪{item.current_price?.toLocaleString() || item.starting_price?.toLocaleString()}</span>
                      <span className="text-white text-xs px-3 py-1.5 rounded-xl font-semibold"
                        style={{ background: `linear-gradient(135deg, ${cat.color}, #3e6b8a)` }}>
                        הצע
                      </span>
                    </div>
                    <LiveCardStats product={item} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}