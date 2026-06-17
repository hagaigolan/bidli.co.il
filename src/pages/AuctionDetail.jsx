import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Clock, MapPin, Tag, User, TrendingUp, CheckCircle, Award } from "lucide-react";

function useCountdown(endsAt) {
  const calcLeft = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff, pct: Math.max(0, diff / (24 * 3600000)) };
  };
  const [left, setLeft] = useState(calcLeft);
  useEffect(() => {
    const t = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function TimerBlock({ endsAt }) {
  const left = useCountdown(endsAt);
  const urgent = left && left.total < 3600000;
  const color = urgent ? "#f700ff" : "#0088ff";

  if (!left) {
    return (
      <div className="rounded-2xl border border-gray-100 p-5 text-center" style={{ background: "#f9fafb" }}>
        <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="font-bold text-gray-700 text-lg">המכרז הסתיים</p>
        <p className="text-sm text-gray-400 mt-1">ההצעה הגבוהה ביותר אושרה</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: color + "33", background: color + "08" }}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>
          {urgent ? "⚡ נגמר בקרוב!" : "המכרז מסתיים בעוד:"}
        </span>
      </div>
      <div className="flex gap-3 justify-center mb-3">
        {[{ v: left.h, l: "שעות" }, { v: left.m, l: "דקות" }, { v: left.s, l: "שניות" }].map(({ v, l }) => (
          <div key={l} className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl font-mono"
              style={{ background: "white", border: `2px solid ${color}44`, color }}>
              {String(v).padStart(2, "0")}
            </div>
            <p className="text-xs text-gray-400 mt-1">{l}</p>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${left.pct * 100}%`, background: `linear-gradient(to right, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
}

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidderName, setBidderName] = useState("");

  useEffect(() => {
    base44.entities.Product.filter({ id }).then(items => {
      if (items.length) setProduct(items[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const ended = product && new Date(product.ends_at) <= new Date();
  const minBid = product ? (product.current_price || product.starting_price || 0) + 1 : 1;

  const handleBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || parseFloat(bidAmount) < minBid) {
      setBidError(`ההצעה חייבת להיות לפחות ₪${minBid}`);
      return;
    }
    setBidding(true);
    setBidError("");
    try {
      const newPrice = parseFloat(bidAmount);
      await base44.entities.Product.update(product.id, {
        current_price: newPrice,
        highest_bidder: bidderName || "אנונימי",
        bid_count: (product.bid_count || 0) + 1,
      });
      setProduct(p => ({ ...p, current_price: newPrice, highest_bidder: bidderName || "אנונימי", bid_count: (p.bid_count || 0) + 1 }));
      setBidAmount("");
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
    } catch {
      setBidError("שגיאה, נסה שנית");
    } finally {
      setBidding(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">מוצר לא נמצא</h2>
        <button onClick={() => navigate("/auctions")} className="text-sm" style={{ color: "#f700ff" }}>לכל המכרזים</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Back */}
      <div className="border-b border-gray-100 px-4 py-3">
        <button onClick={() => navigate("/auctions")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          חזרה למכרזים
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square">
            {product.image_url
              ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl">🏺</div>}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              {product.category && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold mb-2 inline-block"
                  style={{ background: "#f700ff15", color: "#f700ff" }}>{product.category}</span>
              )}
              <h1 className="text-2xl font-black text-gray-900 mt-1">{product.title}</h1>
              {product.condition && <p className="text-sm text-gray-400 mt-1">מצב: {product.condition}</p>}
            </div>

            {/* Timer */}
            <TimerBlock endsAt={product.ends_at} />

            {/* Price */}
            <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, #f700ff08, #9d00ff05)", border: "1px solid #f700ff22" }}>
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-xs text-gray-400">מחיר נוכחי</p>
                  <p className="text-3xl font-black text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">{product.bid_count || 0} הצעות</p>
                  {product.highest_bidder && (
                    <p className="text-xs font-semibold" style={{ color: "#9d00ff" }}>מוביל: {product.highest_bidder}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">מחיר התחלתי: ₪{(product.starting_price || 0).toLocaleString()}</p>
            </div>

            {/* Bid Form */}
            {!ended ? (
              <form onSubmit={handleBid} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">שמך (אופציונלי)</label>
                  <input value={bidderName} onChange={e => setBidderName(e.target.value)}
                    placeholder="הכנס שם"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">סכום הצעתך (₪)</label>
                  <input type="number" min={minBid} step="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                    placeholder={`מינימום ₪${minBid}`}
                    className="w-full px-4 py-3 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff22] transition-all text-right" />
                </div>
                {bidError && <p className="text-xs text-red-500">{bidError}</p>}
                {bidSuccess && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <CheckCircle className="h-4 w-4" /> הצעתך נרשמה בהצלחה!
                  </div>
                )}
                <button type="submit" disabled={bidding}
                  className="w-full text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)", boxShadow: "0 0 16px #f700ff44" }}>
                  {bidding
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> שולח...</>
                    : <><TrendingUp className="h-4 w-4" /> הגש הצעה</>}
                </button>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <Award className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                {product.highest_bidder
                  ? <><p className="font-bold text-gray-800">הזוכה: {product.highest_bidder}</p>
                     <p className="text-lg font-black mt-1" style={{ color: "#f700ff" }}>₪{(product.current_price || 0).toLocaleString()}</p></>
                  : <p className="text-sm text-gray-500">לא הוגשו הצעות</p>}
              </div>
            )}

            {/* Meta */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {product.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /><span>{product.location}</span>
                </div>
              )}
              {product.seller_name && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" /><span>מוכר: {product.seller_name}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">תיאור</p>
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}