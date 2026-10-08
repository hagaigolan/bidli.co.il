import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Award, Gavel, Trophy, Heart, Store, Target } from "lucide-react";

// שלב 9+10 — תגי הישגים והתקדמות אישית, מחושבים מנתונים אמיתיים בלבד
// שלב 11 — אתגר שבועי: גלגול קטגוריה לגלות לפי שבוע השנה
const CATEGORIES = ["אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "תכשיטים", "שעונים", "עיצוב הבית", "אופנה", "ספרים", "כלי נגינה"];

const BADGES = [
  { id: "first_bid", icon: Gavel, label: "הצעה ראשונה", check: s => s.bids >= 1, color: "#e5893d" },
  { id: "active_bidder", icon: Target, label: "מציע פעיל — 5 הצעות", check: s => s.bids >= 5, color: "#3e6b8a" },
  { id: "winner", icon: Trophy, label: "זכייה ראשונה", check: s => s.wins >= 1, color: "#00a35c" },
  { id: "collector", icon: Heart, label: "אספן — 5 שמירות", check: s => s.favs >= 5, color: "#ef4444" },
  { id: "seller", icon: Store, label: "מוכר מאומת — מכירה ראשונה", check: s => s.sales >= 1, color: "#6aa3cd" },
];

export default function AchievementsCard({ email, name }) {
  const [stats, setStats] = useState(null);
  const [weekCat, setWeekCat] = useState(null);

  useEffect(() => {
    if (!email) return;
    const me = (email || "").trim().toLowerCase();
    const nm = (name || "").trim();
    const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
    setWeekCat(CATEGORIES[weekNum % CATEGORIES.length]);
    Promise.all([
      base44.entities.Bid.filter({}).catch(() => []),
      base44.entities.Favorite.filter({ owner_key: me }).catch(() => []),
      base44.entities.Product.filter({ seller_email: me }).catch(() => []),
    ]).then(([bids, favs, myProducts]) => {
      const myBids = bids.filter(b =>
        (b.bidder_email || "").trim().toLowerCase() === me ||
        (nm && (b.bidder_name || "").trim() === nm));
      setStats({
        bids: myBids.length,
        wins: myBids.filter(b => b.status === "won").length,
        favs: favs.length,
        sales: myProducts.filter(p => p.status !== "active").length,
      });
    }).catch(() => setStats({ bids: 0, wins: 0, favs: 0, sales: 0 }));
  }, [email, name]);

  if (!stats) return null;
  const earned = BADGES.filter(b => b.check(stats));
  const pct = Math.round((earned.length / BADGES.length) * 100);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5" dir="rtl"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
          <Award className="h-4 w-4" style={{ color: "#e5893d" }} /> ההישגים שלי
        </h2>
        <span className="text-xs font-bold text-gray-400">{earned.length}/{BADGES.length} תגים</span>
      </div>

      {/* פס התקדמות */}
      <div className="h-2 rounded-full bg-gray-100 mb-1 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #e5893d, #3e6b8a)" }} />
      </div>
      <p className="text-xs text-gray-400 mb-4 text-left">{pct}% מהתגים נאספו</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
        {BADGES.map(b => {
          const has = b.check(stats);
          return (
            <div key={b.id} className="rounded-xl border p-3 text-center transition-all"
              style={has
                ? { borderColor: b.color + "55", background: b.color + "0a" }
                : { borderColor: "#f3f4f6", background: "#fafafa", opacity: 0.55 }}>
              <b.icon className="h-5 w-5 mx-auto mb-1.5" style={{ color: has ? b.color : "#9ca3af" }} />
              <p className="text-[11px] font-bold text-gray-700 leading-snug">{b.label}</p>
              <p className="text-[10px] mt-0.5" style={{ color: has ? b.color : "#9ca3af" }}>{has ? "נצבר ✓" : "בהמתנה"}</p>
            </div>
          );
        })}
      </div>

      {/* אתגר שבועי — גילוי, לא הוצאה */}
      {weekCat && (
        <div className="rounded-xl p-3.5 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #3e6b8a0d, #e5893d0a)", border: "1px solid #3e6b8a22" }}>
          <span className="text-xl">🎯</span>
          <div className="flex-1">
            <p className="text-xs font-black text-gray-800">אתגר השבוע: גלה פריט בקטגוריית {weekCat}</p>
            <p className="text-[11px] text-gray-400">עיין, שמור למועדפים ולמד מה מתאים לך</p>
          </div>
          <Link to={`/category/${encodeURIComponent(weekCat)}`}
            className="flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            לגלות
          </Link>
        </div>
      )}
    </div>
  );
}