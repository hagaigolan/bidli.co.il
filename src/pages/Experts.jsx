import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/lib/AuthContext";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { ArrowRight, GraduationCap, MapPin, Phone, Mail, CheckCircle } from "lucide-react";

const PROFESSIONS = ["שמאי", "משקם עתיקות", "מומחה תכשיטים", "מומחה אמנות", "מומחה יודאיקה", "מומחה נומיסמטיקה", "מומחה שעונים", "אחר"];

const INITIAL_FORM = { name: "", profession: "", email: "", phone: "", city: "", bio: "" };

export default function Experts() {
  const { isAuthenticated } = useAuth();
  const [experts, setExperts] = useState(null);
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setPageMeta({
      title: "דירקטוריון מומחים — שמאים, משקמי עתיקות ומומחי אספנות | bidli",
      description: "מצא מומחה להערכת שווי, שימור ושחזור: שמאים, משקמי עתיקות, מומחי תכשיטים, אמנות, יודאיקה ושעונים. הרשמה חינם למומחים.",
    });
  }, []);

  const load = () => {
    base44.entities.Expert.filter({ status: "approved" })
      .then(setExperts)
      .catch(() => setExperts([]));
  };
  useEffect(load, []);

  const shown = (experts || []).filter(e => !filter || e.profession === filter);
  const professionsInUse = [...new Set((experts || []).map(e => e.profession))];

  const openForm = () => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.profession || !form.email.trim() || !form.phone.trim()) {
      setError("יש למלא שם, תחום התמחות, אימייל וטלפון");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await base44.entities.Expert.create({ ...form, status: "pending" });
      setSaved(true);
      setShowForm(false);
      setForm(INITIAL_FORM);
    } catch {
      setError("שגיאה ברישום, נסה שנית");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #3e6b8a08, #6aa3cd05)" }}>
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3e6b8a18, #6aa3cd11)", border: "1px solid #3e6b8a44" }}>
              <GraduationCap className="h-5 w-5" style={{ color: "#3e6b8a" }} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">דירקטוריון מומחים</h1>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            מצא מומחה להערכת שווי, שימור ושחזור פריטי אספנות — לפני רכישה חשובה או פרסום מכרז יוקרתי.
          </p>
          <button onClick={openForm}
            className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
            אני מומחה — הרשמה חינם
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {saved && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "#00a35c0f", color: "#00a35c", border: "1px solid #00a35c33" }} dir="rtl">
            <CheckCircle className="h-4 w-4" />
            הרישום נשלח — פרטיך יוצגו בדירקטוריון לאחר אישור הנהלת האתר
          </div>
        )}

        {/* Profession filter */}
        {professionsInUse.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setFilter("")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === "" ? "text-white" : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
              style={filter === "" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
              הכל
            </button>
            {professionsInUse.map(p => (
              <button key={p} onClick={() => setFilter(p)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === p ? "text-white" : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
                style={filter === p ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Experts grid */}
        {experts === null ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">🎓</p>
            <p className="font-bold text-gray-700 mb-1">הדירקטוריון בהקמה</p>
            <p className="text-sm text-gray-400">המומחים הראשונים יופיעו כאן בקרוב</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {shown.map(e => (
              <div key={e.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col hover:border-transparent transition-all duration-300 card-neon-cyan"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #3e6b8a22, #e5893d11)", border: "1px solid #3e6b8a33" }}>
                    <GraduationCap className="h-5 w-5" style={{ color: "#3e6b8a" }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{e.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "#3e6b8a0f", color: "#3e6b8a" }}>{e.profession}</span>
                  </div>
                </div>
                {e.bio && <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-3 flex-1">{e.bio}</p>}
                <div className="space-y-1 text-xs text-gray-500 border-t border-gray-50 pt-3">
                  {e.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" style={{ color: "#3e6b8a" }} />{e.city}
                    </div>
                  )}
                  <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 hover:text-[#e5893d] transition-colors" dir="ltr">
                    <Phone className="h-3 w-3" style={{ color: "#3e6b8a" }} />{e.phone}
                  </a>
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 hover:text-[#e5893d] transition-colors truncate" dir="ltr">
                    <Mail className="h-3 w-3 flex-shrink-0" style={{ color: "#3e6b8a" }} />{e.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Registration form */}
        {showForm && (
          <form onSubmit={submit} className="mt-10 p-5 rounded-2xl border space-y-4" style={{ borderColor: "#e5893d33", background: "#e5893d04" }} dir="rtl">
            <h2 className="font-black text-gray-900">רישום מומחה לדירקטוריון</h2>
            <p className="text-xs text-gray-400 -mt-2">הרישום חינם — פרטיך יוצגו לציבור לאחר אישור הנהלת האתר</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">שם מלא *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] text-right" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">תחום התמחות *</label>
                <select value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] text-right">
                  <option value="">בחר תחום</option>
                  {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">אימייל *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  dir="ltr"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">טלפון *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="050-1234567" dir="ltr"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88]" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">עיר / אזור</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] text-right" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">התמחות, ניסיון והסמכות</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="לדוגמה: 20 שנות ניסיון בהערכת יודאיקה, מוסמך מטעם..."
                className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] text-right resize-none" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="text-white text-sm px-6 py-2.5 rounded-xl font-bold disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                {saving ? "שולח..." : "שלח לאישור"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-gray-600 text-sm px-6 py-2.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50">
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>

      {showLoginModal && <LoginRequiredModal action="default" onClose={() => setShowLoginModal(false)} />}
    </div>
  );
}