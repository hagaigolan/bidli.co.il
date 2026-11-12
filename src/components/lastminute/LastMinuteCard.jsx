import { Link } from "react-router-dom";
import { MapPin, TrendingDown, CalendarClock } from "lucide-react";
import DealCountdown from "@/components/lastminute/DealCountdown";
import { businessIcon } from "@/components/lastminute/businessIcon";
import { dealPriceAt, savingsPercent, dealStatus, dealProgress, formatSlotTime } from "@/lib/lastMinute";
import useNow from "@/lib/useNow";

// כרטיס מכרז הפוך: המחיר והטיימר מתעדכנים בזמן אמת מול אותו חישוב שהשרת משתמש בו
export default function LastMinuteCard({ deal }) {
  const now = useNow();
  const status = dealStatus(deal, now);
  const price = dealPriceAt(deal, now);
  const list = Number(deal.list_price) || 0;
  const pct = savingsPercent(deal, price);
  const progress = dealProgress(deal, now);
  const Icon = businessIcon(deal.business_type);
  const sold = status === "sold";
  const expired = status === "expired";

  return (
    <Link to={`/last-minute/${deal.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg card-neon">
      <div className="relative px-4 pt-3 pb-3"
        style={{ background: sold ? "linear-gradient(135deg,#f3f4f6,#e5e7eb)" : "linear-gradient(135deg,#2d4f68,#3e6b8a)" }}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/80">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {deal.business_type || "שירות"}
          </span>
          {sold ? (
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/90 text-gray-600">נמכר</span>
          ) : expired ? (
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-white/20 text-white/80">הסתיים</span>
          ) : (
            <span className="text-[11px] font-black px-2 py-0.5 rounded-full" style={{ background: "#e5893d", color: "#fff" }}>
              <DealCountdown endsAt={deal.auction_ends_at} now={now} className="!text-[11px]" />
            </span>
          )}
        </div>
        <p className="text-white/60 text-[11px] mt-2 flex items-center gap-1">
          <CalendarClock className="h-3 w-3" aria-hidden="true" /> {formatSlotTime(deal.slot_start)}
        </p>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-black text-gray-900 text-[15px] leading-snug line-clamp-2">{deal.title}</h3>
        <p className="text-xs text-gray-500 mt-1 truncate">{deal.business_name}</p>
        {deal.city && (
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden="true" /> {deal.city}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-black leading-none" style={{ color: sold ? "#6b7280" : "#e5893d" }}>
                ₪{(sold ? Number(deal.sold_price) || price : price).toLocaleString("he-IL")}
              </p>
              {list > price && !sold && (
                <p className="text-[11px] text-gray-400 line-through mt-0.5">₪{list.toLocaleString("he-IL")}</p>
              )}
            </div>
            {pct > 0 && !sold && (
              <span className="text-[11px] font-black px-2 py-1 rounded-lg flex items-center gap-0.5"
                style={{ background: "#00a84414", color: "#00a844" }}>
                <TrendingDown className="h-3 w-3" aria-hidden="true" /> {pct}%
              </span>
            )}
          </div>

          <div className="mt-2.5">
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.round(progress * 100)}%`, background: sold ? "#9ca3af" : "linear-gradient(90deg,#e5893d,#3e6b8a)" }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {sold ? "החלון נתפס" : `המחיר יורד עד רצפה ₪${Number(deal.floor_price || 0).toLocaleString("he-IL")}`}
            </p>
          </div>

          <span className="mt-3 block text-center text-xs font-black py-2 rounded-xl transition-all"
            style={sold || expired
              ? { background: "#f3f4f6", color: "#9ca3af" }
              : { background: "#e5893d12", color: "#e5893d" }}>
            {sold ? "צפה בעסקה שנסגרה" : expired ? "המכרז הסתיים" : "לתפוס את המחיר"}
          </span>
        </div>
      </div>
    </Link>
  );
}