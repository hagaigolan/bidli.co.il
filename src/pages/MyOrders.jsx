import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Package, Gavel, RefreshCw, Trophy,
  Hourglass, ShieldCheck, ShieldAlert, XCircle, ChevronDown, Receipt
} from "lucide-react";
import { getFeeBreakdown } from "@/lib/handlingFee";
import { getFeeConfig } from "@/functions/getFeeConfig";
import OrderPaymentFlow from "@/components/OrderPaymentFlow";

// Payment / order status derived from product.status + payment_status
function getOrderStatus(product) {
  if (product.status === "disputed")
    return { label: "בסכסוך", color: "#ef4444", bg: "#ef444415", icon: ShieldAlert };
  if (product.status === "cancelled")
    return { label: "בוטל", color: "#6b7280", bg: "#f3f4f6", icon: XCircle };
  if (product.status === "paid" || product.payment_status === "released")
    return { label: "שולם ואושר ✓", color: "#22c55e", bg: "#22c55e15", icon: ShieldCheck };
  if (product.status === "transfer_reported")
    return { label: "העברה דווחה — ממתין לאישור המוכר", color: "#2d4f68", bg: "#2d4f6815", icon: Hourglass };
  if (product.status === "awaiting_payment" || product.payment_status === "unpaid")
    return { label: "ממתין להעברה", color: "#e5893d", bg: "#e5893d15", icon: Hourglass };
  return { label: "בטיפול", color: "#f97316", bg: "#f9731615", icon: Hourglass };
}

function OrderRow({ product, feeRate, onReload }) {
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
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">
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
            style={{ color: showBreakdown ? "#3e6b8a" : "#9ca3af" }}>
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
            <span className="font-black" style={{ color: "#3e6b8a" }}>₪{total.toLocaleString()}</span>
          </div>
        </div>
      )}

      {["awaiting_payment", "transfer_reported"].includes(product.status) && (
        <OrderPaymentFlow product={product} onDone={onReload} />
      )}
    </div>
  );
}

function getBidStatus(bid) {
  if (bid.is_winning || bid.status === "won")
    return { label: "ההצעה שלי מובילה 🏆", color: "#22c55e", bg: "#22c55e15" };
  if (bid.status === "outbid")
    return { label: "קיבלת הצעה גבוהה יותר", color: "#ef4444", bg: "#ef444415" };
  if (bid.status === "lost")
    return { label: "המכרז הסתיים", color: "#6b7280", bg: "#f3f4f6" };
  return { label: "הצעה פעילה", color: "#e5893d", bg: "#e5893d15" };
}

