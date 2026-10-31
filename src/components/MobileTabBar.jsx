import { NavLink } from "react-router-dom";
import { Home, Gavel, Repeat, Heart, User } from "lucide-react";

// סרגל ניווט תחתון — מוצג במסכים ניידים בלבד (עד md), נעלם בדסקטופ
const TABS = [
  { label: "בית", path: "/", icon: Home },
  { label: "מכרזים", path: "/auctions", icon: Gavel },
  { label: "בארטר", path: "/barter", icon: Repeat },
  { label: "מועדפים", path: "/favorites", icon: Heart },
  { label: "פרופיל", path: "/profile", icon: User },
];

export default function MobileTabBar() {
  return (
    <nav
      aria-label="ניווט מהיר"
      dir="rtl"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-bottom"
    >
      <div className="flex items-stretch" style={{ height: "var(--tabbar-h)" }}>
        {TABS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                isActive ? "text-[#e5893d]" : "text-gray-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}