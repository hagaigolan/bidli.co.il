import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, Globe, ChevronDown, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { label: "The Auctions", path: "/Auctions" },
    { label: "Shops", path: "#" },
    { label: "Bidspirit judaica", path: "#" },
    { label: "Cars", path: "#" },
    { label: "Real estate", path: "#" },
    { label: "Industrial", path: "#" },
    { label: "Art", path: "#" },
    { label: "Judaica", path: "#" },
    { label: "Collectibles", path: "#" },
    { label: "Numismatics", path: "#" },
    { label: "Jewelry", path: "#" },
    { label: "Home design", path: "#" },
    { label: "Fashion", path: "#" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full bg-background transition-all duration-300 ${scrolled ? "shadow-md" : "border-b border-border"}`}>
      {/* Top Main Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <Link to="/" className="flex items-center flex-shrink-0 mr-6">
              <img
                src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/be33c0209_bidspirit-portal-static_global_ssl_fastly_net_logo-system_85f28498.jpg"
                alt="Bidspirit"
                className="h-8 sm:h-10 w-auto object-contain"
                onError={e => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "inline"; }}
              />
              <span className="font-bold text-2xl text-primary hidden" style={{ fontFamily: "'Helvetica Neue', system-ui, sans-serif" }}>bidspirit</span>
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-background p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                   <Link to="/" onClick={() => setOpen(false)}>
                      <img
                        src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/be33c0209_bidspirit-portal-static_global_ssl_fastly_net_logo-system_85f28498.jpg"
                        alt="Bidspirit"
                        className="h-8 w-auto object-contain"
                      />
                    </Link>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 pb-4 border-b border-border">
                     <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Registration</Button>
                     <Button variant="outline" className="flex-1">Login</Button>
                  </div>
                  <nav className="flex flex-col gap-1 mt-2">
                    <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors">Home</Link>
                    {navLinks.map((link, idx) => (
                      <Link key={idx} to={link.path} onClick={() => setOpen(false)} className="px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors">
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Central Search Bar (Desktop) */}
          <div className="hidden sm:flex flex-1 max-w-2xl mx-auto w-full">
            <div className="flex w-full border border-border rounded-sm overflow-hidden bg-card focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
              <div className="relative flex-shrink-0 bg-muted border-r border-border hover:bg-muted/80 transition-colors cursor-pointer">
                <select className="appearance-none bg-transparent py-2 pl-3 pr-8 text-xs font-medium text-foreground focus:outline-none cursor-pointer h-full">
                  <option>Find lots or catalogs</option>
                  <option>Auctions</option>
                  <option>Shops</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
              <input 
                type="text" 
                placeholder="Search..." 
                className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button className="px-4 bg-muted hover:bg-border transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary cursor-pointer transition-colors">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Israel</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Login</a>
              <Button className="h-8 px-4 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-sm rounded-sm">
                Registration
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden mt-3 w-full border border-border rounded-sm flex bg-card overflow-hidden">
           <input 
              type="text" 
              placeholder="Find lots or catalogs..." 
              className="flex-1 px-3 py-2 text-sm bg-transparent border-none focus:outline-none text-foreground"
            />
            <button className="px-3 bg-muted text-muted-foreground">
              <Search className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Bottom Navigation Bar (Desktop) */}
      <div className="hidden sm:block border-t border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-10">
            <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <Link to="/" className={`px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${location.pathname === "/" ? "text-primary border-b-2 border-primary" : "text-foreground hover:text-primary"}`}>
                Home
              </Link>
              {navLinks.slice(0, 9).map((link, idx) => (
                <Link key={idx} to={link.path} className={`px-2 py-1 text-xs font-medium whitespace-nowrap transition-colors ${location.pathname === link.path ? "text-primary border-b-2 border-primary" : "text-foreground hover:text-primary"}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <a href="#" className="text-xs font-medium text-foreground hover:text-primary transition-colors">Help</a>
              <div className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary cursor-pointer transition-colors">
                English <ChevronDown className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}