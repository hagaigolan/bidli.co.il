import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";

// "נצפו לאחרונה" — המכרזים שהמשתמש צפה בהם בפועל, ככרטיסים קטנים
export default function RecentlyViewedSection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 mb-4">
      <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
        <Eye className="h-4 w-4" style={{ color: "#3e6b8a" }} aria-hidden="true" />
        נצפו לאחרונה
      </h2>

      {items.length === 0 ? (
        <p className="text-xs text-gray-400">עדיין לא צפית במכרזים</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/auction/${p.id}`}
              className="block rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-all"
            >
              <div className="aspect-square bg-gray-50 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>
                )}
              </div>
              <div className="p-1.5" dir="rtl">
                <p className="text-[11px] font-bold text-gray-800 leading-tight line-clamp-2">{p.title}</p>
                <p className="text-[11px] font-black mt-0.5" style={{ color: "#e5893d" }}>
                  ₪{Number(p.price || 0).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}