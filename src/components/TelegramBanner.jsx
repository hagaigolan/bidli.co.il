import { Send } from "lucide-react";

// באנר הצטרפות לערוץ הטלגרם — מוצג בראש העמוד הראשי
export default function TelegramBanner() {
  return (
    <a href="https://t.me/bidli24" target="_blank" rel="noopener noreferrer"
      className="block w-full text-white font-bold transition-all hover:opacity-90"
      style={{ background: "linear-gradient(135deg, #229ED9, #1d7fb5)" }}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2" dir="rtl">
        <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="text-sm">הצטרפו לערוץ הטלגרם שלנו — עדכונים על מכרזים חדשים</span>
        <Send className="h-3.5 w-3.5 flex-shrink-0 rotate-180" aria-hidden="true" />
      </div>
    </a>
  );
}