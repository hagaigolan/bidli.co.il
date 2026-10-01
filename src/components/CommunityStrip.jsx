import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Users, Heart, MessageCircle } from "lucide-react";

// מדור קהילת האספנים — אספנים פעילים (לייקים/עוקבים) + תגובות אחרונות
export default function CommunityStrip() {
  const [collectors, setCollectors] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.CollectionLike.list("-created_date", 100).catch(() => []),
      base44.entities.CollectorFollow.list("-created_date", 100).catch(() => []),
      base44.entities.CollectionComment.list("-created_date", 6).catch(() => []),
    ]).then(([likes, follows, cmts]) => {
      // אגירת פעילות לפי אספן: כמה לייקים קיבלו הפריטים שלו + כמה עוקבים אחריו
      const stats = {};
      const bump = (key, name, field) => {
        if (!key) return;
        (stats[key] ||= { key, name: name || "אספן", likes: 0, followers: 0 });
        stats[key][field] += 1;
        if (name) stats[key].name = name;
      };
      likes.forEach(l => bump(l.collector_key, l.collector_name, "likes"));
      follows.forEach(f => bump(f.followed_key, f.followed_name, "followers"));
      const top = Object.values(stats)
        .filter(s => s.likes + s.followers > 0)
        .sort((a, b) => (b.likes + b.followers) - (a.likes + a.followers))
        .slice(0, 8);
      setCollectors(top);
      setComments(cmts.slice(0, 3));
      setHasData(top.length > 0 || cmts.length > 0);
    });
  }, []);

  if (!hasData) return null;

  return (
    <section className="py-8 sm:py-10" style={{ background: "linear-gradient(180deg, #fff, #fafafa)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "#e5893d18", border: "1px solid #e5893d44" }}>
            <Users className="h-4 w-4" style={{ color: "#e5893d" }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">קהילת האספנים</h2>
          <span className="text-xs text-gray-400 hidden sm:block">אתם לא לבד — כאן כולם אספנים כמוכם</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* אספנים פעילים */}
          {collectors.length > 0 && (
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {collectors.map(c => (
                  <Link key={c.key} to={`/seller/${encodeURIComponent(c.key)}`}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 group hover:border-transparent transition-all duration-300 card-neon"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black"
                      style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
                      {c.name[0]}
                    </div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#e5893d] transition-colors line-clamp-1 text-center">{c.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      {c.likes > 0 && <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" style={{ color: "#e5893d" }} />{c.likes}</span>}
                      {c.followers > 0 && <span className="flex items-center gap-0.5"><Users className="h-3 w-3" style={{ color: "#3e6b8a" }} />{c.followers}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* תגובות אחרונות */}
          {comments.length > 0 && (
            <div className={collectors.length > 0 ? "md:col-span-1" : "md:col-span-3"}>
              <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" style={{ color: "#3e6b8a" }} /> דיברו על זה השבוע
              </h3>
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-3.5"
                    style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-1.5">"{c.comment}"</p>
                    <p className="text-[11px] text-gray-400">{c.commenter_name || "אספן"} על {c.product_title || "פריט באוסף"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}