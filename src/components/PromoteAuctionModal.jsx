import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, Loader2, X, CheckCircle } from "lucide-react";

const PACKAGES = [
  { name: "בולט בקטגוריה", price: 49, days: 7, desc: "המכרז מוצג ראשון עם תווית מקודם בקטגוריה שלו" },
  { name: "דף הבית", price: 149, days: 7, desc: "המכרז מוצג בראש רשימת המכרזים הפעילים" },
  { name: "פרימיום", price: 299, days: 14, desc: "קידום בכל הרשימות לשבועיים + תווית בולטת" },
];

// בקשת קידום מכרז — הבקשה נשלחת לניהול, והחיוב מתבצע לאחר אישור
export default function PromoteAuctionModal({ product, sellerEmail, sellerName, onClose, onSaved }) {
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true); setError("");
    try {
      const pkg = PACKAGES[selected];
      await base44.entities.Promotion.create({
        product_id: product.id,
        product_title: product.title,
        seller_email: sellerEmail || "",
        seller_name: sellerName || product.seller_name || "",
        package_name: pkg.name,
        price: pkg.price,
        days: pkg.days,
        status: "pending",
        note: `בקשת קידום עבור "${product.title}"`,
      });
      setDone(true);
      onSaved?.();
    } catch {
      setError("שליחת הבקשה נכשלה, נסה שנית");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" dir="rtl" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
              <Megaphone className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <h3 className="font-black text-gray-900">קידום המכרז</h3>
          </div>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-3" style={{ color: "#00a35c" }} aria-hidden="true" />
            <p className="font-bold text-gray-800 mb-1">הבקשה נשלחה לאישור</p>
            <p className="text-sm text-gray-500">נחזור אליך להשלמת התשלום ולאישור הקידום. ברגע שהקידום יאושר המכרז יוצג עם תווית "מקודם".</p>
            <button onClick={onClose} className="mt-4 text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>סגירה</button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-xs text-gray-500">בחר חבילת חשיפה. החיוב מתבצע לאחר אישור הבקשה על ידי צוות bidli.</p>
            {PACKAGES.map((pkg, i) => (
              <button key={pkg.name} type="button" onClick={() => setSelected(i)} aria-pressed={selected === i}
                className="w-full text-right p-3 rounded-xl border transition-all"
                style={selected === i
                  ? { borderColor: "#e5893d", background: "#e5893d0f" }
                  : { borderColor: "#e5e7eb", background: "white" }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-gray-800">{pkg.name}</span>
                  <span className="text-sm font-black" style={{ color: "#e5893d" }}>₪{pkg.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{pkg.desc} · {pkg.days} ימים</p>
              </button>
            ))}
            {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
            <button onClick={submit} disabled={busy}
              className="w-full text-white text-sm py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Megaphone className="h-4 w-4" aria-hidden="true" />}
              שלח בקשת קידום
            </button>
          </div>
        )}
      </div>
    </div>
  );
}