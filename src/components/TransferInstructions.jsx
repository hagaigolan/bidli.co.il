import { useState } from "react";
import { Copy, Check, Smartphone, Landmark, Banknote } from "lucide-react";

const METHOD_META = {
  kashcash: { label: "קשקאש", icon: Smartphone },
  bit: { label: "ביט", icon: Smartphone },
  bank: { label: "העברה בנקאית", icon: Landmark },
};

// הוראות העברה לקונה — מציג את כל אמצעי התשלום שהמוכר הגדר (ניתן לבחור יותר מאחד)
export default function TransferInstructions({ product }) {
  const [copied, setCopied] = useState("");
  const methods = (Array.isArray(product.seller_payment_methods) && product.seller_payment_methods.length
    ? product.seller_payment_methods
    : [product.seller_payment_method]
  ).filter((m) => METHOD_META[m]);
  const amount = product.current_price || product.starting_price || 0;

  const copy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(""), 1600);
    } catch {}
  };

  return (
    <div className="rounded-2xl border p-4" dir="rtl"
      style={{ background: "linear-gradient(135deg, #00c85308, #00e67605)", borderColor: "#00c85333" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00c85322, #00e67611)", border: "1px solid #00c85333" }}>
          <Banknote className="h-4 w-4" style={{ color: "#00c853" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">העבר את סכום הזכייה ישירות למוכר</p>
          <p className="text-xs text-gray-400">ללא כרטיס אשראי — העברה ישירה ומיידית{methods.length > 1 ? " · לרשותך כמה אמצעים לבחירה" : ""}</p>
        </div>
        <p className="text-lg font-black" style={{ color: "#00c853" }}>₪{amount.toLocaleString()}</p>
      </div>

      {methods.length === 0 ? (
        <div className="p-3 rounded-xl bg-white border border-gray-100 text-sm text-gray-500">
          המוכר לא הגדיר פרטי תשלום — פנה אליו ישירות
        </div>
      ) : (
        methods.map((m, i) => {
          const meta = METHOD_META[m];
          const details = m === "bank" ? product.seller_bank_details : product.seller_payme_phone;
          const MethodIcon = meta.icon;
          const copyValue = details || "";
          return (
            <div key={m} className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 ${i > 0 ? "mt-2" : ""}`}>
              <MethodIcon className="h-5 w-5 flex-shrink-0" style={{ color: "#00c853" }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400">{meta.label} של המוכר{methods.length > 1 ? " — אפשר לבחור" : ""}</p>
                <p className="text-sm font-bold text-gray-900 break-words whitespace-pre-line" dir={m === "bank" ? "rtl" : "ltr"}>
                  {details || "המוכר לא הגדיר פרטי תשלום — פנה אליו ישירות"}
                </p>
              </div>
              {copyValue && (
                <button type="button" onClick={() => copy(copyValue)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                  style={copied === copyValue
                    ? { background: "#00c853", color: "white" }
                    : { background: "#00c85310", color: "#00c853", border: "1px solid #00c85344" }}>
                  {copied === copyValue ? <><Check className="h-3.5 w-3.5" /> הועתק</> : <><Copy className="h-3.5 w-3.5" /> העתק</>}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}