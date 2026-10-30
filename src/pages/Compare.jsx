import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { clearCompare, getCompareIds, removeFromCompare } from "@/lib/compare";
import { formatTimeLeft, isLiveAuction } from "@/lib/countdown";
import { setPageMeta } from "@/lib/seo";

const price = (n) => `₪${Number(n || 0).toLocaleString("he-IL")}`;

const ROWS = [
  { label: "מחיר נוכחי", render: (p) => <span className="font-black text-gray-900">{price(p.current_price || p.starting_price)}</span> },
  { label: "מחיר פתיחה", render: (p) => (p.starting_price ? price(p.starting_price) : "—") },
  { label: "קנה עכשיו", render: (p) => (p.buy_now_price ? price(p.buy_now_price) : "—") },
  { label: "מספר הצעות", render: (p) => `${p.bid_count || 0} הצעות` },
  { label: "מצב הפריט", render: (p) => p.condition || "—" },
  { label: "קטגוריה", render: (p) => [p.category, p.subcategory].filter(Boolean).join(" · ") || "—" },
  { label: "מוכר", render: (p) => p.seller_name || "—" },
  { label: "מיקום", render: (p) => p.location || "—" },
  { label: "נשאר זמן", render: (p) => (isLiveAuction(p) ? formatTimeLeft(p.ends_at) : "הסתיים") },
  { label: "תיאור", render: (p) => <span className="block max-w-[220px] line-clamp-4 text-xs leading-relaxed text-gray-600">{p.description || "—"}</span> },
];

export default function Compare() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setPageMeta({
      title: "השוואת מכרזים — פריט מול פריט | bidli",
      description: "השוו עד 4 מכרזים זה לצד זה: מחיר נוכחי, מחיר פתיחה, מצב הפריט, מספר הצעות, מוכר וזמן שנותר.",
    });
  }, []);

  const load = () => {
    const ids = getCompareIds();
    if (!ids.length) { setProducts([]); setLoading(false); return; }
    Promise.all(ids.map((id) => base44.entities.Product.get(id).catch(() => null))).then((list) => {
      const found = list.filter(Boolean);
      // פריט שנמחק מהמערכת יוסר אוטומטית מההשוואה
      ids.forEach((id, i) => { if (!list[i]) removeFromCompare(id); });
      setProducts(found);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-6xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
              <ArrowLeftRight className="h-6 w-6" style={{ color: "#e5893d" }} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">השוואת פריטים</h1>
              <p className="text-sm text-gray-400">כל הפרטים זה מול זה — כדי להחליט בבטחה לפני שמציעים</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ArrowLeftRight className="h-10 w-10 mx-auto mb-3 text-gray-200" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-700 mb-2">עוד לא בחרת פריטים להשוואה</h2>
            <p className="text-sm text-gray-400 mb-6">בכל כרטיס מכרז יש כפתור השוואה — בחר עד 4 פריטים וחזור לכאן</p>
            <Link to="/auctions" className="text-white text-sm px-6 py-2.5 rounded-xl font-bold inline-block"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              לכל המכרזים
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{products.length} פריטים בהשוואה</p>
              <button type="button" onClick={() => { clearCompare(); setProducts([]); }} className="text-xs text-gray-400 hover:text-gray-600">
                נקה השוואה
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm border-collapse" style={{ minWidth: 220 + products.length * 180 }}>
                <thead>
                  <tr>
                    <th className="text-right p-3 bg-gray-50 border-b border-gray-100 align-bottom w-[130px]">
                      <span className="text-xs font-bold text-gray-400">השוואה</span>
                    </th>
                    {products.map((p) => (
                      <th key={p.id} className="p-3 bg-gray-50 border-b border-gray-100 align-top" style={{ minWidth: 180 }}>
                        <div className="relative">
                          <button type="button" onClick={() => { removeFromCompare(p.id); setProducts((prev) => prev.filter((x) => x.id !== p.id)); }}
                            aria-label={`הסר את ${p.title} מההשוואה`}
                            className="absolute -top-1 left-0 w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">
                            <X className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
                          </button>
                          <Link to={`/auction/${p.id}`} className="block group">
                            <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2">
                              {p.image_url
                                ? <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                : <div className="w-full h-full flex items-center justify-center text-3xl">🏺</div>}
                            </div>
                            <span className="block text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover:underline">{p.title}</span>
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, i) => (
                    <tr key={row.label} className={i % 2 ? "bg-gray-50/40" : "bg-white"}>
                      <td className="p-3 text-xs font-bold text-gray-500 border-b border-gray-100 whitespace-nowrap">{row.label}</td>
                      {products.map((p) => (
                        <td key={p.id} className="p-3 text-xs text-gray-700 border-b border-gray-100 align-top">{row.render(p)}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3" />
                    {products.map((p) => (
                      <td key={p.id} className="p-3">
                        <Link to={`/auction/${p.id}`} className="block text-center text-white text-xs font-bold px-3 py-2 rounded-xl"
                          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                          לעמוד המכרז
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}