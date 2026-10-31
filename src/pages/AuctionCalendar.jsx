import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { CalendarDays, Clock, MapPin, Download, ArrowRight } from "lucide-react";
import { downloadAuctionIcs } from "@/lib/ics";

const dayKey = (d) => new Date(d).toDateString();

function dayLabel(key, index) {
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (key === today.toDateString()) return "היום";
  if (key === tomorrow.toDateString()) return "מחר";
  return new Date(key).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
}

// לוח מכרזים — כל המכרזים הפעילים מסודרים לפי יום ושעת סיום, עם הוספה ליומן
export default function AuctionCalendar() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: "לוח מכרזים — מכרזים לפי תאריך ושעת סיום | bidli",
      description: "כל המכרזים הפעילים ב-bidli מסודרים לפי יום ושעה. הוסיפו תזכורת ליומן וזכו בפריטים של אמנות, תכשיטים, יודאיקה ואספנות.",
    });
    base44.entities.Product.list("-created_date", 300)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = products
    .filter(p => p.status === "active" && p.ends_at && new Date(p.ends_at) > new Date())
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at));

  const groups = [];
  upcoming.forEach(p => {
    const key = dayKey(p.ends_at);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(p);
    else groups.push({ key, items: [p] });
  });

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 py-8 px-4" style={{ background: "linear-gradient(135deg, #3e6b8a08, #ffffff)" }}>
        <div className="max-w-3xl mx-auto">
          <Link to="/auctions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4" aria-hidden="true" /> לכל המכרזים
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#3e6b8a15", border: "1px solid #3e6b8a33" }}>
              <CalendarDays className="h-6 w-6" style={{ color: "#3e6b8a" }} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">לוח המכרזים</h1>
              <p className="text-sm text-gray-400">{upcoming.length} מכרזים פעילים לפי תאריך ושעת סיום</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#3e6b8a] rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 text-gray-200" aria-hidden="true" />
            <p className="text-sm text-gray-400">אין מכרזים פעילים כרגע</p>
          </div>
        ) : (
          <div className="space-y-7">
            {groups.map((group, gi) => (
              <section key={group.key}>
                <h2 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: gi === 0 ? "#00c853" : "#3e6b8a" }} />
                  {dayLabel(group.key, gi)}
                  <span className="text-xs font-medium text-gray-400">({group.items.length})</span>
                </h2>
                <div className="space-y-2">
                  {group.items.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-[#e5893d55] transition-colors">
                      <span className="text-xs font-black px-2.5 py-1.5 rounded-xl flex-shrink-0 font-mono"
                        style={{ background: "#3e6b8a0f", color: "#3e6b8a" }}>
                        {new Date(p.ends_at).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Link to={`/auction/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                          {p.image_url
                            ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">🏺</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">{p.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                            <span className="font-black text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
                            {p.location && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" aria-hidden="true" />{p.location}</span>}
                          </div>
                        </div>
                      </Link>
                      <button type="button" onClick={() => downloadAuctionIcs(p)} aria-label={`הוסף את ${p.title} ליומן`}
                        className="flex items-center gap-1 text-xs font-bold px-2.5 py-2 rounded-xl border flex-shrink-0 transition-all hover:scale-[1.03]"
                        style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">ליומן</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-8 flex items-center justify-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          הקובץ מתווסף ליומן עם תזכורת 30 דקות לפני סיום המכרז
        </p>
      </div>
    </div>
  );
}