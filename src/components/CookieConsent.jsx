import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4" dir="rtl">
      <div className="max-w-5xl mx-auto rounded-2xl border shadow-2xl bg-white flex flex-col sm:flex-row items-center gap-3 p-4"
        style={{ borderColor: "#e5893d44", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        role="dialog" aria-modal="false" aria-label="הסכמה לשימוש בעוגיות">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
          <Cookie className="h-5 w-5" style={{ color: "#e5893d" }} aria-hidden="true" />
        </div>
        <div className="flex-1 text-center sm:text-right">
          <p className="text-sm font-bold text-gray-800">אנחנו משתמשים בעוגיות 🍪</p>
          <p className="text-xs text-gray-500 mt-0.5">
            העוגיות עוזרות לנו לשמור את ההעדפות שלך ולשפר את חווית הגלישה.
            לפרטים נוספים ניתן לעיין ב{" "}
            <RouterLink to="/terms" className="underline font-semibold" style={{ color: "#e5893d" }}>תנאי השימוש ומדיניות הפרטיות</RouterLink>.
          </p>
        </div>
        <button onClick={accept}
          className="w-full sm:w-auto text-white text-sm px-8 py-2.5 rounded-xl font-bold flex-shrink-0 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
          הבנתי, אישור
        </button>
      </div>
    </div>
  );
}