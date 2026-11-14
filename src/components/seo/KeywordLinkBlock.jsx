import { Link } from "react-router-dom";

// בלוק קישורים פנימיים לקידום ביטויי הליבה: מכרז, מכרזים, יד2, מכירה מיד 2 ומכירת מוצרים באינטרנט.
// כל וריאציה מוצגת בעמוד אחר ומקשרת לעמוד זירת המכרזים (/auctions) ולעמוד הפרסום (/upload-product).
const LINK_STYLE = "font-bold underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity";

export default function KeywordLinkBlock({ variant = "guide", className = "" }) {
  const link = (to, children, color = "#3e6b8a") => (
    <Link to={to} className={LINK_STYLE} style={{ color, textDecorationColor: `${color}66` }}>
      {children}
    </Link>
  );

  const content = {
    guide: (
      <>
        הפלטפורמה שלנו מאפשרת לכל אחד לפתוח מכרז מהיר ל-24 שעות. אם אתם חדשים בעולם המכירה מיד 2,
        תוכלו לראות {link("/upload-product", "איך להעלות את הפריט הראשון שלכם", "#e5893d")} בקלות ולמשוך קונים,
        ולהצטרף ל{link("/auctions", "מכרזים הפעילים כרגע באתר")}.
      </>
    ),
    category: (
      <>
        מחפשים לשדרג? אל תפספסו את {link("/auctions", "המכרזים החמים שלנו")} על מוצרים מעולים,
        או הצטרפו למשתמשים שכבר עושים {link("/upload-product", "מכירת מוצרים באינטרנט", "#e5893d")} ישירות מהנייד.
      </>
    ),
    blog: (
      <>
        רבים שואלים אותנו מה הדרך המשתלמת ביותר להיפטר מחפצים ישנים. התשובה היא פשוטה:
        {" "}{link("/auctions", "פלטפורמות יד2 מבוססות הצעות מחיר")} מבטיחות שתקבלו את הערך האמיתי של הפריט שלכם.
      </>
    ),
  }[variant];

  if (!content) return null;

  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3.5 text-sm leading-relaxed text-gray-600 ${className}`}
      dir="rtl"
    >
      {content}
    </div>
  );
}