import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Search, User, Bell, Gavel } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const categoryLinks = [
    { label: "אמנות" },
    { label: "יודאיקה" },
    { label: "אספנות" },
    { label: "נומיסמטיקה" },
    { label: "תכשיטים" },
    { label: "עיצוב הבית" },
    { label: "אופנה" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 bg-white ${scrolled ? "shadow-lg shadow-black/5" : ""}`} dir="rtl">
      {/* Top micro-bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-xs text-gray-500">
          <div className="hidden sm:flex items-center gap-4">
            <span>🇮🇱 ישראל</span>
            {["פורטל מטבעות","פורטל בולים","פורטל ספרים","פורטל תכשיטים"].map(p => (
              <a key={p} href="#" className="hover:text-[#f700ff] transition-colors">{p}</a>
            ))}
          </div>
          <div className="flex items-center gap-3 mr-auto">
            <a href="#" className="font-medium text-[#f700ff] hover:opacity-80 transition-opacity">כניסה</a>
            <span className="text-gray-300">|</span>
            <a href="#" className="font-medium text-[#9d00ff] hover:opacity-80 transition-opacity">הרשמה</a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f700ff, #9d00ff)' }}>
                <Gavel className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">
                bid-<span className="neon-text-pink">it</span>
              </span>
            </Link>

            {/* Search bar */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="חפש מכרזים, פריטים, בתי מכרזים..."
                  className="w-full pr-10 pl-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f700ff44] focus:border-[#f700ff88] transition-all text-right"
                />
              </div>
            </div>

            {/* Nav links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === "/" ? "text-[#f700ff] bg-pink-50" : "text-gray-600 hover:text-[#f700ff] hover:bg-pink-50"}`}>דף הבית</Link>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">מכרזים</a>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">חנויות</a>
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">רכבים</a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#f700ff] hidden sm:flex rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#f700ff] hidden sm:flex rounded-xl">
                <User className="h-4 w-4" />
              </Button>
              <button className="hidden sm:block btn-neon text-white text-xs font-bold px-4 py-2 rounded-xl">
                הירשם
              </button>

              {/* Mobile menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-white">
                  <div className="mt-6 flex flex-col gap-1" dir="rtl">
                    <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f700ff] hover:bg-pink-50 rounded-xl">דף הבית</Link>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f700ff] hover:bg-pink-50 rounded-xl">מכרזים</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f700ff] hover:bg-pink-50 rounded-xl">חנויות</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f700ff] hover:bg-pink-50 rounded-xl">רכבים</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#f700ff] hover:bg-pink-50 rounded-xl">נדל"ן</a>
                    <div className="border-t border-gray-100 my-2" />
                    {categoryLinks.map(l => (
                      <Link key={l.label} to={`/category/${encodeURIComponent(l.label)}`} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:text-[#9d00ff] hover:bg-purple-50 rounded-xl">{l.label}</Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Category strip */}
      <div className="hidden sm:block border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto scrollbar-hide h-10 gap-1">
          {categoryLinks.map((link, i) => {
            const colors = ["#f700ff","#9d00ff","#00f7ff","#0088ff","#f700ff","#9d00ff","#00f7ff"];
            return (
              <Link key={link.label} to={`/category/${encodeURIComponent(link.label)}`} style={{ color: colors[i % colors.length] }} className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full hover:bg-gray-50 transition-colors whitespace-nowrap">
                {link.label}
              </Link>
            );
          })}
          <div className="mr-auto flex-shrink-0">
            <a href="#" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-3 py-1">
              עברית <ChevronDown className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}