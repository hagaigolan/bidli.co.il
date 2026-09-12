import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Pencil, RotateCcw, Truck } from "lucide-react";
import ProductEditModal from "@/components/ProductEditModal";
import { parseDbDate } from "@/lib/time";

const SOLD_STATES = ["paid", "delivered", "released"];

function getSaleStatus(p, ended) {
  if (p.status === "cancelled") return { label: "בוטל", color: "#6b7280", bg: "#f3f4f6" };
  if (p.status === "disputed") return { label: "בסכסוך", color: "#ef4444", bg: "#ef444415" };
  if (["delivered", "released"].includes(p.status)) return { label: "סופק לקונה ✓", color: "#22c55e", bg: "#22c55e15" };
  if (p.status === "paid") return { label: "נמכר — תשלום התקבל ✓", color: "#22c55e", bg: "#22c55e15" };
  if (ended && p.highest_bidder) return { label: "נמכר — ממתין לתשלום", color: "#e5893d", bg: "#e5893d15" };
  if (ended) return { label: "לא נמכר", color: "#6b7280", bg: "#f3f4f6" };
  return { label: "פעיל", color: "#3e6b8a", bg: "#3e6b8a15" };
}

// One published product row with seller management actions:
// mark sold / delivered, republish (with editing), edit active auction.
export default function SaleRow({ product, onReload }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const endsAt = parseDbDate(product.ends_at);
  const ended = endsAt ? endsAt.getTime() <= Date.now() : true;
  const cfg = getSaleStatus(product, ended);

  const isSold = SOLD_STATES.includes(product.status);
  const canMarkSold = ended && product.highest_bidder && !isSold &&
    !["cancelled", "disputed"].includes(product.status);
  const canMarkDelivered = ended && product.highest_bidder &&
    !["delivered", "released", "cancelled", "disputed"].includes(product.status);
  const canRepublish = ended || ["cancelled"].includes(product.status);

  const mark = async (data) => {
    setBusy(true); setErr("");
    try {
      await base44.entities.Product.update(product.id, data);
      onReload();
    } catch {
      setErr("שגיאה בעדכון, נסה שנית");
    } finally {
      setBusy(false);
    }
  };

  const markSold = () => mark({ status: "paid", seller_confirmed_at: new Date().toISOString() });
  const markDelivered = () => mark({ status: "delivered", delivered_at: new Date().toISOString() });

  // Copy all details into the publish form so the auction can be edited before republishing
  const handleRepublish = () => {
    const draft = {
      title: product.title,
      description: product.description || "",
      category: product.category || "",
      condition: product.condition || "",
      location: product.location || "",
      starting_price: product.starting_price,
      image_url: product.image_url || "",
      image_urls: product.image_urls || [],
      seller_name: product.seller_name || "",
      seller_email: product.seller_email || "",
      seller_phone: product.seller_phone || "",
    };
    localStorage.setItem("republish_draft", JSON.stringify(draft));
    navigate("/upload-product");
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <Link to={`/auction/${product.id}`}
        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all group">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          {product.image_url
            ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
        </div>
        <div className="flex-1 min-w-0" dir="rtl">
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">
            {product.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{product.highest_bidder ? "מחיר זכייה:" : "מחיר נוכחי:"}</span>
            <span className="text-sm font-black text-gray-900">
              ₪{(product.current_price || product.starting_price || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>{product.bid_count || 0} הצעות</span>
            <span className="text-gray-200">·</span>
            <span>{ended ? "הסתיים" : "מסתיים"} ב-{endsAt ? endsAt.toLocaleDateString("he-IL") : ""}</span>
            {ended && product.highest_bidder && (
              <><span className="text-gray-200">·</span><span>זוכה: {product.highest_bidder}</span></>
            )}
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </Link>

      {(canMarkSold || canMarkDelivered || canRepublish || !ended) && (
        <div className="px-3 py-2.5 border-t border-gray-50 flex flex-wrap items-center gap-2" dir="rtl">
          {canMarkSold && (
            <button type="button" onClick={markSold} disabled={busy}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all disabled:opacity-50"
              style={{ borderColor: "#22c55e66", color: "#16a34a", background: "#22c55e08" }}>
              <CheckCircle className="h-3.5 w-3.5" /> התשלום התקבל — סמן כנמכר
            </button>
          )}
          {canMarkDelivered && (
            <button type="button" onClick={markDelivered} disabled={busy}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all disabled:opacity-50"
              style={{ borderColor: "#3e6b8a66", color: "#3e6b8a", background: "#3e6b8a08" }}>
              <Truck className="h-3.5 w-3.5" /> סופק לקונה
            </button>
          )}
          {canRepublish && (
            <button type="button" onClick={handleRepublish} disabled={busy}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all disabled:opacity-50"
              style={{ borderColor: "#e5893d66", color: "#e5893d", background: "#e5893d08" }}>
              <RotateCcw className="h-3.5 w-3.5" /> פרסום חוזר (עם עריכה)
            </button>
          )}
          {!ended && (
            <button type="button" onClick={() => setShowEdit(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all"
              style={{ borderColor: "#6aa3cd66", color: "#3e6b8a", background: "#6aa3cd08" }}>
              <Pencil className="h-3.5 w-3.5" /> עריכת המכרז
            </button>
          )}
          {err && <span className="text-xs text-red-500">{err}</span>}
        </div>
      )}

      {showEdit && !ended && (
        <ProductEditModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); onReload(); }}
        />
      )}
    </div>
  );
}