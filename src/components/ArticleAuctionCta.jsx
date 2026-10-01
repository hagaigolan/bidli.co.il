import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Zap, ArrowRight } from "lucide-react";

// מדור מכרזים פעילים בקטגוריית המאמר — ממיר קוראים למציעים
export default function ArticleAuctionCta({ category }) {
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    if (!category) return;
    base44.entities.Product.filter({ category })
      .then(items => {
        const now = new Date();
        setAuctions((items || [])
          .filter(p => p.status === "active" && p.ends_at && new Date(p.ends_at) > now)
          .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at))
          .slice(0, 3));
      })
      .catch(() => {});
  }, [category]);

  if (!category || auctions.length === 0) return null;

  return (
    <div className="mt-10 p-5 rounded-2xl border" dir="rtl"
      style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)", borderColor: "#e5893d33" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
          <Zap className="h-4 w-4" style={{ color: "#e5893d" }} />
        </div>
        <h2 className="font-black text-gray-900">מכרזים פעילים בקטגוריה זו</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {auctions.map(p => (
          <Link key={p.id} to={`/auction/${p.id}`}
            className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100 hover:border-[#e5893d55] transition-all group">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              {p.image_url
                ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">{p.title}</p>
              <p className="text-xs mt-0.5">
                <span className="font-black" style={{ color: "#e5893d" }}>₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
                <span className="text-gray-400"> · {p.bid_count || 0} הצעות</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
      <Link to={`/category/${encodeURIComponent(category)}`}
        className="mt-4 inline-flex items-center gap-1 text-sm font-bold hover:underline" style={{ color: "#e5893d" }}>
        לכל המכרזים בקטגוריה
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}