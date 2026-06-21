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
    { label: "אמנות", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=120&h=120&fit=crop&auto=format" },
    { label: "יודאיקה", img: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=120&h=120&fit=crop&auto=format" },
    { label: "אספנות", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=120&h=120&fit=crop&auto=format" },
    { label: "נומיסמטיקה", img: "https://images.unsplash.com/photo-1624365169364-0640dd10e180?w=120&h=120&fit=crop&auto=format" },
    { label: "תכשיטים", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&h=120&fit=crop&auto=format" },
    { label: "עיצוב הבית", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&h=120&fit=crop&auto=format" },
    { label: "אופנה", img: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=120&h=120&fit=crop&auto=format" },
    { label: "רכבים", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=120&h=120&fit=crop&auto=format" },
    { label: 'נדל"ן', img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&h=120&fit=crop&auto=format" },
    { label: "ספרים", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=120&h=120&fit=crop&auto=format" },
    { label: "בולים", img: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=120&h=120&fit=crop&auto=format" },
    { label: "מטבעות", img: "https://images.unsplash.com/photo-1618044733300-9472054094ee?w=120&h=120&fit=crop&auto=format" },
    { label: "כלי נגינה", img: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=120&h=120&fit=crop&auto=format" },
    { label: "יין ואלכוהול", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=120&h=120&fit=crop&auto=format" },
    { label: "שעונים", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop&auto=format" },
    { label: "אלקטרוניקה", img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=120&h=120&fit=crop&auto=format" },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 bg-white ${scrolled ? "shadow-lg shadow-black/5" : ""}`} dir="rtl">
      {/* Top micro-bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-xs text-gray-500">
          <div className="hidden sm:flex items-center gap-4">
            <span>🇮🇱 ישראל</span>
          </div>
          <div className="flex items-center gap-3 mr-auto">
            <a href="/Login" className="font-medium text-[#f700ff] hover:opacity-80 transition-opacity">כניסה / הרשמה</a>
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
              <a href="#" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">מכרזים פעילים</a>
              <Link to="/auctions?view=archive" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">ארכיון מכרזים</Link>
              <Link to="/stocks" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#f700ff] hover:bg-pink-50 rounded-lg transition-colors">סטוקים</Link>


            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#f700ff] hidden sm:flex rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-[#f700ff] hidden sm:flex rounded-xl">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/upload-product" className="hidden sm:block btn-neon text-white text-xs font-bold px-4 py-2 rounded-xl">
                + פרסם מכרז
              </Link>

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto scrollbar-hide py-2 gap-4">
          {categoryLinks.map((link) => (
            <Link key={link.label} to={`/category/${encodeURIComponent(link.label)}`}
              className="flex-shrink-0 flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 border-2 border-transparent group-hover:border-[#f700ff66] transition-all duration-200"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <img src={link.img} alt={link.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-[#f700ff] transition-colors whitespace-nowrap font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}