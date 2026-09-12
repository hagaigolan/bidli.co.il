import { Link } from "react-router-dom";
import { LogIn, UserPlus, X } from "lucide-react";

// פופאפ "נדרש להתחבר" — מוצג בניסיון להגיש הצעה או לפרסם מכרז ללא התחברות
export default function LoginRequiredModal({ onClose, action = "bid" }) {
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search);

  return (
    <div dir="rtl" className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }} role="dialog" aria-modal="true" aria-label="נדרש להתחבר">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center relative animate-[fadeIn_0.2s_ease]"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <button onClick={onClose} aria-label="סגירה"
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 20px #e5893d44" }}>
          <LogIn className="h-7 w-7 text-white" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-1.5">נדרש להתחבר</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">
          {action === "publish"
            ? "כדי לפרסם מכרז יש להתחבר לחשבון שלך. אין עדיין חשבון? ההרשמה כוללת אימות מייל ולוקחת פחות מדקה."
            : "כדי להגיש הצעה במכרז יש להתחבר לחשבון שלך. אין עדיין חשבון? ההרשמה כוללת אימות מייל ולוקחת פחות מדקה."}
        </p>

        <div className="space-y-2.5">
          <Link to={`/login?returnTo=${returnTo}`}
            className="block w-full text-white text-sm font-bold py-3 rounded-xl transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            התחברות
          </Link>
          <Link to={`/register?returnTo=${returnTo}`}
            className="flex items-center justify-center gap-2 w-full text-sm font-bold py-3 rounded-xl border-2 transition-all hover:bg-orange-50"
            style={{ borderColor: "#e5893d", color: "#e5893d" }}>
            <UserPlus className="h-4 w-4" aria-hidden="true" /> יצירת חשבון חדש
          </Link>
          <button onClick={onClose} className="w-full text-xs text-gray-400 py-1 hover:text-gray-600 transition-colors">
            אולי בפעם אחרת
          </button>
        </div>
      </div>
    </div>
  );
}