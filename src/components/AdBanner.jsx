import { Link } from "react-router-dom";
import { Megaphone, ArrowLeft } from "lucide-react";

// באנר פרסום עתידי — מקום שמור למפרסמים; התמונה משמשת רקע והכיתוב בעברית כשכבת טקסט חדה
const AD_IMAGE = "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8e08fbb0f_generated_image.png";

export default function AdBanner() {
  return (
    <section className="bg-white pt-5 pb-1" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <Link
          to="/contact?topic=advertising"
          className="group relative block overflow-hidden rounded-2xl border border-gray-100"
          style={{ boxShadow: "0 2px 14px rgba(0,0,0,0.07)" }}
        >
          <img
            src={AD_IMAGE}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.93) 50%, rgba(255,255,255,0.35) 100%)" }}
          />
          <div className="relative z-10 flex flex-col items-center text-center gap-4 px-5 sm:px-10 py-7 sm:py-10">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Megaphone className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
                <span className="text-[11px] font-bold tracking-wide" style={{ color: "#3e6b8a" }}>
                  שטח פרסום
                </span>
              </div>
              <p className="text-xl sm:text-3xl font-black text-gray-900 leading-tight">
                מעוניין לפרסם כאן?
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1.5 max-w-md mx-auto">
                הצג את העסק שלך בפני קהילת אספנים, סוחרי אמנות ורוכשי עתיקות מכל הארץ.
              </p>
            </div>
            <span
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all group-hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}
            >
              השאר פרטים
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}