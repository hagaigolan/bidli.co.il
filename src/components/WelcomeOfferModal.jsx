import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Gavel, Timer, BadgePercent } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// פופאפ ברוכים-הבאים למבקר חדש — פעם אחת במכשיר, למשתמשים שאינם מחוברים
export default function WelcomeOfferModal() {
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAuthenticated) return;
    if (localStorage.getItem("welcome_offer_seen")) return;
    const t = setTimeout(() => setShow(true), 6000);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  const close = () => {
    localStorage.setItem("welcome_offer_seen", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div dir="rtl" className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }} role="dialog" aria-modal="true" aria-label="ברוכים הבאים ל-bidli">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center relative" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <button onClick={close} aria-label="סגירה" className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 20px #e5893d44" }}>🎁</div>
        <h2 className="text-xl font-black text-gray-900 mb-1.5">ברוך הבא ל-bidli! 🎉</h2>
        <p className="text-sm text-gray-500 mb-5">מצטרפים עכשיו ונהנים מהיתרונות של פורטל המכרזים המהיר בישראל:</p>
        <div className="space-y-2 mb-5 text-right">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <BadgePercent className="h-4 w-4 flex-shrink-0" style={{ color: "#00a35c" }} aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">0% עמלה — כל הכסף שלך</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <Timer className="h-4 w-4 flex-shrink-0" style={{ color: "#e5893d" }} aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">מכרזים שנסגרים תוך 24 שעות בלבד</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <Gavel className="h-4 w-4 flex-shrink-0" style={{ color: "#3e6b8a" }} aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">הצעות, מועדפים והתראות — בחינם</span>
          </div>
        </div>
        <Link to="/register" onClick={close}
          className="block w-full text-white text-sm font-bold py-3 rounded-xl transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
          יצירת חשבון עכשיו
        </Link>
        <button onClick={close} className="w-full text-xs text-gray-400 py-2 hover:text-gray-600 transition-colors">
          המשך לגלוש בלי הרשמה
        </button>
      </div>
    </div>
  );
}