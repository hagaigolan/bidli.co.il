import { Link } from "react-router-dom";
import { Mail, Smartphone, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* App banner */}
      <div className="bg-primary/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-primary-foreground flex-shrink-0" />
              <div>
                <p className="font-bold text-primary-foreground text-sm">Download the Bidspirit app</p>
                <p className="text-primary-foreground/80 text-xs">Participate in auctions and get notified when your favorite items go up for bid.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href="#" className="bg-primary-foreground text-primary text-xs font-semibold px-4 py-2 hover:bg-primary-foreground/90 transition-colors">App Store</a>
              <a href="#" className="bg-primary-foreground text-primary text-xs font-semibold px-4 py-2 hover:bg-primary-foreground/90 transition-colors">Google Play</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/">
                <img
                  src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/be33c0209_bidspirit-portal-static_global_ssl_fastly_net_logo-system_85f28498.jpg"
                  alt="Bidspirit Online Auctions"
                  className="h-8 w-auto object-contain mb-3 brightness-0 invert"
                  onError={e => { e.target.style.display = "none"; e.target.nextElementSibling.style.display = "inline"; }}
                />
                <span className="font-bold text-xl text-background hidden">bidspirit</span>
              </Link>
              <p className="text-background/70 text-xs mb-3">
                We'd love to hear from you! Send us your questions, comments, or ideas.
              </p>
              <div className="flex items-center gap-2 text-xs text-background/70 mb-2">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <a href="mailto:info-il@bidspirit.com" className="hover:text-background transition-colors">info-il@bidspirit.com</a>
              </div>
              <a href="#" className="inline-block mt-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                Write to us
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-bold text-background text-sm mb-4 uppercase tracking-wider">Navigation</h3>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-xs text-background/70 hover:text-background transition-colors">Home</Link>
                <Link to="/Auctions" className="text-xs text-background/70 hover:text-background transition-colors">The Auctions</Link>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Shops</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Bidspirit judaica</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Cars</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Real estate</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Industrial</a>
              </nav>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-background text-sm mb-4 uppercase tracking-wider">Categories</h3>
              <nav className="flex flex-col gap-2">
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Art</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Judaica</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Collectibles</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Numismatics & Philately</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Jewelry</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Home design</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Fashion</a>
              </nav>
            </div>

            {/* Company & For Sellers */}
            <div>
              <h3 className="font-bold text-background text-sm mb-4 uppercase tracking-wider">Company</h3>
              <nav className="flex flex-col gap-2 mb-5">
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">About</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Contact Us</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Product</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Auction Houses</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">White-Label</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Terms of service</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Privacy policy</a>
                <a href="#" className="text-xs text-background/70 hover:text-background transition-colors">Cookies policy</a>
              </nav>
              <div className="border-t border-background/20 pt-4">
                <p className="text-xs text-background/70 mb-1 font-medium">Have something to sell?</p>
                <a href="#" className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
                  Contact auction houses <ArrowRight className="h-3 w-3" />
                </a>
                <p className="text-xs text-background/50 mt-2">
                  Custom website solutions for auction houses.{" "}
                  <a href="#" className="text-accent hover:text-accent/80 transition-colors">More details</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/50">
            <p>© bidspirit. All Rights Reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-background/70 transition-colors">Terms of service</a>
              <a href="#" className="hover:text-background/70 transition-colors">Privacy policy</a>
              <a href="#" className="hover:text-background/70 transition-colors">Cookies policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}