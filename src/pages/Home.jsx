import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, Store, Search, Zap, TrendingUp, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c6330b626_res_cloudinary_com_portal_AuctionHouse_54dd1a37e4b02fd6852a9470_hallPicture_bd51fb3c.jpg", alt: "Auction hall" },
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8dc8db955_res_cloudinary_com_portal_AuctionHouse_53a9cd82e4b0e4606c3f4129_hallPicture_4273f366.jpg", alt: "Auctioneers" },
  { src: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/bf66870bf_res_cloudinary_com_portal_AuctionHouse_53aa6675e4b032e680e98708_hallPicture_70bee7d1.jpg", alt: "Auction room" },
];

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % carouselImages.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white" style={{ minHeight: 480 }}>
      {/* Carousel bg */}
      {carouselImages.map((img, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" style={{ filter: "brightness(0.18) saturate(0.6)" }} />
        </div>
      ))}

      {/* Neon gradient overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 20% 50%, #f700ff18 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 50%, #00f7ff14 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 80% at 50% 100%, #9d00ff10 0%, transparent 60%)" }} />

      {/* Neon grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        backgroundImage: "linear-gradient(#f700ff08 1px, transparent 1px), linear-gradient(90deg, #f700ff08 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f700ff33] bg-[#f700ff0a] mb-6">
            <Zap className="h-3 w-3" style={{ color: "#f700ff" }} />
            <span className="text-xs font-semibold" style={{ color: "#f700ff" }}>Live Auctions • Israel's #1 Portal</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 leading-none tracking-tight">
            The{" "}
            <span className="gradient-text">bidspirit</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 font-light mb-10 max-w-xl mx-auto">
            Your gate to the auction houses' arena
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Search lots, catalogs, houses..."
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#f700ff88] focus:ring-2 focus:ring-[#f700ff33] transition-all"
              />
            </div>
            <button className="btn-neon rounded-xl px-6 py-3 text-sm font-bold flex-shrink-0">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {["Art", "Judaica", "Collectibles", "Numismatics", "Jewelry", "Home Design"].map((tag, i) => {
              const colors = ["#f700ff", "#9d00ff", "#00f7ff", "#0088ff", "#f700ff", "#9d00ff"];
              return (
                <button key={tag} className="px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105"
                  style={{ borderColor: colors[i] + "55", color: colors[i], background: colors[i] + "0f" }}>
                  {tag}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Slide dots */}
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
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: color + "18", border: `1px solid ${color}44` }}>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${color}55, transparent)` }} />
      </div>
    </AnimatedElement>
  );
}

function AuctionCard({ auction, index, buttonLabel = "View Auction", accentColor = "#f700ff" }) {
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
            <div className="absolute top-2 left-2 text-white text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              Part {auction.part}
            </div>
          )}
        </div>
        <div className="p-3">
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
          <a href={auction.view_url || "#"}
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
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all"
              style={{ borderColor: "#f700ff33", background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
              <img src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/846ba5fb9_res_cloudinary_com_portal_AuctionHouse_53a9d826e4b032e680e986fe_EXTERNAL_AD_3316416d.png"
                alt="Tiroche" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
              <div>
                <div className="font-bold text-gray-900 text-sm">Tiroche - Israeli Art</div>
                <div className="text-xs font-medium" style={{ color: "#f700ff" }}>Grand Auction — June 28th</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer hover:shadow-md transition-all flex-shrink-0"
              style={{ borderColor: "#00f7ff33", background: "linear-gradient(135deg, #00f7ff08, #0088ff05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #00f7ff, #0088ff)" }}>
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-sm">Bidspirit App</div>
                <div className="text-xs text-gray-400">Bid live from your phone</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 pl-1">All times displayed in your local timezone</p>
        </div>
      </section>
    </AnimatedElement>
  );
}

function UpcomingAuctionsSection({ auctions }) {
  const staticFallback = [
    { name: "Hizdamnut", auction_number: "50", date: "Thu, Jun 18", time: "11:30", location: "Tel Aviv", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/81cfa745d_bidspirit-images_global_ssl_fastly_net_691_v3_04fbf0dd.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Ben-Ami Endres", auction_number: "302", date: "Thu, Jun 18", time: "12:00", location: "Herzeliya", description: "Special Auction from Estates", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/38e8a2990_bidspirit-images_global_ssl_fastly_net_200_v1_61d7997a.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Noam Alon", auction_number: "18", date: "Thu, Jun 18", time: "12:00", location: "Holon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7d1a4006a_bidspirit-images_global_ssl_fastly_net_268_v3_0a739447.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Ruth Gallery", auction_number: "43", date: "Thu, Jun 18", time: "12:00", location: "Ashdod", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cc35671d9_bidspirit-images_global_ssl_fastly_net_301_v15_2af99078.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Art collect", auction_number: "108", date: "Sat, Jun 20", time: "13:30", location: "Holon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/fa73eb325_bidspirit-images_global_ssl_fastly_net_549_v1_8dd42122.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Moreshet", auction_number: "92", date: "Sun, Jun 21", time: "12:00", location: "Bnei Brak", description: "Summer Auction", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c0f11c82e_bidspirit-images_global_ssl_fastly_net_254_v9_b7c0a814.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Kedem", auction_number: "062", date: "Tue, Jun 23", time: "10:00", location: "Jerusalem", description: "Judaica | Letters | Photographs", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/5c66d08c2_bidspirit-images_global_ssl_fastly_net_588_v6_e95ac575.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Gallery 74", auction_number: "0147", date: "Thu, Jun 25", time: "11:30", location: "Tel Aviv", description: "Jewelry, Art and Antiques", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/62869b32d_bidspirit-images_global_ssl_fastly_net_283_v1_38b76886.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Tiroche", auction_number: "205", date: "Sun, Jun 28", time: "12:00", location: "Herzeliya", description: "Israeli & International Art", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/6d650aab9_bidspirit-images_global_ssl_fastly_net_456_v2_24d94d97.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Alma", auction_number: "162", date: "Sun, Jun 28", time: "11:00", location: "Tel Aviv", description: "Jewelry Gems and Timepieces", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/91da9d921_bidspirit-images_global_ssl_fastly_net_650_v2_5659f930.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "King David Auctions", auction_number: "207", date: "Thu, Jun 25", time: "11:00", location: "Jerusalem", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/55ef5d452_bidspirit-images_global_ssl_fastly_net_1022_v2_510636c9.jpeg", category: "upcoming", part: "", view_url: "#" },
    { name: "Sigallery", auction_number: "84", date: "Sun, Jun 21", time: "12:30", location: "Rosh Pina", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3968e3931_bidspirit-images_global_ssl_fastly_net_344_v2_16293109.jpg", category: "upcoming", part: "", view_url: "#" },
  ];
  const items = auctions.length > 0 ? auctions.filter(a => a.category === "upcoming") : staticFallback;

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Upcoming Auctions" color="#f700ff" icon={Zap} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.slice(0, 12).map((auction, index) => (
            <AuctionCard key={auction.id || index} auction={auction} index={index} accentColor="#f700ff" />
          ))}
        </div>
      </div>
    </section>
  );
}

const additionalAuctions = [
  { name: "Israeliana Auctions", auction_number: "63", date: "Sat, Jun 20", time: "13:30", location: "Rishon LeTsiyon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/1a50b6818_res_cloudinary_com_portal_AuctionHouse_6183a1b7fd6bc548d1ae628a_mainPageLogo_c7f9e8a2.png", part: "", view_url: "#" },
  { name: "NeverLand Collectibles", auction_number: "50", date: "Sun, Jun 21", time: "10:00", description: "50th Anniversary Sale", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/190157253_bidspirit-images_global_ssl_fastly_net_290_v9_f8371104.jpg", part: "", view_url: "#" },
  { name: "The new Israeli Gallery", auction_number: "12", date: "Mon, Jun 22", time: "14:00", location: "HAIFA", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/e2dee3eee_bidspirit-images_global_ssl_fastly_net_258_v1_ae22b09c.jpg", part: "", view_url: "#" },
  { name: "The Bidder", auction_number: "134", date: "Tue, Jun 23", time: "10:00", location: "Gedera", description: "Judaica Objects. Jewelry, Porcelain", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/21e55b8c6_bidspirit-images_global_ssl_fastly_net_531_v1_08846bc6.jpg", part: "", view_url: "#" },
  { name: "Teddy art's & antiques", auction_number: "89", date: "Wed, Jun 24", time: "10:00", location: "Ganei Tiqkva", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/556a17a25_bidspirit-images_global_ssl_fastly_net_659_v6_0fe14d8b.jpg", part: "", view_url: "#" },
  { name: "History for sale", auction_number: "159", date: "Thu, Jun 25", time: "12:00", location: "Givatayim", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/366bdae20_bidspirit-images_global_ssl_fastly_net_544_v2_c054d76a.jpg", part: "", view_url: "#" },
];

function AdditionalAuctionsSection() {
  return (
    <section className="py-10" style={{ background: "linear-gradient(180deg, #fafafa, #fff)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Additional Auctions" color="#9d00ff" icon={TrendingUp} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {additionalAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} accentColor="#9d00ff" />
          ))}
        </div>
      </div>
    </section>
  );
}

const buyNowAuctions = [
  { name: "GAL COLLECTION", auction_number: "56", date: "Jun 17, 2026", location: "Givaat Shmuel", description: "Numismatics, Fountain Pens, Watches", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/e3ea4ef3b_bidspirit-images_global_ssl_fastly_net_298_v4_e97ddb55.jpg", part: "", view_url: "#" },
  { name: "third time", auction_number: "180", date: "Jun 17, 2026", location: "Binyamina", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/21bda5af8_bidspirit-images_global_ssl_fastly_net_854_v2_51dd077b.jpg", part: "2", view_url: "#" },
  { name: "Otzarot", auction_number: "22", date: "Jun 16, 2026", location: "Bnay Brak", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/10ad13964_bidspirit-images_global_ssl_fastly_net_264_v1_95696f6f.png", part: "", view_url: "#" },
  { name: "Yotzrim - Israeli Art", auction_number: "31", date: "Jun 15, 2026", description: "Original Israeli artworks and lithographs.", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/0d980a102_bidspirit-images_global_ssl_fastly_net_578_v4_70c56d47.jpg", part: "", view_url: "#" },
  { name: "Ron Ohayon Gallery", auction_number: "75", date: "Jun 14, 2026", location: "Tel Aviv-Yafo", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8f5c224fa_bidspirit-images_global_ssl_fastly_net_397_v17_57845b84.jpg", part: "", view_url: "#" },
  { name: "ARTY", auction_number: "67", date: "Jun 4, 2026", location: "Tel Aviv", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cddc3a0c9_bidspirit-images_global_ssl_fastly_net_378_v12_789212fd.jpg", part: "", view_url: "#" },
];

function BuyNowSection() {
  return (
    <section className="bg-white py-10 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Buy it now — non sold items" color="#00f7ff" icon={Tag} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {buyNowAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="Results" accentColor="#00c4cc" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopsSection({ shops }) {
  const staticFallback = [
    { name: "PASAREL", description: "Jewelry, Silver, Art, Judaica, Collectibles and More...", location: "Netanya", shop_url: "#" },
    { name: "The Bidder", description: "The Bidder Auctions Store", location: "Gedera", shop_url: "#" },
    { name: "Tiroche", description: "TIROCHE AUCTION HOUSE - BUY NOW STORE", location: "Herzeliya", shop_url: "#" },
    { name: "Empire Auctions", description: "Rare Israeliana from a Private Collection", location: "Ramat Gan", shop_url: "#" },
    { name: "History for sale", description: "Historic items and memorabilia", location: "Givatayim", shop_url: "#" },
  ];
  const items = shops.length > 0 ? shops : staticFallback;

  return (
    <section className="py-10" style={{ background: "linear-gradient(180deg, #fafafa, #fff)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Direct purchase — Shops" color="#9d00ff" icon={Store} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.map((shop, index) => (
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
                  To the shop
                </a>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="btn-neon rounded-xl px-8 py-2.5 text-sm font-bold text-white">To all shops</button>
        </div>
      </div>
    </section>
  );
}

const pastResults = [
  { name: "Midler's auction", auction_number: "3", date: "Jun 16, 2026", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/dced20964_res_cloudinary_com_portal_AuctionHouse_69db407a0128505dcb25e6f4_mainPageLogo_28e971ea.png", part: "", view_url: "#" },
  { name: "Har Zion Art", auction_number: "10", date: "Jun 16, 2026", location: "Holon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/2ca00b277_res_cloudinary_com_portal_AuctionHouse_5f0700b50b6b347c696d824e_mainPageLogo_e7b0e49f.png", part: "", view_url: "#" },
  { name: "Kidmat Dena", auction_number: "42", date: "Jun 16, 2026", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7a043dcd5_bidspirit-images_global_ssl_fastly_net_594_v1_59e23bcd.jpg", part: "2", view_url: "#" },
  { name: "AGG", auction_number: "99", date: "Jun 15, 2026", location: "Beer sheva", description: "Pokemon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/68307bf49_bidspirit-images_global_ssl_fastly_net_354_v1_09d85b4d.jpg", part: "", view_url: "#" },
  { name: "Matsart", auction_number: "10226", date: "Jun 15, 2026", location: "Jerusalem", description: "Interiors 102", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/a37a7d0ca_bidspirit-images_global_ssl_fastly_net_334_v3_2a200dd9.jpg", part: "", view_url: "#" },
  { name: "King David Auctions", auction_number: "206", date: "Jun 15, 2026", location: "Jerusalem", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/ccc55c8de_bidspirit-images_global_ssl_fastly_net_1094_v1_8448da00.jpg", part: "2", view_url: "#" },
];

function PastResultsSection() {
  return (
    <section className="bg-white py-10 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Past Auction Results" color="#0088ff" icon={TrendingUp} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {pastResults.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="Results" accentColor="#0088ff" />
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="btn-neon-cyan rounded-xl px-8 py-2.5 text-sm font-bold">All Auction Results</button>
        </div>
      </div>
    </section>
  );
}

const carsAuctions = [
  { name: "גלעד נרקיס | משרד עורכי דין", date: "Thu, Jun 18", time: "02:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7d41bb1ee_bidspirit-images_global_ssl_fastly_net_248_v2_452d8d1c.jpg", view_url: "#" },
  { name: "פינקלשטיין חננאל, משרד עורכי דין", date: "Thu, Jun 18", time: "03:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3bc6091c6_bidspirit-images_global_ssl_fastly_net_300_v1_ab79cc9c.jpg", view_url: "#" },
  { name: "שטאובר את צברי משרד עורכי דין", date: "Thu, Jun 18", time: "03:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8a6388be2_bidspirit-images_global_ssl_fastly_net_241_v1_c08e1856.jpg", view_url: "#" },
  { name: "שגיב ויפעת עזרא | משרד עורכי דין", date: "Thu, Jun 18", time: "05:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/f3c005374_bidspirit-images_global_ssl_fastly_net_242_v1_cf120317.jpg", view_url: "#" },
];

const realEstateAuctions = [
  { name: "עופר אלפסי | משרד עורכי דין", date: "Thu, Jul 4", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/12100237e_res_cloudinary_com_portal_AuctionHouse_5c17a59f9a0ed70fa88751a5_mainPageLogo_c04cc2e2.png", view_url: "#" },
  { name: "שגיא רוזנק, חברת עורכי דין", date: "Sun, Jul 21", time: "05:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/54c498646_res_cloudinary_com_portal_AuctionHouse_665581629ce5c9034dff7ef1_mainPageLogo_848589e8.png", view_url: "#" },
  { name: "ישראל אדלשטיין | משרד עורכי דין", date: "Sun, Jul 21", time: "05:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/1981440ec_res_cloudinary_com_portal_AuctionHouse_5ef1d37d7f85ea0960cdfa16_mainPageLogo_62cd356e.png", view_url: "#" },
  { name: "ש.כהן ושות' | עורכי דין ונוטריון", date: "Sun, Mar 30", time: "05:00", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/dced20964_res_cloudinary_com_portal_AuctionHouse_69db407a0128505dcb25e6f4_mainPageLogo_28e971ea.png", view_url: "#" },
];

function SpecialtyAuctionsSection() {
  return (
    <section className="py-10" style={{ background: "linear-gradient(180deg, #fafafa, #fff)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Cars Auctions" color="#f700ff" icon={Zap} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {carsAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} accentColor="#f700ff" />
          ))}
        </div>
        <SectionHeader title="Real Estate Auctions" color="#9d00ff" icon={TrendingUp} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {realEstateAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="More details" accentColor="#9d00ff" />
          ))}
        </div>
      </div>
    </section>
  );
}

const futureAuctions = [
  { name: "HAMIGOS", auction_number: "52", date: "Wed, Jun 24", time: "13:00", location: "Netanya", description: "Catalog available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/a04d2b89e_bidspirit-images_global_ssl_fastly_net_293_v2_d486dfb1.jpg", view_url: "#" },
  { name: "Yair gallery", auction_number: "87", date: "Sat, Jun 27", time: "13:30", location: "Tel Aviv-Yafo", description: "Catalog available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/ba582297d_res_cloudinary_com_portal_AuctionHouse_53aa67d0e4b032e680e98718_mainPageLogo_a53befe0.png", view_url: "#" },
  { name: "Duzza antiques", auction_number: "93", date: "Mon, Jun 29", time: "13:00", location: "Zichron Yaakov", description: "Catalog available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/43d57ad83_bidspirit-images_global_ssl_fastly_net_343_v1_c33282d3.jpg", view_url: "#" },
  { name: "Moreshet", auction_number: "93", date: "Tue, Jun 30", time: "13:00", location: "Bnei Brak", description: "The 22th Chabad Auction", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cf4a56f83_bidspirit-images_global_ssl_fastly_net_258_v1_726fdbcd.jpg", view_url: "#" },
  { name: "Winner'S", auction_number: "155", date: "Sun, Jul 5", time: "13:00", location: "Jerusalem", description: "Catalog available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/201615c3f_bidspirit-images_global_ssl_fastly_net_133_v1_824b360b.jpg", view_url: "#" },
  { name: "Jacov Jewelry", auction_number: "60", date: "Thu, Jul 9", time: "11:00", location: "Holon", description: "LIMITED EDITION - Jewelry, art, antiques", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/687f80bb2_bidspirit-images_global_ssl_fastly_net_306_v1_27f6e0ee.jpg", view_url: "#" },
];

function FutureAuctionsSection() {
  return (
    <section className="bg-white py-10 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader title="Future Auctions" color="#00f7ff" icon={Zap} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {futureAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="View Details" accentColor="#00c4cc" />
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="btn-neon-cyan rounded-xl px-8 py-2.5 text-sm font-bold">All Future Auctions</button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AuctionEntity.list("-created_date", 50).then(setAuctions).catch(() => {}),
      ShopEntity.list("-created_date", 10).then(setShops).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className={`transition-opacity duration-500 bg-white ${loading ? "opacity-0" : "opacity-100"}`}>
      <HeroSection />
      <FeaturedBanner />
      <UpcomingAuctionsSection auctions={auctions} />
      <AdditionalAuctionsSection />
      <BuyNowSection />
      <ShopsSection shops={shops} />
      <PastResultsSection />
      <SpecialtyAuctionsSection />
      <FutureAuctionsSection />
    </div>
  );
}