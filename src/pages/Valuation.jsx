import { useState } from "react";
import { Link } from "react-router-dom";
import { estimateItemValue } from "@/functions/estimateItemValue";
import { setPageMeta } from "@/lib/seo";
import { CATEGORIES } from "@/lib/productMeta";
import { Calculator, ArrowRight, Sparkles, CheckCircle, GraduationCap, Upload } from "lucide-react";

const CONFIDENCE_LABELS = {
  high: { label: "ביטחון גבוה", color: "#00a35c" },
  medium: { label: "ביטחון בינוני", color: "#f59e0b" },
  low: { label: "ביטחון נמוך — פריט נדיר או עמום", color: "#e5893d" },
};

export default function Valuation() {
  const [item, setItem] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useState(() => {
    setPageMeta({
      title: "מחשבון הערכת שווי לפריטי אספנות ועתיקות | bidli",
      description: "הזן פריט וקבל טווח שווי מוערך — מבוסס על מכירות שהסתיימו באתר ועל נתוני שוק האספנות. הערכה חינם לפני פרסום מכרז.",
    });
  }, []);

  const estimate = async (e) => {
    e.preventDefault();
    if (!item.trim()) { setError("יש לתאר את הפריט"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await estimateItemValue({ item: item.trim(), category });
      const data = res?.data ?? res;
      if (data?.error === "rate_limited") {
        setError("בוצעו יותר מדי בקשות — נסה שוב בעוד כשעה");
      } else if (data?.estimate) {
        setResult(data);
      } else {
        setError("שגיאה בהערכה, נסה שנית");
      }
    } catch (err) {
      setError("שגיאה בהערכה, נסה שנית");
    } finally {
      setLoading(false);
    }
  };

  const conf = result ? CONFIDENCE_LABELS[result.estimate.confidence] || CONFIDENCE_LABELS.low : null;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לדף הבית
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d18, #3e6b8a11)", border: "1px solid #e5893d44" }}>
              <Calculator className="h-5 w-5" style={{ color: "#e5893d" }} />
            </div>
            <h1 className="text-3xl font-black text-gray-900">מחשבון הערכת שווי</h1>
          </div>
          <p className="text-gray-500 text-sm">
            הזן פריט וקבל טווח שווי מוערך — מבוסס על מכירות שהסתיימו באתר ועל נתוני שוק האספנות. חינם, לפני פרסום מכרז.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Form */}
        <form onSubmit={estimate} className="p-5 rounded-2xl border" style={{ borderColor: "#e5e7eb" }} dir="rtl">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">תיאור הפריט *</label>
          <textarea value={item} onChange={e => setItem(e.target.value)}
            placeholder="לדוגמה: שעון כיס זהב מהמאה ה-19, חברת Longines, עובד ותקין, עם קופסה מקורית"
            rows={3}
            className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right resize-none mb-4" />
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">קטגוריה (מדויק יותר)</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-[#e5893d88] text-right">
            <option value="">לא צוין / לא בטוח</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full text-white text-sm py-3.5 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> מעריך שווי...</>
              : <><Sparkles className="h-4 w-4" /> הערך שווי</>}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="space-y-4" dir="rtl">
            <div className="p-6 rounded-2xl text-center"
              style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)", border: "1px solid #e5893d33" }}>
              <p className="text-xs text-gray-400 mb-1">טווח שווי מוערך</p>
              <p className="text-4xl font-black text-gray-900">
                ₪{result.estimate.min_price.toLocaleString()} — ₪{result.estimate.max_price.toLocaleString()}
              </p>
              <span className="inline-block mt-3 text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: conf.color + "15", color: conf.color }}>
                {conf.label}
              </span>
              <p className="text-sm text-gray-600 leading-relaxed mt-4">{result.estimate.reasoning}</p>
            </div>

            {result.estimate.tips?.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-2">💡 טיפים לפני פרסום המכרז</p>
                <ul className="space-y-1.5">
                  {result.estimate.tips.map((t, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "#00a35c" }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.site_sales?.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-gray-100">
                <p className="text-sm font-bold text-gray-800 mb-3">📊 מכירות דומות שהסתיימו באתר</p>
                <div className="space-y-1.5">
                  {result.site_sales.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-gray-50">
                      <span className="text-gray-700 truncate">{s.title}</span>
                      <span className="font-black flex-shrink-0 mr-2" style={{ color: "#00a35c" }}>₪{s.final_price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/upload-product"
                className="flex items-center justify-center gap-2 text-white text-sm py-3.5 rounded-xl font-bold"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
                <Upload className="h-4 w-4" />
                פרסם מכרז עם הפריט שלי
              </Link>
              <Link to="/experts"
                className="flex items-center justify-center gap-2 text-sm py-3.5 rounded-xl font-bold border transition-all hover:scale-[1.01]"
                style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                <GraduationCap className="h-4 w-4" />
                רוצה הערכה מקצועית? פנה למומחה
              </Link>
            </div>
            <p className="text-xs text-gray-400 text-center">
              ההערכה ניתנה על בסיס נתוני האתר וידע שוק כללי — אין בה כל התחייבות. להערכה מחייבת מומלץ לפנות למומחה מוסמך.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}