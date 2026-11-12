import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { ArrowRight, MapPin, Clock3, TrendingDown, CheckCircle2, AlertCircle, Zap, ShieldCheck, XCircle, Phone } from "lucide-react";
import DealCountdown from "@/components/lastminute/DealCountdown";
import DealShare from "@/components/lastminute/DealShare";
import DemoNotice from "@/components/lastminute/DemoNotice";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import { businessIcon } from "@/components/lastminute/businessIcon";
import useNow from "@/lib/useNow";
import { dealPriceAt, savingsPercent, dealStatus, dealProgress, formatSlotTime, dropPerHour, RESCUE_FEE_RATE } from "@/lib/lastMinute";

const BUY_ERRORS = {
  deal_closed: "החלון הזה כבר נתפס על ידי מישהו אחר — בדוק את שאר המכרזים הפתוחים.",
  auction_ended: "הזמן נגמר והמכרז נסגר. אפשר לתפוס חלון אחר שעוד פתוח.",
  own_deal: "זה החלון שלך — אי אפשר לקנות אותו בעצמך.",
};

export default function LastMinuteDetail() {
  const { id } = useParams();
  const now = useNow();
  const { user, isAuthenticated } = useAuth();
  const [deal, setDeal] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [error, setError] = useState("");
  const [justBought, setJustBought] = useState(false);

  useEffect(() => {
    base44.entities.LastMinuteDeal.get(id)
      .then(setDeal)
      .catch(() => setDeal(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (deal?.title) document.title = `${deal.title} — מכרז הפוך | bidli`;
  }, [deal?.title]);

  // פרטי הקשר (כתובת, טלפון, פירוט עמלה) יושבים ברשומה פרטית שנפתחת לעסק ולקונה בלבד
  useEffect(() => {
    if (!deal?.id || !user?.id) return;
    if (deal.created_by_id !== user.id && deal.buyer_user_id !== user.id) return;
    base44.entities.LastMinuteBooking.filter({ deal_id: deal.id })
      .then(res => {
        const rows = Array.isArray(res) ? res : (res?.items || []);
        setBooking(rows[0] || null);
      })
      .catch(() => {});
  }, [deal?.id, deal?.created_by_id, deal?.buyer_user_id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#e5893d] rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center">
          <h1 className="text-xl font-black text-gray-900">המכרז לא נמצא</h1>
          <p className="text-sm text-gray-500 mt-1 mb-4">יכול להיות שהחלון נסגר ונמחק.</p>
          <Link to="/last-minute" className="text-sm font-bold px-5 py-2.5 rounded-xl text-white inline-block"
            style={{ background: "linear-gradient(135deg,#e5893d,#3e6b8a)" }}>
            כל המכרזים
          </Link>
        </div>
      </div>
    );
  }

  const status = dealStatus(deal, now);
  const price = status === "sold" ? Number(deal.sold_price) || dealPriceAt(deal, now) : dealPriceAt(deal, now);
  const list = Number(deal.list_price) || 0;
  const floor = Number(deal.floor_price) || 0;
  const pct = savingsPercent(deal, price);
  const saved = Math.max(0, list - price);
  const progress = dealProgress(deal, now);
  const Icon = businessIcon(deal.business_type);
  const isOwner = !!user?.id && deal.created_by_id === user.id;
  const buyerIsMe = !!user?.id && deal.buyer_user_id === user.id;

  const buy = async () => {
    if (deal.is_demo) return;
    if (!isAuthenticated) { setShowLogin(true); return; }
    setBuying(true);
    setError("");
    try {
      const res = await base44.functions.invoke("claimLastMinuteDeal", { deal_id: deal.id });
      if (res?.data?.deal) {
        setDeal(res.data.deal);
        setJustBought(true);
      }
    } catch (e) {
      const code = e?.response?.data?.error;
      setError(BUY_ERRORS[code] || "לא הצלחנו לסגור את העסקה. נסה שוב.");
      const fresh = await base44.entities.LastMinuteDeal.get(deal.id).catch(() => null);
      if (fresh) setDeal(fresh);
    } finally {
      setBuying(false);
    }
  };

  const cancelDeal = async () => {
    const updated = await base44.entities.LastMinuteDeal.update(deal.id, {
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
    });
    setDeal(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Link to="/last-minute" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#e5893d] mb-4">
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /> חזרה לכל המכרזים
        </Link>

        {deal.is_demo && <DemoNotice className="mb-4" />}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* ── תוכן ── */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#e5893d,#3e6b8a)" }}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-400">{deal.business_type}</p>
                  <p className="text-sm font-black text-gray-800">{deal.business_name}</p>
                  {deal.city && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" aria-hidden="true" /> {deal.city}
                    </p>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-black text-gray-900 mt-4 leading-snug">{deal.title}</h1>
              {deal.description && (
                <p className="text-sm text-gray-600 leading-relaxed mt-2 whitespace-pre-line">{deal.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">מועד השירות</p>
                  <p className="text-sm font-black text-gray-800">{formatSlotTime(deal.slot_start)}</p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">משך</p>
                  <p className="text-sm font-black text-gray-800">{deal.duration_minutes || 60} דקות</p>
                </div>
                {(buyerIsMe || isOwner) && booking?.address && (
                  <div className="rounded-xl bg-gray-50 px-3 py-2.5 col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold mb-0.5">כתובת</p>
                    <p className="text-sm font-black text-gray-800">{booking.address}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-black text-gray-900 mb-2 flex items-center gap-1.5">
                <Zap className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" /> איך המכרז ההפוך עובד
              </h2>
              <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
                <li>המחיר מתחיל במחירון (₪{list.toLocaleString("he-IL")}) ויורד בהדרגה עד רצפת המחיר (₪{floor.toLocaleString("he-IL")}).</li>
                <li>מי שלוחץ "קנה עכשיו" סוגר את החלון במחיר שמופיע באותו רגע — הראשונים תופסים.</li>
                <li>כשהמכרז נסגר או שהחלון נתפס, המחיר מפסיק לרדת. הזמן הוא המלאי.</li>
                <li className="flex items-start gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#00a844" }} aria-hidden="true" />
                  העסק משלם עמלת הצלה של {RESCUE_FEE_RATE}% רק על עסקה שנסגרה — ולכן המחיר כאן אגרסיבי.
                </li>
              </ul>
            </div>

            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-black text-gray-900 mb-2">ניהול החלון שלך</h2>
                {status === "sold" ? (
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>נמכר ב-₪{Number(deal.sold_price || 0).toLocaleString("he-IL")} ל-{booking?.buyer_name || "קונה"}.</p>
                    <p>
                      עמלת הצלה: ₪{Number(booking?.platform_fee || 0).toLocaleString("he-IL")} ·
                      לתשלום לך: ₪{Number(booking?.business_payout || 0).toLocaleString("he-IL")}
                    </p>
                    {booking?.buyer_phone && (
                      <p className="flex items-center gap-1"><Phone className="h-3 w-3" aria-hidden="true" /> {booking.buyer_phone}</p>
                    )}
                  </div>
                ) : status === "active" ? (
                  <button type="button" onClick={cancelDeal}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 transition-all">
                    בטל את המכרז
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">החלון לא נתפס בזמן.</p>
                )}
              </div>
            )}
          </div>

          {/* ── פאנל מחיר ── */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4 rounded-2xl overflow-hidden text-white"
              style={{ background: "linear-gradient(135deg,#18181b 0%,#2d4f68 60%,#3e6b8a 100%)" }}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[11px] font-bold text-white/60">
                    {status === "sold" ? "המחיר שנסגר" : status === "active" ? "המחיר עכשיו" : "המחיר האחרון"}
                  </p>
                  {pct > 0 && (
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5"
                      style={{ background: "#00a844", color: "#fff" }}>
                      <TrendingDown className="h-3 w-3" aria-hidden="true" /> {pct}%
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black tabular-nums leading-none" style={{ color: status === "sold" ? "#fff" : "#e5893d" }}>
                    ₪{price.toLocaleString("he-IL")}
                  </p>
                  {list > price && <p className="text-sm text-white/40 line-through mb-1">₪{list.toLocaleString("he-IL")}</p>}
                </div>
                {saved > 0 && (
                  <p className="text-[11px] text-white/70 mt-1">חוסך ₪{saved.toLocaleString("he-IL")} מהמחירון</p>
                )}

                <div className="mt-4">
                  {status === "active" ? (
                    <DealCountdown endsAt={deal.auction_ends_at} now={now} size="lg" />
                  ) : (
                    <p className="text-sm font-bold text-white/80">
                      {status === "sold" ? "החלון נתפס" : status === "cancelled" ? "המכרז בוטל" : "הזמן נגמר"}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round(progress * 100)}%`, background: "linear-gradient(90deg,#e5893d,#6aa3cd)" }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/50 mt-1">
                    <span>רצפה ₪{floor.toLocaleString("he-IL")}</span>
                    <span>יורד ב-₪{dropPerHour(deal).toLocaleString("he-IL")} לשעה</span>
                  </div>
                </div>

                {status === "active" && deal.is_demo && (
                  <div className="mt-4 rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <p className="text-sm font-bold">מכרז הדגמה — לא ניתן לרכוש</p>
                    <p className="text-[11px] text-white/60 mt-1">המחיר והטיימר אמיתיים, אבל זהו חלון לדוגמה בלבד.</p>
                  </div>
                )}

                {status === "active" && !deal.is_demo && (
                  <>
                    {error && (
                      <div className="mt-4 rounded-xl px-3 py-2 text-[11px] font-bold flex items-start gap-1.5"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#fecaca" }}>
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" /> {error}
                      </div>
                    )}
                    <button type="button" onClick={buy} disabled={buying}
                      className="mt-4 w-full text-sm font-black py-3.5 rounded-xl disabled:opacity-60 transition-all hover:opacity-90"
                      style={{ background: "#e5893d", color: "#fff", boxShadow: "0 0 24px #e5893d66" }}>
                      {buying ? "תופס את החלון..." : `קנה עכשיו ב-₪${price.toLocaleString("he-IL")}`}
                    </button>
                    <p className="text-[10px] text-white/40 text-center mt-2">
                      המחיר ממשיך לרדת עד שייתפס — או עד שהטיימר יגיע לאפס
                    </p>
                  </>
                )}

                {status === "sold" && (
                  <div className="mt-4 space-y-3">
                    {buyerIsMe ? (
                      <div className="rounded-xl px-3 py-3" style={{ background: "rgba(0,168,68,0.18)", border: "1px solid rgba(0,168,68,0.4)" }}>
                        <p className="text-sm font-black flex items-center gap-1.5" style={{ color: "#86efac" }}>
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          {justBought ? "החלון שלך!" : "רכשת את החלון הזה"}
                        </p>
                        <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
                          {formatSlotTime(deal.slot_start)} · {deal.business_name}
                          {booking?.address ? ` · ${booking.address}` : ""}
                          {booking?.business_phone ? ` · ${booking.business_phone}` : ""}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <p className="text-sm font-bold flex items-center gap-1.5">
                          <XCircle className="h-4 w-4" aria-hidden="true" /> החלון נתפס
                        </p>
                        <p className="text-[11px] text-white/60 mt-1">מישהו הקדים — יש חלונות אחרים שעוד פתוחים.</p>
                      </div>
                    )}
                    <DealShare deal={deal} price={price} />
                  </div>
                )}

                {status === "expired" && (
                  <div className="mt-4 rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <p className="text-sm font-bold flex items-center gap-1.5">
                      <Clock3 className="h-4 w-4" aria-hidden="true" /> הזמן נגמר
                    </p>
                    <p className="text-[11px] text-white/60 mt-1">החלון הזה לא נתפס בזמן. אפשר לתפוס את הבא בתור.</p>
                  </div>
                )}

                {status === "cancelled" && (
                  <div className="mt-4 rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <p className="text-sm font-bold">המכרז בוטל על ידי העסק</p>
                  </div>
                )}
              </div>
            </div>

            {status === "active" && (
              <div className="mt-3">
                <DealShare deal={deal} price={price} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showLogin && <LoginRequiredModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}