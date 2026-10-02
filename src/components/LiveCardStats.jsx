import { useMemo } from "react";
import { Eye } from "lucide-react";

// נתוני פעילות חיים על כרטיס מכרז — צופים (מיוצב לפי מזהה הפריט) + מספר הצעות אמיתי
export function useViewers(id) {
  return useMemo(() => {
    let h = 7;
    const s = String(id || "");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1009;
    return 4 + (h % 29);
  }, [id]);
}

export default function LiveCardStats({ product }) {
  const viewers = useViewers(product?.id);
  if (!product) return null;
  const bids = product.bid_count || 0;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
      <Eye className="h-3 w-3" aria-hidden="true" />
      <span className="font-medium">{viewers} צופים כרגע</span>
      <span>·</span>
      <span className="font-bold" style={bids > 0 ? { color: "#e5893d" } : undefined}>{bids} הצעות</span>
    </div>
  );
}