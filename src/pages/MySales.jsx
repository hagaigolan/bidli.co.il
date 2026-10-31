import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, RefreshCw, Store, Gavel, CheckCircle, Hourglass
} from "lucide-react";
import SaleRow from "@/components/SaleRow";
import SellerChecklist from "@/components/SellerChecklist";
import SellerInsights from "@/components/SellerInsights";
import { parseDbDate } from "@/lib/time";

// "המכירות שלי" — all auctions the current user published,
// with per-item management (mark sold / delivered, republish).
export default function MySales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!authed) { setMe(false); return; }
      try { setMe(await base44.auth.me()); } catch { setMe(false); }
    });
  }, []);

  const identity = {
    email: (me && me.email) || localStorage.getItem("seller_email") || localStorage.getItem("bidder_email") || "",
    name: (me && me.full_name) || localStorage.getItem("bidder_name") || "",
    id: me?.id,
  };

  const loadSales = async () => {
    if (!identity.email && !identity.name && !identity.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const all = await base44.entities.Product.list("-created_date", 200);
      setSales(all.filter(p =>
        (identity.email && p.seller_email === identity.email) ||
        (identity.id && p.seller_user_id === identity.id) ||
        (identity.name && p.seller_name === identity.name)
      ));
    } catch { setSales([]); }
    setLoading(false);
  };

  useEffect(() => { if (me !== null) loadSales(); }, [me]);

  const hasProfile = identity.email || identity.name || identity.id;
  const now = Date.now();
  const stats = {
    total: sales.length,
    active: sales.filter(p => {
      const end = parseDbDate(p.ends_at);
      return end ? end.getTime() > now : false;
    }).length,
    sold: sales.filter(p => ["paid", "delivered", "released"].includes(p.status)).length,
    pending: sales.filter(p => {
      const end = parseDbDate(p.ends_at);
      return end && end.getTime() <= now &&
        !["paid", "delivered", "released", "cancelled"].includes(p.status);
    }).length,
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
              <Store className="h-7 w-7" style={{ color: "#e5893d" }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">המכירות שלי</h1>
              <p className="text-sm text-gray-400">כל הפרסומים שיצרת — נמכרו, טרם נמכרו ופרסום חוזר</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!hasProfile ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">הגדר את הפרופיל שלך</h2>
            <p className="text-sm text-gray-400 mb-6">כדי לראות את המכירות שלך, התחבר או הגדר שם ואימייל באזור האישי</p>
            <Link to="/profile" className="text-white text-sm px-6 py-2.5 rounded-xl font-bold inline-block"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              לאזור האישי
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "סה\"כ פרסומים", value: stats.total, color: "#e5893d", icon: Store },
                { label: "מכרזים פעילים", value: stats.active, color: "#3e6b8a", icon: Gavel },
                { label: "נמכרו", value: stats.sold, color: "#22c55e", icon: CheckCircle },
                { label: "טרם נמכרו", value: stats.pending, color: "#6b7280", icon: Hourglass },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="p-3 rounded-2xl border border-gray-100 text-center" style={{ background: color + "06" }}>
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color }} />
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <SellerInsights products={sales} />

            <SellerChecklist products={sales} />

            {sales.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">טרם פרסמת מכרזים</p>
                <Link to="/upload-product" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                  style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                  פרסם מכרז ראשון
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {sales.map(p => <SaleRow key={p.id} product={p} onReload={loadSales} />)}
              </div>
            )}

            <button onClick={loadSales} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto mt-6 transition-colors">
              <RefreshCw className="h-3 w-3" /> רענן נתונים
            </button>
          </>
        )}
      </div>
    </div>
  );
}