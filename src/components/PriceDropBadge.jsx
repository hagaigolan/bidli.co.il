import { TrendingDown } from "lucide-react";

const DROP_WINDOW_DAYS = 30;

// כמה המחיר ירד מאז ההורדה האחרונה (0 = אין ירידה להצגה)
export function priceDropAmount(product) {
  const prev = Number(product?.previous_price || 0);
  const now = Number(product?.current_price || product?.starting_price || 0);
  if (!prev || !now || prev <= now) return 0;
  if (product?.price_dropped_at) {
    const age = Date.now() - new Date(product.price_dropped_at).getTime();
    if (age > DROP_WINDOW_DAYS * 86400000) return 0;
  }
  return prev - now;
}

// תווית "ירד ב-₪X" על כרטיסי מכרזים ובעמוד המכרז
export default function PriceDropBadge({ product, className = "" }) {
  const drop = priceDropAmount(product);
  if (!drop) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black text-white ${className}`}
      style={{ background: "linear-gradient(135deg, #00a35c, #00c853)" }}
      aria-label={`המחיר ירד ב-${drop.toLocaleString("he-IL")} שקלים`}
    >
      <TrendingDown className="h-3 w-3" aria-hidden="true" />
      ירד ב-₪{drop.toLocaleString()}
    </span>
  );
}