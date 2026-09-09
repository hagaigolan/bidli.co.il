import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
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
    </div>
  );
}