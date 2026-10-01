import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

// צ'יפי חיפוש מוכנים — קישורים ישירים לרשימת המכרזים עם מסננים מופעלים
const POPULAR_SEARCHES = [
  { label: "תכשיטים עד ₪2,000", query: "category=תכשיטים&max=2000" },
  { label: "מציאות מתחת ל-₪500", query: "max=500" },
  { label: "אמנות ישראלית", query: "category=אמנות" },
  { label: "שעוני אספנות", query: "category=שעונים" },
  { label: "יודאיקה נדירה", query: "category=יודאיקה" },
  { label: "מטבעות ובולים", query: "category=נומיסמטיקה" },
  { label: "יין ואלכוהול", query: "category=יין ואלכוהול" },
  { label: "עיצוב הבית", query: "category=עיצוב הבית" },
];

export default function PopularSearches() {
  return (
    <section className="py-6 sm:py-8 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#3e6b8a18", border: "1px solid #3e6b8a44" }}>
            <TrendingUp className="h-4 w-4" style={{ color: "#3e6b8a" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">חיפושים פופולריים עכשיו</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCHES.map(s => (
            <Link key={s.label} to={`/auctions?${s.query}`}
              className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all hover:scale-105">
              {s.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}