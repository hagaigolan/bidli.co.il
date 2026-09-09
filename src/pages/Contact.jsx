import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Mail, Send, Loader2, CheckCircle2, MessageCircle } from "lucide-react";

const CONTACT_EMAIL = "info@bid-it.co.il";
const TOPICS = ["שאלה כללית", "מכירת פריט בפלטפורמה", "תמיכה בהזמנה קיימת", "שיתוף פעולה עסקי"];

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", topic: TOPICS[0], message: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("יש למלא שם, אימייל והודעה");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await base44.integrations.Core.SendEmail({
        to: CONTACT_EMAIL,
        subject: `פנייה חדשה מהאתר: ${form.topic}`,
        body: `פנייה חדשה מעמוד "צור קשר"\n\nנושא: ${form.topic}\nשם: ${form.name}\nאימייל: ${form.email}\n\nההודעה:\n${form.message}`,
      });
      setSent(true);
    } catch {
      setError("שליחת ההודעה נכשלה — נסה שוב, או כתוב ישירות אלינו במייל");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #f700ff08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
              <MessageCircle className="h-7 w-7" style={{ color: "#f700ff" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">צור קשר</h1>
              <p className="text-sm text-gray-400">שאלות, הערות או רעיונות — נשמח לשמוע ממך</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Contact info */}
        <div className="md:col-span-2 space-y-3">
          <div className="p-4 rounded-2xl border border-gray-100" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Mail className="h-4 w-4" style={{ color: "#f700ff" }} />
              <p className="text-sm font-bold text-gray-800">מייל</p>
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-xs text-gray-500 hover:text-[#f700ff] transition-colors" dir="ltr">
              {CONTACT_EMAIL}
            </a>
          </div>
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 leading-relaxed">
              אנחנו חוזרים לפניות בתוך 1–2 ימי עסקים.
              לשאלות דחופות על מכרז פעיל אפשר גם להשתמש בכפתור הצ'אט בעמוד המכרז.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-3">
          {sent ? (
            <div className="text-center py-12 rounded-2xl border border-green-200" style={{ background: "#00c85308" }}>
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3" style={{ color: "#00c853" }} />
              <h2 className="text-lg font-bold text-gray-800 mb-1">ההודעה נשלחה!</h2>
              <p className="text-sm text-gray-400 mb-5">נחזור אליך בהקדם לכתובת שהשארת</p>
              <button onClick={() => navigate("/")} className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
                חזרה לדף הבית
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">שם *</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="השם שלך"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">אימייל *</label>
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">נושא הפנייה</label>
                <select value={form.topic} onChange={e => set("topic", e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right">
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ההודעה *</label>
                <textarea value={form.message} onChange={e => set("message", e.target.value)}
                  placeholder="ספר לנו במה אפשר לעזור..."
                  rows={6}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right resize-none" />
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button type="submit" disabled={busy}
                className="w-full text-white text-sm py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)", boxShadow: "0 0 20px #f700ff44" }}>
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> שולח...</> : <><Send className="h-4 w-4" /> שלח פנייה</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}