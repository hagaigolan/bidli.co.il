import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Ban, Loader2, X } from "lucide-react";

// אישור ביטול מכרז עצמי — הכללים (12 שעות, מכסת 3 ביטולים) נאכפים בשרת
export default function CancelAuctionModal({ product, onClose, onDone }) {
  const hasBids = (product.bid_count || 0) > 0;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setBusy(true); setError("");
    try {
      const res = await base44.functions.invoke("sellerCancelAuction", { product_id: product.id });
      const data = (res && res.data) ? res.data : res;
      if (data && data.ok) {
        onDone(data.code);
        return;
      }
      const code = data && data.code;
      if (code === "too_late") setError("נותרו פחות מ-12 שעות לסיום המכרז — הביטול נחסם כדי להגן על המציעים");
      else if (code === "limit_reached") setError("הגעת למכסת הביטולים של מכרזים עם הצעות (3). לפניות: mitugplus@gmail.com");
      else if (code === "ended") setError("המכרז כבר הסתיים ולא ניתן לביטול");
      else if (code === "forbidden") setError("רק המוכר שפרסם את המכרז יכול לבטל אותו");
      else setError("הביטול נכשל, נסה שנית");
    } catch {
      setError("הביטול נכשל, נסה שנית");
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button onClick={onClose} aria-label="סגירה"
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "#ef444412", border: "1px solid #ef444433" }}>
          <Ban className="h-6 w-6 text-red-500" aria-hidden="true" />
        </div>

        <h2 className="text-lg font-black text-gray-900 text-center mb-2">ביטול המכרז</h2>
        <p className="text-sm text-gray-500 text-center mb-4">"{product.title}"</p>

        {!hasBids ? (
          <div className="p-3.5 rounded-xl text-sm leading-relaxed mb-5"
            style={{ background: "#f9fafb", border: "1px solid #f3f4f6", color: "#374151" }}>
            לא הוגשו הצעות על המוצר — המכרז ייסגר מיד ויוסתר מהאתר.
            ביטול ללא הצעות אינו נספר למכסת הביטולים שלך ואינו פוגע בכלום.
          </div>
        ) : (
          <div className="p-3.5 rounded-xl text-sm leading-relaxed mb-5"
            style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#7c2d12" }}>
            <div className="flex items-center gap-2 font-bold mb-1.5">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              על המוצר הוגשו {product.bid_count} הצעות
            </div>
            <ul className="list-disc pr-4 space-y-1">
              <li>הביטול יישלח כהתראה לכל המציעים, וההצעות יבוטלו</li>
              <li>הביטול ייספר למכסת הביטולים שלך — עד 3 ביטולים של מכרזים עם הצעות</li>
              <li>הפעולה אינה הפיכה</li>
            </ul>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-3 text-center" role="alert">{error}</p>}

        <div className="flex gap-2">
          <button onClick={confirm} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-3 rounded-xl font-bold disabled:opacity-60"
            style={{ background: "#ef4444" }}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> מבטל...</> : "כן, בטל את המכרז"}
          </button>
          <button onClick={onClose} disabled={busy}
            className="flex-1 text-gray-600 text-sm py-3 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 disabled:opacity-60">
            השאר את המכרז
          </button>
        </div>
      </div>
    </div>
  );
}