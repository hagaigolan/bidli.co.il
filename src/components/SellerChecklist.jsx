import { Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

// צ'קליסט חכם למוכר — בודק את איכות הפרסומים הקיימים ומראה בדיוק מה חסר
const CHECKS = [
  {
    key: "images",
    label: "3 תמונות ומעלה",
    tip: "פריטים עם 3 תמונות ומעלה מקבלים יותר הצעות",
    test: (p) => {
      const count = (Array.isArray(p.image_urls) && p.image_urls.length) || (p.image_url ? 1 : 0);
      return count >= 3;
    },
  },
  {
    key: "desc",
    label: "תיאור מפורט (200+ תווים)",
    tip: "פרטו מידות, מצב, היסטוריה וסימני בלאי",
    test: (p) => (p.description || "").trim().length >= 200,
  },
  {
    key: "buy_now",
    label: "מחיר \"קנה עכשיו\"",
    tip: "קונה שממהר יכול לסגור עסקה בלי לחכות לסיום",
    test: (p) => Number(p.buy_now_price) > 0,
  },
  {
    key: "subcategory",
    label: "תת-קטגוריה",
    tip: "ממקדת את הפריט לקהל הנכון ומשפרת את החשיפה",
    test: (p) => !!p.subcategory,
  },
  {
    key: "payments",
    label: "אמצעי תשלום לקבלת הכסף",
    tip: "בלעדיו הזוכה לא יודע איך להעביר את התשלום",
    test: (p) => (Array.isArray(p.seller_payment_methods) ? p.seller_payment_methods.length > 0 : !!p.seller_payment_method),
  },
  {
    key: "title",
    label: "כותרת ממוקדת (15-70 תווים)",
    tip: "כותרת קצרה וברורה מופיעה טוב יותר בתוצאות החיפוש",
    test: (p) => {
      const len = (p.title || "").trim().length;
      return len >= 15 && len <= 70;
    },
  },
];

export default function SellerChecklist({ products = [] }) {
  if (!products.length) return null;

  const total = products.length * CHECKS.length;
  const passed = products.reduce(
    (sum, p) => sum + CHECKS.filter((c) => c.test(p)).length,
    0
  );
  const score = Math.round((passed / total) * 100);

  const missing = CHECKS
    .map((c) => ({ ...c, count: products.filter((p) => !c.test(p)).length }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="rounded-2xl border border-gray-100 p-4 mb-6" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center"
          style={{ background: `conic-gradient(#e5893d ${score * 3.6}deg, #f1f1f1 0deg)` }}>
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
            <span className="text-xs font-black" style={{ color: "#e5893d" }}>{score}%</span>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
            צ׳קליסט המוכר החכם
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {score === 100
              ? "כל הפרסומים שלך מלאים — מצוין!"
              : `מדד הכנת הפרסומים שלך: ${score}% — כמה תיקונים קטנים יכולים להגדיל את הסיכוי למכירה`}
          </p>
        </div>
      </div>

      {missing.length === 0 ? (
        <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> כל הפרסומים עומדים בכל הקריטריונים
        </div>
      ) : (
        <ul className="space-y-2">
          {missing.map((c) => (
            <li key={c.key} className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#e5893d" }} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800">
                  {c.label}
                  <span className="font-normal text-gray-400"> — חסר ב-{c.count} {c.count === 1 ? "פרסום" : "פרסומים"}</span>
                </p>
                <p className="text-[11px] text-gray-500">{c.tip}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {score < 100 && (
        <Link to="/upload-product" className="inline-block mt-3 text-xs font-bold" style={{ color: "#e5893d" }}>
          פרסם פריט חדש לפי הצ׳קליסט ←
        </Link>
      )}
    </div>
  );
}