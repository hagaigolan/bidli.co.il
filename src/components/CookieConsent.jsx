import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie_consent"; // "granted" | "denied"
export const CONSENT_EVENT = "cookie-consent-changed";
export const OPEN_SETTINGS_EVENT = "cookie-settings-open";

// הבחירה השמורה — null כשלא נבחר עדיין
export function readConsent() {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

// דיווח הבחירה ל-Google Consent Mode (כל ארבעת השדות)
function pushConsent(granted) {
  window.dataLayer = window.dataLayer || [];
  const gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const value = granted ? "granted" : "denied";
  gtag("consent", "update", {
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
    analytics_storage: value,
  });
}

// בדחייה מאוחרת — מחיקת עוגיות הפרסום שגוגל הציבה
function clearAdCookies() {
  document.cookie.split(";").forEach(c => {
    const name = c.split("=")[0].trim();
    if (/^__(gads|gpi|eoi)|^_gcl/.test(name)) {
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = readConsent();
    if (saved) pushConsent(saved === "granted");
    else setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const choose = (granted) => {
    localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    pushConsent(granted);
    if (!granted) clearAdCookies();
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { granted } }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] px-3 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] sm:p-4 sm:pb-[calc(1rem+var(--safe-bottom))]" dir="rtl">
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
            עוגיות הכרחיות מאפשרות לאתר לעבוד. עוגיות פרסום של Google משמשות להצגת מודעות ולתשלום עבורן. אפשר לאשר או לדחות את עוגיות הפרסום בכל עת.
            לפרטים נוספים ניתן לעיין ב{" "}
            <RouterLink to="/terms?tab=cookies" className="underline font-semibold" style={{ color: "#e5893d" }}>מדיניות העוגיות</RouterLink>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
          <button onClick={() => choose(true)}
            className="text-white text-sm px-6 py-2.5 rounded-xl font-bold transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
            אישור עוגיות פרסום
          </button>
          <button onClick={() => choose(false)}
            className="text-sm px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-white border transition-all hover:bg-gray-50"
            style={{ borderColor: "#e5893d55" }}>
            דחייה
          </button>
        </div>
      </div>
    </div>
  );
}