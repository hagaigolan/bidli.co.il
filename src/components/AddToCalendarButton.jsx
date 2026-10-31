import { CalendarPlus } from "lucide-react";
import { downloadAuctionIcs } from "@/lib/ics";

// כפתור "ליומן" — מוריד קובץ ICS עם תזכורת לפני סיום המכרז
export default function AddToCalendarButton({ product, className = "" }) {
  if (!product?.ends_at) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); downloadAuctionIcs(product); }}
      aria-label={`הוספת "${product.title}" ליומן`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border bg-white transition-all hover:bg-[#d68d4d14] ${className}`}
      style={{ borderColor: "#d68d4d", color: "#d68d4d" }}
    >
      <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
      ליומן
    </button>
  );
}