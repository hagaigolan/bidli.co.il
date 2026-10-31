import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Megaphone, CheckCircle, XCircle } from "lucide-react";

// בקשות קידום מכרזים — אישור מפעיל תווית "מקודם" למספר הימים שנבחר
export default function PromotionsSection() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    base44.entities.Promotion.list("-created_date", 50)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const approve = async (promo) => {
    setBusyId(promo.id);
    try {
      const days = Number(promo.days) || 7;
      await base44.entities.Product.update(promo.product_id, {
        featured: true,
        featured_until: new Date(Date.now() + days * 86400000).toISOString(),
      });
      await base44.entities.Promotion.update(promo.id, { status: "approved", reviewed_at: new Date().toISOString() });
      load();
    } catch { /* יישאר בסטטוס הקודם */ }
    finally { setBusyId(""); }
  };

  const reject = async (promo) => {
    setBusyId(promo.id);
    try {
      await base44.entities.Promotion.update(promo.id, { status: "rejected", reviewed_at: new Date().toISOString() });
      load();
    } catch { /* יישאר בסטטוס הקודם */ }
    finally { setBusyId(""); }
  };

  const pending = items.filter(p => p.status === "pending");
  if (loading || !items.length) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        <h2 className="text-sm font-black text-gray-900">בקשות קידום מכרזים</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#e5893d15", color: "#e5893d" }}>
          {pending.length} ממתינות
        </span>
      </div>

      {pending.length === 0 ? (
        <p className="text-xs text-gray-400">אין בקשות ממתינות</p>
      ) : (
        <div className="space-y-2">
          {pending.map(p => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div className="flex-1 min-w-[160px]">
                <p className="text-sm font-bold text-gray-800 truncate">{p.product_title}</p>
                <p className="text-xs text-gray-400">
                  {p.seller_name || p.seller_email} · {p.package_name} · ₪{p.price} · {p.days} ימים
                </p>
              </div>
              <button onClick={() => approve(p)} disabled={busyId === p.id}
                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border disabled:opacity-50"
                style={{ borderColor: "#22c55e66", color: "#16a34a", background: "#22c55e08" }}>
                <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> אישור קידום
              </button>
              <button onClick={() => reject(p)} disabled={busyId === p.id}
                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border disabled:opacity-50"
                style={{ borderColor: "#ef444455", color: "#ef4444", background: "#ef444408" }}>
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" /> דחייה
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}