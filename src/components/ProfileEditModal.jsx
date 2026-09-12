import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { X, Camera, Loader2, CheckCircle, Info } from "lucide-react";

// עריכת פרופיל אישי — שם מלא, מייל, טלפון, כינוי ותמונה שתוצג בפרסומים
export default function ProfileEditModal({ onClose, onSaved }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [name, setName] = useState(() => localStorage.getItem("bidder_name") || authUser?.full_name || "");
  const [email, setEmail] = useState(() => authUser?.email || localStorage.getItem("bidder_email") || "");
  const [phone, setPhone] = useState(() => authUser?.phone || localStorage.getItem("profile_phone") || "");
  const [nickname, setNickname] = useState(() => authUser?.nickname || localStorage.getItem("bidder_nickname") || "");
  const [photoUrl, setPhotoUrl] = useState(() => localStorage.getItem("profile_photo_url") || authUser?.photo_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // המייל הוא מזהה החשבון — ניתן לעריכה רק כשאין חשבון מחובר
  const emailLocked = !!(isAuthenticated && authUser?.email);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("יש לבחור קובץ תמונה"); return; }
    setUploading(true); setError("");
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      setPhotoUrl(res.file_url);
    } catch {
      setError("העלאת התמונה נכשלה, נסה שנית");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl("");
    localStorage.removeItem("profile_photo_url");
  };

  const save = async () => {
    if (!name.trim()) { setError("יש להזין שם מלא"); return; }
    if (!phone.trim()) { setError("יש להזין מספר טלפון"); return; }
    setSaving(true); setError("");
    try {
      localStorage.setItem("bidder_name", name.trim());
      if (email.trim()) localStorage.setItem("bidder_email", email.trim().toLowerCase());
      localStorage.setItem("profile_phone", phone.trim());
      if (nickname.trim()) localStorage.setItem("bidder_nickname", nickname.trim());
      else localStorage.removeItem("bidder_nickname");
      if (photoUrl) localStorage.setItem("profile_photo_url", photoUrl);
      else localStorage.removeItem("profile_photo_url");

      // עדכון פרטי החשבון עבור משתמש מחובר
      if (isAuthenticated) {
        try {
          const data = { phone: phone.trim() };
          if (nickname.trim()) data.nickname = nickname.trim();
          if (photoUrl) data.photo_url = photoUrl;
          await base44.auth.updateMe(data);
        } catch {}
      }
      setSaved(true);
      setTimeout(() => { onSaved?.(); onClose(); }, 1200);
    } catch {
      setError("שמירת הפרופיל נכשלה, נסה שנית");
      setSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl my-8" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">עריכת פרופיל</h2>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {saved ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="font-bold text-gray-800">הפרופיל עודכן בהצלחה!</p>
          </div>
        ) : (
          <>
            {/* תמונת פרופיל */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                {photoUrl ? (
                  <img src={photoUrl} alt="תמונת פרופיל" className="w-20 h-20 rounded-full object-cover border-2" style={{ borderColor: "#e5893d44" }} />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "2px solid #e5893d33" }}>
                    👤
                  </div>
                )}
                <label className="absolute bottom-0 left-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110"
                  style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                  {uploading
                    ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                    : <Camera className="h-4 w-4 text-white" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {uploading ? "מעלה תמונה..." : "תמונת הפרופיל תוצג לצד שמך בפרסומים"}
              </p>
              {photoUrl && (
                <button type="button" onClick={removePhoto} className="text-xs text-red-400 hover:text-red-500 mt-1">
                  הסר תמונה
                </button>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">שם מלא *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="השם המלא שלך"
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">אימייל {emailLocked ? "" : "*"}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com" disabled={emailLocked}
                  className={inputCls + (emailLocked ? " bg-gray-50 text-gray-400 cursor-not-allowed" : "")} dir="ltr" />
                {emailLocked && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> מייל החשבון אינו ניתן לשינוי
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">טלפון *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="050-1234567" className={inputCls} dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">כינוי לתצוגה (אופציונלי)</label>
                <input value={nickname} onChange={e => setNickname(e.target.value)}
                  placeholder="הכינוי שיוצג לקונים" className={inputCls} />
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mb-3" role="alert">{error}</p>}

            <div className="flex gap-2">
              <button onClick={save} disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-xl font-bold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> שומר...</> : "שמור"}
              </button>
              <button onClick={onClose}
                className="flex-1 text-gray-600 text-sm py-2.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50">
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}