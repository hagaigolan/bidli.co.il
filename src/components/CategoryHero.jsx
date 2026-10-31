import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { categoryImageUrl } from "@/lib/categoryImages";

// כותרת דף קטגוריה עם תמונת רקע מתאימה לקטגוריה ושכבת לבן שמשמרת קריאות הכיתוב
export default function CategoryHero({ name, cat }) {
  const heroImg = categoryImageUrl(name, 1600, 600);

  return (
    <div className="relative overflow-hidden" dir="rtl">
      {heroImg && (
        <>
          <img src={heroImg} alt="" aria-hidden="true" loading="lazy"
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: "rgba(255,255,255,0.2)" }} />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </>
      )}

      <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-7">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          חזרה לדף הבית
        </Link>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-sm"
            style={{ background: "#ffffff", border: "1px solid #e9d5ff" }}>
            {cat.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-gray-900 mb-1.5">מכרזי {name}</h1>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xl">{cat.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {cat.subcategories.map((sub) => (
            <button key={sub} type="button"
              className="px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.85)", color: "#7c3aed", border: "1px solid #e9d5ff" }}>
              {sub}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}