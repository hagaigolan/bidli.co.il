import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Gavel, Repeat, Heart, User } from "lucide-react";

// סרגל ניווט תחתון — מוצג במסכים ניידים בלבד (עד md), נעלם בדסקטופ
// match: קידומות שמסמנות את "האזור" של הטאב (למשל גם עמוד מכרז בודד נחשב לטאב המכרזים)
const TABS = [
  { label: "בית", path: "/", icon: Home, match: ["/"] },
  { label: "מכרזים", path: "/auctions", icon: Gavel, match: ["/auctions", "/auction"] },
  { label: "בארטר", path: "/barter", icon: Repeat, match: ["/barter"] },
  { label: "מועדפים", path: "/favorites", icon: Heart, match: ["/favorites"] },
  { label: "פרופיל", path: "/profile", icon: User, match: ["/profile", "/my-center", "/my-orders", "/my-sales"] },
];

export default function MobileTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isTabActive = (tab) => tab.match.some(p =>
    p === "/" ? location.pathname === "/" : location.pathname === p || location.pathname.startsWith(p + "/")
  );

  // לחיצה על טאב שכבר פעיל — מחזירה לתצוגת השורש שלו ומגלילה לראש העמוד
  const handleClick = (e, tab) => {
    if (!isTabActive(tab)) return;
    e.preventDefault();
    if (location.pathname !== tab.path) navigate(tab.path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="ניווט מהיר"
      dir="rtl"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-bottom"
    >
      <div className="flex items-stretch" style={{ height: "var(--tabbar-h)" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab);
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              aria-current={active ? "page" : undefined}
              onClick={(e) => handleClick(e, tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                active ? "text-[#e5893d]" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}