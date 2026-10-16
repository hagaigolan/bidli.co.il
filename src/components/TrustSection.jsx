import { Link } from "react-router-dom";
import { Eye, CreditCard, BadgeCheck, Lock, Users, ShieldCheck } from "lucide-react";

// שקיפות ופרטיות — מקטע אמון בדף הבית
const TRUST_ITEMS = [
  {
    icon: Eye,
    color: "#e5893d",
    title: "שקיפות מחירים מלאה",
    text: "אין עמלות נסתרות: דמי טיפול של 3% מוצגים לך מראש, לפני שאתה מגיש הצעה או משלם. מה שאתה רואה — זה מה שאתה משלם.",
  },
  {
    icon: CreditCard,
    color: "#2d4f68",
    title: "תשלום ישיר, בלי כרטיס אשראי",
    text: "התשלום עובר בהעברה ישירה (קש / ביט / העברה בנקאית) ישירות למוכר. פרטי כרטיס אשראי לא נאספים ולא נשמרים במערכת.",
  },
  {
    icon: BadgeCheck,
    color: "#00c853",
    title: "אישור כפול לכל עסקה",
    text: "הקונה מדווח על ההעברה, והמוכר מאשר שהכסף התקבל — רק אז ההזמנה נסגרת. שני הצדדים רואים את הסטטוס בכל רגע.",
  },
  {
    icon: Lock,
    color: "#3e6b8a",
    title: "הפרטים שלך נשארים שלך",
    text: "השם, האימייל והטלפון משמשים אך ורק לניהול ההזמנה וההתראות שביקשת. לא מוכרים ולא מעבירים אותם לצד שלישי.",
  },
  {
    icon: Users,
    color: "#f97316",
    title: "אנטי שילוח — מכרז הוגן",
    text: "מוכרים לא יכולים להגיש הצעות על המכרזים של עצמם, וכל ההצעות נרשמות וגלויות בזמן אמת לכולם.",
  },
  {
    icon: ShieldCheck,
    color: "#6aa3cd",
    title: "דירוגי מוכרים אמיתיים",
    text: "בסיום כל מכרז הקונים מדרגים את המוכר, כך שהמוניטין נבנה מביקורות אמת — ומוצג לכל מכרז חדש.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-10 border-t border-gray-100" style={{ background: "linear-gradient(180deg, #ffffff, #fafaff)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-6 w-6" style={{ color: "#3e6b8a" }} aria-hidden="true" />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">שקיפות ופרטיות — ככה זה עובד אצלנו</h2>
        </div>
        <p className="text-sm text-gray-400 mb-6">כל מה שחשוב לדעת על מחירים, תשלומים והמידע שלך — בגלוי</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, color, title, text }) => (
            <div key={title} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color + "14", border: `1px solid ${color}33` }}>
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-5 text-xs">
          <Link to="/terms" className="font-bold hover:opacity-80 transition-opacity" style={{ color: "#3e6b8a" }}>
            תנאי שימוש ומדיניות פרטיות מלאים ←
          </Link>
          <Link to="/contact" className="font-bold text-gray-500 hover:text-gray-700 transition-colors">
            שאלות? דברו איתנו ←
          </Link>
        </div>
      </div>
    </section>
  );
}