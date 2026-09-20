import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, MessageCircleQuestion, RefreshCw, CheckCircle2, RotateCcw, Loader2, Bot } from "lucide-react";

function QuestionRow({ q, onToggle }) {
  const [busy, setBusy] = useState(false);
  const handled = q.status === "handled";

  const toggle = async () => {
    setBusy(true);
    try {
      await base44.entities.ProductQuestion.update(q.id, {
        status: handled ? "open" : "handled",
        handled_at: handled ? "" : new Date().toISOString(),
      });
      onToggle();
    } catch {}
    setBusy(false);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/auction/${q.product_id}`}
            className="text-sm font-semibold text-gray-800 hover:text-[#e5893d] transition-colors truncate block">
            {q.product_title || "מכרז"}
          </Link>
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{q.question}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
            {q.asker_name && <span>שואל: {q.asker_name}</span>}
            {q.asker_contact && <span dir="ltr">{q.asker_contact}</span>}
            <span>{new Date(q.created_date).toLocaleString("he-IL")}</span>
            {handled && q.handled_at && <span className="text-green-600">טופלה: {new Date(q.handled_at).toLocaleDateString("he-IL")}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            style={handled ? { background: "#22c55e15", color: "#22c55e" } : { background: "#e5893d15", color: "#e5893d" }}>
            {handled ? "טופלה ✓" : "ממתינה לטיפול"}
          </span>
          <button type="button" onClick={toggle} disabled={busy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all disabled:opacity-50"
            style={handled
              ? { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }
              : { borderColor: "#22c55e66", color: "#16a34a", background: "#22c55e0d" }}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : handled
              ? <><RotateCcw className="h-3.5 w-3.5" /> פתח מחדש</>
              : <><CheckCircle2 className="h-3.5 w-3.5" /> סמן כטופלה</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SellerQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("open");
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { setLoading(false); return; }
      try { setMe(await base44.auth.me()); } catch { setLoading(false); }
    });
  }, []);

  const loadQuestions = async () => {
    if (!me) { setLoading(false); return; }
    setLoading(true);
    try {
      const all = await base44.entities.ProductQuestion.list("-created_date", 200);
      setQuestions(all.filter(q =>
        (me.email && q.seller_email === me.email) ||
        (me.id && q.seller_user_id === me.id)
      ));
    } catch { setQuestions([]); }
    setLoading(false);
  };

  useEffect(() => { loadQuestions(); }, [me]);

  const openCount = questions.filter(q => q.status !== "handled").length;
  const handledCount = questions.length - openCount;
  const shown = questions.filter(q => tab === "open" ? q.status !== "handled" : q.status === "handled");

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
              <MessageCircleQuestion className="h-7 w-7" style={{ color: "#e5893d" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">פניות ושאלות</h1>
              <p className="text-sm text-gray-400">כל השאלות שהגיעו מהצ'אט החי במכרזים שלך — סמן כטופלות ועקוב אחרי השירות</p>
              <Link to="/shop-support"
                className="inline-flex items-center gap-1 mt-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                style={{ background: "#e5893d0f", color: "#e5893d", border: "1px solid #e5893d33" }}>
                <Bot className="h-3.5 w-3.5" /> ענה על הפניות עם סוכן AI
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!me ? (
          <div className="text-center py-12">
            <MessageCircleQuestion className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-5">כדי לנהל את הפניות יש להתחבר לחשבון</p>
            <button onClick={() => base44.auth.redirectToLogin("/seller-questions")}
              className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              התחברות
            </button>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircleQuestion className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">טרם התקבלו שאלות מהצ'אט במכרזים שלך</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6" dir="rtl">
              {[
                { id: "open", label: "ממתינות לטיפול", count: openCount },
                { id: "handled", label: "טופלו", count: handledCount },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={tab === t.id
                    ? { borderColor: "#e5893d", color: "#e5893d", background: "#e5893d0f" }
                    : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
                  {t.label} <span className="opacity-60">({t.count})</span>
                </button>
              ))}
            </div>

            {shown.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                {tab === "open" ? "אין פניות ממתינות — הכל טופל 👏" : "טרם סומנו פניות כטופלות"}
              </p>
            ) : (
              <div className="space-y-2">
                {shown.map(q => <QuestionRow key={q.id} q={q} onToggle={loadQuestions} />)}
              </div>
            )}

            <button onClick={loadQuestions} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto mt-6 transition-colors">
              <RefreshCw className="h-3 w-3" /> רענן נתונים
            </button>
          </>
        )}
      </div>
    </div>
  );
}