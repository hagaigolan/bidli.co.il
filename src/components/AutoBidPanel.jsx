import { useState, useEffect } from "react";
import { Bot, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// הצעה אוטומטית חד-פעמית — המשתמש בוחר סכום מקסימלי, ואם מישהו אחר מגיש
// הצעה גבוהה יותר, המערכת מגישה בשמו אוטומטית הצעה של מחיר נוכחי + 1 (פעם אחת בלבד)
export default function AutoBidPanel({ product, onRequireLogin }) {
  const { user: authUser, isAuthenticated } = useAuth();
  const [maxAmount, setMaxAmount] = useState("");
  const [mine, setMine] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const myEmails = [...new Set([
    (localStorage.getItem("bidder_email") || "").trim().toLowerCase(),
    (authUser?.email || "").trim().toLowerCase(),
  ].filter(Boolean))];
  const myName = (localStorage.getItem("bidder_name") || "").trim();

  useEffect(() => {
    base44.entities.AutoBid.filter({ product_id: product.id })
      .then(items => {
        setMine(items.find(a =>
          myEmails.includes((a.bidder_email || "").trim().toLowerCase()) ||
          (myName && (a.bidder_name || "").trim() === myName)
        ) || null);
      }).catch(() => {});
  }, [product?.id, product?.bid_count]);

  const minAmount = (product.current_price || product.starting_price || 0) + 1;

  const handleSet = async () => {
    if (!isAuthenticated) { onRequireLogin?.(); return; }
    const amt = parseFloat(maxAmount);
    if (!amt || amt < minAmount) {
      setError(`הסכום חייב להיות לפחות ₪${minAmount.toLocaleString()}`);
      return;
    }
    setSaving(true); setError("");
    try {
      const created = await base44.entities.AutoBid.create({
        product_id: product.id,
        product_title: product.title,
        product_ends_at: product.ends_at,
        bidder_name: myName || "אנונימי",
        bidder_email: myEmails[0] || "",
        max_amount: amt,
      });
      setMine(created);
    } catch { setError("שגיאה בשמירה, נסה שנית"); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "#6aa3cd44", background: "#6aa3cd0a" }} dir="rtl">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-4 w-4" style={{ color: "#2d4f68" }} />
        <span className="text-sm font-bold text-gray-800">הצעה אוטומטית חד-פעמית</span>
      </div>

      {mine && mine.used ? (
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#16a34a" }}>
          <CheckCircle className="h-4 w-4" /> ההצעה האוטומטית שלך נוצלה — הוגשה עבורך הצעה אוטומטית
        </div>
      ) : mine ? (
        <p className="text-xs text-gray-500 leading-relaxed">
          מוגדרת עד <span className="font-black text-gray-800">₪{mine.max_amount.toLocaleString()}</span> —
          אם מישהו אחר יגיש הצעה גבוהה יותר, נגיש בשמך אוטומטית הצעה של מחיר נוכחי + ₪1 (פעם אחת בלבד).
        </p>
      ) : (
        <>
          <p className="text-xs text-gray-500 leading-relaxed mb-2.5">
            בחר/י סכום מקסימלי — אם מישהו אחר יגיש הצעה גבוהה יותר, נגיש בשמך אוטומטית הצעה של מחיר נוכחי + ₪1 (פעם אחת בלבד).
          </p>
          <div className="flex gap-2">
            <input type="number" min={minAmount} step="1" value={maxAmount}
              onChange={e => setMaxAmount(e.target.value)}
              placeholder={`עד ₪${minAmount.toLocaleString()} ומעלה`}
              className="flex-1 px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#6aa3cd88] text-right" />
            <button type="button" onClick={handleSet} disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60 whitespace-nowrap transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #6aa3cd, #2d4f68)" }}>
              {saving ? "שומר..." : "הפעלה"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
        </>
      )}
    </div>
  );
}