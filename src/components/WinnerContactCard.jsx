import { Phone, MessageCircle, User } from "lucide-react";

// כרטיס פרטי קשר לזוכה במכרז — טלפון המוכר עם לחצני שיחה מהירה ווואטסאפ
export default function WinnerContactCard({ product }) {
  const phone = (product?.seller_phone || "").trim();
  if (!phone) return null;

  const name = product.seller_name || "המוכר";
  const price = (product.current_price || product.starting_price || 0).toLocaleString();
  const digits = phone.replace(/\D/g, "");
  const intl = digits.startsWith("0") ? "972" + digits.slice(1) : digits;
  const msg = encodeURIComponent(
    `שלום ${name}, זכיתי במכרז "${product.title}" שלך ב-bidli על ₪${price}. אשמח לתאם את קבלת הפריט.`
  );

  return (
    <div className="rounded-2xl border p-4" dir="rtl"
      style={{ borderColor: "#00c85344", background: "linear-gradient(135deg, #00c8530a, #ffffff)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <p className="text-sm font-black text-gray-900">מזל טוב, זכית במכרז! פרטי המוכר לתיאום:</p>
      </div>
      <div className="flex items-center gap-2 mb-3 text-sm text-gray-700">
        <User className="h-4 w-4 text-gray-400" />
        <span className="font-bold">{name}</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Phone className="h-4 w-4 text-gray-400" />
        <a href={`tel:${phone}`} className="text-base font-black tracking-wide" style={{ color: "#e5893d" }}
          dir="ltr">{phone}</a>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <a href={`tel:${phone}`}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
          <Phone className="h-4 w-4" /> התקשר למוכר
        </a>
        <a href={`https://wa.me/${intl}?text=${msg}`} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "#25d366" }}>
          <MessageCircle className="h-4 w-4" /> שלח הודעת וואטסאפ
        </a>
      </div>
    </div>
  );
}