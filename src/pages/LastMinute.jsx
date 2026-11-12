import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Zap, Plus, Search, Flame, TrendingDown, Clock, Percent, ShieldCheck } from "lucide-react";
import LastMinuteCard from "@/components/lastminute/LastMinuteCard";
import AddSlotModal from "@/components/lastminute/AddSlotModal";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import MobileSelect from "@/components/MobileSelect";
import useNow from "@/lib/useNow";
import { BUSINESS_TYPES, dealStatus, savingsPercent, RESCUE_FEE_RATE } from "@/lib/lastMinute";

const PLANS = [
  {
    name: "עסק יחיד",
    price: 190,
    highlight: false,
    features: ["חלון פנוי אחד פעיל בכל רגע", "מכרז הפוך אוטומטי עם טיימר", "הפצה בוואטסאפ ובטלגרם", "דוח מכירות בסיסי"],
  },
  {
    name: "צמיחה",
    price: 250,
    highlight: true,
    features: ["עד 3 חלונות במקביל", "דף מכרז ממותג בעסק שלך", "תזכורות אוטומטיות ללקוחות קודמים", "מאגר לקוחות וסגמנטים"],
  },
  {
    name: "רשת",
    price: 290,
    highlight: false,
    features: ["מספר סניפים וצוות", "ניהול יומן מלא לכל סניף", "גישה ל-API ולחיבורים", "ליווי אישי בהטמעה"],
  },
];

