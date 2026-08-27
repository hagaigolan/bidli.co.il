import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SellerPayoutPanel from "@/components/SellerPayoutPanel";
import { ArrowRight, CreditCard, Package, Wallet, CheckCircle, AlertCircle } from "lucide-react";

const SOLD_STATUSES = ["awaiting_payment", "paid", "escrow", "delivered", "released"];

export default function SellerPayout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(
    () => searchParams.get("email") || localStorage.getItem("seller_email") || ""
  );
  const [committed, setCommitted] = useState(email);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!committed) { setProducts([]); return; }
    localStorage.setItem("seller_email", committed);
    setLoading(true);
    base44.entities.Product.filter({ seller_email: committed }, "-created_date", 100)
      .then((items) => setProducts(items.filter((p) => SOLD_STATUSES.includes(p.status))))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [committed, refreshKey]);

  const soldProducts = products;
  const needsCard = soldProducts.filter((p) => !p.seller_payout_method_id);
  const hasCard = soldProducts.find((p) => p.seller_payout_method_id);
  const totalPending = needsCard.reduce((s, p) => s + (p.current_price || p.starting_price || 0), 0);

  const cardBrand = hasCard?.seller_card_brand;
  const cardLast4 = hasCard?.seller_card_last4;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #f700ff08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00c85322, #00e67611)", border: "1px solid #00c85333" }}>
              <Wallet className="h-7 w-7" style={{ color: "#00c853" }} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">אזור המוכר — קבלת תשלומים</h1>
              <p className="text-sm text-gray-400">הזנת כרטיס אשראי אליו יועבר סכום המכירות</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Email identification */}
        <div className="p-4 rounded-2xl border border-gray-100">
          <label className="block text-xs text-gray-500 mb-1">האימייל שבו נרשמת כמוכר</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all"
              dir="ltr"
            />
            <button
              onClick={() => setCommitted(email.trim())}
              disabled={!email.trim() || email.trim() === committed}
              className="text-white text-sm px-4 py-2.5 rounded-xl font-bold disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}
            >
              הצג מכירות
            </button>
          </div>
        </div>

        {!committed ? (
          <div className="text-center py-10">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">הזן את האימייל שלך כדי לראות את המכירות ולהזין כרטיס לתשלום</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
          </div>
        ) : soldProducts.length === 0 ? (
          <div className="text-center py-10">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">עדיין אין מכירות שהסתיימו עבור אימייל זה</p>
            <Link to="/upload-product" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              פרסם מוצר חדש
            </Link>
          </div>
        ) : (
          <>
            {/* Card status */}
            {hasCard ? (
              <div className="p-4 rounded-2xl border border-green-200" style={{ background: "#00c85308" }} dir="rtl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800">כרטיס רשום ✓</p>
                    <p className="text-xs text-green-700">
                      {cardBrand || "כרטיס"} ···· {cardLast4} — התשלומים יועברו לכרטיס זה
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-amber-200" style={{ background: "#f59e0b08" }} dir="rtl">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">נדרש להזין כרטיס</p>
                    <p className="text-xs text-amber-700">
                      כדי שנוכל להעביר אליך את סכום המכירות, יש להזין כרטיס אשראי לקבלת התשלום
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card entry */}
            <SellerPayoutPanel
              sellerEmail={committed}
              onRegistered={() => setRefreshKey((k) => k + 1)}
            />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "מכירות שהסתיימו", value: soldProducts.length, color: "#9d00ff", icon: Package },
                { label: "ממתינות לכרטיס", value: needsCard.length, color: "#f700ff", icon: CreditCard },
                { label: "סכום ממתין (₪)", value: totalPending.toLocaleString(), color: "#00c853", icon: Wallet },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="p-3 rounded-2xl border border-gray-100 text-center" style={{ background: color + "06" }}>
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color }} />
                  <p className="text-lg font-black" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Sold products list */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">המכירות שלי</h3>
              {soldProducts.map((p) => (
                <Link
                  to={`/auction/${p.id}`}
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    {p.image_url
                      ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#f700ff] transition-colors">
                      {p.title}
                    </p>
                    <p className="text-xs font-bold text-gray-700">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</p>
                  </div>
                  {p.seller_payout_method_id ? (
                    <span className="text-xs px-2 py-1 rounded-full font-bold text-green-700 bg-green-50 border border-green-200">
                      כרטיס נרשם
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-bold text-amber-700 bg-amber-50 border border-amber-200">
                      ממתין לכרטיס
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}