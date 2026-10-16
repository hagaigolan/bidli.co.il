import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Trophy } from "lucide-react";

// "נמכרו לאחרונה" — מכרזים שהסתיימו ונמכרו בפועל, עם הזוכים, המחירים והתמונות
export default function RecentlySold() {
  const [sold, setSold] = useState(null);

  useEffect(() => {
    base44.entities.Product.filter({ highest_bidder: { $ne: "" } }, { sort: "-ends_at", limit: 40 })
      .then(items => {
        const now = Date.now();
        const recent = (items || [])
          .filter(p => p.ends_at && new Date(p.ends_at).getTime() <= now && !["cancelled", "disputed"].includes(p.status))
          .sort((a, b) => new Date(b.ends_at) - new Date(a.ends_at))
          .slice(0, 8);
        setSold(recent);
      })
      .catch(() => setSold([]));
  }, []);

  if (!sold || sold.length === 0) return null;

  return (
    <section className="py-8 sm:py-10" dir="rtl" style={{ background: "linear-gradient(180deg, #ffffff, #f5fbf7)" }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#00a35c18", border: "1px solid #00a35c44" }}>
            <CheckCircle className="h-4 w-4" style={{ color: "#00a35c" }} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">נמכרו לאחרונה</h2>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, #00a35c55, transparent)" }} />
        </div>
        <p className="text-sm text-gray-400 mb-6">מכרזים שהסתיימו ונמכרו בפועל — עם הזוכים והמחירים הסופיים</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {sold.map(p => (
            <Link key={p.id} to={`/auction/${p.id}`}
              className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-black text-white"
                  style={{ background: "linear-gradient(135deg, #00a35c, #00e676)", boxShadow: "0 0 10px #00a35c55" }}>
                  נמכר
                </span>
              </div>
              <div className="p-3" dir="rtl">
                <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{p.title}</h3>
                {p.highest_bidder && (
                  <p className="flex items-center gap-1 text-xs font-semibold mb-1.5" style={{ color: "#00a35c" }}>
                    <Trophy className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                    נמכר ל{p.highest_bidder}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <p className="font-black text-sm text-gray-900">₪{(p.current_price || 0).toLocaleString()}</p>
                  {p.ends_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(p.ends_at).toLocaleDateString("he-IL")}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}