import { useState } from "react";
import { MessageCircle, Link2, Check } from "lucide-react";

export default function ShareButton({ product }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/auction/${product.id}`;
  const price = (product.current_price || product.starting_price || 0).toLocaleString();
  const shareText = encodeURIComponent(`🔥 מכרז חי ב-bidli: "${product.title}" — מחיר נוכחי ₪${price}. הצע הצעה עכשיו: ${url}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="contents sm:flex sm:flex-1 sm:min-w-0 sm:gap-2" dir="rtl">
      <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer"
        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold leading-tight text-center text-green-700 border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all sm:flex-1 sm:min-w-0">
        <MessageCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span>שתף בוואטסאפ</span>
      </a>
      <button type="button" onClick={copyLink}
        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-xl text-[11px] sm:text-xs font-bold leading-tight text-center border border-gray-200 text-gray-500 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all sm:flex-shrink-0">
        {copied ? <><Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> <span>הועתק</span></> : <><Link2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" /> <span>העתק קישור</span></>}
      </button>
    </div>
  );
}