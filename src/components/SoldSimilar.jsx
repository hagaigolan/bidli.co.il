import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Clock } from "lucide-react";

// מדור אמון — מכרזים דומים מאותה קטגוריה שהסתיימו ונמכרו בפועל,
// עם המחירים הסופיים שלהם, כדי לעזור למציע להעריך את שווי השוק.
export default function SoldSimilar({ category, excludeId }) {
  const [sold, setSold] = useState(null);

  useEffect(() => {
    if (!category) return;
    base44.entities.Product.filter({ category })
      .then(items => {
        const ended = (items || [])
          .filter(p => p.id !== excludeId && p.highest_bidder && p.current_price &&
            (!p.ends_at || new Date(p.ends_at) <= new Date()) &&
            !["cancelled", "disputed"].includes(p.status))
          .sort((a, b) => new Date(b.ends_at || 0) - new Date(a.ends_at || 0))
          .slice(0, 6);
        setSold(ended);
      })
      .catch(() => setSold([]));
  }, [category, excludeId]);

  if (!sold || sold.length === 0) return null;

  return (
    <div className="mt-10" dir="rtl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#00a35c18", border: "1px solid #00a35c44" }}>
          <CheckCircle className="h-4 w-4" style={{ color: "#00a35c" }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">מכרזים דומים שנמכרו</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">כך תוכל להעריך את שווי השוק בקטגוריה זו לפני שאתה מציע</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
        {sold.map(p => (
          <Link key={p.id} to={`/auction/${p.id}`}
            className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
            style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
              {p.image_url
                ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, #00a35c, #00e676)", boxShadow: "0 0 10px #00a35c55" }}>
                נמכר
              </span>
            </div>
            <div className="p-3" dir="rtl">
              <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{p.title}</h3>
              <div className="flex items-center justify-between">
                <p className="font-black text-sm" style={{ color: "#00a35c" }}>₪{(p.current_price || 0).toLocaleString()}</p>
                {p.ends_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {new Date(p.ends_at).toLocaleDateString("he-IL")}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}