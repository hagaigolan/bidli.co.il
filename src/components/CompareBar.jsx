import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeftRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { COMPARE_EVENT, clearCompare, getCompareIds, removeFromCompare } from "@/lib/compare";

// סרגל השוואה צף בתחתית המסך — מציג את הפריטים שנבחרו ומקשר לעמוד ההשוואה
export default function CompareBar() {
  const [ids, setIds] = useState(getCompareIds);
  const [items, setItems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const sync = () => setIds(getCompareIds());
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!ids.length) { setItems([]); return; }
    let alive = true;
    Promise.all(ids.map((id) => base44.entities.Product.get(id).catch(() => null)))
      .then((list) => { if (alive) setItems(list.filter(Boolean)); });
    return () => { alive = false; };
  }, [ids.join(",")]);

  const hiddenPages = ["/compare", "/upload-product"];
  if (!ids.length || hiddenPages.includes(location.pathname)) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-3 py-2" dir="rtl">
      <div className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
        <ArrowLeftRight className="h-5 w-5 flex-shrink-0 hidden sm:block" style={{ color: "#2d4f68" }} aria-hidden="true" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          {items.map((p) => (
            <div key={p.id} className="relative flex-shrink-0">
              <img
                src={p.image_url || ""}
                alt={p.title}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50"
              />
              <button
                type="button"
                onClick={() => removeFromCompare(p.id)}
                aria-label={`הסר את ${p.title} מההשוואה`}
                className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                <X className="h-3 w-3 text-gray-500" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={clearCompare} className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">
          נקה
        </button>
        <Link
          to="/compare"
          className="text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}
        >
          השווה ({ids.length})
        </Link>
      </div>
    </div>
  );
}