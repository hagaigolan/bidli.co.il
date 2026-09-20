import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Store, RefreshCw, BadgeCheck, Hourglass, CheckCircle2, Loader2 } from "lucide-react";

const SALE_STATUSES = ["awaiting_payment", "transfer_reported", "paid"];

const SELLER_STATUS = {
  awaiting_payment: { label: "ממתין להעברת הקונה", color: "#e5893d", bg: "#e5893d15", icon: Hourglass },
  transfer_reported: { label: "הקונה דיווח על העברה", color: "#2d4f68", bg: "#2d4f6815", icon: BadgeCheck },
  paid: { label: "שולם ואושר ✓", color: "#22c55e", bg: "#22c55e15", icon: CheckCircle2 },
};

// אזור המוכר: מכירות פעילות ואישור קבלת תשלום בהעברה
export default function SalesManager() {
  const sellerEmail = localStorage.getItem("seller_email") || localStorage.getItem("bidder_email");
  const [sales, setSales] = useState(null);
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    if (!sellerEmail) { setSales([]); return; }
    try {
      const items = await base44.entities.Product.filter({ seller_email: sellerEmail }, "-created_date", 100);
      setSales(items.filter(p => SALE_STATUSES.includes(p.status)));
    } catch { setSales([]); }
  };

  useEffect(() => { load(); }, []);

  const confirmPayment = async (product) => {
    if (busyId) return;
    setBusyId(product.id);
    try {
      // האישור מבוצע בשרת: אימות שהמאשר הוא המוכר, עדכון הסטטוס ומייל לקונה
      await base44.functions.invoke("confirmSalePayment", { product_id: product.id });
      await load();
    } catch {} finally { setBusyId(""); }
  };

  if (sales === null || sales.length === 0) return null;

  return (
    <div className="mb-6" dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #00c85322, #00e67611)", border: "1px solid #00c85333" }}>
          <Store className="h-5 w-5" style={{ color: "#00c853" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">המכירות שלי</p>
          <p className="text-xs text-gray-400">קבלת תשלומים בהעברה ואישור קבלת כסף</p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {sales.map(p => {
          const cfg = SELLER_STATUS[p.status] || SELLER_STATUS.awaiting_payment;
          const Icon = cfg.icon;
          const canConfirm = p.status === "transfer_reported";
          return (
            <div key={p.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <Link to={`/auction/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all group">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
                    {p.highest_bidder && <span className="text-xs text-gray-400">· קונה: {p.highest_bidder}</span>}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  <Icon className="h-3 w-3" />
                  <span className="text-xs font-bold whitespace-nowrap">{cfg.label}</span>
                </div>
              </Link>

              {canConfirm && (
                <div className="px-3 pb-3 pt-1 border-t border-gray-50">
                  <button type="button" onClick={() => confirmPayment(p)} disabled={busyId === p.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition-all"
                    style={{ background: "linear-gradient(135deg, #00c853, #00e676)", boxShadow: "0 0 12px #00c85344" }}>
                    {busyId === p.id
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> מאשר...</>
                      : <><CheckCircle2 className="h-3.5 w-3.5" /> הכסף התקבל — אשר קבלת תשלום</>}
                  </button>
                  {p.transfer_reference && (
                    <p className="text-xs text-gray-400 mt-1.5 px-1">אסמכתא שהוזנה על ידי הקונה: {p.transfer_reference}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}