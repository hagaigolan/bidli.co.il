import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, MapPin, Phone, Flame, Coins, Trash2, CheckCircle } from "lucide-react";

const CONDITION_COLORS = {
  "חדש":   { bg: "#00c85314", border: "#00c85355", color: "#00a35c" },
  "משומש": { bg: "#6aa3cd14", border: "#6aa3cd55", color: "#3e6b8a" },
  "תקין":  { bg: "#f59e0b14", border: "#f59e0b55", color: "#b45309" },
  "מקולקל": { bg: "#ef444414", border: "#ef444455", color: "#dc2626" },
};

export default function BarterCard({ item, isOwner, onCompleted, onDeleted }) {
  const navigate = useNavigate();
  const imgs = [...(item.image_urls || []), item.image_url].filter(Boolean);
  const img = imgs[0];
  const cond = CONDITION_COLORS[item.condition] || CONDITION_COLORS["תקין"];
  const waPhone = (item.owner_phone || "").replace(/[^0-9]/g, "").replace(/^0/, "972");
  const waLink = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(`היי ${item.owner_name || ""}, ראיתי את "${item.title}" בבארטר של bidli — מעניין אותי להחליף!`)}`
    : "";

  return (
    <article onClick={() => navigate(`/barter/${item.id}`)}
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      {/* Image */}
      <div className="relative h-44 bg-gray-50">
        {img
          ? <img src={img} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center">
              <ArrowLeftRight className="h-10 w-10 text-gray-300" aria-hidden="true" />
            </div>}
        <div className="absolute top-2 right-2 flex gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-black"
            style={{ background: cond.bg, border: `1px solid ${cond.border}`, color: cond.color }}>
            {item.condition}
          </span>
          {item.urgency === "דחוף" && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black text-white flex items-center gap-1"
              style={{ background: "linear-gradient(135deg, #ef4444, #e5893d)" }}>
              <Flame className="h-3 w-3" aria-hidden="true" /> דחוף
            </span>
          )}
        </div>
        {item.estimated_value > 0 && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-bold flex items-center gap-1">
            <Coins className="h-3 w-3" aria-hidden="true" />
            שווי מוערך ₪{Number(item.estimated_value).toLocaleString("he-IL")}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {item.category && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#3e6b8a10", color: "#3e6b8a" }}>{item.category}</span>}
        <h3 className="text-base font-black text-gray-900 mt-1.5 leading-snug">{item.title}</h3>
        {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}

        {/* Wanted in exchange — the swap block */}
        <div className="mt-3 rounded-xl p-3" style={{ background: "linear-gradient(135deg, #e5893d0a, #6aa3cd0a)", border: "1px dashed #e5893d44" }}>
          <p className="flex items-center gap-1.5 text-[11px] font-black" style={{ color: "#e5893d" }}>
            <ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />
            מבקש בתמורה
            {item.wanted_condition && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: (CONDITION_COLORS[item.wanted_condition] || cond).bg, color: (CONDITION_COLORS[item.wanted_condition] || cond).color }}>
                {item.wanted_condition}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-700 mt-1 whitespace-pre-line leading-relaxed">{item.wanted_description}</p>
          {!!(item.wanted_categories || []).length && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.wanted_categories.map(c => (
                <span key={c} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{c}</span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-2 text-[10px] font-bold text-gray-500">
            {item.allow_cash_topup && <span style={{ color: "#00a35c" }}>✓ נכון לתוספת כספית</span>}
            {item.open_to_other && <span>✓ פתוח להצעות אחרות</span>}
          </div>
        </div>

        {/* Owner + contact */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{item.owner_name || "אנונימי"}</p>
            {item.location && (
              <p className="text-[11px] text-gray-400 flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />{item.location}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {item.owner_phone && (
              <a href={`tel:${item.owner_phone}`} aria-label="שיחה" onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: "#3e6b8a10", color: "#3e6b8a" }}>
                <Phone className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {waLink && (
              <a href={waLink} target="_blank" rel="noopener noreferrer" aria-label="וואטסאפ" onClick={e => e.stopPropagation()}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:scale-105"
                style={{ background: "#25d366" }}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Owner tools */}
        {isOwner && item.status === "active" && (
          <div className="mt-2 flex gap-1.5">
            <button type="button" onClick={e => { e.stopPropagation(); onCompleted(); }}
              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 rounded-lg border transition-all hover:bg-green-50"
              style={{ borderColor: "#22c55e55", color: "#16a34a" }}>
              <CheckCircle className="h-3 w-3" aria-hidden="true" /> הוחלף בהצלחה
            </button>
            <button type="button" onClick={e => { e.stopPropagation(); onDeleted(); }} aria-label="מחיקה"
              className="w-8 rounded-lg border flex items-center justify-center transition-all hover:bg-red-50"
              style={{ borderColor: "#ef444455", color: "#ef4444" }}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}