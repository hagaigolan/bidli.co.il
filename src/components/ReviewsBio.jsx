import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Star, Store, ShoppingBag } from "lucide-react";

// ביוגרפיית חוות דעת — מציג את כל הדירוגים שאדם קיבל, מופרדים לפי תפקידו בעסקה: כמוכר או כקונה
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className="h-3.5 w-3.5" aria-hidden="true"
          fill={s <= rating ? "#f59e0b" : "none"}
          style={{ color: s <= rating ? "#f59e0b" : "#d1d5db" }} />
      ))}
    </div>
  );
}

function ReviewRow({ review }) {
  return (
    <div className="p-3.5 rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
        <div className="flex items-center gap-2">
          <Stars rating={review.rating} />
          {review.recommend != null && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={review.recommend
                ? { background: "#22c55e15", color: "#16a34a" }
                : { background: "#ef444415", color: "#dc2626" }}>
              {review.recommend ? "ממליץ ✓" : "לא ממליץ"}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {review.reviewer_name || "אנונימי"} ({review.reviewer_role === "seller" ? "כמוכר" : "כקונה"})
        </span>
      </div>
      {review.comment && <p className="text-sm text-gray-600 leading-relaxed mb-1.5">{review.comment}</p>}
      {review.product_id && (
        <Link to={`/auction/${review.product_id}`} className="text-xs hover:underline" style={{ color: "#e5893d" }}>
          {review.product_title || "צפה במכרז"}
        </Link>
      )}
    </div>
  );
}

function BioSection({ title, icon: Icon, reviews }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  const recCount = reviews.filter(r => r.recommend).length;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        <Icon className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        <h3 className="text-sm font-black text-gray-900">{title} ({reviews.length})</h3>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <Star className="h-3.5 w-3.5" fill="#f59e0b" style={{ color: "#f59e0b" }} aria-hidden="true" />
          ממוצע {avg.toFixed(1)}
        </span>
        <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>· {recCount} המלצות</span>
      </div>
      <div className="space-y-2">
        {reviews.map(r => <ReviewRow key={r.id} review={r} />)}
      </div>
    </div>
  );
}

export default function ReviewsBio({ email }) {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    if (!email) return;
    Promise.all([
      base44.entities.Review.filter({ reviewee_email: email }),
      base44.entities.Review.filter({ seller_email: email }),
    ])
      .then(([byReviewee, bySeller]) => {
        const map = new Map();
        [...byReviewee, ...bySeller].forEach(r => map.set(r.id, r));
        setReviews([...map.values()].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      })
      .catch(() => setReviews([]));
  }, [email]);

  if (!reviews || !reviews.length) return null;

  const asSeller = reviews.filter(r => (r.reviewee_role || "seller") === "seller");
  const asBuyer = reviews.filter(r => r.reviewee_role === "buyer");

  return (
    <div className="mb-6 p-4 rounded-2xl border border-gray-100" style={{ background: "#fafafa" }}>
      <h2 className="text-base font-black text-gray-900 mb-4">חוות דעת</h2>
      <BioSection title="כמוכר" icon={Store} reviews={asSeller} />
      <BioSection title="כקונה" icon={ShoppingBag} reviews={asBuyer} />
    </div>
  );
}