import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

// ארבעת מדריכי הליבה של האתר — קישורים פנימיים קבועים (עוגנים קבועים לקידום אורגני)
export const CORE_GUIDES = [
  { to: "/what-is-bidli", label: "מה זה בידלי ואיך זה עובד" },
  { to: "/how-much-is-it-worth", label: "כמה שווה פריט?" },
  { to: "/bidli-vs-yad2-ebay", label: "בידלי מול יד2 מול eBay" },
  { to: "/מכרז-24-שעות", label: "מכרז 24 שעות" },
];

// בלוק "מדריכים שימושיים" — מוצג בעמודי קטגוריה ובעמוד המכרז
export default function GuidesLinksBlock({ className = "" }) {
  return (
    <section className={`mt-8 ${className}`} dir="rtl" aria-labelledby="guides-block-title">
      <h2 id="guides-block-title" className="flex items-center gap-2 text-base font-black text-gray-900 mb-3">
        <BookOpen className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        מדריכים שימושיים
      </h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {CORE_GUIDES.map((guide) => (
          <li key={guide.to}>
            <Link
              to={guide.to}
              className="group flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-white p-3 text-sm font-bold text-gray-900 transition-all hover:border-[#e5893d55] hover:shadow-sm"
            >
              <span>{guide.label}</span>
              <ArrowLeft className="h-4 w-4 flex-shrink-0" style={{ color: "#e5893d" }} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}