import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import RouteLoader from './components/RouteLoader';

// ── טעינה עצלה של העמודים (React.lazy) — מקצרת את זמן הטעינה הראשוני, חשוב במיוחד ב-WebView ──
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const UploadProduct = lazy(() => import('./pages/UploadProduct'));
const Auctions = lazy(() => import('./pages/Auctions'));
const AuctionDetail = lazy(() => import('./pages/AuctionDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDispute = lazy(() => import('./pages/AdminDispute'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TermsAndPrivacy = lazy(() => import('./pages/TermsAndPrivacy'));
const Stocks = lazy(() => import('./pages/Stocks'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Search = lazy(() => import('./pages/Search'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const MySales = lazy(() => import('./pages/MySales'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const SellerQuestions = lazy(() => import('./pages/SellerQuestions'));
const ShopSupport = lazy(() => import('./pages/ShopSupport'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const SeoAgent = lazy(() => import('./pages/SeoAgent'));
const Experts = lazy(() => import('./pages/Experts'));
const Valuation = lazy(() => import('./pages/Valuation'));
const AuctionsMap = lazy(() => import('./pages/AuctionsMap'));
const Barter = lazy(() => import('./pages/Barter'));
const BarterDetail = lazy(() => import('./pages/BarterDetail'));
const Landing = lazy(() => import('./pages/Landing'));
const MyCenter = lazy(() => import('./pages/MyCenter'));
const Compare = lazy(() => import('./pages/Compare'));
const AuctionCalendar = lazy(() => import('./pages/AuctionCalendar'));
const Collections = lazy(() => import('./pages/Collections'));
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  // Always render auth pages regardless of auth state
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].includes(window.location.pathname);

  if (isAuthPage) {
    return (
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    );
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:name" element={<Category />} />
          <Route path="/upload-product" element={<UploadProduct />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:id" element={<AuctionDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin/disputes" element={<AdminDispute />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/terms" element={<TermsAndPrivacy />} />
          <Route path="/stocks" element={<Stocks />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-center" element={<MyCenter />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/auction-calendar" element={<AuctionCalendar />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
          <Route path="/my-sales" element={<MySales />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/seller/id/:id" element={<SellerProfile />} />
          <Route path="/seller/:email" element={<SellerProfile />} />
          <Route path="/seller-questions" element={<SellerQuestions />} />
          <Route path="/shop-support" element={<ShopSupport />} />
          <Route path="/admin/manage" element={<AdminManagement />} />
          <Route path="/admin/seo-agent" element={<SeoAgent />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/valuation" element={<Valuation />} />
          <Route path="/auctions-map" element={<AuctionsMap />} />
          <Route path="/barter" element={<Barter />} />
          <Route path="/barter/:id" element={<BarterDetail />} />
          <Route path="/landing/:slug" element={<Landing />} />
          {/* Add your page Route elements here */}
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App