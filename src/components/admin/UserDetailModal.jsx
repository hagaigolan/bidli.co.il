import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Gavel, TrendingUp, Trophy, Heart, Store, Clock, MapPin } from "lucide-react";

// פרופיל משתמש מנקודת מבט אדמין — כל הפעילות שלו: מכרזים, הצעות, זכיות, מועדפים
export default function UserDetailModal({ user, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    const me = (user.email || "").trim().toLowerCase();
    const nm = (user.full_name || "").trim();
    Promise.all([
      base44.entities.Product.filter({}).catch(() => []),
      base44.entities.Bid.filter({}).catch(() => []),
      base44.entities.Favorite.filter({ owner_key: me }).catch(() => []),
    ]).then(([products, bids, favs]) => {
      const myAuctions = products.filter(p =>
        ((p.seller_email || "").trim().toLowerCase() === me) ||
        (p.seller_user_id && p.seller_user_id === user.id));
      const myBids = bids.filter(b =>
        ((b.bidder_email || "").trim().toLowerCase() === me) ||
        (nm && (b.bidder_name || "").trim() === nm));
      setData({
        auctions: myAuctions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
        bids: myBids.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)),
        favs,
      });
    }).catch(() => setData({ auctions: [], bids: [], favs: [] }));
  }, [user]);

  if (!user) return null;
  const stats = data ? {
    total: data.auctions.length,
    active: data.auctions.filter(p => p.status === "active").length,
    ended: data.auctions.filter(p => p.status !== "active").length,
    bids: data.bids.length,
    bidTotal: data.bids.reduce((s, b) => s + (Number(b.amount) || 0), 0),
    wins: data.bids.filter(b => b.status === "won").length,
    favs: data.favs.length,
  } : null;

  const statCard = (Icon, label, value, color) => (
    <div className="rounded-2xl border border-gray-100 p-3.5 text-center"
      style={{ borderColor: color + "33", background: color + "08" }}>
      <Icon className="h-4 w-4 mx-auto mb-1" style={{ color }} aria-hidden="true" />
      <p className="text-lg font-black text-gray-900">{value}</p>
      <p className="text-[11px] font-semibold text-gray-400">{label}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-6" onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl max-h-[88vh] rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()} dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <div className="min-w-0">
            <h2 className="font-black text-gray-900 truncate">{user.full_name || "ללא שם"}</h2>
            <p className="text-xs text-gray-400 truncate" dir="ltr">{user.email}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {user.role === "admin" && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#3e6b8a15", color: "#3e6b8a" }}>אדמין</span>}
            {user.is_banned && <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#ef4444" }}>מושהה</span>}
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-200 transition-colors" aria-label="סגירה">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {!data ? (
          <div className="py-14 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-300" /></div>
        ) : (
          <div className="overflow-y-auto p-5 space-y-5">
            {/* סטטיסטיקה */}
            <div className="grid grid-cols-3 gap-2.5">
              {statCard(Store, "מכרזים שפרסם", stats.total, "#e5893d")}
              {statCard(Gavel, "הצעות שהגיש", stats.bids, "#3e6b8a")}
              {statCard(Trophy, "זכיות", stats.wins, "#00a35c")}
              {statCard(TrendingUp, "סה״כ הצעות ₪", stats.bidTotal.toLocaleString(), "#6aa3cd")}
              {statCard(Clock, "מכרזים פעילים", stats.active, "#2d4f68")}
              {statCard(Heart, "מועדפים", stats.favs, "#ef4444")}
            </div>

            {/* מכרזים שפרסם */}
            <div>
              <h3 className="text-sm font-black text-gray-800 mb-2">מכרזים שפרסם ({stats.total})</h3>
              {data.auctions.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center rounded-xl bg-gray-50">לא פרסם מכרזים</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {data.auctions.map(p => (
                    <Link key={p.id} to={`/auction/${p.id}`} onClick={onClose}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-[#e5893d55] transition-all">
                      {p.image_url
                        ? <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">🏺</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{p.title}</p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" /> {p.location || "—"} · ₪{(p.current_price || p.starting_price || 0).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                        style={p.status === "active"
                          ? { background: "#00c85315", color: "#00a35c" }
                          : { background: "#f3f4f6", color: "#6b7280" }}>
                        {p.status === "active" ? "פעיל" : "הסתיים"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* הצעות שהגיש */}
            <div>
              <h3 className="text-sm font-black text-gray-800 mb-2">הצעות שהגיש ({stats.bids})</h3>
              {data.bids.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center rounded-xl bg-gray-50">לא הגיש הצעות</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {data.bids.map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100">
                      {b.product_image_url
                        ? <img src={b.product_image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">🏺</div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{b.product_title || "—"}</p>
                        <p className="text-[11px] text-gray-400">{b.created_date ? new Date(b.created_date).toLocaleDateString("he-IL") : ""}</p>
                      </div>
                      <span className="text-xs font-black flex-shrink-0" style={{ color: b.status === "won" ? "#00a35c" : "#3e6b8a" }}>
                        ₪{(b.amount || 0).toLocaleString()}{b.status === "won" ? " 🏆" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}