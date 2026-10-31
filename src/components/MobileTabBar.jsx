import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

// זיכרון הסשן: המסלול הפנימי האחרון שנצפה בכל טאב — נמחק בסגירת האפליקציה/הטאב
const storageKey = (path) => `tab_last:${path}`;

const readLast = (path) => {
  try {
    const saved = sessionStorage.getItem(storageKey(path));
    return saved && saved !== path ? saved : null;
  } catch {
    return null;
  }
};

export default function MobileTabBar() {
  const location = useLocation();
  const [lastRoutes, setLastRoutes] = useState(() =>
    TABS.reduce((acc, tab) => {
      const saved = readLast(tab.path);
      if (saved) acc[tab.path] = saved;
      return acc;
    }, {})
  );

  const isTabActive = (tab) => tab.match.some((p) =>
    p === "/" ? location.pathname === "/" : location.pathname === p || location.pathname.startsWith(p + "/")
  );

  // כל מסלול פנימי שנצפה נשמר תחת הטאב שלו, כדי לחזור אליו בלחיצה על הטאב
  useEffect(() => {
    const tab = TABS.find((t) => isTabActive(t));
    if (!tab || location.pathname === tab.path) return;
    try {
      sessionStorage.setItem(storageKey(tab.path), location.pathname);
    } catch {
      /* מצב פרטי — ממשיכים בלי זיכרון */
    }
    setLastRoutes((prev) => (prev[tab.path] === location.pathname ? prev : { ...prev, [tab.path]: location.pathname }));
  }, [location.pathname]);

  // לחיצה כשכבר נמצאים ביעד — גלילה לראש העמוד
  const handleClick = (e, target) => {
    if (location.pathname !== target) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav
      aria-label="ניווט מהיר"
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-bottom"
    >
      <div className="mx-auto flex max-w-lg items-stretch" style={{ height: "var(--tabbar-h)" }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab);
          const target = lastRoutes[tab.path] || tab.path;
          return (
            <NavLink
              key={tab.path}
              to={target}
              aria-current={active ? "page" : undefined}
              onClick={(e) => handleClick(e, target)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                active ? "text-[#e5893d]" : "text-muted-foreground"
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