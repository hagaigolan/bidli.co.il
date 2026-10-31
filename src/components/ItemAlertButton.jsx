import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getOwnerKey } from "@/lib/favorites";

// התראה על פריט מסוים — נשמרת כמועדף עם סימון "עדכן אותי" לפני סיום המכרז
export default function ItemAlertButton({ product, userEmail, onRequireLogin, onError }) {
  const email = (userEmail || "").trim().toLowerCase();
  const [alertOn, setAlertOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!product?.id || !email) { setAlertOn(false); return; }
    base44.entities.Favorite.filter({ product_id: product.id, owner_key: getOwnerKey() })
      .then(items => setAlertOn(items.some(f => (f.notify_email || "").trim().toLowerCase() === email)))
      .catch(() => {});
  }, [product?.id, email]);

  const toggle = async () => {
    if (!email) { onRequireLogin?.(); return; }
    setBusy(true);
    try {
      const existing = await base44.entities.Favorite.filter({ product_id: product.id, owner_key: getOwnerKey() });
      if (existing.length) {
        await base44.entities.Favorite.update(existing[0].id, { notify_email: alertOn ? "" : email });
      } else {
        await base44.entities.Favorite.create({
          product_id: product.id,
          product_title: product.title,
          product_image_url: product.image_url || "",
          product_ends_at: product.ends_at,
          owner_key: getOwnerKey(),
          notify_email: email,
        });
      }
      setAlertOn(v => !v);
    } catch {
      onError?.("שגיאה בעדכון ההתראה, נסה שנית");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={toggle} disabled={busy} aria-pressed={alertOn}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02] disabled:opacity-60"
      style={alertOn
        ? { background: "#3e6b8a15", borderColor: "#3e6b8a", color: "#3e6b8a" }
        : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
      {alertOn ? <Bell className="h-4 w-4" aria-hidden="true" /> : <BellOff className="h-4 w-4" aria-hidden="true" />}
      {alertOn ? "התראה על הפריט פעילה ✓" : "עדכן אותי על הפריט"}
    </button>
  );
}