export default function LastMinute() {
  const { user, isAuthenticated } = useAuth();
  const now = useNow(1000);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("live");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    document.title = "ברגע האחרון — מכרזים הפוכים על חלונות שהתפנו | bidli";
    const load = () => {
      base44.entities.LastMinuteDeal.filter({}, { sort: "-created_date", limit: 100 })
        .then(res => setDeals(res?.items || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    };
    load();
    const unsub = base44.entities.LastMinuteDeal.subscribe(() => load());
    return unsub;
  }, []);

  const live = deals
    .filter(d => dealStatus(d, now) === "active")
    .sort((a, b) => new Date(a.auction_ends_at) - new Date(b.auction_ends_at));
  const mine = user?.id ? deals.filter(d => d.created_by_id === user.id) : [];

  const base = tab === "mine" ? mine : live;
  const filtered = base.filter(d => {
    if (typeFilter && d.business_type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const hay = [d.title, d.business_name, d.city, d.description].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const avgSave = live.length
    ? Math.round(live.reduce((sum, d) => sum + savingsPercent(d), 0) / live.length)
    : 0;
  const endingSoon = live.filter(d => new Date(d.auction_ends_at).getTime() - now < 3600000).length;

  const openAdd = () => {
    if (!isAuthenticated) { setShowLogin(true); return; }
    setShowAdd(true);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ── הירו ── */}
      <section className="text-white" style={{ background: "linear-gradient(135deg, #18181b 0%, #2d4f68 55%, #3e6b8a 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 animate-float"
              style={{ background: "linear-gradient(135deg, #e5893d, #6aa3cd)", boxShadow: "0 0 40px #e5893d66" }}>
              <Zap className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="text-center sm:text-right flex-1">
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#6aa3cd" }}>LAST MINUTE · תשואה דינמית</p>
              <h1 className="text-3xl sm:text-4xl font-black leading-tight">
                ברגע האחרון
                <span className="block" style={{ color: "#e5893d" }}>המחיר יורד. הזמן אוזל.</span>
              </h1>
              <p className="text-sm text-white/70 mt-2 max-w-xl leading-relaxed">
                כל ביטול של הרגע האחרון הוא הכנסה שנזרקה לפח. כאן עסקים מפרסמים את החלון שהתפנה, והמערכת מריצה
                מכרז הפוך: המחיר מתחיל במחירון ויורד כל דקה — עד שמישהו לוחץ "קנה עכשיו".
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto sm:mx-0">
            {[
              { v: live.length, l: "מכרזים חיים", icon: Flame, color: "#e5893d" },
              { v: `-${avgSave}%`, l: "הנחה ממוצעת", icon: TrendingDown, color: "#00a844" },
              { v: endingSoon, l: "נסגר בשעה הקרובה", icon: Clock, color: "#6aa3cd" },
            ].map(s => (
              <div key={s.l} className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center backdrop-blur-sm">
                <s.icon className="h-4 w-4 mx-auto mb-1" style={{ color: s.color }} aria-hidden="true" />
                <p className="text-xl font-black" style={{ color: s.color }}>{s.v}</p>
                <p className="text-[11px] text-white/60 font-semibold">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ── סרגל ── */}
        <div className="rounded-2xl bg-white border border-gray-100 p-3 mb-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש שירות, עסק או עיר..."
                aria-label="חיפוש מכרזים"
                className="w-full pr-9 pl-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:border-[#e5893d88]" />
            </div>
            <MobileSelect value={typeFilter} onChange={setTypeFilter} options={BUSINESS_TYPES}
              placeholder="כל סוגי השירות" title="סינון לפי סוג שירות"
              className="px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button type="button" onClick={() => setTab("live")}
                className={`px-4 py-2.5 text-sm font-bold transition-colors ${tab === "live" ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                style={tab === "live" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
                מכרזים חיים
              </button>
              <button type="button" onClick={() => setTab("mine")}
                className={`px-4 py-2.5 text-sm font-bold transition-colors ${tab === "mine" ? "text-white" : "text-gray-600 hover:bg-gray-50"}`}
                style={tab === "mine" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
                החלונות שלי
              </button>
            </div>
            <button type="button" onClick={openAdd}
              className="btn-neon text-white text-sm font-bold px-5 py-2.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap">
              <Plus className="h-4 w-4" aria-hidden="true" /> חלון התפנה
            </button>
          </div>
        </div>

        {/* ── גריד ── */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(deal => <LastMinuteCard key={deal.id} deal={deal} />)}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d15, #6aa3cd15)" }}>
              <Zap className="h-8 w-8" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <h3 className="text-lg font-black text-gray-800">
              {tab === "mine" ? "עדיין לא פתחת חלון" : "אין כרגע מכרזים פתוחים"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              {tab === "mine"
                ? "קיבלת ביטול להיום? פתח מכרז הפוך ותפוס הכנסה שהייתה הולכת לאיבוד."
                : "חלונות מתפספים כאן כל היום — חזור בעוד כמה דקות או פתח חלון משלך."}
            </p>
            <button type="button" onClick={openAdd}
              className="btn-neon text-white text-sm font-bold px-6 py-3 rounded-xl inline-flex items-center gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" /> חלון התפנה
            </button>
          </div>
        )}

        {/* ── איך זה עובד ── */}
        <section className="mt-10">
          <h2 className="text-xl font-black text-gray-900 mb-4">איך המכרז ההפוך עובד</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Plus, title: "1. הזנת החלון המת", text: "ביטול להיום? מזינים את השירות, מועד החלון ורצפת המחיר שגם בה שווה לעבוד." },
              { icon: TrendingDown, title: "2. המחיר יורד לבד", text: "מתחיל במחיר המחירון ויורד כל דקה עד הרצפה. הקונה רואה את המספר צונח בזמן אמת." },
              { icon: ShieldCheck, title: "3. נמכר — או לא שילמת", text: `עמלת הצלה של ${RESCUE_FEE_RATE}% נגבית רק מעסקה שנסגרה. חלון שלא נתפס עולה לעסק כלום.` },
            ].map(step => (
              <div key={step.title} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                  style={{ background: "#e5893d14", border: "1px solid #e5893d33" }}>
                  <step.icon className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
                </div>
                <h3 className="text-sm font-black text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── מחירים לעסקים ── */}
        <section className="mt-10 rounded-3xl p-5 sm:p-7" style={{ background: "linear-gradient(135deg, #18181b 0%, #2d4f68 100%)" }}>
          <div className="text-center mb-6">
            <p className="text-xs font-bold tracking-widest mb-1" style={{ color: "#6aa3cd" }}>לעסקים</p>
            <h2 className="text-2xl font-black text-white">מינוי חודשי + עמלת הצלה</h2>
            <p className="text-sm text-white/60 mt-1 max-w-xl mx-auto">
              המערכת מחזירה כסף שהיה נזרק לפח — ולכן קל לעבור מניסיון חינם ללקוח משלם.
              המינוי מכסה את המערכת וההפצה, ועמלת ההצלה נגבית רק כשחלון באמת נמכר.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map(plan => (
              <div key={plan.name} className="rounded-2xl p-4 flex flex-col"
                style={plan.highlight
                  ? { background: "#e5893d", color: "#fff", boxShadow: "0 0 30px #e5893d55" }
                  : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-black text-white">{plan.name}</h3>
                  {plan.highlight && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/25 text-white">הנפוץ</span>}
                </div>
                <p className="text-2xl font-black text-white">₪{plan.price}<span className="text-xs font-bold opacity-70"> /חודש</span></p>
                <ul className="mt-3 space-y-1.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="text-[12px] leading-relaxed text-white/80 flex items-start gap-1.5">
                      <span aria-hidden="true" style={{ color: plan.highlight ? "#fff" : "#6aa3cd" }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={openAdd}
                  className="mt-4 w-full text-xs font-black py-2.5 rounded-xl transition-all"
                  style={plan.highlight
                    ? { background: "#fff", color: "#e5893d" }
                    : { background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                  התחל עם חלון אחד
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Percent className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#e5893d" }} aria-hidden="true" />
            <p className="text-xs text-white/70 leading-relaxed">
              <span className="font-black text-white">עמלת הצלה {RESCUE_FEE_RATE}%</span> — נגבית אוטומטית מכל עסקה
              שנסגרה דרך המכרז הפומבי, כך שהעסק מקבל לחשבון רק את היתרה. חלון שלא נמכר: אפס עמלה.
            </p>
          </div>
        </section>
      </div>

      {showAdd && (
        <AddSlotModal user={user} onClose={() => setShowAdd(false)} onSaved={() => setShowAdd(false)} />
      )}
      {showLogin && <LoginRequiredModal onClose={() => setShowLogin(false)} action="publish" />}
    </div>
  );
}