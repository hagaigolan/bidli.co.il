import { useState, useEffect, useRef } from "react";
import { guidedPublishAssistant } from "@/functions/guidedPublishAssistant";
import { Bot, Send, Sparkles, Loader2 } from "lucide-react";

// פרסום מודרך — צ'אט עם עוזר AI שממלא את שדות טופס הפרסום מתיאור בשיחה
export default function GuidedPublishChat({ onApply }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "היי! 🤖 ספר/י לי על הפריט שברצונך לפרסם — מה זה, באיזה מצב, ומה ידוע לך על ההיסטוריה שלו. אני אמלא עבורך את הטופס ואשאל אם חסר משהו חשוב." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const history = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const res = await guidedPublishAssistant({ messages: history });
      const data = res?.data ?? res;
      const next = [...history, { role: "assistant", content: data.reply || "לא הצלחתי לנתח את ההודעה — נסה לתאר שוב." }];
      if (data.fields && Object.keys(data.fields).length > 0) {
        onApply?.(data.fields);
        next.push({ role: "assistant", content: "✅ מילאתי את השדות בטופס למטה — עבור עליהם, תקן מה שצריך ואשר את ההצהרות לפני הפרסום." });
      }
      setMessages(next);
    } catch (e) {
      const msg = (e?.response?.data?.message || e?.response?.data?.error || "") === "rate_limited"
        ? "יותר מדי בקשות — נסה שוב בעוד כשעה"
        : "שגיאה, נסה שנית";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.01]"
        style={{ background: "linear-gradient(135deg, #3e6b8a08, #6aa3cd05)", borderColor: "#3e6b8a44" }} dir="rtl">
        <span className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #3e6b8a, #6aa3cd)" }}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-right">
            <span className="block text-sm font-bold text-gray-800">פרסום מודרך בצ'אט</span>
            <span className="block text-xs text-gray-400 mt-0.5">ספר על הפריט בשיחה — העוזר החכם ימלא את הטופס בשבילך</span>
          </span>
        </span>
        <Sparkles className="h-4 w-4 flex-shrink-0" style={{ color: "#3e6b8a" }} />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#3e6b8a44" }} dir="rtl">
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "linear-gradient(135deg, #3e6b8a, #2d4f68)" }}>
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">פרסום מודרך — העוזר החכם</span>
        </div>
        <button type="button" onClick={() => setOpen(false)}
          className="text-xs text-white/80 hover:text-white font-semibold">סגור</button>
      </div>

      <div ref={scrollRef} className="max-h-64 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-line ${
              m.role === "user" ? "bg-white border border-gray-200 text-gray-800" : "text-white"
            }`}
              style={m.role !== "user" ? { background: "linear-gradient(135deg, #3e6b8a, #2d4f68)" } : undefined}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-end">
            <div className="px-3 py-2 rounded-xl text-white flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #3e6b8a, #2d4f68)" }}>
              <Loader2 className="h-3 w-3 animate-spin" /> כותב...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-3 bg-white border-t border-gray-100">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          placeholder="לדוגמה: יש לי ציור שמן של צייר ישראלי משנות ה-70, מצב מעולה, 50×70 ס״מ"
          className="flex-1 px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#3e6b8a88] text-right" />
        <button type="button" onClick={send} disabled={busy || !input.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 transition-all"
          style={{ background: "linear-gradient(135deg, #3e6b8a, #2d4f68)" }} aria-label="שלח הודעה">
          <Send className="h-4 w-4 rotate-180" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 px-3 pb-2">{error}</p>}
    </div>
  );
}