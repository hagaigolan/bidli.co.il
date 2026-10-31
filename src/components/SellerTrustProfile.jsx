import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Gavel, Star } from "lucide-react";

// פרופיל אמון למוכר — שלושה נתונים אמיתיים בלבד מהשרת:
// תאריך ההצטרפות, מספר המכרזים ודירוג מביקורות אמיתיות (או "אין דירוגים עדיין").
export default function SellerTrustProfile({ sellerEmail, sellerUserId, className = "" }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!sellerEmail && !sellerUserId) return;
    base44.functions.invoke("getSellerTrust", {
      seller_email: sellerEmail || undefined,
      seller_user_id: sellerUserId || undefined,
    })
      .then(res => setData(res.data || null))
      .catch(() => setData(null));
  }, [sellerEmail, sellerUserId]);

  if (!data) return null;

  const joined = data.joined_at
    ? new Date(data.joined_at).toLocaleDateString("he-IL", { month: "long", year: "numeric" })
    : null;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 ${className}`} dir="rtl">
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <CalendarDays className="h-3 w-3" aria-hidden="true" /> ב-bidli מאז
        </p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{joined || "לא ידוע"}</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Gavel className="h-3 w-3" aria-hidden="true" /> מכרזים
        </p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{data.auctions_count || 0} מכרזים</p>
      </div>
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Star className="h-3 w-3" aria-hidden="true" /> דירוג
        </p>
        {data.rating === null || data.reviews_count === 0 ? (
          <p className="text-sm font-bold text-gray-400 mt-0.5">אין דירוגים עדיין</p>
        ) : (
          <p className="text-sm font-bold text-gray-800 mt-0.5 flex items-center gap-1">
            <span style={{ color: "#f59e0b" }}>★</span>
            {data.rating}
            <span className="text-xs font-medium text-gray-400">({data.reviews_count} ביקורות)</span>
          </p>
        )}
      </div>
    </div>
  );
}