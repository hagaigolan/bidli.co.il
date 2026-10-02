import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CookieConsent from "./CookieConsent";
import WelcomeOfferModal from "./WelcomeOfferModal";
import AccessibilityWidget from "./AccessibilityWidget";
import { setRobotsMeta } from "@/lib/seo";

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

  useEffect(() => {
    const isPrivate = PRIVATE_PREFIXES.some(p => location.pathname.startsWith(p));
    setRobotsMeta(isPrivate);
  }, [location.pathname]);

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
      <CookieConsent />
      <WelcomeOfferModal />
      <AccessibilityWidget />
    </div>
  );
}