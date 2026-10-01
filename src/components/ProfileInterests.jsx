import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Pencil, Check, Package } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { parseDbDate } from "@/lib/time";

const INTEREST_CATEGORIES = [
  { name: "אמנות", icon: "🎨" },
  { name: "יודאיקה", icon: "✡️" },
  { name: "אספנות", icon: "🏺" },
  { name: "נומיסמטיקה", icon: "🪙" },
  { name: "תכשיטים", icon: "💎" },
  { name: "עיצוב הבית", icon: "🏠" },
  { name: "אופנה", icon: "👗" },
  { name: "רכבים", icon: "🚗" },
  { name: "נדל\"ן", icon: "🏢" },
  { name: "ספרים", icon: "📚" },
  { name: "בולים", icon: "📮" },
];

function useCountdown(endsAt) {
  const calc = () => {
    const d = parseDbDate(endsAt);
    if (!d) return null;
    const diff = d.getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      h: Math.floor(diff / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function RecCard({ product }) {
  const left = useCountdown(product.ends_at);
  const urgent = left && left.h === 0 && left.m < 30;
  return (
    <Link to={`/auction/${product.id}`}
      className="block rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-all group">
      <div className="aspect-square bg-gray-50 relative">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🏺</div>}
        {product.category && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ background: "#e5893dcc" }}>{product.category}</span>
        )}
      </div>
      <div className="p-2.5" dir="rtl">
        <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">{product.title}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm font-black" style={{ color: "#e5893d" }}>
            ₪{(product.current_price || product.starting_price || 0).toLocaleString()}
          </span>
          {left && (
            <span className="text-[10px] font-mono font-bold" style={{ color: urgent ? "#e5893d" : "#2d4f68" }}>
              {String(left.h).padStart(2, "0")}:{String(left.m).padStart(2, "0")}:{String(left.s).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProfileInterests() {
  const { user: authUser } = useAuth();
  const saved = authUser?.interest_categories || [];
  const [selected, setSelected] = useState(saved);
  const [editing, setEditing] = useState(saved.length === 0);
  const [saving, setSaving] = useState(false);
  const [recs, setRecs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [notifyNew, setNotifyNew] = useState(true);
  const [keywords, setKeywords] = useState("");

  // טעינת הגדרות ההתראות הקיימות של המשתמש (קטגוריות + מוצרים במעקב)
  useEffect(() => {
    if (!authUser?.email) return;
    base44.entities.InterestAlert.filter({ owner_email: authUser.email })
      .then(rows => {
        if (rows.length) {
          setNotifyNew(rows[0].active !== false);
          setKeywords((rows[0].keywords || []).join(", "));
        }
      })
      .catch(() => {});
  }, [authUser?.email]);

  const key = saved.join("|");
  useEffect(() => {
    if (!saved.length) { setRecs([]); return; }
    setLoadingRecs(true);
    base44.entities.Product.filter({ status: "active" }, "-created_date", 200)
      .then(items => {
        const set = new Set(saved);
        const now = Date.now();
        const active = items.filter(p =>
          set.has(p.category) && p.ends_at && new Date(p.ends_at) > now);
        setRecs(active.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, [key]);

  if (!authUser) return null;

  const toggle = (name) => {
    setSelected(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ interest_categories: selected });
      // שמירת מעקב התראות: בכל פרסום מכרז תואם — מייל מעוצב + התראה בפעמון האתר
      const kws = keywords.split(/[,،]/).map(k => k.trim()).filter(Boolean).slice(0, 10);
      const existing = await base44.entities.InterestAlert.filter({ owner_email: authUser.email }).catch(() => []);
      if (notifyNew && (selected.length || kws.length)) {
        const payload = {
          owner_email: authUser.email,
          owner_name: authUser.full_name || "",
          categories: selected,
          keywords: kws,
          notify_email: true,
          active: true,
        };
        if (existing.length) await base44.entities.InterestAlert.update(existing[0].id, payload);
        else await base44.entities.InterestAlert.create(payload);
      } else if (existing.length) {
        await base44.entities.InterestAlert.update(existing[0].id, { active: false });
      }
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="rounded-2xl border p-4 mb-6"
      style={{ borderColor: "#e5893d33", background: "linear-gradient(135deg, #e5893d08, #ffffff)" }} dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "#e5893d" }} />
          <h2 className="text-sm font-black text-gray-900">
            {editing ? "אילו קטגוריות מעניינות אותך?" : "מומלץ בשבילך"}
          </h2>
        </div>
        {!editing && (
          <button onClick={() => { setSelected(saved); setEditing(true); }}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all hover:bg-white"
            style={{ borderColor: "#e5893d44", color: "#e5893d" }}>
            <Pencil className="h-3 w-3" /> עריכת קטגוריות
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <p className="text-xs text-gray-400 mb-3">בחר/י את התחומים שאוהבים אותך — נציע לך מכרזים רלוונטיים בכל כניסה לפרופיל</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {INTEREST_CATEGORIES.map(cat => {
              const on = selected.includes(cat.name);
              return (
                <button key={cat.name} type="button" onClick={() => toggle(cat.name)}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                  style={on
                    ? { background: "#e5893d", borderColor: "#e5893d", color: "white", boxShadow: "0 0 10px #e5893d44" }
                    : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
                  <span>{cat.icon}</span>
                  {on && <Check className="h-3 w-3" />}
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* התראות על מכירות חדשות — מייל מעוצב + התראה באתר */}
          <div className="rounded-xl border border-gray-100 bg-white p-3 mb-4">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-xs font-bold text-gray-800">התראות על מכירות חדשות 🔔</p>
                <p className="text-[11px] text-gray-400 mt-0.5">בכל פרסום מכרז בקטגוריות או במוצרים שבחרת — תקבל/י מייל מעוצב והתראה באתר</p>
              </div>
              <button type="button" onClick={() => setNotifyNew(v => !v)} role="switch" aria-checked={notifyNew}
                className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: notifyNew ? "#e5893d" : "#d1d5db" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
                  style={{ right: notifyNew ? "2px" : "18px" }} />
              </button>
            </label>
            {notifyNew && (
              <input value={keywords} onChange={e => setKeywords(e.target.value)}
                placeholder="שמות מוצרים מעניינים — מופרדים בפסיק (למשל: שעון בולובה, ציור גוטמן)"
                className="w-full mt-3 px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e5893d88]" dir="rtl" />
            )}
          </div>

          <button type="button" onClick={save} disabled={saving || !selected.length}
            className="w-full text-white text-sm py-2.5 rounded-xl font-bold disabled:opacity-60 transition-all"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            {saving ? "שומר..." : selected.length ? `שמור ${selected.length} קטגוריות` : "בחר לפחות קטגוריה אחת"}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {saved.map(name => {
              const cat = INTEREST_CATEGORIES.find(c => c.name === name);
              return (
                <span key={name} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "#e5893d12", color: "#e5893d" }}>
                  {cat ? `${cat.icon} ` : ""}{name}
                </span>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            🔔 {notifyNew ? "תקבל/י מייל והתראה באתר על כל מכרז חדש בקטגוריות שבחרת" : "התראות על מכירות חדשות כבויות"}
          </p>
          {notifyNew && keywords.split(/[,،]/).map(k => k.trim()).filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {keywords.split(/[,،]/).map(k => k.trim()).filter(Boolean).map(kw => (
                <span key={kw} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: "#3e6b8a12", color: "#3e6b8a" }}>🔎 {kw}</span>
              ))}
            </div>
          )}
          {loadingRecs ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
            </div>
          ) : recs.length === 0 ? (
            <div className="text-center py-6">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-200" />
              <p className="text-xs text-gray-400">אין כרגע מכרזים פעילים בקטגוריות שבחרת — נעדכן כשיעלו חדשים</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {recs.map(p => <RecCard key={p.id} product={p} />)}
            </div>
          )}
          <Link to="/auctions" className="block text-center text-xs font-bold mt-3 hover:underline" style={{ color: "#3e6b8a" }}>
            לכל המכרזים הפעילים →
          </Link>
        </div>
      )}
    </div>
  );
}