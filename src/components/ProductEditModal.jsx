import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, X, Save } from "lucide-react";
import { CATEGORIES, CONDITIONS } from "@/lib/productMeta";

// עריכת פרטי מכרז — המחיר ניתן לעריכה רק אם לא הוגשו הצעות
export default function ProductEditModal({ product, onClose, onSaved }) {
  const noBids = !product.bid_count;
  const [form, setForm] = useState({
    title: product.title || "",
    description: product.description || "",
    category: product.category || "",
    condition: product.condition || CONDITIONS[1],
    location: product.location || "",
    starting_price: String(product.starting_price ?? ""),
    is_stock: !!product.is_stock,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right";

  const save = async () => {
    if (!form.title.trim()) { setError("יש למלא כותרת"); return; }
    if (noBids && (!form.starting_price || parseFloat(form.starting_price) < 1)) {
      setError("יש להזין מחיר התחלתי תקין"); return;
    }
    setBusy(true); setError("");
    try {
      const data = {
        title: form.title.trim(),
        description: form.description,
        category: form.category,
        condition: form.condition,
        location: form.location,
        is_stock: form.is_stock,
      };
      if (noBids) {
        const price = parseFloat(form.starting_price);
        data.starting_price = price;
        data.current_price = price;
      }
      await base44.entities.Product.update(product.id, data);
      onSaved();
    } catch { setError("שמירת השינויים נכשלה, נסה שנית"); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" dir="rtl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-base font-black text-gray-900">עריכת פרטי המכרז</h2>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div>
            <label htmlFor="edit-title" className="block text-xs text-gray-500 mb-1">כותרת *</label>
            <input id="edit-title" value={form.title} onChange={e => set("title", e.target.value)}
              className={inputCls} placeholder="כותרת המוצר" />
          </div>

          <div>
            <label htmlFor="edit-desc" className="block text-xs text-gray-500 mb-1">תיאור</label>
            <textarea id="edit-desc" value={form.description} onChange={e => set("description", e.target.value)}
              rows={4} className={inputCls + " resize-none"} placeholder="תיאור המוצר" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-category" className="block text-xs text-gray-500 mb-1">קטגוריה</label>
              <select id="edit-category" value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="edit-condition" className="block text-xs text-gray-500 mb-1">מצב המוצר</label>
              <select id="edit-condition" value={form.condition} onChange={e => set("condition", e.target.value)} className={inputCls}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="button" onClick={() => set("is_stock", !form.is_stock)} aria-pressed={form.is_stock}
            className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all"
            style={form.is_stock
              ? { borderColor: "#e5893d", background: "#e5893d0f" }
              : { borderColor: "#e5e7eb", background: "white" }}>
            <span className="text-sm font-semibold text-gray-700">פרסום בעמוד הסטוקים</span>
            <span className="w-10 h-6 rounded-full flex items-center flex-shrink-0 transition-all p-0.5"
              style={{ background: form.is_stock ? "#e5893d" : "#d1d5db", justifyContent: form.is_stock ? "flex-end" : "flex-start" }}>
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>

          <div>
            <label htmlFor="edit-location" className="block text-xs text-gray-500 mb-1">מיקום</label>
            <input id="edit-location" value={form.location} onChange={e => set("location", e.target.value)}
              className={inputCls} placeholder="עיר / אזור" />
          </div>

          <div>
            <label htmlFor="edit-price" className="block text-xs text-gray-500 mb-1">
              מחיר התחלתי (₪) {noBids ? "*" : ""}
            </label>
            <input id="edit-price" type="number" min="1" value={form.starting_price}
              onChange={e => set("starting_price", e.target.value)}
              disabled={!noBids}
              className={inputCls + (noBids ? "" : " bg-gray-50 text-gray-400 cursor-not-allowed")} dir="ltr" />
            <p className="text-xs text-gray-400 mt-1">
              {noBids
                ? "אין הצעות עדיין — המחיר ניתן לעריכה"
                : `הוגשו ${product.bid_count} הצעות — המחיר אינו ניתן לשינוי`}
            </p>
          </div>

          {error && <p className="text-xs text-red-500" role="alert">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-xl font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              שמור שינויים
            </button>
            <button onClick={onClose} className="flex-1 text-gray-600 text-sm py-2.5 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50">
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}