function AuctionRow({ product }) {
  const ended = new Date(product.ends_at) <= new Date();
  return (
    <Link to={`/auction/${product.id}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all group border border-gray-100 rounded-xl bg-white">
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
          <span className="text-xs text-gray-400">מחיר נוכחי:</span>
          <span className="text-sm font-black text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {product.bid_count || 0} הצעות · סיום בתאריך {new Date(product.ends_at).toLocaleDateString("he-IL")}
        </p>
      </div>
      <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
        style={ended ? { background: "#f3f4f6", color: "#6b7280" } : { background: "#22c55e15", color: "#22c55e" }}>
        {ended ? "הסתיים" : "פעיל"}
      </span>
    </Link>
  );
}

function BidRow({ bid }) {
  const cfg = getBidStatus(bid);
  return (
    <Link to={`/auction/${bid.product_id}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all group border border-gray-100 rounded-xl bg-white">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
        {bid.product_image_url
          ? <img src={bid.product_image_url} alt={bid.product_title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
      </div>
      <div className="flex-1 min-w-0" dir="rtl">
        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">
          {bid.product_title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">ההצעה שלי:</span>
          <span className="text-sm font-black text-gray-900">₪{(bid.amount || 0).toLocaleString()}</span>
        </div>
        {bid.product_ends_at && (
          <p className="text-xs text-gray-400 mt-1">סיום: {new Date(bid.product_ends_at).toLocaleDateString("he-IL")}</p>
        )}
      </div>
      <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap"
        style={{ background: cfg.bg, color: cfg.color }}>
        {cfg.label}
      </span>
    </Link>
  );
}

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [tab, setTab] = useState("orders");
  const [feeRate, setFeeRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { setMe(false); return; }
      try { setMe(await base44.auth.me()); } catch { setMe(false); }
    });
  }, []);

  const storedName = localStorage.getItem("bidder_name");
  const storedEmail = localStorage.getItem("bidder_email");

  const identity = {
    email: (me && me.email) || storedEmail || "",
    name: (me && me.full_name) || storedName || "",
    id: me?.id,
  };

  const loadOrders = async () => {
    getFeeConfig().then(r => setFeeRate(r?.data?.buyer_handling_rate ?? 0)).catch(() => {});
    if (!identity.email && !identity.name) { setLoading(false); return; }
    setLoading(true);
    try {
      const all = await base44.entities.Product.list("-created_date", 200);
      const now = new Date();

      // מכרזים שיצרתי
      setMyAuctions(all.filter(p =>
        (identity.email && p.seller_email === identity.email) ||
        (identity.id && p.seller_user_id === identity.id) ||
        (identity.name && p.seller_name === identity.name)
      ));

      // הצעות שהגשתי — ההצעה האחרונה שלי בכל מכרז
      const bidRecs = await base44.entities.Bid.list("-created_date", 200);
      const seen = new Set();
      setMyBids(bidRecs.filter(b => {
        if (seen.has(b.product_id)) return false;
        if (!((identity.email && b.bidder_email === identity.email) ||
               (identity.name && b.bidder_name === identity.name))) return false;
        seen.add(b.product_id);
        return true;
      }));

      // זכיות והזמנות
      setOrders(all.filter(p =>
        new Date(p.ends_at) <= now &&
        ((identity.email && p.highest_bidder_email === identity.email) ||
         (identity.name && p.highest_bidder === identity.name))
      ));
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { if (me !== null) loadOrders(); }, [me]);

  const hasProfile = identity.email || identity.name;

  const paidCount = orders.filter(p => p.status === "paid").length;
  const reportedCount = orders.filter(p => p.status === "transfer_reported").length;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #3e6b8a08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3e6b8a22, #e5893d11)", border: "1px solid #3e6b8a33" }}>
              <Package className="h-7 w-7" style={{ color: "#3e6b8a" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">ההזמנות שלי</h1>
              <p className="text-sm text-gray-400">זכיות, מכרזים שיצרתי והצעות שהגשתי — הכל במקום אחד</p>
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
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              לאזור האישי
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-[#3e6b8a] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6" dir="rtl">
              {[
                { id: "orders", label: "זכיות והזמנות", count: orders.length },
                { id: "created", label: "מכרזים שיצרתי", count: myAuctions.length },
                { id: "bids", label: "הצעות שהגשתי", count: myBids.length },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={tab === t.id
                    ? { borderColor: "#3e6b8a", color: "#3e6b8a", background: "#3e6b8a0f" }
                    : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
                  {t.label} <span className="opacity-60">({t.count})</span>
                </button>
              ))}
            </div>

            {tab === "orders" && (
              <>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "זכיות בסה\"כ", value: orders.length, color: "#3e6b8a", icon: Trophy },
                    { label: "ממתין לאישור", value: reportedCount, color: "#2d4f68", icon: Hourglass },
                    { label: "שולם ואושר", value: paidCount, color: "#22c55e", icon: ShieldCheck },
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
                      style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                      לכל המכרזים
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map(p => <OrderRow key={p.id} product={p} feeRate={feeRate} onReload={loadOrders} />)}
                  </div>
                )}
              </>
            )}

            {tab === "created" && (
              myAuctions.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">טרם יצרת מכרזים</p>
                  <Link to="/upload-product" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                    העלה מוצר למכרז
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myAuctions.map(p => <AuctionRow key={p.id} product={p} />)}
                </div>
              )
            )}

            {tab === "bids" && (
              myBids.length === 0 ? (
                <div className="text-center py-12">
                  <Gavel className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm text-gray-400">טרם הגשת הצעות במכרזים</p>
                  <Link to="/auctions" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                    לכל המכרזים
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {myBids.map(b => <BidRow key={b.id} bid={b} />)}
                </div>
              )
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