import { useParams, Link } from "react-router-dom";
import { Search, Filter, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const CATEGORIES = {
  "אמנות": {
    icon: "🎨",
    description: "ציורים, פסלים, הדפסים ועבודות אמנות מקוריות מאמנים ישראליים ובינלאומיים.",
    color: "#f700ff",
    subcategories: ["ציירים ישראלים", "אמנות בינלאומית", "הדפסים ולית'וגרפיה", "פסלים", "צילום אמנותי"],
  },
  "יודאיקה": {
    icon: "✡️",
    description: "חפצי קודש, ספרי תורה, מזוזות, חנוכיות ופריטי הירושה היהודית.",
    color: "#9d00ff",
    subcategories: ["ספרי תורה", "חנוכיות", "מזוזות", "כסף יודאי", "מסמכים ומכתבים"],
  },
  "אספנות": {
    icon: "🏺",
    description: "פריטים נדירים, מזכרות, צעצועים עתיקים, כרטיסי ספורט וכל מה שאוהבי אספנות מחפשים.",
    color: "#00f7ff",
    subcategories: ["מזכרות ספורט", "צעצועים עתיקים", "פוסטרים ושלטים", "בובות ופיגורינות", "מיכלים ובקבוקים"],
  },
  "נומיסמטיקה": {
    icon: "🪙",
    description: "מטבעות, שטרות ובולים נדירים מכל תקופות ההיסטוריה.",
    color: "#0088ff",
    subcategories: ["מטבעות ישראליים", "מטבעות עולמיים", "שטרות", "בולים", "מדליות"],
  },
  "תכשיטים": {
    icon: "💎",
    description: "תכשיטים יוקרתיים, שעונים, אבני חן ותכשיטי וינטג'.",
    color: "#f700ff",
    subcategories: ["טבעות", "שרשראות", "עגילים", "שעונים", "תכשיטי וינטג'"],
  },
  "עיצוב הבית": {
    icon: "🏠",
    description: "רהיטים, יצירות דקורטיביות, שטיחים וכלי בית עתיקים ומעוצבים.",
    color: "#9d00ff",
    subcategories: ["רהיטים", "שטיחים", "כלי חרס ופורצלן", "זכוכית", "תאורה"],
  },
  "אופנה": {
    icon: "👗",
    description: "בגדים, תיקים ואביזרי אופנה מעצבים מובילים ופריטי וינטג' נדירים.",
    color: "#00f7ff",
    subcategories: ["תיקים", "נעליים", "שעונים", "בגדי מעצבים", "תכשיטי אופנה"],
  },
};

export default function Category() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const cat = CATEGORIES[decodedName];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Product.filter({ category: decodedName, status: "active" }, "-created_date", 50)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [decodedName]);

  if (!cat) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">קטגוריה לא נמצאה</h2>
          <a href="/" className="text-sm" style={{ color: "#f700ff" }}>חזרה לדף הבית</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden py-14 px-4" style={{ background: `linear-gradient(135deg, ${cat.color}0a, #ffffff)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{
          backgroundImage: `linear-gradient(${cat.color}15 1px, transparent 1px), linear-gradient(90deg, ${cat.color}15 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </a>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}44` }}>
              {cat.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">{decodedName}</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-xl">{cat.description}</p>
            </div>
          </div>

          {/* Subcategories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {cat.subcategories.map((sub, i) => (
              <button key={sub} className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-105"
                style={{ borderColor: cat.color + "55", color: cat.color, background: cat.color + "0f" }}>
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="border-y border-gray-100 bg-gray-50 py-3 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder={`חפש ב${decodedName}...`}
              className="w-full pr-10 pl-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none transition-all text-right"
              style={{ '--tw-ring-color': cat.color }}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-300 transition-all flex-shrink-0">
            <Filter className="h-4 w-4" />
            סינון
          </button>
        </div>
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
            <p className="text-sm text-gray-400 mb-6">{items.length} פריטים נמצאו</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <Link key={item.id} to={`/auction/${item.id}`} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">{cat.icon}</div>
                    }
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-xs mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">₪{item.current_price?.toLocaleString() || item.starting_price?.toLocaleString()}</span>
                      <span className="text-white text-xs px-3 py-1.5 rounded-xl font-semibold"
                        style={{ background: `linear-gradient(135deg, ${cat.color}, #9d00ff)` }}>
                        הצע
                      </span>
                    </div>
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