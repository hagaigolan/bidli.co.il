import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeftRight, ArrowRight, MapPin, Phone, Flame, Coins, CheckCircle, Trash2, Award } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import ImageSlider from "@/components/ImageSlider";
import RelatedProducts from "@/components/RelatedProducts";

const CONDITION_COLORS = {
  "חדש":   { bg: "#00c85314", border: "#00c85355", color: "#00a35c" },
  "משומש": { bg: "#6aa3cd14", border: "#6aa3cd55", color: "#3e6b8a" },
  "תקין":  { bg: "#f59e0b14", border: "#f59e0b55", color: "#b45309" },
  "מקולקל": { bg: "#ef444414", border: "#ef444455", color: "#dc2626" },
};

export default function BarterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);        // הוחלף בהצלחה
  const [gone, setGone] = useState(false);        // נמחק

  useEffect(() => {
    base44.entities.BarterItem.get(id)
      .then(setItem)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const myEmail = (authUser?.email || "").trim().toLowerCase();
  const isOwner = !!item && (item.owner_email || "").trim().toLowerCase() === myEmail;

  const markCompleted = async () => {
    await base44.entities.BarterItem.update(item.id, { status: "completed" });
    setDone(true);
  };
  const deleteItem = async () => {
    await base44.entities.BarterItem.delete(item.id);
    setGone(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  if (!item || gone) return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-5xl mb-4">🤝</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">פריט הבארטר לא נמצא</h2>
        <button onClick={() => navigate("/barter")} className="text-sm" style={{ color: "#e5893d" }}>חזרה לבורסת הבארטר</button>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="text-center max-w-sm px-4">
        <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#00c85314" }}>
          <CheckCircle className="h-8 w-8" style={{ color: "#00a35c" }} aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">מזל טוב על ההחלפה! 🎉</h2>
        <p className="text-sm text-gray-500 mb-4">הפריט סומן כ"הוחלף בהצלחה" והוסר מבורסת הבארטר הפעילה.</p>
        <button onClick={() => navigate("/barter")} className="btn-neon text-white text-sm font-bold px-6 py-3 rounded-xl">
          חזרה לבורסת הבארטר
        </button>
      </div>
    </div>
  );

  const imgs = [...(item.image_urls || []), item.image_url].filter(Boolean);
  const cond = CONDITION_COLORS[item.condition] || CONDITION_COLORS["תקין"];
  const waPhone = (item.owner_phone || "").replace(/[^0-9]/g, "").replace(/^0/, "972");
  const waLink = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`היי ${item.owner_name || ""}, ראיתי את "${item.title}" בבארטר של bidli — מעניין אותי להחליף!`)}`
    : "";

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Back */}
      <div className="border-b border-gray-100 px-4 py-3">
        <button onClick={() => navigate("/barter")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          חזרה לבורסת הבארטר
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <ImageSlider images={imgs} alt={item.title} />
            {item.urgency === "דחוף" && (
              <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-bold"
                style={{ background: "#ef44440a", border: "1px solid #ef444455", color: "#dc2626" }}>
                <Flame className="h-4 w-4" aria-hidden="true" /> פריט דחוף — הבעלים מעוניין בהחלפה מהירה
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              {item.category && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold inline-block" style={{ background: "#3e6b8a10", color: "#3e6b8a" }}>{item.category}</span>
              )}
              <h1 className="text-2xl font-black text-gray-900 mt-1.5">{item.title}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full font-black" style={{ background: cond.bg, border: `1px solid ${cond.border}`, color: cond.color }}>
                  מצב: {item.condition}
                </span>
                {item.estimated_value > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-black flex items-center gap-1" style={{ background: "#e5893d0f", border: "1px solid #e5893d33", color: "#e5893d" }}>
                    <Coins className="h-3 w-3" aria-hidden="true" /> שווי מוערך ₪{Number(item.estimated_value).toLocaleString("he-IL")}
                  </span>
                )}
              </div>
            </div>

            {/* Wanted block */}
            <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #e5893d0a, #6aa3cd0a)", border: "1px dashed #e5893d44" }}>
              <p className="flex items-center gap-1.5 text-sm font-black" style={{ color: "#e5893d" }}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                מה מבקשים בתמורה
                {item.wanted_condition && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: (CONDITION_COLORS[item.wanted_condition] || cond).bg, color: (CONDITION_COLORS[item.wanted_condition] || cond).color }}>
                    {item.wanted_condition}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700 mt-2 whitespace-pre-line leading-relaxed">{item.wanted_description}</p>
              {!!(item.wanted_categories || []).length && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.wanted_categories.map(c => (
                    <span key={c} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600">{c}</span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-3 text-xs font-bold text-gray-500">
                {item.allow_cash_topup && <span style={{ color: "#00a35c" }}>✓ נכון לתוספת כספית</span>}
                {item.open_to_other && <span>✓ פתוח להצעות החלפה אחרות</span>}
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-1.5">תיאור הפריט</p>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {/* Owner + contact */}
            <div className="rounded-2xl p-4 border border-gray-100" style={{ background: "#f9fafb" }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-black text-gray-900">{item.owner_name || "אנונימי"}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    {item.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{item.location}</span>
                    )}
                    {item.owner_phone && <span dir="ltr">{item.owner_phone}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.owner_phone && (
                    <a href={`tel:${item.owner_phone}`}
                      className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                      style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" /> שיחה
                    </a>
                  )}
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:opacity-90"
                      style={{ background: "#25d366", boxShadow: "0 0 12px #25d36655" }}>
                      <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" /> פנה להחלפה
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Owner tools */}
            {isOwner && (
              <div className="flex gap-2">
                <button type="button" onClick={markCompleted}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-xl border transition-all hover:bg-green-50"
                  style={{ borderColor: "#22c55e55", color: "#16a34a" }}>
                  <CheckCircle className="h-4 w-4" aria-hidden="true" /> הוחלף בהצלחה
                </button>
                <button type="button" onClick={deleteItem} aria-label="מחיקת הפריט"
                  className="w-12 rounded-xl border flex items-center justify-center transition-all hover:bg-red-50"
                  style={{ borderColor: "#ef444455", color: "#ef4444" }}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related auctions in the same category */}
      {item.category && (
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <RelatedProducts category={item.category} excludeId={item.id} />
        </div>
      )}
    </div>
  );
}