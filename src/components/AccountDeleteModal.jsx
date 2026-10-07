import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

// מודל מחיקת חשבון — מחייב הקלדת "מחק" לאישור, ואז מפעיל את פונקציית השרת
// שמוחקת את כל הרשומות של המשתמש ואת רשומת המשתמש עצמה, מנקה אחסון מקומי
// ומתנתקת.

const KEYS_TO_CLEAR = [
  "bidder_name", "bidder_email", "profile_phone", "profile_photo_url",
  "seller_email", "republish_draft", "bidli_upload_draft",
];

export default function AccountDeleteModal({ onClose }) {
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (confirmText.trim() !== "מחק") {
      setError("יש להקליד 'מחק' כדי לאשר את הפעולה");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("deleteMyAccount", {});
      KEYS_TO_CLEAR.forEach(k => localStorage.removeItem(k));
      await base44.auth.logout();
    } catch {
      setBusy(false);
      setError("מחיקת החשבון נכשלה — נסה שוב, או פנה אלינו במייל");
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }} role="dialog" aria-modal="true" aria-label="מחיקת חשבון">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center relative"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <button onClick={onClose} aria-label="סגירה" disabled={busy}
          className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "#fee2e2", border: "1px solid #fecaca" }}>
          <AlertTriangle className="h-7 w-7 text-red-500" aria-hidden="true" />
        </div>

        <h2 className="text-xl font-black text-gray-900 mb-1.5">מחיקת החשבון</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-3">
          פעולה זו בלתי הפיכה. יימחקו כל הנתונים הקשורים לחשבונך: המוצרים שפרסמת,
          ההצעות שהגשת, המועדפים, הפריטים בבארטר, ההתראות והפניות שלך.
        </p>
        <p className="text-xs text-red-500 mb-4">
          שים/י לב: מכרזים פעילים ייעלמו מהאתר מיד, ולא ניתן יהיה לשחזר אותם.
        </p>

        <label className="block text-xs text-gray-500 mb-1.5 text-right">
          הקלד "מחק" כדי לאשר
        </label>
        <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
          disabled={busy}
          className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-red-300 transition-all text-right mb-4"
          dir="rtl" />

        {error && <p className="text-xs text-red-500 mb-3" role="alert">{error}</p>}

        <button onClick={handleDelete} disabled={busy}
          className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3 rounded-xl transition-all disabled:opacity-60"
          style={{ background: "#dc2626" }}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> מוחק...</> : <><Trash2 className="h-4 w-4" /> מחק את החשבון שלי</>}
        </button>
        <button onClick={onClose} disabled={busy}
          className="w-full text-xs text-gray-400 py-2 mt-1 hover:text-gray-600 transition-colors">
          ביטול
        </button>
      </div>
    </div>
  );
}