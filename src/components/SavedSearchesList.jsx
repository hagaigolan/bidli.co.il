import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Bookmark, Trash2 } from "lucide-react";

const FREQ_LABELS = { instant: "מיידי", daily: "יומי", weekly: "שבועי" };

// קישור לחיפוש עם כל המסננים שנשמרו
const searchLink = (s) => {
  const params = new URLSearchParams();
  if (s.category) params.set("category", s.category);
  if (s.keyword) params.set("q", s.keyword);
  if (s.min_price) params.set("min", String(s.min_price));
  if (s.max_price) params.set("max", String(s.max_price));
  if (s.condition) params.set("condition", s.condition);
  if (s.city) params.set("city", s.city);
  const qs = params.toString();
  return `/auctions${qs ? `?${qs}` : ""}`;
};

// רשימת החיפושים השמורים של המשתמש — בפרופיל האישי
export default function SavedSearchesList() {
  const { user } = useAuth();
  const [searches, setSearches] = useState(null);

  const load = () => {
    if (!user?.email) return;
    base44.entities.SavedSearch.filter({ owner_email: user.email }, "-created_date", 30)
      .then(setSearches)
      .catch(() => setSearches([]));
  };
  useEffect(load, [user?.email]);

  if (!user || !searches || searches.length === 0) return null;

  // עדכון אופטימי — הכפתור מתחלף מיד, ובכישלון חוזר למצב הקודם
  const toggleActive = async (s) => {
    const next = !s.active;
    setSearches(list => (list || []).map(x => (x.id === s.id ? { ...x, active: next } : x)));
    try {
      await base44.entities.SavedSearch.update(s.id, { active: next });
    } catch {
      setSearches(list => (list || []).map(x => (x.id === s.id ? { ...x, active: s.active } : x)));
    }
  };
  const remove = async (s) => {
    await base44.entities.SavedSearch.delete(s.id).catch(() => {});
    load();
  };

  return (
    <div className="mt-8 p-5 rounded-2xl bg-white border border-gray-100" dir="rtl"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
          <Bookmark className="h-4 w-4" style={{ color: "#e5893d" }} />
        </div>
        <h2 className="font-black text-gray-900">החיפושים השמורים שלי</h2>
      </div>
      <div className="space-y-2">
        {searches.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
            <div className="flex-1 min-w-0">
              <Link to={searchLink(s)}
                className="text-sm font-bold text-gray-800 hover:text-[#e5893d] transition-colors truncate block">
                {s.label}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">
                {[s.category || "כל הקטגוריות",
                  s.keyword ? `«${s.keyword}»` : null,
                  s.min_price ? `מ-₪${s.min_price.toLocaleString()}` : null,
                  s.max_price ? `עד ₪${s.max_price.toLocaleString()}` : null,
                  s.condition || null,
                  s.city || null].filter(Boolean).join(" · ")} · {FREQ_LABELS[s.frequency] || "יומי"}
              </p>
            </div>
            <button onClick={() => toggleActive(s)}
              className="text-xs px-3 py-1.5 rounded-full font-bold border transition-all"
              style={s.active
                ? { borderColor: "#00a35c44", color: "#00a35c", background: "#00a35c0a" }
                : { borderColor: "#e5e7eb", color: "#9ca3af", background: "white" }}>
              {s.active ? "פעיל" : "מושבת"}
            </button>
            <button onClick={() => remove(s)} aria-label="מחק חיפוש"
              className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}