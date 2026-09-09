import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Loader2, Phone } from "lucide-react";
import { getProductFaqs } from "@/lib/productFaq";

// מספר הוואטסאפ של הנהלת המכירה — החלף כאן (פורמט בינלאומי ללא +, למשל 972501234567).
// אם ריק, נשלחת ברירת מחדל לטלפון המוכר של הפריט.
const SALES_WHATSAPP = "";

function toIntl(phone) {
  return (phone || "").replace(/[^0-9]/g, "").replace(/^0/, "972");
}

function buildPrompt(product, question) {
  const details = [
    `כותרת: ${product.title}`,
    product.category && `קטגוריה: ${product.category}`,
    product.condition && `מצב מוצהר: ${product.condition}`,
    product.description && `תיאור: ${product.description}`,
    product.location && `מיקום: ${product.location}`,
    `מחיר התחלתי: ₪${(product.starting_price || 0).toLocaleString()}`,
    `מחיר נוכחי: ₪${(product.current_price || product.starting_price || 0).toLocaleString()}`,
    product.bid_count ? `מספר הצעות: ${product.bid_count}` : null,
    product.ends_at && `מועד סיום: ${new Date(product.ends_at).toLocaleString("he-IL")}`,
    product.seller_name && `מוכר: ${product.seller_name}`,
  ].filter(Boolean).join("\n");

  return `אתה עוזר השירות של פלטפורמת המכירות bid-it. ענה בעברית, בקצרה ובידידות, על שאלת הקונה.
ענה אך ורק על סמך נתוני המכרז הבאים. אם מידע מבוקש לא קיים בנתונים — ציין זאת בכנות והצע לפנות לצוות המכירה בוואטסאפ.
אל תמציא פרטים, מידות או הערכות שלא נמסרו, ואין לתת הערכת שווי מחייבת.

נתוני המכרז:
${details}

שאלת הקונה: ${question}`;
}

export default function ProductChat({ product }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "שלום! 👋 אני עוזר השירות של bid-it. שאל אותי כל שאלה על הפריט, מצבו או תנאי המכרז." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const send = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || typing) return;
    setInput("");
    setMessages(m => [...m, { from: "user", text: question }]);
    setTyping(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(product, question) });
      const answer = typeof res === "string" ? res : res?.response ?? res?.message ?? res?.data ?? "";
      setMessages(m => [...m, { from: "bot", text: answer || "לא הצלחתי לענות כרגע — נסה שוב או פנה לצוות בוואטסאפ." }]);
    } catch {
      setMessages(m => [...m, { from: "bot", text: "אירעה שגיאה — נסה שוב, או פנה ישירות לצוות המכירה בוואטסאפ." }]);
    } finally {
      setTyping(false);
    }
  };

  const faqs = getProductFaqs(product);
  const askFaq = (faq) => {
    setMessages(m => [...m, { from: "user", text: faq.q }, { from: "bot", text: faq.a }]);
  };

  const waNumber = toIntl(SALES_WHATSAPP || product.seller_phone);
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`שלום, יש לי שאלה לגבי המכרז "${product.title}" (${window.location.href})`)}`
    : null;

  return (
    <>
      {open && (
        <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:w-[360px] z-50 rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden" dir="rtl">
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
            <MessageCircle className="h-4 w-4 text-white" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">שאלות על הפריט</p>
              <p className="text-xs text-white/80">עוזר bid-it · מענה מיידי</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i}
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.from === "user" ? "ml-auto text-white" : "mr-auto bg-white text-gray-700 border border-gray-100"
                }`}
                style={m.from === "user" ? { background: "linear-gradient(135deg, #f700ff, #9d00ff)" } : {}}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="mr-auto bg-white border border-gray-100 rounded-2xl px-3 py-2.5 flex gap-1 w-fit">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>

          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-1.5 mx-3 mt-2 py-2 rounded-xl text-xs font-bold text-green-700 border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all">
              <Phone className="h-3.5 w-3.5" /> שאלה מורכבת? דבר עם צוות המכירה בוואטסאפ
            </a>
          )}

          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide px-3 py-2 border-t border-gray-50 bg-white" dir="rtl">
            {faqs.map(f => (
              <button key={f.q} type="button" onClick={() => askFaq(f)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-200 text-gray-500 hover:border-[#f700ff66] hover:text-[#f700ff] transition-all whitespace-nowrap">
                {f.q}
              </button>
            ))}
          </div>

          <form onSubmit={send} className="p-3 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="שאל על הפריט, מצבו, המשלוח..."
              className="flex-1 px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] text-right" />
            <button type="submit" disabled={typing || !input.trim()}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              {typing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -scale-x-100" />}
            </button>
          </form>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)", boxShadow: "0 0 20px #f700ff55" }}>
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}