import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Search, Send, Plus, Wrench, Loader2, CheckCircle2, XCircle } from "lucide-react";

const AGENT_NAME = "seo_agent";

const STATUS_META = {
  pending: { label: "ממתין...", done: false },
  running: { label: "רץ...", done: false },
  in_progress: { label: "מבצע...", done: false },
  completed: { label: "הושלם", done: true },
  success: { label: "הצליח", done: true },
  failed: { label: "נכשל", done: false },
  error: { label: "שגיאה", done: false },
};

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_META[toolCall.status] || { label: toolCall.status, done: false };
  let results = toolCall.results;
  try { if (typeof results === "string") results = JSON.parse(results); } catch (e) { /* raw */ }
  return (
    <div className="mt-2 text-xs" dir="rtl">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        {status.done ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : toolCall.status === "failed" || toolCall.status === "error" ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e5893d]" />}
        <Wrench className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-semibold text-gray-700">{toolCall.name}</span>
        <span className="text-gray-400">· {status.label}</span>
      </button>
      {expanded && (
        <div className="mt-1 p-2 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 space-y-1 overflow-x-auto">
          {toolCall.arguments_string && (
            <div><span className="font-semibold">פרמטרים:</span> <pre className="whitespace-pre-wrap">{toolCall.arguments_string}</pre></div>
          )}
          {results != null && (
            <div><span className="font-semibold">תוצאה:</span> <pre className="whitespace-pre-wrap">{typeof results === "string" ? results : JSON.stringify(results, null, 2)}</pre></div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-[#e5893d] text-white" : "bg-white border border-gray-100 text-gray-900"}`} style={isUser ? {} : { boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        {message.content && (isUser
          ? <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          : <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{message.content}</ReactMarkdown>)}
        {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}

export default function SeoAgent() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadConversations = async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      if (list && list.length > 0 && !activeId) setActiveId(list[0].id);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeId) return;
    const unsub = base44.agents.subscribeToConversation(activeId, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return unsub;
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const openConversation = async (id) => {
    setActiveId(id);
    try {
      const conv = await base44.agents.getConversation(id);
      setMessages(conv.messages || []);
    } catch (e) { /* ignore */ }
  };

  const newConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: `בדיקת SEO ${new Date().toLocaleDateString("he-IL")}` },
      });
      setConversations(prev => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
    } catch (e) { /* ignore */ }
  };

  const send = async () => {
    const content = input.trim();
    if (!content || !activeId || sending) return;
    setInput("");
    setSending(true);
    setMessages(prev => [...prev, { role: "user", content }]);
    try {
      const conv = await base44.agents.getConversation(activeId);
      await base44.agents.addMessage(conv, { role: "user", content });
    } catch (e) {
      setSending(false);
      setMessages(prev => [...prev, { role: "assistant", content: "שגיאה בשליחת ההודעה, נסה שוב." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">סוכן SEO/GEO</h1>
            <p className="text-xs text-gray-400">בודק ומתקן את נוכחות האתר בגוגל ובמנועי בינה מלאכותית</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 lg:col-span-1 h-fit" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <button onClick={newConversation} className="w-full btn-neon rounded-xl px-3 py-2 text-xs font-bold mb-3 flex items-center justify-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> בדיקה חדשה
            </button>
            <div className="space-y-1">
              {loading ? <p className="text-xs text-gray-400 text-center py-2">טוען...</p> : null}
              {conversations.map(c => (
                <button key={c.id} onClick={() => openConversation(c.id)}
                  className={`w-full text-right px-3 py-2 rounded-xl text-xs font-medium truncate transition-colors ${activeId === c.id ? "bg-[#e5893d0f] text-[#e5893d] border border-[#e5893d33]" : "text-gray-600 hover:bg-gray-50"}`}>
                  {c.metadata?.name || "שיחה"}
                </button>
              ))}
              {!loading && conversations.length === 0 && <p className="text-xs text-gray-400 text-center py-2">אין שיחות — התחל בדיקה חדשה</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col lg:col-span-3" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)", height: "70vh" }}>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-gray-400">
                  <Search className="h-8 w-8 opacity-30" />
                  <p className="text-sm">בקש מהסוכן לבדוק את ה-SEO של האתר, למשל:</p>
                  <p className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">"בדוק איך bidli מופיע בגוגל ובצע סקירת SEO מלאה"</p>
                </div>
              )}
              {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
              {sending && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white border border-gray-100 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e5893d]" /> הסוכן עובד...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-gray-100 p-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                placeholder="כתוב בקשה לסוכן..."
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22]"
                disabled={!activeId}
              />
              <button onClick={send} disabled={!activeId || sending || !input.trim()}
                className="btn-neon rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-40 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> שלח
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}