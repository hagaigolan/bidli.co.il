import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, MessageCircle, Link2, Check } from "lucide-react";

// הזמנת חברים — שיתוף קישור ההרשמה דרך וואטסאפ או העתקה, עם מעקב אירועים
export default function InviteFriendsSection() {
  const [copied, setCopied] = useState(false);
  // קישור ההזמנה נושא את המזמין — כדי שנוכל לייחס הרשמות שהגיעו ממנו
  const ref = (localStorage.getItem("bidder_email") || "").trim().toLowerCase();
  const url = `${window.location.origin}/${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
  const text = encodeURIComponent(
    `גליתי אתר מכרזים מעולה בעברית — bidli. מכרזים חיים של אמנות, תכשיטים ואספנות, כל מכרז נסגר תוך 24 שעות וההשתתפות חינם. הירשם כאן: ${url}`
  );

  const track = method => {
    try { base44.analytics.track({ eventName: "invite_shared", properties: { method } }); } catch {}
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track("copy");
    } catch {}
  };

  return (
    <section className="py-10 bg-white" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-3xl p-6 sm:p-8 text-center"
          style={{ background: "linear-gradient(135deg, #e5893d0d, #3e6b8a0a)", border: "1px solid #e5893d2a" }}>
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 20px #e5893d44" }}>
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1.5">הזמן חבר ל-bidli</h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            ככל שיותר אספנים באתר — כך המכרזים חמים יותר. שתף את הקישור עם חברים שאוהבים מציאות.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
            <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer" onClick={() => track("whatsapp")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#25d366" }}>
              <MessageCircle className="h-4 w-4" /> שתף בוואטסאפ
            </a>
            <button type="button" onClick={copy}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:bg-orange-50"
              style={{ borderColor: "#e5893d", color: "#e5893d" }}>
              {copied ? <><Check className="h-4 w-4" /> הועתק</> : <><Link2 className="h-4 w-4" /> העתק קישור</>}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}