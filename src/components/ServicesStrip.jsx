import { Link } from "react-router-dom";
import { Calculator, GraduationCap, Map } from "lucide-react";

// מקטע שירותים בדף הבית — כניסות לכלים ולדירקטוריון
const SERVICES = [
  {
    icon: Calculator,
    title: "מחשבון הערכת שווי",
    desc: "הזן פריט וקבל טווח שווי מוערך לפני שאתה מציע או מפרסם",
    path: "/valuation",
    color: "#e5893d",
  },
  {
    icon: GraduationCap,
    title: "דירקטוריון מומחים",
    desc: "שמאים, משקמי עתיקות ומומחי אספנות — להערכה מקצועית",
    path: "/experts",
    color: "#3e6b8a",
  },
  {
    icon: Map,
    title: "מפת המכרזים",
    desc: "מצא מכרזים פעילים לפי מיקום — מושלם לאיסוף עצמי",
    path: "/auctions-map",
    color: "#6aa3cd",
  },
];

export default function ServicesStrip() {
  return (
    <section className="py-6 sm:py-8 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SERVICES.map(s => (
            <Link key={s.path} to={s.path}
              className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 group hover:border-transparent transition-all duration-300 card-neon"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + "18", border: `1px solid ${s.color}44` }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm group-hover:text-[#e5893d] transition-colors">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}