import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp } from "lucide-react";

// פס עדכונים נגלל — מכירות אמיתיות שהסתיימו לאחרונה, מתחלף כל כמה שניות
export default function SalesTicker() {
  const [messages, setMessages] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    base44.entities.Product.list("-updated_date", 60).then((ps) => {
      const now = Date.now();
      const sold = ps
        .filter((p) => p.highest_bidder && p.status !== "cancelled" && p.status !== "active" &&
          p.ends_at && new Date(p.ends_at).getTime() < now)
        .slice(0, 8)
        .map((p) => `המכרז של ${p.seller_name || "מוכר"} נמכר ב-₪${(p.current_price || 0).toLocaleString("he-IL")} — ${p.title}`);
      setMessages(sold);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(t);
  }, [messages.length]);

  if (!messages.length) return null;

  return (
    <div className="flex items-center gap-1.5 overflow-hidden" dir="rtl">
      <TrendingUp className="h-3 w-3 flex-shrink-0" style={{ color: "#00a35c" }} aria-hidden="true" />
      <span key={idx} className="truncate font-medium" style={{ color: "#00a35c" }}>{messages[idx]}</span>
    </div>
  );
}