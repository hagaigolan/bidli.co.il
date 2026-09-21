import { Medal } from "lucide-react";

// טבלת מובילים חיה — שלושת המציעים הגבוהים, מתעדכנת בכל הצעה
export default function BidLeaderboard({ bids }) {
  if (!bids || bids.length === 0) return null;

  // מציע אחד = ההצעה הגבוהה שלו; מדורג לפי סכום
  const byBidder = new Map();
  for (const bid of bids) {
    const name = bid.bidder_name || "אנונימי";
    if (!byBidder.has(name) || bid.amount > byBidder.get(name).amount) {
      byBidder.set(name, { name, amount: bid.amount });
    }
  }
  const top = [...byBidder.values()].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];
  const colors = ["#e5893d", "#3e6b8a", "#6aa3cd"];

  return (
    <div className="rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Medal className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        <span className="text-xs font-bold text-gray-700">טבלת המובילים</span>
      </div>
      <div className="space-y-2">
        {top.map((b, i) => (
          <div key={b.name} className="flex items-center justify-between rounded-xl px-3 py-2 transition-all"
            style={{ background: colors[i] + "0d", border: `1px solid ${colors[i]}33` }}>
            <span className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <span>{medals[i]}</span>
              {b.name}
            </span>
            <span className="text-xs font-black" style={{ color: colors[i] }}>
              ₪{b.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}