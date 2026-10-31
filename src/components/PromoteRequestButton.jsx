import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, CheckCircle } from "lucide-react";

// בקשת קידום מכרז — למוכר שבעל המכרז בלבד. ללא תשלום וללא חיוב,
// הבקשה נשלחת לבעל האתר לאישור.
export default function PromoteRequestButton({ product, onUpdated }) {
  const status = product?.promotionStatus || "none";
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const request = async () => {
    setSending(true);
    setError("");
    try {
      await base44.entities.Product.update(product.id, { promotionStatus: "requested" });
      setSent(true);
      onUpdated?.("requested");
    } catch {
      setError("שליחת הבקשה נכשלה, נסה שנית");
    } finally {
      setSending(false);
    }
  };

  if (status === "approved") {
    return (
      <p className="text-xs font-bold mt-2" style={{ color: "#3e6b8a" }}>
        ★ המכרז מקודם — מוצג בראש רשימת המכרזים
      </p>
    );
  }

  if (status === "requested" || sent) {
    return (
      <p className="text-xs font-bold mt-2 flex items-center gap-1.5" style={{ color: "#3e6b8a" }}>
        <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
        הבקשה נשלחה — בעל האתר יאשר את הקידום
      </p>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={request}
        disabled={sending}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all hover:scale-[1.02] disabled:opacity-60"
        style={{ borderColor: "#3e6b8a55", color: "#3e6b8a", background: "#3e6b8a08" }}
      >
        <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
        {sending ? "שולח בקשה..." : "קדם את המכרז"}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}