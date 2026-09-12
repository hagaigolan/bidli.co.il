import { Link } from "react-router-dom";
import { Mail, Smartphone, ArrowRight } from "lucide-react";
import logoWordmarkDark from "@/assets/logo-wordmark-dark.png";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white" dir="rtl">
      {/* Neon top border */}
      <div className="h-px" style={{ background: "linear-gradient(to right, #e5893d, #3e6b8a, #6aa3cd, #2d4f68)" }} />

      {/* App banner */}
      <div className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">הורד את אפליקציית bidli</p>
                <p className="text-white/50 text-xs">הצע הצעות בזמן אמת מכל מקום, קבל התראות מיידיות</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href="#" className="group px-4 py-2 rounded-xl text-xs font-semibold border border-[#e5893d55] text-white hover:bg-[#e5893d15] transition-colors">
                <span className="group-hover:hidden">App Store</span>
                <span className="hidden group-hover:inline">עובדים על זה</span>
              </a>
              <a href="#" className="group px-4 py-2 rounded-xl text-xs font-semibold text-gray-950 font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                <span className="group-hover:hidden">Google Play</span>
                <span className="hidden group-hover:inline">עובדים על זה</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <Link to="/" className="flex flex-col items-center gap-1.5 mb-4" aria-label="bidli.co.il — דף הבית">
                <img
                  src={logoWordmarkDark}
                  alt="bidli.co.il"
                  className="h-[96px] w-auto object-contain"
                />
                <span className="text-sm font-bold text-white/60 whitespace-nowrap">האתר למכרזים המהירים והמנוהלים ביותר בישראל</span>
              </Link>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">
                נשמח לשמוע ממך! שלח לנו שאלות, הערות או רעיונות.
              </p>
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <Mail className="h-3 w-3" />
                <a href="mailto:mitugplus@gmail.com" className="hover:text-white/70 transition-colors">mitugplus@gmail.com</a>
              </div>
              <Link to="/contact" className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors" style={{ color: "#e5893d" }}>
                צור קשר <ArrowRight className="h-3 w-3 rotate-180" />
              </Link>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">ניווט</h3>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-xs text-white/40 hover:text-white transition-colors">דף הבית</Link>
                {["מכרזים","חנויות","יודאיקה","רכבים","נדל\"ן","תעשייה"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
              </nav>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">קטגוריות</h3>
              <nav className="flex flex-col gap-2">
                {["אמנות","יודאיקה","אספנות","נומיסמטיקה ופילטליה","תכשיטים","עיצוב הבית","אופנה"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
              </nav>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">חברה</h3>
              <nav className="flex flex-col gap-2 mb-6">
                <Link to="/articles" className="text-xs text-white/40 hover:text-white transition-colors">מאמרים</Link>
                <Link to="/contact" className="text-xs text-white/40 hover:text-white transition-colors">צור קשר</Link>
                {["White-Label"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
                <Link to="/about" className="text-xs text-white/40 hover:text-white transition-colors">אודות</Link>


              </nav>
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/40 mb-1">יש לך משהו למכור?</p>
                <a href="#" className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: "#6aa3cd" }}>
                  צור קשר עם בתי המכרזים <ArrowRight className="h-3 w-3 rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <div className="text-center sm:text-right">
            <p>© bidli בע"מ. כל הזכויות שמורות.</p>
            <a href="mailto:mitugplus@gmail.com" className="hover:text-white/50 transition-colors" dir="ltr">mitugplus@gmail.com</a>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            <Link to="/terms?tab=terms" className="hover:text-white/50 transition-colors">תנאי שימוש</Link>
            <Link to="/terms?tab=privacy" className="hover:text-white/50 transition-colors">מדיניות פרטיות</Link>
            <Link to="/terms?tab=cookies" className="hover:text-white/50 transition-colors">מדיניות עוגיות</Link>
            <Link to="/terms?tab=returns" className="hover:text-white/50 transition-colors">מדיניות החזרים</Link>
            <Link to="/terms?tab=shipping" className="hover:text-white/50 transition-colors">משלוחים והספקה</Link>
            <Link to="/terms?tab=accessibility" className="hover:text-white/50 transition-colors">הצהרת נגישות</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}