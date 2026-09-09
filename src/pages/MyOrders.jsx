import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Package, RefreshCw, Trophy, Wallet,
  Hourglass, ShieldCheck, ShieldAlert, XCircle, Lock, Undo2, ChevronDown, Receipt
} from "lucide-react";
import { getFeeBreakdown } from "@/lib/handlingFee";
import { getFeeConfig } from "@/functions/getFeeConfig";

// Payment / order status derived from product.status + payment_status
function getOrderStatus(product) {
  const ps = product.payment_status;
  if (product.status === "disputed")
    return { label: "בסכסוך", color: "#ef4444", bg: "#ef444415", icon: ShieldAlert };
  if (product.status === "cancelled")
    return { label: "בוטל", color: "#6b7280", bg: "#f3f4f6", icon: XCircle };
  if (ps === "released")
    return { label: "הושלם — התשלום שוחרר", color: "#22c55e", bg: "#22c55e15", icon: ShieldCheck };
  if (ps === "refunded")
    return { label: "הוחזר", color: "#f97316", bg: "#f9731615", icon: Undo2 };
  if (ps === "frozen")
    return { label: "שולם — כסף בנאמנות", color: "#0088ff", bg: "#0088ff15", icon: Lock };
  if (product.status === "awaiting_payment" || ps === "unpaid")
    return { label: "ממתין לתשלום", color: "#f700ff", bg: "#f700ff15", icon: Hourglass };
  return { label: "בטיפול", color: "#f97316", bg: "#f9731615", icon: Hourglass };
}

function OrderRow({ product, feeRate }) {
  const cfg = getOrderStatus(product);
  const Icon = cfg.icon;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { base, fee, total } = getFeeBreakdown(product.current_price || product.starting_price || 0, feeRate);

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
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#f700ff] transition-colors">
            {product.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">מחיר זכייה:</span>
            <span className="text-sm font-black text-gray-900">₪{base.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>זכית בתאריך</span>
            <span>{new Date(product.ends_at).toLocaleDateString("he-IL")}</span>
            {product.seller_name && (<><span className="text-gray-200">·</span><span>מוכר: {product.seller_name}</span></>)}
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: cfg.bg, color: cfg.color }}>
            <Icon className="h-3 w-3" />
            <span className="text-xs font-bold whitespace-nowrap">{cfg.label}</span>
          </div>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowBreakdown(s => !s); }}
            className="flex items-center gap-0.5 text-xs font-semibold transition-colors"
            style={{ color: showBreakdown ? "#9d00ff" : "#9ca3af" }}>
            <Receipt className="h-3.5 w-3.5" />
            פירוט
            <ChevronDown className={`h-3 w-3 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          </button>
        </div>
      </Link>

      {showBreakdown && (
        <div className="px-3 pb-3 pt-2 border-t border-gray-50" style={{ background: "#f9fafb" }} dir="rtl">
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-500">מחיר הפריט (מחיר זכייה)</span>
            <span className="font-semibold text-gray-700">₪{base.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs py-1">
            <span className="text-gray-500">דמי טיפול {fee > 0 ? `(${Math.round((feeRate || 0) * 100)}%)` : ""}</span>
            <span className="font-semibold text-gray-700">{fee > 0 ? `₪${fee.toLocaleString()}` : "₪0 — ללא עלות נסתרת ✓"}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-1.5 border-t border-gray-200 mt-1">
            <span className="font-bold text-gray-800">סה"כ שולם</span>
            <span className="font-black" style={{ color: "#9d00ff" }}>₪{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [feeRate, setFeeRate] = useState(0);
  const [loading, setLoading] = useState(true);

  const storedName = localStorage.getItem("bidder_name");
  const storedEmail = localStorage.getItem("bidder_email");

  const loadOrders = async () => {
    getFeeConfig().then(r => setFeeRate(r?.data?.buyer_handling_rate ?? 0)).catch(() => {});
    if (!storedName && !storedEmail) { setLoading(false); return; }
    setLoading(true);
    try {
      const all = await base44.entities.Product.list("-created_date", 200);
      const now = new Date();
      const mine = all.filter(p =>
        new Date(p.ends_at) <= now &&
        ((storedEmail && p.highest_bidder_email === storedEmail) ||
         (storedName && p.highest_bidder === storedName))
      );
      setOrders(mine);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, []);

  const hasProfile = storedName || storedEmail;

  const paidCount = orders.filter(p => ["frozen", "released"].includes(p.payment_status)).length;
  const releasedCount = orders.filter(p => p.payment_status === "released").length;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #9d00ff08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #9d00ff22, #f700ff11)", border: "1px solid #9d00ff33" }}>
              <Package className="h-7 w-7" style={{ color: "#9d00ff" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">ההזמנות שלי</h1>
              <p className="text-sm text-gray-400">כל המוצרים שזכית בהם וסטטוס התשלום שלהם</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!hasProfile ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">הגדר את הפרופיל שלך</h2>
            <p className="text-sm text-gray-400 mb-6">כדי לראות את ההזמנות שלך, הגדר שם ואימייל באזור האישי</p>
            <Link to="/profile" className="text-white text-sm px-6 py-2.5 rounded-xl font-bold inline-block"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              לאזור האישי
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-[#9d00ff] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "זכיות בסה\"כ", value: orders.length, color: "#9d00ff", icon: Trophy },
                { label: "שולם", value: paidCount, color: "#0088ff", icon: Wallet },
                { label: "הושלם", value: releasedCount, color: "#22c55e", icon: ShieldCheck },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="p-3 rounded-2xl border border-gray-100 text-center" style={{ background: color + "06" }}>
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color }} />
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">טרם זכית במכרזים</p>
                <Link to="/auctions" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                  style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
                  לכל המכרזים
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.map(p => <OrderRow key={p.id} product={p} feeRate={feeRate} />)}
              </div>
            )}

            <button onClick={loadOrders} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto mt-6 transition-colors">
              <RefreshCw className="h-3 w-3" /> רענן נתונים
            </button>
          </>
        )}
      </div>
    </div>
  );
}