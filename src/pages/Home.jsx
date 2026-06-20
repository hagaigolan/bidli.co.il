import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, Store, Search, Zap } from "lucide-react";

const AuctionEntity = base44.entities.Auction;
const ShopEntity = base44.entities.Shop;

const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setIsVisible(true); return; }
    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clearTimeout(fallback); setTimeout(() => setIsVisible(true), delay); observer.unobserve(el); }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);
  return (
    <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className || ""}`}>
      {children}
    </div>
  );
};

const carouselImages = [
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c6330b626_res_cloudinary_com_portal_AuctionHouse_54dd1a37e4b02fd6852a9470_hallPicture_bd51fb3c.jpg", alt: "אולם מכרז" },
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8dc8db955_res_cloudinary_com_portal_AuctionHouse_53a9cd82e4b0e4606c3f4129_hallPicture_4273f366.jpg", alt: "מכרז" },
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/bf66870bf_res_cloudinary_com_portal_AuctionHouse_53aa6675e4b032e680e98708_hallPicture_70bee7d1.jpg", alt: "חדר מכרז" },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % carouselImages.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white" style={{ minHeight: 480 }} dir="rtl">
      {carouselImages.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" style={{ filter: "brightness(0.18) saturate(0.6)" }} />
        </div>
      ))}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 50%, #f700ff18 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 50%, #00f7ff14 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 80% at 50% 100%, #9d00ff10 0%, transparent 60%)" }} />
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "linear-gradient(#f700ff08 1px, transparent 1px), linear-gradient(90deg, #f700ff08 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f700ff33] bg-[#f700ff0a] mb-6">
            <Zap className="h-3 w-3" style={{ color: "#f700ff" }} />
            <span className="text-xs font-semibold" style={{ color: "#f700ff" }}>מכרזים חיים • פורטל המכרזים מספר 1 בישראל</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none tracking-tight">
            ברוכים הבאים ל-{" "}
            <span className="gradient-text">bid-it</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light mb-10 max-w-xl mx-auto">
            השער שלך לזירת בתי המכרזים
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="חפש פריטים, קטלוגים, בתי מכרזים..."
                className="w-full pr-10 pl-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff33] transition-all text-right"
              />
            </div>
            <button className="btn-neon rounded-xl px-6 py-3 text-sm font-bold flex-shrink-0">
              חיפוש
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {["אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "תכשיטים", "עיצוב הבית"].map((tag, i) => {
              const colors = ["#f700ff", "#9d00ff", "#00f7ff", "#0088ff", "#f700ff", "#9d00ff"];
              return (
                <Link key={tag} to={`/category/${encodeURIComponent(tag)}`} className="px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105"
                  style={{ borderColor: colors[i] + "55", color: colors[i], background: colors[i] + "0f" }}>
                  {tag}
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 flex justify-center gap-2 pb-6">
        {carouselImages.map((_, i) => (
          <button key={i} onClick={() => setCurrentSlide(i)}
            className="rounded-full transition-all duration-300"
            style={{ width: i === currentSlide ? 24 : 8, height: 8, background: i === currentSlide ? "#f700ff" : "#ffffff40" }} />
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ title, color = "#f700ff", icon: Icon }) {
  return (
    <AnimatedElement>
      <div className="flex items-center gap-3 mb-6" dir="rtl">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: color + "18", border: `1px solid ${color}44` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${color}55, transparent)` }} />
      </div>
    </AnimatedElement>
  );
}

function AuctionCard({ auction, index, buttonLabel = "צפה במכרז", accentColor = "#f700ff" }) {
  return (
    <AnimatedElement delay={index * 50}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
        style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
          <img
            src={auction.image_url}
            alt={auction.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.style.display = "none"; }}
          />
          {auction.part && (
            <div className="absolute top-2 right-2 text-white text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              חלק {auction.part}
            </div>
          )}
        </div>
        <div className="p-3" dir="rtl">
          <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">
            {auction.name}{auction.auction_number ? ` #${auction.auction_number}` : ""}
          </h3>
          {auction.date && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{auction.date}{auction.time ? `, ${auction.time}` : ""}</span>
            </div>
          )}
          {auction.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2.5">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{auction.location}</span>
            </div>
          )}
          <a href={auction.id ? `/auction/${auction.id}` : (auction.view_url || "#")}
            className="block w-full text-center text-white text-xs py-2 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor === "#f700ff" ? "#9d00ff" : "#0088ff"})` }}>
            {buttonLabel}
          </a>
        </div>
      </div>
    </AnimatedElement>
  );
}

function FeaturedBanner() {
  return (
    <AnimatedElement>
      <section className="bg-white border-b border-gray-100 py-4" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all"
              style={{ borderColor: "#f700ff33", background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
              <img src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/846ba5fb9_res_cloudinary_com_portal_AuctionHouse_53a9d826e4b032e680e986fe_EXTERNAL_AD_3316416d.png"
                alt="מכרז מיוחד" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
              <div>
                <div className="font-bold text-gray-900 text-sm">מכרז אמנות ישראלית</div>
                <div className="text-xs font-medium" style={{ color: "#f700ff" }}>מכרז גדול — 28 ביוני</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex-shrink-0"
              style={{ borderColor: "#00f7ff33", background: "linear-gradient(135deg, #00f7ff08, #0088ff05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #00f7ff, #0088ff)" }}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">אפליקציית bid-it</div>
                <div className="text-xs text-gray-400">הצע הצעות חיות מהטלפון</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 pr-1">כל השעות מוצגות לפי אזור הזמן שלך</p>
        </div>
      </section>
    </AnimatedElement>
  );
}

function UpcomingAuctionsSection({ products }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-white py-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="מכרזים קרובים" color="#f700ff" icon={Zap} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product, index) => (
            <AnimatedElement key={product.id} delay={index * 50}>
              <a href={`/auction/${product.id}`} className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
                  {product.image_url
                    ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
                </div>
                <div className="p-3" dir="rtl">
                  <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{product.title}</h3>
                  {product.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  )}
                  <p className="font-black text-sm text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
                </div>
              </a>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}




function ShopsSection({ shops }) {
  if (shops.length === 0) return null;

  return (
    <section className="py-10" style={{ background: "linear-gradient(180deg, #fafafa, #fff)" }} dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="רכישה ישירה — חנויות" color="#9d00ff" icon={Store} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {shops.map((shop, index) => (
            <AnimatedElement key={shop.id || index} delay={index * 70}>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 group hover:border-transparent transition-all duration-300 card-neon-cyan h-full"
                style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #9d00ff22, #f700ff11)", border: "1px solid #9d00ff33" }}>
                  <Store className="h-5 w-5" style={{ color: "#9d00ff" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{shop.name}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-2">{shop.description}</p>
                  {shop.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      <span>{shop.location}</span>
                    </div>
                  )}
                </div>
                <a href={shop.shop_url || "#"}
                  className="block w-full text-center text-white text-xs py-2 rounded-xl font-semibold transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #9d00ff, #f700ff)" }}>
                  לחנות
                </a>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="btn-neon rounded-xl px-8 py-2.5 text-sm font-bold text-white">לכל החנויות</button>
        </div>
      </div>
    </section>
  );
}



export default function Home() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.list("-created_date", 50).then(setProducts).catch(() => {}),
      ShopEntity.list("-created_date", 10).then(setShops).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className={`transition-opacity duration-500 bg-white ${loading ? "opacity-0" : "opacity-100"}`}>
      <HeroSection />
      <FeaturedBanner />
      <UpcomingAuctionsSection products={products} />
      <ShopsSection shops={shops} />
    </div>
  );
}