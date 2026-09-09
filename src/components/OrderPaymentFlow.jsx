import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, CheckCircle2, Hourglass, Loader2, AlertCircle } from "lucide-react";
import TransferInstructions from "@/components/TransferInstructions";

// תהליך התשלום בהעברה עבור הזוכה:
// ממתין להעברה → דיווח על העברה → ממתין לאישור המוכר → שולם ואושר
export default function OrderPaymentFlow({ product, onDone }) {
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justReported, setJustReported] = useState(false);

  const reported = justReported || ["transfer_reported", "paid"].includes(product.status);
  const confirmed = product.status === "paid";
  const deadline = product.payment_deadline
    ? new Date(product.payment_deadline)
    : null;

  const report = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await base44.entities.Product.update(product.id, {
        status: "transfer_reported",
        transfer_reported_at: new Date().toISOString(),
        transfer_reference: reference.trim(),
      });
      if (product.seller_email) {
        base44.integrations.Core.SendEmail({
          to: product.seller_email,
          subject: `💸 הקונה דיווח על העברה — ${product.title}`,
          body: `שלום ${product.seller_name || ""},\n\nהקונה ${product.highest_bidder || ""} דיווח שהעביר את סכום הזכייה (₪${(product.current_price || 0).toLocaleString()}) עבור "${product.title}".${reference.trim() ? `\n\nאסמכתא שהוזנה על ידי הקונה: ${reference.trim()}` : ""}\n\nלאחר שהכסף התקבל בפועל, יש לאשר קבלת תשלום באזור האישי:\nhttps://bidli.co.il/profile\n\nצוות bidli`,
        }).catch(() => {});
      }
      setJustReported(true);
      onDone?.();
    } catch {
      setError("שגיאה בעדכון — נסה שוב בעוד רגע");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-3 pb-3 pt-3 border-t border-gray-50 space-y-3" style={{ background: "#f9fafb" }} dir="rtl">
      {/* צ'קליסט אישור כפול */}
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={reported ? { background: "#00c85315", color: "#00c853" } : { background: "#f3f4f6", color: "#9ca3af" }}>
          {reported ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}
          העברה דווחה
        </span>
        <div className="flex-1 h-0.5 rounded-full" style={{ background: reported ? "#00c853" : "#e5e7eb" }} />
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={confirmed ? { background: "#00c85315", color: "#00c853" } : { background: "#f3f4f6", color: "#9ca3af" }}>
          {confirmed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5" />}
          המוכר אישר קבלה
        </span>
      </div>

      {!reported ? (
        <>
          <TransferInstructions product={product} />

          {deadline && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold px-1">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              מועד אחרון להעברה: {deadline.toLocaleDateString("he-IL")} בשעה {deadline.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-500 mb-1">אסמכתא / מספר העברה (אופציונלי)</label>
            <input value={reference} onChange={e => setReference(e.target.value)}
              placeholder="לדוגמה: מספר אסמכתא מהאפליקציה, 4 ספרות אחרונות וכו'"
              className="w-full px-3 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#00c85388] transition-all text-right" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="button" onClick={report} disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all"
            style={{ background: "linear-gradient(135deg, #00c853, #00e676)", boxShadow: "0 0 16px #00c85344" }}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> שולח...</> : <><Send className="h-4 w-4" /> ביצעתי את ההעברה — דווח</>}
          </button>
        </>
      ) : !confirmed ? (
        <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
          style={{ background: "#0088ff10", color: "#0088ff", border: "1px solid #0088ff33" }}>
          <Hourglass className="h-4 w-4 flex-shrink-0" />
          <span>הדיווח נשלח למוכר — ההזמנה תסומן כשולמה לאחר שיאשר את קבלת הכסף. מומלץ לתאם מסירה ישירות איתו{product.seller_phone ? ` (${product.seller_phone})` : ""}.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
          style={{ background: "#00c85310", color: "#00c853", border: "1px solid #00c85333" }}>
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>התשלום התקבל ואושר על ידי המוכר — ההזמנה הושלמה ✓</span>
        </div>
      )}
    </div>
  );
}