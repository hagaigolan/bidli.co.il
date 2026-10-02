import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { categoryImageUrl } from "@/lib/categoryImages";

// אוספים תמטיים — כניסה מהירה לתחומים נבחרים
const COLLECTIONS = [
  { title: "תכשיטים וינטג' נדירים", sub: "זהב, יהלומים ופריטי יוקרה", cat: "תכשיטים", color: "#e5893d" },
  { title: "אמנות ישראלית מקורית", sub: "ציורים ופסלים של אמנים", cat: "אמנות", color: "#3e6b8a" },
  { title: "יודאיקה עתיקה", sub: "חפצי קודש ופריטי ירושה", cat: "יודאיקה", color: "#6aa3cd" },
  { title: "שעוני יוקרה", sub: "וינטג' ומותגים מובילים", cat: "שעונים", color: "#2d4f68" },
];

export default function CollectionsStrip() {
  return (
    <section className="py-6 sm:py-8 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#6aa3cd18", border: "1px solid #6aa3cd44" }}>
            <Sparkles className="h-4 w-4" style={{ color: "#3e6b8a" }} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">אוספים מומלצים</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {COLLECTIONS.map((c) => (
            <Link key={c.cat} to={`/category/${encodeURIComponent(c.cat)}`}
              className="relative h-32 sm:h-36 rounded-2xl overflow-hidden group"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <img src={categoryImageUrl(c.cat, 480, 320)} alt={c.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.color}cc, ${c.color}22 60%)` }} />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h3 className="text-white font-black text-sm sm:text-base">{c.title}</h3>
                <p className="text-white/85 text-xs">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}