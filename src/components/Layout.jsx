import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import MobileTabBar from "./MobileTabBar";
import RouteLoader from "./RouteLoader";
import CookieConsent from "./CookieConsent";
import AdSenseLoader from "./AdSenseLoader";
import WelcomeOfferModal from "./WelcomeOfferModal";
import AccessibilityWidget from "./AccessibilityWidget";
import IdleLogout from "./IdleLogout";
import CompareBar from "./CompareBar";
import ReferralCapture from "./ReferralCapture";
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
    // ייחוס הרשמה שהגיעה מהזמנת חבר — נשמר פעם אחת על הפרופיל
    const ref = localStorage.getItem("bidli_ref");
    const payload = { last_login_at: new Date().toISOString() };
    if (ref && !user?.referred_by && ref.toLowerCase() !== (user?.email || "").toLowerCase()) {
      payload.referred_by = ref;
    }
    base44.auth.updateMe(payload).catch(() => {});
  }, [isAuthenticated, user?.id]);

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col pb-[calc(var(--tabbar-h)+var(--safe-bottom))] md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-[100] focus:bg-gray-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl text-sm font-bold"
      >
        דלג לתוכן הראשי
      </a>
      <ReferralCapture />
      <Header />
      <main id="main-content" className="flex-1">
        <Suspense fallback={<RouteLoader />}>
          {/* מעבר החלקה בין מסכים — מונפש רק התוכן, הכותרת והפוטר נשארים יציבים */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <MobileTabBar />
      <CompareBar />
      <CookieConsent />
      <AdSenseLoader />
      <WelcomeOfferModal />
      <AccessibilityWidget />
      <IdleLogout />
    </div>
  );
}