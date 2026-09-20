import { useParams, Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import CategoryHero from "@/components/CategoryHero";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";

const CATEGORIES = {
  "אמנות": {
    icon: "🎨",
    description: "ציורים, פסלים, הדפסים ועבודות אמנות מקוריות מאמנים ישראליים ובינלאומיים.",
    subcategories: ["ציירים ישראלים", "אמנות בינלאומית", "הדפסים ולית'וגרפיה", "פסלים", "צילום אמנותי", "רישומים וגואש", "אמנות מסך", "קרמיקה אמנותית", "אמנות ישראלית מוקדמת", "פורטרטים"],
  },
  "יודאיקה": {
    icon: "✡️",
    description: "חפצי קודש, ספרי תורה, מזוזות, חנוכיות ופריטי הירושה היהודית.",
    subcategories: ["ספרי תורה", "חנוכיות", "מזוזות", "כסף יודאי", "מסמכים ומכתבים", "קמעות ושמשות", "טליתות וציציות", "כתובות ומזכרות", "חפצי בית הכנסת", "ארונות קודש"],
  },
  "אספנות": {
    icon: "🏺",
    description: "פריטים נדירים, מזכרות, צעצועים עתיקים, כרטיסי ספורט וכל מה שאוהבי אספנות מחפשים.",
    subcategories: ["מזכרות ספורט", "צעצועים עתיקים", "פוסטרים ושלטים", "בובות ופיגורינות", "מיכלים ובקבוקים", "כרטיסי בייסבול וכדורגל", "חוברות וקומיקס", "מטבעות ומדליות ישנים", "רדיו וגראמופונים", "מוצרי פרסום ישנים"],
  },
  "נומיסמטיקה": {
    icon: "🪙",
    description: "מטבעות, שטרות ובולים נדירים מכל תקופות ההיסטוריה.",
    subcategories: ["מטבעות ישראליים", "מטבעות עולמיים", "שטרות", "בולים", "מדליות", "מטבעות עתיקים", "אוספים ומאחסנים", "משקלות ושקלים", "כתבי חוב ומניות", "פריטי בנקאות ישנים"],
  },
  "תכשיטים": {
    icon: "💎",
    description: "תכשיטים יוקרתיים, שעונים, אבני חן ותכשיטי וינטג'.",
    subcategories: ["טבעות", "שרשראות", "עגילים", "שעונים", "תכשיטי וינטג'", "צמידים", "אבני חן", "סיכות וברושים", "תכשיטי זהב", "תכשיטי כסף"],
  },
  "עיצוב הבית": {
    icon: "🏠",
    description: "רהיטים, יצירות דקורטיביות, שטיחים וכלי בית עתיקים ומעוצבים.",
    subcategories: ["רהיטים", "שטיחים", "כלי חרס ופורצלן", "זכוכית", "תאורה", "מראות ומסגרות", "כלי כסף", "שעוני קיר ומטוטלות", "ואזות וכדים", "טקסטיל ביתי"],
  },
  "אופנה": {
    icon: "👗",
    description: "בגדים, תיקים ואביזרי אופנה מעצבים מובילים ופריטי וינטג' נדירים.",
    subcategories: ["תיקים", "נעליים", "שעונים", "בגדי מעצבים", "תכשיטי אופנה", "משקפי שמש", "חגורות ואבזרים", "צעיפים ושמלות ערב", "אופנה וינטג'", "בושמים וטיפוח"],
  },
  "רכבים": {
    icon: "🚗",
    description: "רכבים, אופנועים, כלי רכב קלאסיים וחלקי חילוף.",
    subcategories: ["רכבים קלאסיים", "אופנועים", "טרקטורונים", "חלקי חילוף", "אביזרים", "משאיות וג'יפים", "אופניים וקורקינטים", "לוחיות רישוי ומזכרות", "מודלים וצעצועי רכב", "ספרות ומסמכי רכב"],
  },
  'נדל"ן': {
    icon: "🏢",
    description: 'דירות, בתים, קרקעות ונכסים מסחריים למכירה במכרז.',
    subcategories: ["דירות", "בתים פרטיים", "קרקעות", "נכסים מסחריים", "פנטהאוז", "דירות גן", "מגרשים וחלקות", "נכסים להשקעה", "דיור מוגן", "מחסנים ומבני תעשייה"],
  },
  "ספרים": {
    icon: "📚",
    description: "ספרים נדירים, כתבי יד, ספרי ילדים עתיקים ואוספי ספרים ייחודיים.",
    subcategories: ["ספרים עתיקים", "כתבי יד", "ספרי ילדים", "מגזינים", "מפות עתיקות", "ספרי קודש", "ספרות עברית", "ספרי בישול ומלאכה", "אנציקלופדיות ולקסיקונים", "אלבומים ותיקים"],
  },
  "בולים": {
    icon: "📮",
    description: "בולים נדירים מישראל ומהעולם, אוספים מיוחדים ובולים היסטוריים.",
    subcategories: ["בולים ישראליים", "בולים עולמיים", "גיליונות מלאים", "בולים על מעטפות", "בולי שגיאה", "בולי יובלות ואירועים", "בולי אוויר וצניחה", "אוספי מדינות", "אלבומים וקטלוגים", "ניירות דואר ישנים"],
  },
  "מטבעות": {
    icon: "🪙",
    description: "מטבעות עתיקים ומודרניים, מדליות ושטרות נדירים מכל העולם.",
    subcategories: ["מטבעות ישראליים", "מטבעות עולמיים", "מדליות", "שטרות", "ערכות אספנים", "מטבעות זהב", "מטבעות כסף", "מטבעות עתיקים", "מטבעות טקסיים", "אביזרי נומיסמטיקה"],
  },
  "כלי נגינה": {
    icon: "🎸",
    description: "גיטרות, כינורות, פסנתרים וכלי נגינה נדירים ווינטג'.",
    subcategories: ["גיטרות", "כינורות", "פסנתרים", "כלי נשיפה", "תופים", "מפוחיות", "צ'לו וויולות", "כלי מיתר מזרחיים", "סינתיסייזרים וקייבורדים", "מגברים ואפקטים"],
  },
  "יין ואלכוהול": {
    icon: "🍷",
    description: "יינות יוקרה, וויסקי נדיר, קוניאק ואספי אלכוהול מיוחדים.",
    subcategories: ["יין אדום", "יין לבן", "וויסקי", "קוניאק", "בקבוקים נדירים", "שמפניה", "רום וג'ין", "וודקה וטקילה", "יינות ישראליים", "חביות ואביזרי מרתף"],
  },
  "שעונים": {
    icon: "⌚",
    description: "שעוני יוקרה, שעונים עתיקים, שעוני כיס ומותגים מובילים.",
    subcategories: ["שעוני יוקרה", "שעונים עתיקים", "שעוני כיס", "שעוני ספורט", "שעוני וינטג'", "שעוני צוללנים", "שעוני יד מכניים", "שעוני סברון וכתרים", "שעוני קיר ושולחניים", "רצועות ואביזרי שעונים"],
  },
  "אלקטרוניקה": {
    icon: "💻",
    description: "מחשבים, טלפונים, מצלמות וגאדג'טים טכנולוגיים.",
    subcategories: ["מחשבים", "טלפונים", "מצלמות", "אודיו", "גאדג'טים", "קונסולות משחקים", "טלוויזיות ומקרנים", "רמקולים ואוזניות", "מוצרי וינטג' טכנולוגיים", "אביזרים וסוללות"],
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
      <CategoryHero name={decodedName} cat={cat} />

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