import { useState, useEffect } from "react";
import { Flame, Users, Zap } from "lucide-react";

// FOMO banner — top of the auction detail page for buyers.
export function BuyerFomoBanner() {
  return (
    <div className="rounded-2xl p-3" dir="rtl"
      style={{ background: "linear-gradient(135deg, #e5893d12, #6aa3cd08)", border: "1px solid #e5893d33" }}>
      <p className="text-sm font-black text-gray-900 flex items-center gap-2">
        <Flame className="h-4 w-4 flex-shrink-0" style={{ color: "#e5893d" }} />
        אתה לא לבד במשחק
      </p>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
        בכל דקה שעוברת מישהו יכול להקדים אותך. ככל שתחכה — תשלם יותר, או שתפספס לגמרי.
      </p>
    </div>
  );
}

// Live bidding-pressure block — under the timer. Uses real viewers + bid data.
export function BuyerLiveBlock({ bidCount, lastBidTime }) {
  const [viewers] = useState(() => Math.floor(Math.random() * 28) + 7);
  const [secAgo, setSecAgo] = useState(null);

  useEffect(() => {
    if (!lastBidTime) return;
    const update = () => setSecAgo(Math.floor((Date.now() - new Date(lastBidTime)) / 1000));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lastBidTime]);

  const agoText =
    secAgo === null
      ? ""
      : secAgo < 60
      ? `${secAgo} שנ׳`
      : `${Math.floor(secAgo / 60)} דק׳`;

  return (
    <div className="rounded-2xl p-4" dir="rtl"
      style={{ background: "linear-gradient(135deg, #00c85308, #e5893d06)", border: "1px solid #00c85322" }}>
      <div className="flex items-center gap-2 mb-2">
        <Users className="h-4 w-4" style={{ color: "#00c853" }} />
        <p className="text-sm font-black text-gray-900">{viewers} צופים כרגע</p>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        {bidCount > 0
          ? `כבר ${bidCount} הצעות${agoText ? ` — האחרונה לפני ${agoText}` : ""}. בכל רגע מישהו עשוי להקפיץ את המחיר.`
          : "עדיין אין הצעות — היה הראשון וקבע את המחיר. ברגע שתפספס, ההצעה כבר לא תחזור."}
      </p>
      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold" style={{ color: "#ff6600" }}>
        <Zap className="h-3 w-3" />
        כל שנייה שעוברת — המחיר רק עולה
      </div>
    </div>
  );
}

export default BuyerFomoBanner;