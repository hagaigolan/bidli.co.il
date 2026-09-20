import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { ArrowRight, Bot, Send, Loader2, Plus, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { setPageMeta } from "@/lib/seo";

const AGENT_NAME = "shop_support";

const SUGGESTED_PROMPTS = [
  "ענה על כל הפניות הפתוחות שלי",
  "עבור על הפניות ותן לי טיוטות תשובה לפני שליחה",
  "כמה פניות פתוחות יש לי כרגע?",
];

function ToolCallChip({ toolCall }) {
  const done = ["success", "completed"].includes(toolCall.status);
  const failed = ["failed", "error"].includes(toolCall.status);
  return (
    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-black/10 mt-1.5" dir="rtl">
      {done ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        : failed ? <XCircle className="h-3.5 w-3.5 text-red-400" />
        : <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />}
      <span className="font-medium opacity-80">{toolCall.name}</span>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-start" : "justify-end"}`} dir="rtl">
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-gray-100 text-gray-800" : "text-white"}`}
        style={isUser ? {} : { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          : <div className="text-sm [&_p]:leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>)}
        {message.tool_calls?.map((tc, i) => <ToolCallChip key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}

export default function ShopSupport() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [authed, setAuthed] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setPageMeta({
      title: "סוכן תמיכה — מענה אוטומטי על פניות לקוחות | bidli",
      description: "סוכן AI של bidli שעונה על שאלות לקוחות מהצ'אט החי במכרזים שלך, שולח את התשובה במייל ומסמן את הפנייה כטופלה.",
    });
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (ok) => {
      setAuthed(ok);
      if (!ok) return;
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        setConversations(list || []);
      } catch { setConversations([]); }
    });
  }, []);

  // עדכוני זרימה בזמן אמת מהשיחה הפעילה
  useEffect(() => {
    if (!activeId) return;
    return base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (id) => {
    setActiveId(id);
    setSending(true);
    try {
      const conv = await base44.agents.getConversation(id);
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch { setMessages([]); }
    setSending(false);
  };

  const startNew = async () => {
    setSending(true);
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "מענה על פניות", description: "מענה על פניות לקוחות" },
      });
      setConversations(prev => [conv, ...(prev || [])]);
      setActiveId(conv.id);
      setConversation(conv);
      setMessages([]);
    } catch {}
    setSending(false);
  };

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content }]);
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch {
      setSending(false);
    }
  };

  const working = sending || (messages.length > 0 && messages[messages.length - 1].role === "user");

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
              <Bot className="h-7 w-7" style={{ color: "#e5893d" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">סוכן תמיכה למוכרים</h1>
              <p className="text-sm text-gray-400">הסוכן קורא את הפניות הפתוחות מהצ'אט החי במכרזים שלך, מנסח תשובה מנתוני הרישום ושולח אותה ללקוח במייל</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        {authed === false ? (
          <div className="text-center py-12">
            <Bot className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-5">כדי להשתמש בסוכן התמיכה יש להתחבר לחשבון</p>
            <button onClick={() => base44.auth.redirectToLogin("/shop-support")}
              className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              התחברות
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-[60vh]">
            {/* שיחות קודמות + שיחה חדשה */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button type="button" onClick={startNew} disabled={sending}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-50"
                style={{ borderColor: "#e5893d", color: "#e5893d", background: "#e5893d0f" }}>
                <Plus className="h-3.5 w-3.5" /> שיחה חדשה
              </button>
              {conversations.map(c => (
                <button key={c.id} type="button" onClick={() => openConversation(c.id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs border transition-all"
                  style={activeId === c.id
                    ? { borderColor: "#3e6b8a", color: "#3e6b8a", background: "#3e6b8a0d" }
                    : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
                  <MessageCircle className="h-3.5 w-3.5" />
                  {new Date(c.created_date).toLocaleDateString("he-IL")}
                </button>
              ))}
            </div>

            {/* גוף השיחה */}
            <div className="flex-1 space-y-3 overflow-y-auto pb-4 min-h-[300px]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <Bot className="h-10 w-10 mb-3 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">במה לעזור?</p>
                  <p className="text-xs text-gray-400 mb-5">בקש מהסוכן לענות על הפניות הפתוחות מהמכרזים שלך</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_PROMPTS.map(p => (
                      <button key={p} type="button" disabled={!conversation || working} onClick={() => send(p)}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
                  {working && (
                    <div className="flex justify-end" dir="rtl">
                      <div className="rounded-2xl px-4 py-2.5 flex items-center gap-2"
                        style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                        <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                        <span className="text-xs text-white/80">הסוכן עובד...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* שורת קלט */}
            <form onSubmit={e => { e.preventDefault(); send(); }}
              className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <input value={input} onChange={e => setInput(e.target.value)} disabled={!conversation || working}
                placeholder={conversation ? "כתוב לסוכן התמיכה..." : "פתח שיחה חדשה כדי להתחיל"}
                className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right disabled:bg-gray-50" />
              <button type="submit" disabled={!conversation || working || !input.trim()}
                className="text-white w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }} aria-label="שלח">
                <Send className="h-4 w-4 -scale-x-100" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}