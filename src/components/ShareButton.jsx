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
    <div className="mt-3 flex gap-2" dir="rtl">
      <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer"
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-green-700 border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-all">
        <MessageCircle className="h-4 w-4" /> שתף בוואטסאפ
      </a>
      <button type="button" onClick={copyLink}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-500 hover:border-[#f700ff66] hover:text-[#f700ff] transition-all">
        {copied ? <><Check className="h-4 w-4" /> הוקדם</> : <><Link2 className="h-4 w-4" /> העתק קישור</>}
      </button>
    </div>
  );
}