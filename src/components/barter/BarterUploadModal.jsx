import { useState } from "react";
import { X, ArrowLeftRight, Coins, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CATEGORIES } from "@/lib/productMeta";
import MobileSelect from "@/components/MobileSelect";

const CONDITIONS = ["חדש", "משומש", "תקין", "מקולקל"];

export default function BarterUploadModal({ me, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "", condition: "תקין", estimated_value: "",
    location: "", owner_phone: me?.phone || "", urgency: "רגיל",
    wanted_description: "", wanted_categories: [], wanted_condition: "",
    allow_cash_topup: false, open_to_other: true,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleWantedCat = (c) => setForm(f => ({
    ...f,
    wanted_categories: f.wanted_categories.includes(c)
      ? f.wanted_categories.filter(x => x !== c)
      : [...f.wanted_categories, c],
  }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(p => [...p, ...files].slice(0, 4));
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))].slice(0, 4));
    e.target.value = "";
  };

  const removeImage = (i) => {
    setImageFiles(p => p.filter((_, idx) => idx !== i));
    setPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.wanted_description) {
      setError("יש למלא כותרת ואת מה שמבקשים בתמורה");
      return;
    }
    if (!form.owner_phone) {
      setError("יש להוסיף טלפון ליצירת קשר");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const urls = [];
      for (const f of imageFiles) {
        const res = await base44.integrations.Core.UploadPublicFile({ file: f });
        urls.push(res.file_url);
      }
      await base44.entities.BarterItem.create({
        title: form.title,
        description: form.description || "",
        category: form.category || "",
        condition: form.condition,
        estimated_value: parseFloat(form.estimated_value) || 0,
        image_url: urls[0] || "",
        image_urls: urls,
        wanted_description: form.wanted_description,
        wanted_categories: form.wanted_categories,
        wanted_condition: form.wanted_condition || "",
        allow_cash_topup: form.allow_cash_topup,
        open_to_other: form.open_to_other,
        urgency: form.urgency,
        owner_name: me?.full_name || "אנונימי",
        owner_email: me?.email || "",
        owner_user_id: me?.id || "",
        owner_phone: form.owner_phone,
        location: form.location || "",
        status: "active",
      });
      onSaved();
    } catch {
      setError("שגיאה בפרסום, נסה שנית");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-3 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)" }} role="dialog" aria-modal="true" aria-label="פרסום פריט לבארטר">
      <form onSubmit={submit} className="bg-white rounded-2xl w-full max-w-lg p-5 my-4" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              <ArrowLeftRight className="h-5 w-5" aria-hidden="true" />
            </span>
            פרסום פריט לבארטר
          </h2>
          <button type="button" onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">מה נותנים? — כותרת הפריט *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="לדוגמה: שעון יד וינטג' מכני"
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:border-[#e5893d88]" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">קטגוריה</label>
              <MobileSelect value={form.category} onChange={v => set("category", v)} options={CATEGORIES}
                placeholder="בחר קטגוריה" title="קטגוריה"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">מצב הפריט *</label>
              <MobileSelect value={form.condition} onChange={v => set("condition", v)} options={CONDITIONS}
                title="מצב הפריט"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Coins className="h-3 w-3" aria-hidden="true" /> שווי מוערך (₪)
              </label>
              <input type="number" min="0" value={form.estimated_value} onChange={e => set("estimated_value", e.target.value)} placeholder="500"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Flame className="h-3 w-3" aria-hidden="true" /> דחיפות
              </label>
              <MobileSelect value={form.urgency} onChange={v => set("urgency", v)}
                options={[{ value: "רגיל", label: "רגיל" }, { value: "דחוף", label: "דחוף 🔥" }]}
                title="דחיפות"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">מיקום</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="תל אביב"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">טלפון ליצירת קשר *</label>
              <input type="tel" value={form.owner_phone} onChange={e => set("owner_phone", e.target.value)} placeholder="050-0000000"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">תיאור הפריט</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} maxLength={1000}
              placeholder="פרטים נוספים על הפריט — גיל, מקור, ליקויים..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right resize-none" />
          </div>

          {/* ── ההחלפה הרצויה ── */}
          <div className="rounded-xl p-3 space-y-2" style={{ background: "linear-gradient(135deg, #e5893d0a, #6aa3cd0a)", border: "1px dashed #e5893d44" }}>
            <p className="text-xs font-black flex items-center gap-1.5" style={{ color: "#e5893d" }}>
              <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" /> מה מבקשים בתמורה? *
            </p>
            <textarea value={form.wanted_description} onChange={e => set("wanted_description", e.target.value)} rows={2} maxLength={1000} required
              placeholder="לדוגמה: מעוניין בגיטרה אקוסטית במצב טוב, או כל הצעה שווה"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl text-right resize-none" />
            <div>
              <p className="text-[11px] font-bold text-gray-600 mb-1">קטגוריות רצויות (לחיצה לבחירה)</p>
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.slice(0, 12).map(c => (
                  <button key={c} type="button" onClick={() => toggleWantedCat(c)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all"
                    style={form.wanted_categories.includes(c)
                      ? { background: "#e5893d18", borderColor: "#e5893d", color: "#e5893d" }
                      : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-600 mb-1">מצב רצוי של המוצר בתמורה</p>
              <div className="flex gap-1">
                {CONDITIONS.map(c => (
                  <button key={c} type="button" onClick={() => set("wanted_condition", form.wanted_condition === c ? "" : c)}
                    className="flex-1 text-[11px] font-bold py-1.5 rounded-lg border transition-all"
                    style={form.wanted_condition === c
                      ? { background: "#3e6b8a15", borderColor: "#3e6b8a", color: "#3e6b8a" }
                      : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.allow_cash_topup} onChange={e => set("allow_cash_topup", e.target.checked)} className="accent-[#e5893d]" />
                <span className="font-semibold text-gray-700">אשמח לתוספת כספית מהצד השני</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.open_to_other} onChange={e => set("open_to_other", e.target.checked)} className="accent-[#e5893d]" />
                <span className="font-semibold text-gray-700">פתוח להצעות החלפה אחרות</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">תמונות (עד 4)</label>
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                  <img src={p} alt={`תמונה ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} aria-label="הסרת תמונה"
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {imageFiles.length < 4 && (
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#e5893d] transition-colors">
                  <span className="text-xl text-gray-400">+</span>
                  <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {error && <p className="text-xs font-bold text-red-500">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
            {saving ? "מפרסם..." : "פרסום לבארטר"}
          </button>
        </div>
      </form>
    </div>
  );
}