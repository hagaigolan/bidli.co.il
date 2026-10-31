import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { Sparkles, ArrowLeft, Bookmark, Store, Clock } from "lucide-react";
import SavedSearchModal from "@/components/SavedSearchModal";

// אוספים נושאיים — קיצורי דרך לשילובי סינון מבוקשים
const COLLECTIONS = [
  { title: "שעונים עד ₪1,000", desc: "שעוני יד קלאסיים ומודרניים במחיר התחלתי נוח", filters: { category: "שעונים", max: 1000 }, icon: "⌚" },
  { title: "תכשיטים עד ₪2,000", desc: "זהב, כסף ואבני חן — כניסה נוחה לעולם התכשיטים", filters: { category: "תכשיטים", max: 2000 }, icon: "💎" },
  { title: "יודאיקה לבית", desc: "פמוטים, חנוכיות וחפצי קודש לבית היהודי", filters: { category: "יודאיקה" }, icon: "✡️" },
  { title: "אמנות ישראלית", desc: "ציורים ופסלים של אמנים ישראלים", filters: { category: "אמנות" }, icon: "🎨" },
  { title: "אספנות נדירה", desc: "פריטים היסטוריים, מזכרות וצעצועים עתיקים", filters: { category: "אספנות" }, icon: "🏺" },
  { title: "יין ואלכוהול", desc: "בקבוקים נדירים ואספי וויסקי", filters: { category: "יין ואלכוהול" }, icon: "🍷" },
  { title: "חדש מהחנות", desc: "פריטים חדשים מחנויות ומותגים — לא יד שנייה", filters: { store: true }, icon: "🏬" },
  { title: "מסתיים ב-24 השעות הקרובות", desc: "ההזדמנות האחרונה להגיש הצעה", filters: { endingSoon: true }, icon: "⏳" },
];

const matches = (product, filters) => {
  if (filters.category && product.category !== filters.category) return false;
  if (filters.store && !product.is_stock) return false;
  if (filters.max && (Number(product.current_price || product.starting_price) || 0) > filters.max) return false;
  if (filters.endingSoon && new Date(product.ends_at) - Date.now() > 86400000) return false;
  return true;
};

const buildLink = (filters) => {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.max) params.set("max", String(filters.max));
  if (filters.store) params.set("store", "1");
  const qs = params.toString();
  return `/auctions${qs ? `?${qs}` : ""}`;
};

export default function Collections() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    setPageMeta({
      title: "אוספים נושאיים — מכרזים נבחרים לפי עניין | bidli",
      description: "אוספים מוכנים של מכרזים: שעונים עד 1,000 ₪, תכשיטים, יודאיקה, אמנות ישראלית, פריטים חדשים מחנויות ועוד.",
    });
    base44.entities.Product.list("-created_date", 300)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter(p => p.status === "active" && new Date(p.ends_at) > new Date());

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-5xl mx-auto">
          <Link to="/auctions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden="true" /> לכל המכרזים
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#e5893d15", border: "1px solid #e5893d33" }}>
              <Sparkles className="h-6 w-6" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">אוספים נושאיים</h1>
              <p className="text-sm text-gray-400">שילובי סינון מוכנים — שמרו לכם התראה על האוסף שמעניין אתכם</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLLECTIONS.map(col => {
            const count = loading ? null : active.filter(p => matches(p, col.filters)).length;
            const Icon = col.filters.store ? Store : col.filters.endingSoon ? Clock : null;
            return (
              <div key={col.title} className="rounded-2xl border border-gray-100 bg-white p-4 flex flex-col gap-3"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "#e5893d0f", border: "1px solid #e5893d26" }}>
                    {Icon ? <Icon className="h-5 w-5" style={{ color: "#e5893d" }} aria-hidden="true" /> : col.icon}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#3e6b8a0f", color: "#3e6b8a" }}>
                    {count === null ? "..." : `${count} מכרזים`}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-black text-gray-900">{col.title}</h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{col.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={buildLink(col.filters)}
                    className="flex-1 text-center text-white text-xs py-2 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                    לאוסף
                  </Link>
                  <button type="button" onClick={() => setSaving(col)} aria-label={`שמור התראה על ${col.title}`}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border"
                    style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                    התראה
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {saving && (
        <SavedSearchModal
          category={saving.filters.category || ""}
          maxPrice={saving.filters.max || ""}
          keyword=""
          defaultLabel={saving.title}
          onClose={() => setSaving(null)}
          onSaved={() => setSaving(null)}
        />
      )}
    </div>
  );
}