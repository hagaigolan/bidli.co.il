import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MobileSelect from "@/components/MobileSelect";
import DealShare from "@/components/lastminute/DealShare";
import { BUSINESS_TYPES, RESCUE_FEE_RATE } from "@/lib/lastMinute";

const AUCTION_HOURS = ["1", "2", "4", "8", "12"];
const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-right focus:outline-none focus:border-[#e5893d88]";
const labelClass = "block text-xs font-bold text-gray-600 mb-1";

// הזנת ה"זמן המת": השירות, חלון הזמן שהתפנה, מחיר המחירון ורצפת המחיר.
// מרגע הפרסום המכרז ההפוך רץ לבד — המחיר יורד עד הרצפה עד סגירת החלון.
export default function AddSlotModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    business_name: user?.full_name || "",
    business_type: BUSINESS_TYPES[1],
    title: "",
    description: "",
    city: "",
    address: "",
    slot_start: "",
    duration_minutes: "60",
    list_price: "",
    floor_price: "",
    owner_phone: "",
  });
  const [auctionHours, setAuctionHours] = useState("4");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));

  const submit = async () => {
    const errs = {};
    if (!form.business_name.trim()) errs.business_name = "שם העסק חסר";
    if (!form.title.trim()) errs.title = "מה השירות שהתפנה?";
    if (!form.slot_start) errs.slot_start = "מתי החלון הפנוי?";
    const list = Number(form.list_price);
    const floor = Number(form.floor_price);
    if (!list || list <= 0) errs.list_price = "מחיר המחירון חסר";
    if (!floor || floor <= 0) errs.floor_price = "רצפת המחיר חסרה";
    if (list && floor && floor >= list) errs.floor_price = "הרצפה חייבת להיות נמוכה ממחיר המחירון";
    if (form.slot_start) {
      const endMs = Date.now() + Number(auctionHours) * 3600000;
      if (new Date(form.slot_start).getTime() <= endMs) {
        errs.slot_start = "המכרז חייב להסתיים לפני מועד השירות — בחר חלון זמן מאוחר יותר או מכרז קצר יותר";
      }
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const start = Date.now();
      const deal = await base44.entities.LastMinuteDeal.create({
        business_name: form.business_name.trim().slice(0, 120),
        business_type: form.business_type,
        title: form.title.trim().slice(0, 160),
        description: form.description.trim().slice(0, 1000),
        city: form.city.trim().slice(0, 80),
        slot_start: new Date(form.slot_start).toISOString(),
        duration_minutes: Number(form.duration_minutes) || 60,
        auction_starts_at: new Date(start).toISOString(),
        auction_ends_at: new Date(start + Number(auctionHours) * 3600000).toISOString(),
        list_price: Number(form.list_price),
        floor_price: Number(form.floor_price),
        fee_rate: RESCUE_FEE_RATE,
        status: "active",
      });
      // כתובת וטלפון העסק נשמרים ברשומה פרטית — נחשפים רק לעסק ולקונה
      await base44.entities.LastMinuteBooking.create({
        deal_id: deal.id,
        deal_title: deal.title,
        business_name: deal.business_name,
        slot_start: deal.slot_start,
        address: form.address.trim().slice(0, 200),
        business_phone: form.owner_phone.trim().slice(0, 40),
      });
      setCreated(deal);
      onSaved?.(deal);
    } catch {
      setErrors({ submit: "הפרסום לא נשמר. נסה שוב בעוד רגע." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)" }} role="dialog" aria-modal="true" aria-label="פתיחת חלון פנוי">
      <div className="bg-white rounded-2xl w-full max-w-lg my-4 relative" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#e5893d,#3e6b8a)" }}>
              <Zap className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 leading-tight">חלון זמן התפנה?</h2>
              <p className="text-[11px] text-gray-400">הפוך ביטול להכנסה — המחיר יורד עד שייתפס</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {created ? (
          <div className="p-5">
            <div className="rounded-xl px-4 py-3 mb-4 flex items-start gap-2"
              style={{ background: "#00a84410", border: "1px solid #00a84433" }}>
              <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#00a844" }} aria-hidden="true" />
              <p className="text-sm font-bold text-gray-700">
                המכרז ההפוך באוויר. שלח את הקישור לקבוצות שלך — החלון נתפס מהר יותר ככל שיותר עיניים רואות אותו.
              </p>
            </div>
            <DealShare deal={created} price={Number(created.list_price)} />
            <Link to={`/last-minute/${created.id}`}
              className="mt-3 block text-center text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#e5893d,#3e6b8a)" }}>
              צפה במכרז
            </Link>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="lm-biz">שם העסק</label>
                <input id="lm-biz" value={form.business_name} onChange={set("business_name")} className={inputClass} placeholder="אולפן X" />
                {errors.business_name && <p className="text-[11px] text-red-500 mt-1">{errors.business_name}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="lm-type">סוג השירות</label>
                <MobileSelect id="lm-type" value={form.business_type} onChange={set("business_type")}
                  options={BUSINESS_TYPES} placeholder="בחר סוג" title="סוג השירות" className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="lm-title">מה התפנה?</label>
              <input id="lm-title" value={form.title} onChange={set("title")} className={inputClass} placeholder="שעת אולפן + מיקס" />
              {errors.title && <p className="text-[11px] text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="lm-desc">מה כלול</label>
              <textarea id="lm-desc" value={form.description} onChange={set("description")} rows={2}
                className={inputClass} placeholder="שעתיים אולפן, טכנאי, מיקס בסיסי" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="lm-city">עיר</label>
                <input id="lm-city" value={form.city} onChange={set("city")} className={inputClass} placeholder="תל אביב" />
              </div>
              <div>
                <label className={labelClass} htmlFor="lm-slot">מועד השירות</label>
                <input id="lm-slot" type="datetime-local" value={form.slot_start} onChange={set("slot_start")} className={inputClass} />
              </div>
            </div>
            {errors.slot_start && <p className="text-[11px] text-red-500">{errors.slot_start}</p>}

            <div>
              <label className={labelClass} htmlFor="lm-addr">כתובת (מוצגת רק לקונה)</label>
              <input id="lm-addr" value={form.address} onChange={set("address")} className={inputClass} placeholder="הרצל 12, תל אביב" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass} htmlFor="lm-list">מחיר מחירון</label>
                <input id="lm-list" type="number" min="0" value={form.list_price} onChange={set("list_price")} className={inputClass} placeholder="400" />
                {errors.list_price && <p className="text-[11px] text-red-500 mt-1">{errors.list_price}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="lm-floor">רצפת מחיר</label>
                <input id="lm-floor" type="number" min="0" value={form.floor_price} onChange={set("floor_price")} className={inputClass} placeholder="150" />
                {errors.floor_price && <p className="text-[11px] text-red-500 mt-1">{errors.floor_price}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="lm-dur">משך (דק')</label>
                <input id="lm-dur" type="number" min="15" step="15" value={form.duration_minutes} onChange={set("duration_minutes")} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="lm-hours">משך המכרז</label>
                <MobileSelect id="lm-hours" value={auctionHours} onChange={setAuctionHours}
                  options={AUCTION_HOURS.map(h => ({ value: h, label: `${h} שעות` }))}
                  placeholder="4 שעות" title="משך המכרז" className={inputClass} />
              </div>
              <div>
                <label className={labelClass} htmlFor="lm-phone">טלפון ליצירת קשר</label>
                <input id="lm-phone" value={form.owner_phone} onChange={set("owner_phone")} className={inputClass} placeholder="050-0000000" />
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              עמלת הצלה של {RESCUE_FEE_RATE}% נגבית רק אם החלון נמכר. לא נמכר — לא שילמת כלום.
            </p>

            {errors.submit && <p className="text-xs text-red-500 font-bold">{errors.submit}</p>}

            <button type="button" onClick={submit} disabled={saving}
              className="w-full text-white text-sm font-black py-3 rounded-xl disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#e5893d,#3e6b8a)" }}>
              {saving ? "מפרסם..." : "פתח מכרז הפוך עכשיו"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}