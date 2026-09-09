import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Star, Award, BadgeCheck, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from "lucide-react";

// Renders star rating visually
export function StarRating({ rating, size = "sm" }) {
  const stars = [1, 2, 3, 4, 5];
  const sz = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {stars.map(s => (
        <Star key={s} className={sz}
          fill={s <= Math.round(rating) ? "#f59e0b" : "none"}
          style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }} />
      ))}
    </div>
  );
}

// The trust badge shown on product/seller listings
export function SellerTrustBadge({ sellerEmail, sellerName, compact = false }) {
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    if (!sellerEmail) return;
    base44.entities.Review.filter({ seller_email: sellerEmail }, "-created_date", 100)
      .then(reviews => {
        setReviews(reviews);
        if (!reviews.length) { setStats({ count: 0, avg: 0, positive: 0, negative: 0, neutral: 0, positivePct: 0, negativePct: 0 }); return; }
        const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        const positive = reviews.filter(r => (r.rating || 0) >= 4).length;
        const negative = reviews.filter(r => (r.rating || 0) <= 2).length;
        const neutral = reviews.length - positive - negative;
        setStats({
          count: reviews.length,
          avg: parseFloat(avg.toFixed(1)),
          positive,
          negative,
          neutral,
          positivePct: Math.round((positive / reviews.length) * 100),
          negativePct: Math.round((negative / reviews.length) * 100),
        });
      }).catch(() => {});
  }, [sellerEmail]);

  if (!stats) return null;

  const isTopSeller = stats.count >= 5 && stats.avg >= 4.5;
  const isVerified = stats.count >= 1;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {isTopSeller && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #f59e0b22, #f59e0b11)", color: "#b45309", border: "1px solid #f59e0b44" }}>
            <Award className="h-3 w-3" /> מוכר מומלץ
          </span>
        )}
        {isVerified && (
          <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#00c85310", color: "#00a846", border: "1px solid #00c85344" }}>
            <BadgeCheck className="h-3 w-3" /> מאומת
          </span>
        )}
        {stats.count > 0 && (
          <span className="flex items-center gap-1 text-xs text-gray-600">
            <StarRating rating={stats.avg} size="sm" />
            <span className="font-bold">{stats.avg}</span>
            <span className="text-gray-400">({stats.count})</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-4 space-y-3"
      style={{ background: "linear-gradient(135deg, #f9fafb, #ffffff)", borderColor: isTopSeller ? "#f59e0b44" : "#e5e7eb" }}>
      {/* Seller identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
          style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
          {(sellerName || sellerEmail || "?")[0].toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">{sellerName || sellerEmail}</p>
          <p className="text-xs text-gray-400">מוכר ב-bidli</p>
        </div>
        {isTopSeller && (
          <div className="mr-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black"
            style={{ background: "linear-gradient(135deg, #f59e0b, #f97316)", color: "white", boxShadow: "0 0 12px #f59e0b55" }}>
            <Award className="h-3.5 w-3.5" /> מוכר מומלץ
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-base font-black text-gray-900">{stats.count}</p>
          <p className="text-xs text-gray-400">דירוגים</p>
        </div>
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-base font-black" style={{ color: "#f59e0b" }}>{stats.avg || "–"}</p>
          <p className="text-xs text-gray-400">ממוצע</p>
        </div>
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          {isVerified
            ? <p className="text-base font-black text-green-600 flex items-center justify-center gap-1"><ShieldCheck className="h-4 w-4" /></p>
            : <p className="text-base font-black text-gray-400">–</p>}
          <p className="text-xs text-gray-400">אמינות</p>
        </div>
      </div>

      {/* Star rating bar */}
      {stats.count > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={stats.avg} size="md" />
          <span className="text-sm font-black text-gray-800">{stats.avg}</span>
          <span className="text-xs text-gray-400">מתוך {stats.count} עסקאות</span>
        </div>
      )}

      {/* Positive / negative summary */}
      {stats.count > 0 && (
        <div className="p-3 rounded-xl bg-white border border-gray-100" dir="rtl">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="h-4 w-4" style={{ color: "#16a34a" }} aria-hidden="true" />
              <span className="text-xs font-bold text-gray-700">חיוביים</span>
              <span className="text-xs font-black" style={{ color: "#16a34a" }}>{stats.positive}</span>
              <span className="text-xs font-bold" style={{ color: "#16a34a" }}>({stats.positivePct}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400">ניטרליים: {stats.neutral}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: "#dc2626" }}>({stats.negativePct}%)</span>
              <span className="text-xs font-black" style={{ color: "#dc2626" }}>{stats.negative}</span>
              <span className="text-xs font-bold text-gray-700">שליליים</span>
              <ThumbsDown className="h-4 w-4" style={{ color: "#dc2626" }} aria-hidden="true" />
            </div>
          </div>
          {/* Proportion bar: positive vs negative vs neutral */}
          <div className="w-full h-2.5 rounded-full overflow-hidden flex" role="img"
            aria-label={`${stats.positivePct}% דירוגים חיוביים, ${stats.negativePct}% שליליים`}>
            <div style={{ width: `${stats.positivePct}%`, background: "#22c55e" }} />
            <div style={{ width: `${Math.max(0, 100 - stats.positivePct - stats.negativePct)}%`, background: "#d1d5db" }} />
            <div style={{ width: `${stats.negativePct}%`, background: "#ef4444" }} />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {stats.positive + stats.negative > 0
              ? `${stats.positivePct}% חיובי מול ${stats.negativePct}% שלילי מתוך סך הדירוגים`
              : "כל הדירוגים ניטרליים"}
          </p>
        </div>
      )}

      {/* Trust signals */}
      <div className="flex flex-wrap gap-2">
        {isVerified && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: "#00c85310", color: "#00a846", border: "1px solid #00c85333" }}>
            <BadgeCheck className="h-3 w-3" /> מאומת
          </span>
        )}
        {isTopSeller && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
            style={{ background: "#f59e0b10", color: "#b45309", border: "1px solid #f59e0b33" }}>
            <Award className="h-3 w-3" /> ציון 4.5+
          </span>
        )}
        <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold"
          style={{ background: "#3b82f610", color: "#2563eb", border: "1px solid #3b82f633" }}>
          <ShieldCheck className="h-3 w-3" /> תשלום מוגן
        </span>
      </div>

      {/* Reviews list toggle */}
      {reviews.length > 0 && (
        <div>
          <button onClick={() => setShowReviews(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors">
            {showReviews ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showReviews ? "הסתר ביקורות" : `הצג ${reviews.length} ביקורות`}
          </button>
          {showReviews && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {reviews.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100" dir="rtl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
                        {(r.reviewer_name || "א")[0]}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{r.reviewer_name || "אנונימי"}</span>
                    </div>
                    <StarRating rating={r.rating} size="sm" />
                  </div>
                  {r.comment && <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>}
                  <p className="text-xs text-gray-300 mt-1">{new Date(r.created_date).toLocaleDateString("he-IL")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}