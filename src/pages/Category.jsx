import { useParams, Link } from "react-router-dom";
import { Search, Filter, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";

const CATEGORIES = {
  "אמנות": {
    icon: "🎨",
    description: "ציורים, פסלים, הדפסים ועבודות אמנות מקוריות מאמנים ישראליים ובינלאומיים.",
    subcategories: ["ציירים ישראלים", "אמנות בינלאומית", "הדפסים ולית'וגרפיה", "פסלים", "צילום אמנותי"],
  },
  "יודאיקה": {
    icon: "✡️",
    description: "חפצי קודש, ספרי תורה, מזוזות, חנוכיות ופריטי הירושה היהודית.",
    subcategories: ["ספרי תורה", "חנוכיות", "מזוזות", "כסף יודאי", "מסמכים ומכתבים"],
  },
  "אספנות": {
    icon: "🏺",
    description: "פריטים נדירים, מזכרות, צעצועים עתיקים, כרטיסי ספורט וכל מה שאוהבי אספנות מחפשים.",
    subcategories: ["מזכרות ספורט", "צעצועים עתיקים", "פוסטרים ושלטים", "בובות ופיגורינות", "מיכלים ובקבוקים"],
  },
  "נומיסמטיקה": {
    icon: "🪙",
    description: "מטבעות, שטרות ובולים נדירים מכל תקופות ההיסטוריה.",
    subcategories: ["מטבעות ישראליים", "מטבעות עולמיים", "שטרות", "בולים", "מדליות"],
  },
  "תכשיטים": {
    icon: "💎",
    description: "תכשיטים יוקרתיים, שעונים, אבני חן ותכשיטי וינטג'.",
    subcategories: ["טבעות", "שרשראות", "עגילים", "שעונים", "תכשיטי וינטג'"],
  },
  "עיצוב הבית": {
    icon: "🏠",
    description: "רהיטים, יצירות דקורטיביות, שטיחים וכלי בית עתיקים ומעוצבים.",
    subcategories: ["רהיטים", "שטיחים", "כלי חרס ופורצלן", "זכוכית", "תאורה"],
  },
  "אופנה": {
    icon: "👗",
    description: "בגדים, תיקים ואביזרי אופנה מעצבים מובילים ופריטי וינטג' נדירים.",
    subcategories: ["תיקים", "נעליים", "שעונים", "בגדי מעצבים", "תכשיטי אופנה"],
  },
  "רכבים": {
    icon: "🚗",
    description: "רכבים, אופנועים, כלי רכב קלאסיים וחלקי חילוף.",
    subcategories: ["רכבים קלאסיים", "אופנועים", "טרקטורונים", "חלקי חילוף", "אביזרים"],
  },
  'נדל"ן': {
    icon: "🏢",
    description: 'דירות, בתים, קרקעות ונכסים מסחריים למכירה במכרז.',
    subcategories: ["דירות", "בתים פרטיים", "קרקעות", "נכסים מסחריים", "פנטהאוז"],
  },
  "ספרים": {
    icon: "📚",
    description: "ספרים נדירים, כתבי יד, ספרי ילדים עתיקים ואוספי ספרים ייחודיים.",
    subcategories: ["ספרים עתיקים", "כתבי יד", "ספרי ילדים", "מגזינים", "מפות עתיקות"],
  },
  "בולים": {
    icon: "📮",
    description: "בולים נדירים מישראל ומהעולם, אוספים מיוחדים ובולים היסטוריים.",
    subcategories: ["בולים ישראליים", "בולים עולמיים", "גיליונות מלאים", "בולים על מעטפות", "בולי שגיאה"],
  },
  "מטבעות": {
    icon: "🪙",
    description: "מטבעות עתיקים ומודרניים, מדליות ושטרות נדירים מכל העולם.",
    subcategories: ["מטבעות ישראליים", "מטבעות עולמיים", "מדליות", "שטרות", "ערכות אספנים"],
  },
  "כלי נגינה": {
    icon: "🎸",
    description: "גיטרות, כינורות, פסנתרים וכלי נגינה נדירים ווינטג'.",
    subcategories: ["גיטרות", "כינורות", "פסנתרים", "כלי נשיפה", "תופים"],
  },
  "יין ואלכוהול": {
    icon: "🍷",
    description: "יינות יוקרה, וויסקי נדיר, קוניאק ואספי אלכוהול מיוחדים.",
    subcategories: ["יין אדום", "יין לבן", "וויסקי", "קוניאק", "בקבוקים נדירים"],
  },
  "שעונים": {
    icon: "⌚",
    description: "שעוני יוקרה, שעונים עתיקים, שעוני כיס ומותגים מובילים.",
    subcategories: ["שעוני יוקרה", "שעונים עתיקים", "שעוני כיס", "שעוני ספורט", "שעוני וינטג'"],
  },
  "אלקטרוניקה": {
    icon: "💻",
    description: "מחשבים, טלפונים, מצלמות וגאדג'טים טכנולוגיים.",
    subcategories: ["מחשבים", "טלפונים", "מצלמות", "אודיו", "גאדג'טים"],
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

  // SEO: כותרת ותיאור ייחודיים לכל קטגוריה
  useEffect(() => {
    if (!cat) return;
    setPageMeta({
      title: `מכרזי ${decodedName} — קנה ומכור במכרז אונליין | bidli`,
      description: `${cat.description} מכרזים חיים של ${decodedName} ב-bidli, פורטל המכרזים בישראל — הצע מחיר בזמן אמת, המכרזים נסגרים תוך 24 שעות.`,
    });
  }, [decodedName]);

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
      <div className="px-4 pt-6 pb-5" style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #fdf4ff 60%, #ffffff 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </a>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-black text-gray-900 mb-1">מכרזי {decodedName}</h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg">{cat.description}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: "#f3e8ff", border: "1px solid #e9d5ff" }}>
              {cat.icon}
            </div>
          </div>

          {/* Subcategories */}
          <div className="flex flex-wrap gap-2">
            {cat.subcategories.map((sub) => (
              <button key={sub} className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                style={{ background: "#f3e8ff", color: "#7c3aed", border: "1px solid #e9d5ff" }}>
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
                        style={{ background: `linear-gradient(135deg, ${cat.color}, #3e6b8a)` }}>
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