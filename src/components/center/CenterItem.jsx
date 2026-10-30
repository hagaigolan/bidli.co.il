import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatTimeLeft } from "@/lib/countdown";

const TONES = {
  leading: { label: "אתה מוביל", bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
  outbid: { label: "עקפו אותך", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  watch: { label: "במועדפים", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  match: { label: "מתאים לך", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
};

export default function CenterItem({ product, tone, myAmount, now }) {
  const t = TONES[tone] || TONES.watch;
  const msLeft = new Date(product.ends_at).getTime() - now;
  const urgent = msLeft > 0 && msLeft < 60 * 60 * 1000;

  return (
    <Link
      to={`/auction/${product.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl border bg-white transition-all hover:shadow-md hover:-translate-y-0.5"
      style={{ borderColor: urgent ? "#fecaca" : "#f1f1f2" }}
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title || "פריט במכרז"}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: t.bg, color: t.color, border: `1px solid ${t.border}` }}
          >
            {t.label}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold"
            style={{ color: urgent ? "#dc2626" : "#6b7280" }}
          >
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatTimeLeft(product.ends_at, now)}
          </span>
        </div>
        <p className="text-sm font-bold text-gray-800 truncate">{product.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          מחיר נוכחי <span className="font-bold text-gray-800">₪{Number(product.current_price || product.starting_price || 0).toLocaleString()}</span>
          {myAmount ? <span className="text-gray-400"> · ההצעה שלך ₪{Number(myAmount).toLocaleString()}</span> : null}
        </p>
      </div>
    </Link>
  );
}