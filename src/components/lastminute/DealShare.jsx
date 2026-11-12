import { useState } from "react";
import { MessageCircle, Send, Link2, Check, Instagram } from "lucide-react";
import { dealUrl } from "@/lib/lastMinute";

// הפצה: קישור מוכן לוואטסאפ, טלגרם וסטורי — האדם מפרסם בקבוצות ובקהילות שלו
export default function DealShare({ deal, price }) {
  const [copied, setCopied] = useState(false);
  if (!deal) return null;

  const url = dealUrl(deal.id);
  const amount = Number(price ?? deal.list_price ?? 0).toLocaleString("he-IL");
  const text = `⚡ חלון שהתפנה ב-${deal.business_name}: ${deal.title} — עכשיו ב-₪${amount}, והמחיר ממשיך לרדת. מי שמקדים תופס: ${url}`;
  const encoded = encodeURIComponent(text);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div dir="rtl" className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <a href={`https://wa.me/?text=${encoded}`} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-green-700 border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> וואטסאפ
        </a>
        <a href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-sky-700 border-2 border-sky-200 bg-sky-50 hover:bg-sky-100 transition-all">
          <Send className="h-4 w-4" aria-hidden="true" /> טלגרם
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <a href={`https://www.instagram.com/`} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-pink-600 border border-pink-200 bg-pink-50 hover:bg-pink-100 transition-all">
          <Instagram className="h-4 w-4" aria-hidden="true" /> סטורי באינסטגרם
        </a>
        <button type="button" onClick={copy}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all">
          {copied ? <><Check className="h-4 w-4" aria-hidden="true" /> הועתק</> : <><Link2 className="h-4 w-4" aria-hidden="true" /> העתק קישור</>}
        </button>
      </div>
    </div>
  );
}