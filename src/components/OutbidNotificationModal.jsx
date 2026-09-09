import { useState } from "react";
import { Bell, Mail, MessageCircle, X, Check } from "lucide-react";

export default function OutbidNotificationModal({ onClose, onSave }) {
  const [email, setEmail] = useState(() => localStorage.getItem("notif_email") || localStorage.getItem("bidder_email") || "");
  const [phone, setPhone] = useState(() => localStorage.getItem("notif_phone") || "");
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem("notif_channels");
    return saved ? JSON.parse(saved) : { email: true, whatsapp: false };
  });

  const toggle = (ch) => setChannels(prev => ({ ...prev, [ch]: !prev[ch] }));

  const handleSave = () => {
    if (channels.email && !email) return alert("נא להזין כתובת מייל");
    if (channels.whatsapp && !phone) return alert("נא להזין מספר טלפון");
    if (!channels.email && !channels.whatsapp) return alert("נא לבחור לפחות ערוץ התראה אחד");

    localStorage.setItem("notif_email", email);
    localStorage.setItem("notif_phone", phone);
    localStorage.setItem("notif_channels", JSON.stringify(channels));
    onSave({ email, phone, channels });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">קבל התראה כשיעקפו אותך</h2>
            <p className="text-xs text-gray-500">נשלח לך הודעה עם קישור להגיש הצעה גבוהה יותר</p>
          </div>
        </div>

        {/* Channel selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button type="button" onClick={() => toggle("email")}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${channels.email ? "border-[#e5893d] bg-[#e5893d08] text-[#e5893d]" : "border-gray-200 text-gray-500"}`}>
            <Mail className="h-4 w-4" />
            מייל
            {channels.email && <Check className="h-3.5 w-3.5 mr-auto" />}
          </button>
          <button type="button" onClick={() => toggle("whatsapp")}
            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${channels.whatsapp ? "border-green-500 bg-green-50 text-green-600" : "border-gray-200 text-gray-500"}`}>
            <MessageCircle className="h-4 w-4" />
            ווצאפ
            {channels.whatsapp && <Check className="h-3.5 w-3.5 mr-auto" />}
          </button>
        </div>

        {/* Email input */}
        {channels.email && (
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">כתובת מייל</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right"
            />
          </div>
        )}

        {/* Phone input */}
        {channels.whatsapp && (
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">מספר טלפון (ווצאפ)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="050-1234567"
              className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-green-400 transition-all text-right"
            />
            <p className="text-xs text-gray-400 mt-1">כולל קידומת מדינה: 972501234567 או 0501234567</p>
          </div>
        )}

        <button onClick={handleSave}
          className="w-full py-3 rounded-xl font-bold text-white text-sm mt-2"
          style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
          הפעל התראות
        </button>
      </div>
    </div>
  );
}