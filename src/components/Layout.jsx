import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import WelcomeOfferModal from "./WelcomeOfferModal";
import AccessibilityWidget from "./AccessibilityWidget";
import IdleLogout from "./IdleLogout";
import CompareBar from "./CompareBar";
import { setRobotsMeta } from "@/lib/seo";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

// עמודים פרטיים/פנימיים — נמנעים מאינדוקס בגוגל
const PRIVATE_PREFIXES = [
  "/admin",
  "/profile",
  "/my-orders",
  "/my-sales",
  "/seller-questions",
  "/upload-product",
  "/favorites",
];

export default function Layout() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const isPrivate = PRIVATE_PREFIXES.some(p => location.pathname.startsWith(p));
    setRobotsMeta(isPrivate);
  }, [location.pathname]);

  // תיעוד מועד ההתחברות האחרון — פעם אחת בכל סשן של משתמש מחובר
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    const key = `login_stamped_${user.id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    base44.auth.updateMe({ last_login_at: new Date().toISOString() }).catch(() => {});
  }, [isAuthenticated, user?.id]);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-gray-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl text-sm font-bold"
      >
        דלג לתוכן הראשי
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CompareBar />
      <CookieConsent />
      <WelcomeOfferModal />
      <AccessibilityWidget />
      <IdleLogout />
    </div>
  );
}