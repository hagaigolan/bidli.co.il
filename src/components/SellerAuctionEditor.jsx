import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gavel, RefreshCw, Loader2, Pencil, X, Save } from "lucide-react";
import { CATEGORIES, CONDITIONS } from "@/lib/productMeta";

// עריכת פרטי מכרז פעיל — המחיר ניתן לעריכה רק אם לא הוגשו הצעות
function EditModal({ product, onClose, onSaved }) {
  const noBids = !product.bid_count;
  const [form, setForm] = useState({
    title: product.title || "",
    description: product.description || "",
    category: product.category || "",
    condition: product.condition || CONDITIONS[1],
    location: product.location || "",
    starting_price: String(product.starting_price ?? ""),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right";

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">כותרת *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              className={inputCls} placeholder="כותרת המוצר" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">תיאור</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={4} className={inputCls + " resize-none"} placeholder="תיאור המוצר" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">קטגוריה</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                <option value="">בחר קטגוריה</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">מצב המוצר</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)} className={inputCls}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">מיקום</label>
            <input value={form.location} onChange={e => set("location", e.target.value)}
              className={inputCls} placeholder="עיר / אזור" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              מחיר התחלתי (₪) {noBids ? "*" : ""}
            </label>
            <input type="number" min="1" value={form.starting_price}
              onChange={e => set("starting_price", e.target.value)}
              disabled={!noBids}
              className={inputCls + (noBids ? "" : " bg-gray-50 text-gray-400 cursor-not-allowed")} dir="ltr" />
            <p className="text-xs text-gray-400 mt-1">
              {noBids
                ? "אין הצעות עדיין — המחיר ניתן לעריכה"
                : `הוגשו ${product.bid_count} הצעות — המחיר אינו ניתן לשינוי`}
            </p>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={busy}
              className="flex-1 flex items-center justify-center gap-2 text-white text-sm py-2.5 rounded-xl font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
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

export default function SellerAuctionEditor() {
  const sellerEmail = localStorage.getItem("seller_email") || localStorage.getItem("bidder_email");
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    if (!sellerEmail) { setProducts([]); return; }
    try {
      const items = await base44.entities.Product.filter({ seller_email: sellerEmail, status: "active" }, "-created_date", 100);
      setProducts(items.filter(p => new Date(p.ends_at) > new Date()));
    } catch { setProducts([]); }
  };

  useEffect(() => { load(); }, []);

  if (products === null || products.length === 0) return null;

  return (
    <div className="mb-6" dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
          <Gavel className="h-5 w-5" style={{ color: "#f700ff" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">המכרזים הפעילים שלי</p>
          <p className="text-xs text-gray-400">עריכת פרטי המכרז — המחיר ניתן לעריכה רק לפני הצעה ראשונה</p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/auction/${p.id}`} className="text-sm font-semibold text-gray-800 truncate block hover:text-[#f700ff] transition-colors">
                  {p.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{p.bid_count || 0} הצעות</span>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(p)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border transition-all flex-shrink-0"
                style={{ borderColor: "#f700ff44", color: "#f700ff", background: "#f700ff08" }}>
                <Pencil className="h-3.5 w-3.5" /> עריכה
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}