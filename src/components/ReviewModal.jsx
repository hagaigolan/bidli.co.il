import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Star, X, CheckCircle } from "lucide-react";

export default function ReviewModal({ product, reviewerName, reviewerEmail, onClose, onDone }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [already, setAlready] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      // דירוג אחד בלבד לכל מכרז
      const existing = await base44.entities.Review.filter({ product_id: product.id });
      const myEmail = (reviewerEmail || "").trim().toLowerCase();
      const dup = existing.some(r =>
        (myEmail && (r.reviewer_email || "").trim().toLowerCase() === myEmail) ||
        (reviewerName && r.reviewer_name === reviewerName));
      if (dup) {
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
        reviewer_name: reviewerName || "אנונימי",
        reviewer_email: reviewerEmail || "",
        rating,
        comment,
      });
      setDone(true);
      onDone?.();
      setTimeout(onClose, 2000);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900">דרג את המוכר</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>

        {already ? (
          <div className="text-center py-6">
            <Star className="h-12 w-12 mx-auto mb-3" style={{ color: "#f59e0b" }} aria-hidden="true" />
            <p className="font-bold text-gray-800">כבר דירגת את המוכר במכרז זה</p>
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
            <p className="text-sm text-gray-500 mb-1">מוכר: <span className="font-semibold text-gray-800">{product.seller_name || product.seller_email}</span></p>
            <p className="text-sm text-gray-500 mb-4">פריט: <span className="font-semibold text-gray-800">{product.title}</span></p>

            {/* Star picker */}
            <div className="flex items-center gap-1 justify-center mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}>
                  <Star className="h-8 w-8 transition-all"
                    fill={(hovered || rating) >= s ? "#f59e0b" : "none"}
                    style={{ color: (hovered || rating) >= s ? "#f59e0b" : "#d1d5db" }} />
                </button>
              ))}
            </div>
            <p className="text-center text-sm font-semibold text-gray-600 mb-4">
              {["","גרוע","לא טוב","בסדר","טוב מאוד","מעולה!"][hovered || rating]}
            </p>

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