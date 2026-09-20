import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setPageMeta } from "@/lib/seo";
import { Gavel, ShieldCheck, Heart, Zap, Users, Eye, ArrowLeft, Image, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Gavel,
    title: "מכרזים חיים ומרגשים",
    text: "הגשת הצעות בזמן אמת על אמנות, תכשיטים, עתיקות ופריטי אספנות — עם טיימר חי, היסטוריית הצעות ואפשרות 'קנה עכשיו'.",
    to: "/auctions",
    cta: "לכל המכרזים",
  },
  {
    icon: ShieldCheck,
    title: "תשלום ישיר ופשוט",
    text: "לאחר סיום המכירה הקונה מקבל את מספר הטלפון של המוכר, והם מעבירים את הכסף ביניהם ישירות — בביט, בקאשקאש או במזומן.",
    to: "/terms",
    cta: "לתנאים והמדיניות",
  },
  {
    icon: Heart,
    title: "אפס עמלות",
    text: "המוכר מקבל את מלוא מחיר המכירה. אנחנו מחברים בין אספנים ומוכרים ישירות — בלי עמלות ובלי פשרות.",
    to: "/upload-product",
    cta: "פרסום מכרז חינם",
  },
  {
    icon: Users,
    title: "קהילה עם מוניטין",
    text: "כל מוכר נושא דירוג אמיתי מקונים, סטטיסטיקות מכירה ותג אמון — כדי שתדעו תמיד עם מי אתם מתמקחים.",
    to: "/search",
    cta: "לגלות מוכרים",
  },
  {
    icon: Eye,
    title: "מועדפים ותזכורות",
    text: "שמרו פריטים למועדפים וקבלו תזכורת לפני סיום המכרז, כדי שלא תפספסו את הפריט הבא שלכם.",
    to: "/favorites",
    cta: "למועדפים שלי",
  },
  {
    icon: Image,
    title: "תוכן מקצועי",
    text: "מאמרים בנושאי אמנות, תכשיטים ואספנות — מדריכי קנייה, טיפים לזיהוי והערכת שווי, ישירות מהמומחים שלנו.",
    to: "/articles",
    cta: "לכל המאמרים",
  },
];

export default function About() {
  useEffect(() => {
    setPageMeta({
      title: "אודות bidli — פורטל המכרזים לאמנות, תכשיטים ואספנות בישראל",
      description: "bidli היא פלטפורמת מכירות פומביות ייחודית לאמנות, תכשיטים, עתיקות ופריטי אספנות — מחברת אספנים ומוכרים ישירות, באמון מלא וללא כל עמלות.",
    });
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a08)" }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(circle at 15% 20%, #e5893d22, transparent 45%), radial-gradient(circle at 85% 75%, #3e6b8a22, transparent 45%)" }} />
        <div className="max-w-4xl mx-auto px-4 py-16 relative">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-3xl" style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 32px #e5893d44" }}>
              <Gavel className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-center text-gray-900 mb-4">
            אודות <span className="gradient-text">bidli</span>
          </h1>
          <p className="text-lg text-gray-500 text-center max-w-2xl mx-auto leading-relaxed">
            פלטפורמת מכירות פומביות ייחודית לאמנות, תכשיטים, עתיקות ופריטי אספנות —
            שמחברת בין אספנים ומוכרים ישירות, באמון מלא, וללא כל עמלות.
          </p>
        </div>
      </div>

      {/* ── Features grid ── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title}
              className="card-neon rounded-2xl border border-gray-100 p-6 flex flex-col transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #e5893d18, #3e6b8a18)", border: "1px solid #e5893d33" }}>
                <f.icon className="h-6 w-6" style={{ color: "#e5893d" }} aria-hidden="true" />
              </div>
              <h3 className="font-black text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{f.text}</p>
              <Link to={f.to}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                style={{ color: "#3e6b8a" }}>
                {f.cta}
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works band ── */}
      <div className="border-y border-gray-100" style={{ background: "linear-gradient(135deg, #3e6b8a06, #e5893d06)" }}>
        <div className="max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-black text-center text-gray-900 mb-10 flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6" style={{ color: "#e5893d" }} aria-hidden="true" />
            איך זה עובד?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "1", t: "מוכרים מפרסמים", d: "המוכר מעלה פריט עם תמונות, תיאור ומחיר פתיחה — תוך דקות." },
              { n: "2", t: "קונים מתמכרזים", d: "הקונים מגישים הצעות בזמן אמת, ומקבלים התראה אם עוקפים אותם." },
              { n: "3", t: "העברה ישירה בין הצדדים", d: "הזוכה מקבל את הטלפון של המוכר, מעביר את הכסף בביט/קאשקאש/מזומן, והמוכר מאשר קבלה באזור האישי." },
            ].map((s, i) => (
              <div key={s.n} className="text-center relative">
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center font-black text-xl text-white mb-4"
                  style={{
                    background: i === 1 ? "linear-gradient(135deg, #6aa3cd, #2d4f68)" : "linear-gradient(135deg, #e5893d, #3e6b8a)",
                    boxShadow: "0 0 16px #e5893d33",
                  }}>
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{s.t}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-3">יש לך משהו למכור?</h2>
        <p className="text-gray-500 mb-6">פרסמו מכרז חינם, ללא עמלות — ותנו לקהילת האספנים לקבוע את המחיר.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/upload-product"
            className="btn-neon inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold">
            <Zap className="h-4 w-4" aria-hidden="true" />
            פרסום מכרז עכשיו
          </Link>
          <Link to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold border-2 transition-all hover:scale-[1.02]"
            style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
            צור קשר
          </Link>
        </div>
      </div>
    </div>
  );
}