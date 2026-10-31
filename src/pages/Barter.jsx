import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeftRight, Search, Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import BarterCard from "@/components/barter/BarterCard";
import BarterUploadModal from "@/components/barter/BarterUploadModal";
import { CATEGORIES } from "@/lib/productMeta";
import MobileSelect from "@/components/MobileSelect";

const CONDITIONS = ["חדש", "משומש", "תקין", "מקולקל"];
const EMPTY_STYLE = {};

export default function Barter() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");           // all | my
  const [conditionFilter, setConditionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const load = () => {
    base44.entities.BarterItem.filter({ status: "active" }, "-created_date", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const unsub = base44.entities.BarterItem.subscribe(() => load());
    return unsub;
  }, []);

  const myEmail = (authUser?.email || "").trim().toLowerCase();
  const filtered = items.filter(it => {
    if (tab === "my" && (it.owner_email || "").trim().toLowerCase() !== myEmail) return false;
    if (conditionFilter && it.condition !== conditionFilter) return false;
    if (categoryFilter && it.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = [it.title, it.description, it.wanted_description, (it.wanted_categories || []).join(" ")]
        .join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const urgentFirst = [...filtered].sort((a, b) => (b.urgency === "דחוף") - (a.urgency === "דחוף"));
  const totalValue = items.reduce((s, it) => s + (it.estimated_value || 0), 0);

  const openUpload = () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setShowUpload(true);
  };

  const markCompleted = async (it) => {
    await base44.entities.BarterItem.update(it.id, { status: "completed" });
    load();
  };
  const deleteItem = async (it) => {
    await base44.entities.BarterItem.delete(it.id);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ── Hero — אולם החליפין ── */}
      <section className="text-white" style={{ background: "linear-gradient(135deg, #18181b 0%, #2d4f68 60%, #3e6b8a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 animate-float"
              style={{ background: "linear-gradient(135deg, #e5893d, #6aa3cd)", boxShadow: "0 0 40px #e5893d66" }}>
              <ArrowLeftRight className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="text-center sm:text-right flex-1">
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#6aa3cd" }}>BARTER · חליפין ב-bidli</p>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                נותן משהו? מקבל משהו.
                <span className="block" style={{ color: "#e5893d" }}>בלי כסף באמצע.</span>
              </h1>
              <p className="text-sm text-white/70 mt-2 max-w-xl leading-relaxed">
                בורסת הבארטר של bidli — העלה את הפריט שלך, רשום מה אתה מחפש בתמורה, ותנו למערכת למצוא לך את ההחלפה המושלמת. שכחה עתיקה שחוזרת לאופנה.
              </p>
            </div>
          </div>
          {/* Live stats */}
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto sm:mx-0">
            {[
              { v: items.length, l: "פריטים להחלפה" },
              { v: `₪${(totalValue / 1000).toFixed(0)}K`, l: "שווי בבורסה" },
              { v: "100%", l: "עסקה ישירה" },
            ].map(s => (
              <div key={s.l} className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center backdrop-blur-sm">
                <p className="text-xl font-black" style={{ color: "#e5893d" }}>{s.v}</p>
                <p className="text-[11px] text-white/60 font-semibold">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── Toolbar ── */}
        <div className="rounded-2xl bg-white border border-gray-100 p-3 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש פריט או החלפה רצויה..."
                className="w-full pr-9 pl-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:border-[#e5893d88]" />
            </div>
            <MobileSelect value={categoryFilter} onChange={setCategoryFilter} options={CATEGORIES}
              placeholder="כל הקטגוריות" title="סינון לפי קטגוריה"
              className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setTab("all")}
                className={`px-4 py-2.5 text-sm font-bold transition-colors ${tab === "all" ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                style={tab === "all" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : EMPTY_STYLE}>
                כל הפריטים
              </button>
              <button type="button" onClick={() => setTab("my")}
                className={`px-4 py-2.5 text-sm font-bold transition-colors ${tab === "my" ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                style={tab === "my" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : EMPTY_STYLE}>
                שלי
              </button>
            </div>
            <button type="button" onClick={openUpload}
              className="btn-neon text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap">
              <Plus className="h-4 w-4" aria-hidden="true" /> פרסם בארטר
            </button>
          </div>
          {/* Condition chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-gray-50">
            <button type="button" onClick={() => setConditionFilter("")}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${!conditionFilter ? "text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              style={!conditionFilter ? { background: "#3e6b8a", borderColor: "#3e6b8a" } : { borderColor: "#e5e7eb" }}>
              כל המצבים
            </button>
            {CONDITIONS.map(c => (
              <button key={c} type="button" onClick={() => setConditionFilter(conditionFilter === c ? "" : c)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${conditionFilter === c ? "text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                style={conditionFilter === c ? { background: "#3e6b8a", borderColor: "#3e6b8a" } : { borderColor: "#e5e7eb" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2"
            style={{ background: "#00c85310", border: "1px solid #00c85344", color: "#00a35c" }}>
            <Sparkles className="h-4 w-4" aria-hidden="true" /> הפריט פורסם לבארטר! עכשיו כל הקהילה יכולה לראות מה אתה מציע ומה אתה מחפש.
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : urgentFirst.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgentFirst.map(it => (
              <BarterCard key={it.id} item={it}
                isOwner={(it.owner_email || "").trim().toLowerCase() === myEmail}
                onCompleted={() => markCompleted(it)}
                onDeleted={() => deleteItem(it)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d15, #6aa3cd15)" }}>
              <ArrowLeftRight className="h-8 w-8" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-black text-gray-800">{tab === "my" ? "עדיין לא פרסמת פריטים לבארטר" : "הבורסה עוד ריקה"}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">היה הראשון להציע פריט להחלפה — פרסום בשניות.</p>
            <button type="button" onClick={openUpload}
              className="btn-neon text-white text-sm font-bold px-6 py-3 rounded-xl inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" /> פרסם בארטר
            </button>
          </div>
        )}
      </div>

      {showUpload && (
        <BarterUploadModal me={authUser}
          onClose={() => setShowUpload(false)}
          onSaved={() => { setShowUpload(false); setSuccessMsg(true); setTimeout(() => setSuccessMsg(false), 5000); load(); }}
        />
      )}
      {showLogin && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}