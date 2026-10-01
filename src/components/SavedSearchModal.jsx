import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bell, X, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

const FREQ_OPTIONS = [
  { value: "instant", label: "מיידי — בדיקה כל שעה" },
  { value: "daily", label: "יומי — סיכום פעם ביום" },
  { value: "weekly", label: "שבועי — סיכום פעם בשבוע" },
];

// דיאלוג שמירת חיפוש — הקטגוריה והמחיר המקסימלי מגיעים מהמסננים הפעילים ברשימת המכרזים
export default function SavedSearchModal({ category, maxPrice, defaultLabel, onClose, onSaved }) {
  const { user } = useAuth();
  const [label, setLabel] = useState(defaultLabel || "");
  const [frequency, setFrequency] = useState("instant");
  const [notifyPhone, setNotifyPhone] = useState(() => localStorage.getItem("notif_phone") || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!user) return;
    if (!label.trim()) { setError("יש להזין שם לחיפוש"); return; }
    setSaving(true);
    setError("");
    try {
      await base44.entities.SavedSearch.create({
        owner_email: user.email,
        owner_name: user.full_name || "",
        label: label.trim(),
        category: category || "",
        max_price: Number(maxPrice) || 0,
        frequency,
        notify_email: true,
        notify_phone: notifyPhone || "",
        last_scan_at: new Date().toISOString(),
        active: true,
      });
      onSaved?.();
      onClose();
    } catch {
      setError("שגיאה בשמירה, נסה שנית");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
              <Bell className="h-4 w-4" style={{ color: "#e5893d" }} />
            </div>
            <h3 className="font-black text-gray-900">שמור חיפוש</h3>
          </div>
          <button onClick={onClose} aria-label="סגור" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!user ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-4">התחבר/י כדי לשמור חיפוש ולקבל התראות על מכרזים חדשים שתואמים לו.</p>
            <Link to="/login" className="inline-block text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              התחברות
            </Link>
          </div>
        ) : (
          <>
            {/* סיכום המסננים */}
            <div className="p-3 rounded-xl text-xs text-gray-600 mb-4"
              style={{ background: "#e5893d0a", border: "1px solid #e5893d22" }}>
              קטגוריה: <strong>{category || "כל הקטגוריות"}</strong>
              {maxPrice ? <> · עד <strong>₪{Number(maxPrice).toLocaleString()}</strong></> : null}
            </div>

            <label className="block text-xs text-gray-500 mb-1">שם החיפוש *</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="לדוגמה: תכשיטים עד 2,000₪"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl mb-3 focus:outline-none focus:border-[#e5893d88] text-right" />

            <label className="block text-xs text-gray-500 mb-1">תדירות ההתראות</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl mb-3 focus:outline-none focus:border-[#e5893d88] text-right">
              {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <label className="block text-xs text-gray-500 mb-1">טלפון להתראות (אופציונלי)</label>
            <input type="tel" value={notifyPhone} onChange={e => setNotifyPhone(e.target.value)}
              placeholder="050-1234567" dir="ltr"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-[#e5893d88]" />

            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

            <button onClick={save} disabled={saving}
              className="w-full flex items-center justify-center gap-2 text-white text-sm py-3 rounded-xl font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              <Bookmark className="h-4 w-4" />
              {saving ? "שומר..." : "שמור והתרא אותי"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}