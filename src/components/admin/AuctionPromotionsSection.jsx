import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Megaphone, CheckCircle, XCircle } from "lucide-react";

// אישור בקשות קידום מכרזים — בעל האתר מאשר או דוחה. ללא תשלום וללא חיוב.
export default function AuctionPromotionsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.entities.Product.filter({ promotionStatus: "requested" }, "-created_date", 100)
    .then(setItems)
    .catch(() => {})
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const approve = async (product) => {
    await base44.entities.Product.update(product.id, { promotionStatus: "approved", featured: true });
    load();
  };

  const reject = async (product) => {
    await base44.entities.Product.update(product.id, { promotionStatus: "none" });
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" dir="rtl">
      <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
        <Megaphone className="h-4 w-4" style={{ color: "#3e6b8a" }} aria-hidden="true" />
        בקשות קידום מכרזים ({items.length})
      </h2>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-gray-100 border-t-[#3e6b8a] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">אין בקשות קידום ממתינות</p>
      ) : (
        <div className="space-y-2">
          {items.map(p => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
              {p.image_url && (
                <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/auction/${p.id}`} className="text-sm font-bold text-gray-900 hover:underline line-clamp-1">
                  {p.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {p.seller_name || p.seller_email || "מוכר"} · ₪{(p.current_price || p.starting_price || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={() => approve(p)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{ borderColor: "#00c85366", color: "#00a846", background: "#00c8530a" }}>
                  <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> אשר
                </button>
                <button type="button" onClick={() => reject(p)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{ borderColor: "#ef444466", color: "#dc2626", background: "#ef44440a" }}>
                  <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> דחה
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}