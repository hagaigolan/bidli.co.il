import { SlidersHorizontal, X, Timer } from "lucide-react";
import { CATEGORIES, CONDITIONS } from "@/lib/productMeta";

// לוח סינון לעמוד כל המכרזים — קטגוריה, טווח מחירים, מצב פריט, עיר ומסתיים בקרוב
export default function AuctionsFilterPanel({
  category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice,
  condition, setCondition, city, setCity, endingSoon, setEndingSoon,
  cities, count, totalCount, onReset,
}) {
  const hasActive = category || minPrice || maxPrice || condition || city || endingSoon;
  const chipCls = (on) =>
    `text-xs font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
      on ? "text-white" : "bg-white text-gray-600 hover:text-[#e5893d] hover:border-[#e5893d66]"
    }`;
  const chipStyle = (on) =>
    on ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent" } : { borderColor: "#e5e7eb" };
  const inputCls = "px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right w-full";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 mb-4" dir="rtl"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="flex items-center gap-2 text-sm font-black text-gray-800">
          <SlidersHorizontal className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
          סינון מכרזים
        </p>
        <div className="flex items-center gap-3">
          {hasActive && (
            <button onClick={onReset}
              className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> איפוס מסננים
            </button>
          )}
          <span className="text-xs font-black px-3 py-1.5 rounded-full"
            style={{ background: "#e5893d0f", color: "#e5893d", border: "1px solid #e5893d33" }}>
            {count} מתוך {totalCount} מכרזים
          </span>
        </div>
      </div>

      {/* קטגוריות — סינון במקום, בלי ניווט לעמודי קטגוריה */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-0.5">
        <button onClick={() => setCategory("")} className={chipCls(!category) + " flex-shrink-0"} style={chipStyle(!category)}>
          כל הקטגוריות
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(category === c ? "" : c)}
            className={chipCls(category === c) + " flex-shrink-0"} style={chipStyle(category === c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">מחיר מ-</label>
          <input type="number" min="0" value={minPrice || ""} onChange={e => setMinPrice(Number(e.target.value) || 0)}
            placeholder="0" className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">מחיר עד-</label>
          <input type="number" min="0" value={maxPrice || ""} onChange={e => setMaxPrice(Number(e.target.value) || 0)}
            placeholder="ללא הגבלה" className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">מצב הפריט</label>
          <select value={condition} onChange={e => setCondition(e.target.value)} className={inputCls}>
            <option value="">כל המצבים</option>
            {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-gray-400 mb-1">עיר</label>
          <select value={city} onChange={e => setCity(e.target.value)} className={inputCls}>
            <option value="">כל הערים</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="button" onClick={() => setEndingSoon(!endingSoon)} aria-pressed={endingSoon}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all"
          style={endingSoon
            ? { borderColor: "#e5893d", color: "#e5893d", background: "#e5893d0f" }
            : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
          <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          מסתיים בקרוב
        </button>
      </div>
    </div>
  );
}