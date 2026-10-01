import { Link } from "react-router-dom";
import { categoryImageUrl } from "@/lib/categoryImages";

// גריד גישה מהירה לקטגוריות — מעגל תמונה + תווית, כניסה בלחיצה אחת (בסטנדרט לוחות מודעות)
const QUICK_CATEGORIES = [
  "אמנות", "תכשיטים", "יודאיקה", "שעונים", "נומיסמטיקה",
  "מטבעות", "בולים", "אספנות", "יין ואלכוהול", "עיצוב הבית",
  "כלי נגינה", "ספרים", "אופנה", "אלקטרוניקה",
];

export default function CategoryGrid() {
  return (
    <section className="py-8 sm:py-10 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6 text-center">גישה מהירה לקטגוריות</h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-y-5 gap-x-2 justify-items-center">
          {QUICK_CATEGORIES.map(cat => (
            <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}
              className="group flex flex-col items-center gap-2 w-full">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#e5893d88] transition-all group-hover:scale-105 flex-shrink-0"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <img src={categoryImageUrl(cat, 160, 160)} alt={cat}
                  className="w-full h-full object-cover" loading="lazy"
                  onError={e => { e.target.style.display = "none"; }} />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-600 group-hover:text-[#e5893d] transition-colors text-center leading-tight">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}