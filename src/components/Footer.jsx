import { Link } from "react-router-dom";
import { Mail, Smartphone, ArrowRight, Gavel } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      {/* Neon top border */}
      <div className="h-px" style={{ background: "linear-gradient(to right, #f700ff, #9d00ff, #00f7ff, #0088ff)" }} />

      {/* App banner */}
      <div className="py-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Download the Bidspirit app</p>
                <p className="text-white/50 text-xs">Bid live from anywhere, get instant notifications</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href="#" className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#f700ff55] text-white hover:bg-[#f700ff15] transition-colors">App Store</a>
              <a href="#" className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-950 font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>Google Play</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
                  <Gavel className="h-4 w-4 text-white" />
                </div>
                <span className="font-extrabold text-lg text-white">bid<span style={{ color: "#f700ff", textShadow: "0 0 8px #f700ff99" }}>spirit</span></span>
              </Link>
              <p className="text-white/40 text-xs mb-4 leading-relaxed">
                We'd love to hear from you! Send us your questions, comments, or ideas.
              </p>
              <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                <Mail className="h-3 w-3" />
                <a href="mailto:info-il@bidspirit.com" className="hover:text-white/70 transition-colors">info-il@bidspirit.com</a>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-xs font-medium mt-2 transition-colors" style={{ color: "#f700ff" }}>
                Write to us <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">Navigation</h3>
              <nav className="flex flex-col gap-2">
                {[["Home", "/"], ["The Auctions", "/Auctions"]].map(([label, to]) => (
                  <Link key={label} to={to} className="text-xs text-white/40 hover:text-white transition-colors">{label}</Link>
                ))}
                {["Shops","Bidspirit judaica","Cars","Real estate","Industrial"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
              </nav>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">Categories</h3>
              <nav className="flex flex-col gap-2">
                {["Art","Judaica","Collectibles","Numismatics & Philately","Jewelry","Home design","Fashion"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
              </nav>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-white text-xs mb-4 uppercase tracking-widest">Company</h3>
              <nav className="flex flex-col gap-2 mb-6">
                {["About","Contact Us","Product","Auction Houses","White-Label","Terms of service","Privacy policy","Cookies policy"].map(l => (
                  <a key={l} href="#" className="text-xs text-white/40 hover:text-white transition-colors">{l}</a>
                ))}
              </nav>
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-white/40 mb-1">Have something to sell?</p>
                <a href="#" className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: "#00f7ff" }}>
                  Contact auction houses <ArrowRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/25">
          <p>© bidspirit. All Rights Reserved.</p>
          <div className="flex gap-4">
            {["Terms of service","Privacy policy","Cookies policy"].map(l => (
              <a key={l} href="#" className="hover:text-white/50 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}