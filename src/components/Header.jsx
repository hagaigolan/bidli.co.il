import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Search, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/AuthContext";
import UserMenu from "@/components/UserMenu";
import logoWordmark from "@/assets/logo-wordmark.png";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const doSearch = () => {
    const term = searchTerm.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

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
    <header className="bg-white" dir="rtl">
      {/* Top micro-bar */}
      <div className="border-b border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-8 text-xs text-gray-500">
          <div className="hidden sm:flex items-center gap-4">
          </div>
          <div className="flex items-center gap-3 mr-auto">
            {!isAuthenticated && (
              <Link to="/login" className="font-medium text-[#e5893d] hover:opacity-80 transition-opacity">כניסה / הרשמה</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main bar — sticky; נשאר דבוק בראש בזמן גלילה */}
      <div className={`sticky top-0 z-50 border-b border-gray-100 bg-white transition-all duration-300 ${scrolled ? "shadow-lg shadow-black/5" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between min-h-16 py-3 gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-0" aria-label="bidli.co.il — דף הבית">
              <img
                src={logoWordmark}
                alt="bidli.co.il"
                className="h-10 sm:h-14 lg:h-[96px] w-auto object-contain"
              />
              <span className="hidden lg:block text-sm font-bold text-gray-500 whitespace-nowrap">האתר למכרזים המהירים והמנוהלים ביותר בישראל</span>
            </Link>

            {/* Search bar */}
            <div className="hidden sm:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="search"
                  aria-label="חיפוש באתר"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doSearch(); } }}
                  placeholder="חפש מכרזים, פריטים, בתי מכרזים..."
                  className="w-full pr-10 pl-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5893d44] focus:border-[#e5893d88] transition-all text-right"
                />
              </div>
            </div>

            {/* Nav links */}
            <nav aria-label="ניווט ראשי" className="hidden lg:flex items-center gap-1">
              <Link to="/" className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${location.pathname === "/" ? "text-[#e5893d] bg-orange-50" : "text-gray-600 hover:text-[#e5893d] hover:bg-orange-50"}`}>דף הבית</Link>
              <Link to="/auctions" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#e5893d] hover:bg-orange-50 rounded-lg transition-colors">מכרזים פעילים</Link>
              <Link to="/auctions?view=archive" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#e5893d] hover:bg-orange-50 rounded-lg transition-colors">ארכיון מכרזים</Link>
              <Link to="/stocks" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#e5893d] hover:bg-orange-50 rounded-lg transition-colors">סטוקים</Link>


            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" aria-label="התראות" className="h-9 w-9 text-gray-500 hover:text-[#e5893d] hidden sm:flex rounded-xl">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </Button>
              <UserMenu />
              <Link to="/upload-product" className="hidden sm:block btn-neon text-white text-xs font-bold px-4 py-2 rounded-xl">
                + פרסם מכרז
              </Link>

              {/* Mobile menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild className="sm:hidden">
                  <Button variant="ghost" size="icon" aria-label="פתח תפריט" className="h-9 w-9 rounded-xl">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-white">
                  <div className="mt-6 flex flex-col gap-1" dir="rtl">
                    <div className="relative mb-3 px-3">
                      <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="search"
                        aria-label="חיפוש באתר"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); doSearch(); setOpen(false); } }}
                        placeholder="חפש מכרזים, פריטים..."
                        className="w-full pr-10 pl-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5893d44] focus:border-[#e5893d88] transition-all text-right"
                      />
                    </div>
                    <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#e5893d] hover:bg-orange-50 rounded-xl">דף הבית</Link>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#e5893d] hover:bg-orange-50 rounded-xl">מכרזים</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#e5893d] hover:bg-orange-50 rounded-xl">חנויות</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#e5893d] hover:bg-orange-50 rounded-xl">רכבים</a>
                    <a href="#" className="px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#e5893d] hover:bg-orange-50 rounded-xl">נדל"ן</a>
                    <div className="border-t border-gray-100 my-2" />
                    {categoryLinks.map(l => (
                      <Link key={l.label} to={`/category/${encodeURIComponent(l.label)}`} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-gray-600 hover:text-[#3e6b8a] hover:bg-blue-50 rounded-xl">{l.label}</Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Category strip — חלק מהעמוד, גולל כלפי מעלה יחד עם האתר */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center overflow-x-auto scrollbar-hide py-12 gap-4">
          {categoryLinks.map((link) => (
            <Link key={link.label} to={`/category/${encodeURIComponent(link.label)}`}
              className="flex-shrink-0 flex flex-col items-center gap-1 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-50 border-2 border-transparent group-hover:border-[#e5893d66] group-hover:scale-[3] group-hover:z-20 transition-all duration-300"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <img src={link.img} alt={link.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-gray-600 group-hover:text-[#e5893d] transition-colors whitespace-nowrap font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}