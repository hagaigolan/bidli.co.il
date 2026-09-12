import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Mail, Loader2, CheckCircle } from "lucide-react";

// מודאל שליחת מייל מטעם ההנהלה לכל כתובת
export default function SendEmailModal({ to, onClose }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right";

  const send = async () => {
    if (!subject.trim() || !body.trim()) { setError("יש למלא נושא ותוכן"); return; }
    setSending(true); setError("");
    try {
      await base44.integrations.Core.SendEmail({
        to,
        subject,
        body: `${body}\n\n— צוות bidli — הבית של פלטפורמת מכרזים שלך`,
        from_name: "bidli הנהלה",
      });
      setDone(true);
      setTimeout(onClose, 1500);
    } catch {
      setError("שליחת המייל נכשלה, נסה שנית");
    } finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <Mail className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" /> שליחת מייל
          </h2>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="font-bold text-gray-800">המייל נשלח בהצלחה!</p>
          </div>
        ) : (
          <div className="p-4 space-y-3.5">
            <div>
              <label className="block text-xs text-gray-500 mb-1">אל</label>
              <input value={to} readOnly dir="ltr"
                className={inputCls + " bg-gray-50 text-gray-500"} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">נושא *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תוכן *</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} className={inputCls + " resize-none"} />
            </div>
            <p className="text-xs text-gray-400">שליחה לכתובות שאינן משתמשים רשומים עשויה להיחסם בהתאם למדיניות המייל של הפלטפורמה</p>
            {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
            <button onClick={send} disabled={sending}
              className="w-full flex items-center justify-center gap-2 text-white text-sm py-3 rounded-xl font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              {sending ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> שולח...</> : <><Mail className="h-4 w-4" aria-hidden="true" /> שלח מייל</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}