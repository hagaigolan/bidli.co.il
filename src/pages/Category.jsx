import { useParams } from "react-router-dom";
import { Tag, Search, Filter, ArrowRight } from "lucide-react";

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

const SAMPLE_ITEMS = [
  { title: "פריט נדיר מהמאה ה-19", price: "₪2,500", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop", status: "פתוח להצעות" },
  { title: "אוסף פרטי מיוחד", price: "₪1,800", image: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=300&fit=crop", status: "פתוח להצעות" },
  { title: "עבודה מקורית חתומה", price: "₪5,200", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", status: "פתוח להצעות" },
  { title: "פריט אספנות נדיר", price: "₪900", image: "https://images.unsplash.com/photo-1601925228008-f1b1d2e5e2f3?w=400&h=300&fit=crop", status: "פתוח להצעות" },
  { title: "מהדורה מוגבלת", price: "₪3,400", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop", status: "פתוח להצעות" },
  { title: "אוצר מאוסף פרטי", price: "₪7,100", image: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=400&h=300&fit=crop", status: "פתוח להצעות" },
];

export default function Category() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const cat = CATEGORIES[decodedName];

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
        <p className="text-sm text-gray-400 mb-6">{SAMPLE_ITEMS.length} פריטים נמצאו</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {SAMPLE_ITEMS.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
              <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <div className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium"
                  style={{ background: cat.color + "15", color: cat.color }}>
                  {item.status}
                </div>
                <h3 className="font-semibold text-gray-800 text-xs mb-2 line-clamp-2">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{item.price}</span>
                  <button className="text-white text-xs px-3 py-1.5 rounded-xl font-semibold transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color === "#f700ff" ? "#9d00ff" : cat.color === "#9d00ff" ? "#f700ff" : "#0088ff"})` }}>
                    הצע
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">{cat.icon}</div>
          <h3 className="font-bold text-gray-700 mb-1">מכרזים פעילים בקרוב</h3>
          <p className="text-sm text-gray-400">הירשם לקבלת עדכונים כשמכרזים חדשים יתווספו לקטגוריה זו</p>
          <button className="mt-4 text-white text-sm px-6 py-2.5 rounded-xl font-semibold"
            style={{ background: `linear-gradient(135deg, ${cat.color}, #9d00ff)` }}>
            הירשם לעדכונים
          </button>
        </div>
      </div>
    </div>
  );
}