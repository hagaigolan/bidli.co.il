import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, X, CheckCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

// דירוג הדדי לאחר מסירת המוצר לקונה —
// direction "buyer" = הקונה מדרג את המוכר, direction "seller" = המוכר מדרג את הקונה
export default function ReviewModal({ product, reviewerName, reviewerEmail, direction = "buyer", onClose, onDone }) {
  const { user: authUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);
  const [selfBlocked, setSelfBlocked] = useState(false);

  const isBuyerDir = direction === "buyer";
  const reviewee = isBuyerDir
    ? { email: product.seller_email || "", name: product.seller_name || product.seller_email, role: "seller", label: "המוכר" }
    : { email: product.highest_bidder_email || "", name: product.highest_bidder || "הקונה", role: "buyer", label: "הקונה" };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      // חסימת דירוג עצמי — רק הצד השני בעסקה יכול לדרג
      const knownEmails = [...new Set([
        (reviewerEmail || "").trim().toLowerCase(),
        (authUser?.email || "").trim().toLowerCase(),
      ].filter(Boolean))];
      const revieweeEmail = (reviewee.email || "").trim().toLowerCase();
      if ((revieweeEmail && knownEmails.includes(revieweeEmail)) ||
          (reviewee.name && reviewerName && reviewee.name.trim() === reviewerName.trim())) {
        setSelfBlocked(true);
        setTimeout(onClose, 2000);
        return;
      }
      // דירוג אחד לכל כיוון בכל מכרז
      const existing = await base44.entities.Review.filter({ product_id: product.id });
      const isMine = r =>
        knownEmails.includes((r.reviewer_email || "").trim().toLowerCase()) ||
        (reviewerName && r.reviewer_name === reviewerName.trim());
      const dirOf = r => r.reviewer_role || "buyer";
      if (existing.some(r => isMine(r) && dirOf(r) === (isBuyerDir ? "buyer" : "seller"))) {
        setAlready(true);
        onDone?.();
        setTimeout(onClose, 1500);
        return;
      }
      await base44.entities.Review.create({
        product_id: product.id,
        product_title: product.title,
        seller_email: product.seller_email || "",
        seller_name: product.seller_name || "",
        reviewee_email: reviewee.email,
        reviewee_name: reviewee.name,
        reviewee_role: reviewee.role,
        reviewer_name: reviewerName || "אנונימי",
        reviewer_email: reviewerEmail || "",
        reviewer_role: isBuyerDir ? "buyer" : "seller",
        rating,
        comment,
        recommend,
      });
      setDone(true);
      onDone?.();
      setTimeout(onClose, 2000);
    } catch {
      setSubmitting(false);
    }
  };

  const recBtn = (val, activeStyles, label, Icon) => (
    <button type="button" onClick={() => setRecommend(val)} aria-pressed={recommend === val}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold border transition-all"
      style={recommend === val ? activeStyles : { borderColor: "#e5e7eb", color: "#6b7280", background: "white" }}>
      <Icon className="h-4 w-4" aria-hidden="true" /> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">דרג את {reviewee.label === "המוכר" ? "המוכר" : "הקונה"}</h2>
          <button onClick={onClose} aria-label="סגירה"><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        {selfBlocked ? (
          <div className="text-center py-6">
            <Star className="h-12 w-12 mx-auto mb-3" style={{ color: "#d1d5db" }} aria-hidden="true" />
            <p className="font-bold text-gray-800">לא ניתן לדרג את עצמך</p>
            <p className="text-sm text-gray-400 mt-1">רק הצד השני בעסקה יכול לדרג</p>
          </div>
        ) : already ? (
          <div className="text-center py-6">
            <Star className="h-12 w-12 mx-auto mb-3" style={{ color: "#f59e0b" }} aria-hidden="true" />
            <p className="font-bold text-gray-800">כבר דירגת את {reviewee.label} במכרז זה</p>
            <p className="text-sm text-gray-400 mt-1">ניתן לדרג פעם אחת בלבד בכל מכרז</p>
          </div>
        ) : done ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" aria-hidden="true" />
            <p className="font-bold text-gray-800">תודה על הדירוג!</p>
            <p className="text-sm text-gray-400 mt-1">הדירוג שלך עוזר לקהילה</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-1">{reviewee.label}: <span className="font-semibold text-gray-800">{reviewee.name}</span></p>
            <p className="text-sm text-gray-500 mb-4">פריט: <span className="font-semibold text-gray-800">{product.title}</span></p>

            {/* Star picker */}
            <div className="flex items-center gap-1 justify-center mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  aria-label={`${s} כוכבים`}>
                  <Star className="h-8 w-8 transition-all"
                    fill={(hovered || rating) >= s ? "#f59e0b" : "none"}
                    style={{ color: (hovered || rating) >= s ? "#f59e0b" : "#d1d5db" }} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-semibold text-gray-600 mb-4">
              {["","גרוע","לא טוב","בסדר","טוב מאוד","מעולה!"][hovered || rating]}
            </p>

            {/* המלצה */}
            <p className="text-sm font-semibold text-gray-700 mb-2 text-center">האם תמליץ {isBuyerDir ? "על המוכר" : "על הקונה"}?</p>
            <div className="flex gap-2 mb-4">
              {recBtn(true, { borderColor: "#22c55e", color: "#16a34a", background: "#22c55e0d" }, "כן, ממליץ", ThumbsUp)}
              {recBtn(false, { borderColor: "#ef4444", color: "#dc2626", background: "#ef44440d" }, "לא ממליץ", ThumbsDown)}
            </div>

            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="ספר על החוויה שלך (אופציונלי)..."
              rows={3}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right resize-none mb-4" />

            <button onClick={handleSubmit} disabled={submitting || !rating}
              className="w-full text-white py-3 rounded-xl font-bold disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              {submitting ? "שולח..." : "שלח דירוג"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}