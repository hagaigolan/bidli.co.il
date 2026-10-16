import { TrendingUp, AlertTriangle } from "lucide-react";

// באנר סטטוס למציע המחובר — מוביל כרגע או שעקפו אותו
export default function BidStatusBanner({ isLeading, isOutbid, currentLeader, onBidAgain }) {
  if (!isLeading && !isOutbid) return null;

  if (isLeading) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl border-2" dir="rtl"
        style={{ borderColor: "#00c85355", background: "linear-gradient(135deg, #00c85312, #00e67608)" }}>
        <TrendingUp className="h-5 w-5 flex-shrink-0" style={{ color: "#00c853" }} aria-hidden="true" />
        <div>
          <p className="font-black" style={{ color: "#00a35c" }}>אתה מוביל!</p>
          <p className="text-xs text-gray-500">ההצעה שלך היא הגבוהה ביותר כרגע במכרז</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl border-2" dir="rtl"
      style={{ borderColor: "#ff660055", background: "linear-gradient(135deg, #ff22000f, #e5893d0f)" }}>
      <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: "#ff6600" }} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="font-black" style={{ color: "#e55100" }}>עקפו אותך</p>
        <p className="text-xs text-gray-600">
          {currentLeader ? `${currentLeader} מוביל כרגע — ` : ""}הגש הצעה גבוהה יותר כדי לחזור לראש
        </p>
      </div>
      <button type="button" onClick={onBidAgain}
        className="text-xs font-bold px-3 py-2 rounded-xl text-white whitespace-nowrap flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #ff6600, #e5893d)" }}>
        הגש הצעה →
      </button>
    </div>
  );
}