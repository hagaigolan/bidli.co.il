import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Flame, TrendingUp } from "lucide-react";

// FOMO banner — top of the seller's publish form.
// Shows live counts of auctions published today and currently active.
export function SellerFomoBanner() {
  const [todayCount, setTodayCount] = useState(null);
  const [activeCount, setActiveCount] = useState(null);

  useEffect(() => {
    base44.entities.Product.list("-created_date", 500)
      .then((items) => {
        const startToday = new Date();
        startToday.setHours(0, 0, 0, 0);
        setTodayCount(items.filter((p) => new Date(p.created_date) >= startToday).length);
        setActiveCount(items.filter((p) => new Date(p.ends_at) > new Date()).length);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mb-2 rounded-2xl p-4" dir="rtl"
      style={{ background: "linear-gradient(135deg, #f700ff12, #9d00ff08)", border: "1px solid #f700ff33" }}>
      <div className="flex items-center gap-2 mb-1">
        <Flame className="h-4 w-4 flex-shrink-0" style={{ color: "#f700ff" }} />
        <p className="text-sm font-black text-gray-900">
          אחרים כבר פרסמו היום{todayCount !== null ? ` — ${todayCount} מכרזים חדשים` : ""}
        </p>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">
        הפריט שלך עדיין מחכה במגירה?{" "}
        {activeCount !== null ? `כרגע ${activeCount} מכרזים פעילים מתחרים. ` : ""}
        פרסם עכשיו לפני שהרגע עובר ומישהו אחר מוכר את מה שדומה לפריט שלך.
      </p>
    </div>
  );
}

// FOMO block — next to the "publish" CTA. Static urgency copy.
export function SellerFomoBlock() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl" dir="rtl"
      style={{ background: "linear-gradient(135deg, #ff660010, #f700ff08)", border: "1px solid #ff660033" }}>
      <TrendingUp className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#ff6600" }} />
      <div>
        <p className="text-sm font-bold text-gray-800">פרסום לוקח 2 דקות ועולה 0 ₪</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          בינתיים מישהו אחר מוכר עכשיו פריט דומה לשלך — וכבר מקבל הצעות. אל תחכה למחר.
        </p>
      </div>
    </div>
  );
}

export default SellerFomoBanner;