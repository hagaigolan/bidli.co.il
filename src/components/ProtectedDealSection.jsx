import { ShieldCheck, Wallet, Truck, Scale, BadgeCheck } from "lucide-react";

// עסקה מוגנת — הסבר תשלום ומסירה (מוצג בדף הבית ובעמוד המכרז)
const STEPS = [
  {
    icon: Wallet,
    color: "#00c853",
    title: "התשלום מועבר ישירות למוכר",
    text: "בסיום המכרז מעביר הקונה את סכום הזכייה ישירות למוכר — בביט, בקש או בהעברה בנקאית, לפי אמצעי התשלום שהמוכר הגדיר. ללא כרטיס אשראי וללא עמלות נסתרות.",
  },
  {
    icon: Truck,
    color: "#e5893d",
    title: "מסירה מתואמת בין הקונה למוכר",
    text: "אחרי התשלום מתואמת המסירה ישירות בין הצדדים — איסוף אישי, שליח או משלוח מאובטח, לפי מה שמתאים לשניכם ולסוג הפריט.",
  },
  {
    icon: Scale,
    color: "#3e6b8a",
    title: "bidli משמש כמתווך ניטרלי",
    text: "הפלטפורמה מנהלת את המכרז, מתעדת כל הצעה ומאשרת את העסקה בשני הצדדים — אך אינה צד להעברת הכספים עצמה. הכל שקוף ומתועד.",
  },
];

export default function ProtectedDealSection() {
  return (
    <section className="py-10 border-t border-gray-100 bg-white" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="h-6 w-6" style={{ color: "#00c853" }} aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">עסקה מוגנת — כך עובדים התשלום והמסירה</h2>
        </div>
        <p className="text-sm text-gray-400 text-center mb-6 max-w-2xl mx-auto">
          גם לפריטים יקרים במיוחד: כל עסקה ב-bidli מתנהלת בגלוי, מתועדת ומאושרת על ידי שני הצדדים מתחילת המכרז ועד קבלת הפריט.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map(({ icon: Icon, color, title, text }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: color + "14", border: `1px solid ${color}33` }}>
                <Icon className="h-5 w-5" style={{ color }} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-black text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl p-4 flex items-start gap-3 text-xs text-gray-600 leading-relaxed"
          style={{ background: "#00c85308", border: "1px solid #00c85333" }}>
          <BadgeCheck className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#00c853" }} aria-hidden="true" />
          <p>
            <span className="font-bold text-gray-900">שקט נפשי בכל מחיר:</span> הקונה מדווח על ההעברה, המוכר מאשר שהכסף התקבל, וההזמנה נסגרת רק לאחר אישור שני הצדדים —
            ואם משהו משתבש, ניתן לפתוח פנייה למחלוקת שנבחנת ישירות על ידי צוות בידלי. פרטי הקשר של המוכר נחשפים לזוכה בלבד, לאחר סיום המכרז.
          </p>
        </div>
      </div>
    </section>
  );
}