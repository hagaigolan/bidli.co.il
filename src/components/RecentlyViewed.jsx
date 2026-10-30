import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";

// רצועת "נצפו לאחרונה" — מוצגת רק למי שיש לו היסטוריית צפייה במכשיר
export default function RecentlyViewed({ excludeId, className = "" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const now = Date.now();
    setItems(
      getRecentlyViewed().filter(
        (p) => p.id !== excludeId && (!p.ends_at || new Date(p.ends_at).getTime() > now)
      ).slice(0, 6)
    );
  }, [excludeId]);

  if (!items.length) return null;

  return (
    <section className={`mt-8 ${className}`} dir="rtl" aria-label="מכרזים שנצפו לאחרונה">
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        <h2 className="text-base font-black text-gray-900">נצפו לאחרונה</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/auction/${p.id}`}
            className="flex-shrink-0 w-32 rounded-2xl border border-gray-100 overflow-hidden bg-white hover:border-[#e5893d66] transition-all"
          >
            <div className="aspect-square bg-gray-50">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">ללא תמונה</div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{p.title}</p>
              <p className="text-xs font-black mt-1" style={{ color: "#e5893d" }}>
                ₪{Number(p.price || 0).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}