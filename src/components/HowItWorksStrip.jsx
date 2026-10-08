import { Link } from "react-router-dom";
import { Search, Gavel, Trophy, HeartHandshake } from "lucide-react";

// שלב 1 — מסלול הצטרפות קצר וברור: "איך זה עובד" ב-4 צעדים עם CTA
const STEPS = [
  { icon: Search, title: "גלה פריט", desc: "עיין באלפי פריטים — אמנות, תכשיטים, אספנות ועוד", color: "#e5893d" },
  { icon: Gavel, title: "הצע מחיר", desc: "נרשמים בחינם, מציעים בזמן אמת עד סיום המכרז", color: "#3e6b8a" },
  { icon: Trophy, title: "זכה במכרז", desc: "ההצעה הגבוהה בסיום זוכה — בלי עמלות נסתרות", color: "#6aa3cd" },
  { icon: HeartHandshake, title: "תאם עם המוכר", desc: "לחצן שיחה ווואטסאפ ישיר למוכר לתיאום קבלה", color: "#00a35c" },
];

export default function HowItWorksStrip() {
  return (
    <section className="bg-white py-8 sm:py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="text-center mb-7">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight mb-1.5">איך זה עובד? 4 צעדים בלבד</h2>
          <p className="text-sm text-gray-500">מהרגע הראשון — בלי הרשמה כדי לעיין, בלי עמלות בכלל</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STEPS.map((step, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:scale-[1.02] card-neon"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="w-11 h-11 mx-auto rounded-2xl flex items-center justify-center mb-3"
                style={{ background: step.color + "14", border: `1px solid ${step.color}44` }}>
                <step.icon className="h-5 w-5" style={{ color: step.color }} />
              </div>
              <div className="text-xs font-black mb-1" style={{ color: step.color }}>שלב {i + 1}</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/auctions" className="btn-neon inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white">
            התחילו לגלות מכרזים עכשיו
          </Link>
        </div>
      </div>
    </section>
  );
}