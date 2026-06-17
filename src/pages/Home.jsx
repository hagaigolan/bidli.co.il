import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MapPin, Clock, Search, Gavel, Eye, Image as ImageIcon } from "lucide-react";
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
      if (entry.isIntersecting) { 
        clearTimeout(fallback); 
        setTimeout(() => setIsVisible(true), delay); 
        observer.unobserve(el); 
      }
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
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] bg-foreground">
      {/* Background Carousel */}
      {carouselImages.map((img, i) => (
        <div 
          key={i}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay gradient to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-foreground/40" />
        </div>
      ))}

      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen" style={{ animation: 'floatA 10s ease-in-out infinite' }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" style={{ animation: 'floatB 12s ease-in-out infinite reverse' }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-background/10 backdrop-blur-sm p-6 sm:p-10 rounded-xl border border-white/10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg flex flex-col sm:flex-row items-center justify-center gap-2">
            <span className="text-accent text-4xl sm:text-5xl md:text-6xl">$60</span>
            <span className="font-light text-white/90">The <span className="font-bold text-primary animate-pulse">bidspirit</span> portal is your gate</span>
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-white/80 font-light tracking-wide">
            to the auction houses' arena
          </p>
          
          <div className="mt-8 flex justify-center">
             <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold uppercase px-8 h-12 rounded-sm shadow-xl hover:-translate-y-1 hover:shadow-primary/20 transition-all duration-300">
                Register Now
             </Button>
          </div>
        </motion.div>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
        {carouselImages.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentSlide(i)} 
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-primary w-6" : "bg-white/50 hover:bg-white/80"}`} 
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

function FeaturedBannerSection() {
  return (
    <AnimatedElement>
      <section className="bg-background py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex justify-center">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center w-full max-w-5xl">
            {/* Banner 1 */}
            <div className="relative group cursor-pointer overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <img
                src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/846ba5fb9_res_cloudinary_com_portal_AuctionHouse_53a9d826e4b032e680e986fe_EXTERNAL_AD_3316416d.png"
                alt="Tiroche - Israeli Art"
                className="w-full h-auto max-h-[80px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Banner 2 */}
             <div className="relative group cursor-pointer overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 bg-card">
              <img
                src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cf7d870e5_res_cloudinary_com_portal_Auction_6a26b5b27fb9c269aa1e8623_openGraphImage_c954b90a.png"
                alt="Bidspirit App"
                className="w-full h-auto max-h-[80px] object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display='none' }}
              />
               <div className="absolute inset-0 bg-primary/90 flex flex-col items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-center">
                  <span className="font-bold text-sm">Bidspirit app</span>
                  <span className="text-xs">Bid online from your mobile!</span>
               </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4 font-medium tracking-wide">
          Auction dates and times are displayed in your local time (current time: 10:22)
        </p>
      </section>
    </AnimatedElement>
  );
}

function AuctionCard({ auction, index, buttonLabel = "View Auction" }) {
  return (
    <AnimatedElement delay={index * 50}>
      <div className="bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full rounded-sm overflow-hidden">
        
        {/* Image Container */}
        <div className="relative p-3 bg-white aspect-[4/3] flex items-center justify-center border-b border-border/50">
          {auction.image_url ? (
             <img
              src={auction.image_url}
              alt={auction.name}
              className="max-w-full max-h-full object-contain group-hover:scale-[1.03] transition-transform duration-500 drop-shadow-sm"
              onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E"; }}
            />
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          )}
          
          {/* Top Badges */}
          {auction.part && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm shadow-sm z-10">
              Part {auction.part}
            </div>
          )}
          {auction.category === "upcoming" && (
             <div className="absolute top-2 right-2 bg-blue-600/90 backdrop-blur-sm text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm shadow-sm z-10 flex items-center gap-1 animate-pulse">
               <Eye className="w-3 h-3"/> Live
             </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-3 flex flex-col flex-1 text-center bg-card">
          <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
            {auction.name} {auction.auction_number ? `- Auction ${auction.auction_number}` : ""}
          </h3>
          
          <div className="text-[11px] text-muted-foreground mb-2 flex-grow flex flex-col items-center justify-start">
            {auction.date && (
              <span className="font-medium">{auction.date}{auction.time ? `, ${auction.time}` : ""}</span>
            )}
            {auction.description && (
              <p className="mt-1 line-clamp-2 text-[10px] opacity-80">{auction.description}</p>
            )}
          </div>

          {/* Footer Area */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground/60">
               {/* Decorative icons simulating flags/types based on the screenshot */}
               <MapPin className="h-3 w-3" />
               {index % 3 === 0 && <Gavel className="h-3 w-3" />}
               <span className="w-4 h-3 bg-blue-100 rounded-[1px] border border-blue-200 block" title="Israel Region"></span>
            </div>
            
            <a
              href={auction.view_url || "#"}
              className="inline-flex items-center justify-center bg-primary text-primary-foreground text-[11px] font-bold py-1.5 px-3 rounded-sm shadow-sm hover:bg-primary/90 hover:shadow hover:-translate-y-[1px] transition-all active:scale-95"
            >
              {buttonLabel}
            </a>
          </div>
        </div>
      </div>
    </AnimatedElement>
  );
}

function SectionHeader({ title }) {
  return (
    <AnimatedElement>
      <div className="flex flex-col items-center justify-center mb-8 relative">
        <h2 className="text-2xl font-normal text-foreground relative z-10 bg-background px-4 text-center">
          {title}
        </h2>
        {/* Subtle decorative line behind text, typical in this design style even if invisible in some screenshots, it anchors the center titles */}
      </div>
    </AnimatedElement>
  );
}

function SectionFooterAction({ label, href = "#" }) {
  return (
    <div className="text-center mt-8">
      <a 
        href={href} 
        className="inline-block bg-primary text-primary-foreground text-sm font-semibold py-2.5 px-8 rounded-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
      >
        {label}
      </a>
    </div>
  );
}


function UpcomingAuctionsSection({ auctions }) {
  const staticFallback = [
    { name: "Hizdamnut", auction_number: "50", date: "Thursday, Jun 18", time: "11:30", location: "Tel Aviv", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/81cfa745d_bidspirit-images_global_ssl_fastly_net_691_v3_04fbf0dd.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Ben-Ami Endres", auction_number: "302", date: "Thursday, Jun 18", time: "12:00", location: "Herzeliya", description: "Special Auction from Estates and Collections", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/38e8a2990_bidspirit-images_global_ssl_fastly_net_200_v1_61d7997a.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Noam Alon", auction_number: "18", date: "Thursday, Jun 18", time: "12:00", location: "Holon", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7d1a4006a_bidspirit-images_global_ssl_fastly_net_268_v3_0a739447.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Ruth Gallery", auction_number: "43", date: "Thursday, Jun 18", time: "12:00", location: "Ashdod", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cc35671d9_bidspirit-images_global_ssl_fastly_net_301_v15_2af99078.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Art collect", auction_number: "108", date: "Saturday, Jun 20", time: "13:30", location: "Holon", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/fa73eb325_bidspirit-images_global_ssl_fastly_net_549_v1_8dd42122.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Moreshet", auction_number: "92", date: "Sunday, Jun 21", time: "12:00", location: "Bnei Brak", description: "Summer Auction of Moreshet", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/c0f11c82e_bidspirit-images_global_ssl_fastly_net_254_v9_b7c0a814.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Kedem", auction_number: "062", date: "Tuesday, Jun 23", time: "10:00", location: "Jerusalem", description: "Online Auction: Judaica | Letters and Manuscripts | Photographs", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/5c66d08c2_bidspirit-images_global_ssl_fastly_net_588_v6_e95ac575.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Gallery 74", auction_number: "0147", date: "Thursday, Jun 25", time: "11:30", location: "Tel Aviv", description: "Summer Sale - Vintage and Modern Jewelry, Art and Antiques, Branded Bags", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/62869b32d_bidspirit-images_global_ssl_fastly_net_283_v1_38b76886.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "Tiroche", auction_number: "205", date: "Sunday, Jun 28", time: "12:00", location: "Herzeliya", description: "Israeli & International Art Auction", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/6d650aab9_bidspirit-images_global_ssl_fastly_net_456_v2_24d94d97.jpg", category: "upcoming", part: "1", view_url: "#" },
    { name: "Alma", auction_number: "162", date: "Sunday, Jun 28", time: "11:00", location: "Tel Aviv", description: "Summer Sparkle - Jewelry Gems and Timepieces", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/91da9d921_bidspirit-images_global_ssl_fastly_net_650_v2_5659f930.jpg", category: "upcoming", part: "", view_url: "#" },
    { name: "King David Auctions", auction_number: "207", date: "Thursday, Jun 25", time: "11:00", location: "Jerusalem", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/55ef5d452_bidspirit-images_global_ssl_fastly_net_1022_v2_510636c9.jpeg", category: "upcoming", part: "", view_url: "#" },
    { name: "Sigallery", auction_number: "84", date: "Sunday, Jun 21", time: "12:30", location: "Rosh Pina", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3968e3931_bidspirit-images_global_ssl_fastly_net_344_v2_16293109.jpg", category: "upcoming", part: "", view_url: "#" },
  ];
  const items = auctions.length > 0 ? auctions.filter(a => a.category === "upcoming") : staticFallback;

  return (
    <section className="bg-background py-12 relative overflow-hidden">
      <div className="absolute top-0 right-[-10%] w-[40%] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader title="Upcoming Auctions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.slice(0, 18).map((auction, index) => (
            <AuctionCard key={auction.id || index} auction={auction} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const additionalAuctions = [
  { name: "Israeliana Auctions", auction_number: "63", date: "Saturday, Jun 20", time: "13:30", location: "Rishon LeTsiyon", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/1a50b6818_res_cloudinary_com_portal_AuctionHouse_6183a1b7fd6bc548d1ae628a_mainPageLogo_c7f9e8a2.png", part: "", view_url: "#" },
  { name: "NeverLand Collectibles", auction_number: "50", date: "Sunday, Jun 21", time: "10:00", location: "", description: "50th Anniversary Sale - Special sale with $5 items and $1 surprise boxes", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/190157253_bidspirit-images_global_ssl_fastly_net_290_v9_f8371104.jpg", part: "", view_url: "#" },
  { name: "The new Israeli Gallery", auction_number: "12", date: "Monday, Jun 22", time: "14:00", location: "HAIFA", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/e2dee3eee_bidspirit-images_global_ssl_fastly_net_258_v1_ae22b09c.jpg", part: "", view_url: "#" },
  { name: "The Bidder", auction_number: "134", date: "Tuesday, Jun 23", time: "10:00", location: "Gedera", description: "Decorative Items, Israeliana. Judaica Objects. Jewelry, Porcelain and Ceramic", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/21e55b8c6_bidspirit-images_global_ssl_fastly_net_531_v1_08846bc6.jpg", part: "", view_url: "#" },
  { name: "Teddy art's & antiques", auction_number: "89", date: "Wednesday, Jun 24", time: "10:00", location: "Ganei Tiqkva", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/556a17a25_bidspirit-images_global_ssl_fastly_net_659_v6_0fe14d8b.jpg", part: "", view_url: "#" },
  { name: "History for sale", auction_number: "159", date: "Thursday, Jun 25", time: "12:00", location: "Givatayim", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/366bdae20_bidspirit-images_global_ssl_fastly_net_544_v2_c054d76a.jpg", part: "", view_url: "#" },
];

function AdditionalAuctionsSection() {
  return (
    <section className="bg-muted/30 py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader title="Additional Auctions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {additionalAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

const buyNowAuctions = [
  { name: "GAL COLLECTION", auction_number: "56", date: "Jun 17, 2026", time: "", location: "Givaat Shmuel", description: "Numismatics, Fountain Pens, Watches, Israeliana, Zionism, Judaica", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/e3ea4ef3b_bidspirit-images_global_ssl_fastly_net_298_v4_e97ddb55.jpg", part: "", view_url: "#" },
  { name: "third time", auction_number: "180", date: "Jun 17, 2026", time: "", location: "Binyamina", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/21bda5af8_bidspirit-images_global_ssl_fastly_net_854_v2_51dd077b.jpg", part: "2", view_url: "#" },
  { name: "Otzarot", auction_number: "22", date: "Jun 16, 2026", time: "", location: "Bnay Brak", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/10ad13964_bidspirit-images_global_ssl_fastly_net_264_v1_95696f6f.png", part: "", view_url: "#" },
  { name: "Yotzrim - Israeli Art", auction_number: "31", date: "Jun 15, 2026", time: "", location: "", description: "Curated selection of original Israeli artworks and lithographs.", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/0d980a102_bidspirit-images_global_ssl_fastly_net_578_v4_70c56d47.jpg", part: "", view_url: "#" },
  { name: "Ron Ohayon Gallery", auction_number: "75", date: "Jun 14, 2026", time: "", location: "Tel Aviv-Yafo", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8f5c224fa_bidspirit-images_global_ssl_fastly_net_397_v17_57845b84.jpg", part: "", view_url: "#" },
  { name: "ARTY", auction_number: "67", date: "Jun 4, 2026", time: "", location: "Tel Aviv", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cddc3a0c9_bidspirit-images_global_ssl_fastly_net_378_v12_789212fd.jpg", part: "", view_url: "#" },
];

function BuyNowSection() {
  return (
    <section className="bg-background py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader title="Buy it now - non sold items" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {buyNowAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="Results" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopsSection({ shops }) {
  const staticFallback = [
    { name: "PASAREL", description: "Pasarel - Jewelry, Silver, Art, Judaica, Collectibles and More...", location: "Netanya", shop_url: "#", image: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/6d650aab9_bidspirit-images_global_ssl_fastly_net_456_v2_24d94d97.jpg" },
    { name: "The Bidder", description: "The Bidder Auctions Store", location: "Gedera", shop_url: "#", image: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/21e55b8c6_bidspirit-images_global_ssl_fastly_net_531_v1_08846bc6.jpg" },
    { name: "Tiroche", description: "TIROCHE AUCTION HOUSE - BUY NOW STORE", location: "Herzeliya", shop_url: "#", image: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/846ba5fb9_res_cloudinary_com_portal_AuctionHouse_53a9d826e4b032e680e986fe_EXTERNAL_AD_3316416d.png" },
    { name: "Empire Auctions", description: "Rare Israeliana from a Private Collection", location: "Ramat Gan", shop_url: "#", image: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cddc3a0c9_bidspirit-images_global_ssl_fastly_net_378_v12_789212fd.jpg" },
    { name: "History for sale", description: "Historic items and memorabilia", location: "Givatayim", shop_url: "#", image: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/366bdae20_bidspirit-images_global_ssl_fastly_net_544_v2_c054d76a.jpg" },
  ];
  const items = shops.length > 0 ? shops : staticFallback;

  return (
    <section className="bg-muted/30 py-12 border-t border-border relative overflow-hidden">
      <div className="absolute top-[50%] left-[-5%] w-[30%] h-[300px] bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader title="Direct purchase - shops" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {items.slice(0, 5).map((shop, index) => (
            <AnimatedElement key={shop.id || index} delay={index * 80}>
              <div className="bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 flex flex-col justify-between h-full group text-center rounded-sm">
                <div>
                   {/* Mock Shop Logo Area */}
                   <div className="h-20 w-full mb-3 flex items-center justify-center overflow-hidden p-2">
                      <img src={shop.image || "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/be33c0209_bidspirit-portal-static_global_ssl_fastly_net_logo-system_85f28498.jpg"} alt={shop.name} className="max-h-full max-w-full object-contain mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                   </div>
                  <h3 className="font-bold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{shop.name}</h3>
                  <p className="text-[11px] text-muted-foreground mb-3 line-clamp-3">{shop.description}</p>
                </div>
                <div className="mt-auto pt-3 border-t border-border/40">
                  <a
                    href={shop.shop_url || "#"}
                    className="inline-block w-full text-center bg-primary text-primary-foreground text-xs font-bold py-2 px-3 hover:bg-primary/90 transition-colors duration-200 rounded-sm shadow-sm active:scale-95"
                  >
                    To the shop
                  </a>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
        <SectionFooterAction label="To all shops" />
      </div>
    </section>
  );
}

const pastResults = [
  { name: "Midler's auction", auction_number: "3", date: "Jun 16, 2026", time: "", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/dced20964_res_cloudinary_com_portal_AuctionHouse_69db407a0128505dcb25e6f4_mainPageLogo_28e971ea.png", part: "", view_url: "#" },
  { name: "Har Zion Art", auction_number: "10", date: "Jun 16, 2026", time: "", location: "Holon", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/2ca00b277_res_cloudinary_com_portal_AuctionHouse_5f0700b50b6b347c696d824e_mainPageLogo_e7b0e49f.png", part: "", view_url: "#" },
  { name: "Kidmat Dena", auction_number: "42", date: "Jun 16, 2026", time: "", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7a043dcd5_bidspirit-images_global_ssl_fastly_net_594_v1_59e23bcd.jpg", part: "2", view_url: "#" },
  { name: "AGG", auction_number: "99", date: "Jun 15, 2026", time: "", location: "Beer sheva", description: "Pokemon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/68307bf49_bidspirit-images_global_ssl_fastly_net_354_v1_09d85b4d.jpg", part: "", view_url: "#" },
  { name: "Matsart", auction_number: "10226", date: "Jun 15, 2026", time: "", location: "Jerusalem", description: "Interiors 102", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/a37a7d0ca_bidspirit-images_global_ssl_fastly_net_334_v3_2a200dd9.jpg", part: "", view_url: "#" },
  { name: "King David Auctions", auction_number: "206", date: "Jun 15, 2026", time: "", location: "Jerusalem", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/ccc55c8de_bidspirit-images_global_ssl_fastly_net_1094_v1_8448da00.jpg", part: "2", view_url: "#" },
];

function PastResultsSection() {
  return (
    <section className="bg-background py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader title="Past Auction Results" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {pastResults.map((auction, index) => (
            <AuctionCard key={index} auction={auction} index={index} buttonLabel="Results" />
          ))}
        </div>
        <SectionFooterAction label="All Auction Results" />
      </div>
    </section>
  );
}

const carsAuctions = [
  { name: "גלעד נרקיס | משרד עורכי דין", auction_number: "", date: "Thursday, Jun 18", time: "02:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/7d41bb1ee_bidspirit-images_global_ssl_fastly_net_248_v2_452d8d1c.jpg", part: "", view_url: "#" },
  { name: "פינקלשטיין חננאל, משרד עורכי דין", auction_number: "", date: "Thursday, Jun 18", time: "03:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cf7d870e5_res_cloudinary_com_portal_Auction_6a26b5b27fb9c269aa1e8623_openGraphImage_c954b90a.png", part: "", view_url: "#" },
  { name: "שטאובר את צברי משרד עורכי דין", auction_number: "", date: "Thursday, Jun 18", time: "03:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3bc6091c6_bidspirit-images_global_ssl_fastly_net_300_v1_ab79cc9c.jpg", part: "", view_url: "#" },
  { name: "שגיב ויפעת עזרא | משרד עורכי דין", auction_number: "", date: "Thursday, Jun 18", time: "05:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/8a6388be2_bidspirit-images_global_ssl_fastly_net_241_v1_c08e1856.jpg", part: "", view_url: "#" },
];

const realEstateAuctions = [
  { name: "עופר אלפסי | משרד עורכי דין", auction_number: "", date: "Thursday, Jul 4", time: "", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/f3c005374_bidspirit-images_global_ssl_fastly_net_242_v1_cf120317.jpg", part: "", view_url: "#" },
  { name: "שגיא רוזנק, חברת עורכי דין", auction_number: "", date: "Sunday, Jul 21", time: "05:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/12100237e_res_cloudinary_com_portal_AuctionHouse_5c17a59f9a0ed70fa88751a5_mainPageLogo_c04cc2e2.png", part: "", view_url: "#" },
  { name: "ישראל אדלשטיין | משרד עורכי דין", auction_number: "", date: "Sunday, Jul 21", time: "05:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/54c498646_res_cloudinary_com_portal_AuctionHouse_665581629ce5c9034dff7ef1_mainPageLogo_848589e8.png", part: "", view_url: "#" },
  { name: "ש.כהן ושות' | עורכי דין ונוטריון", auction_number: "", date: "Sunday, Mar 30", time: "05:00", location: "", description: "", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/1981440ec_res_cloudinary_com_portal_AuctionHouse_5ef1d37d7f85ea0960cdfa16_mainPageLogo_62cd356e.png", part: "", view_url: "#" },
];

function SpecialtyAuctionsSection() {
  return (
    <section className="bg-muted/30 py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        <div className="mb-12">
          <SectionHeader title="Cars auctions" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 max-w-5xl mx-auto">
            {carsAuctions.map((auction, index) => (
              <AuctionCard key={index} auction={{...auction, image_url: auction.image_url.includes('openGraph') ? carsAuctions[0].image_url : auction.image_url}} index={index} />
            ))}
          </div>
          <SectionFooterAction label="More auctions in cars portal" />
        </div>

        <div>
          <SectionHeader title="Real estate auctions" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4 max-w-5xl mx-auto">
            {realEstateAuctions.map((auction, index) => (
              <AuctionCard key={index} auction={auction} index={index} buttonLabel="More details" />
            ))}
          </div>
          <SectionFooterAction label="More auctions in the real estates portal" />
        </div>

      </div>
    </section>
  );
}

const futureAuctions = [
  { name: "HAMIGOS", auction_number: "52", date: "Wednesday, Jun 24", time: "13:00", location: "Netanya", description: "Catalog will be available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/a04d2b89e_bidspirit-images_global_ssl_fastly_net_293_v2_d486dfb1.jpg", part: "", view_url: "#" },
  { name: "Yair gallery", auction_number: "87", date: "Saturday, Jun 27", time: "13:30", location: "Tel Aviv-Yafo", description: "Catalog will be available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/ba582297d_res_cloudinary_com_portal_AuctionHouse_53aa67d0e4b032e680e98718_mainPageLogo_a53befe0.png", part: "", view_url: "#" },
  { name: "Duzza antiques", auction_number: "93", date: "Monday, Jun 29", time: "13:00", location: "Zichron Yaakov", description: "Catalog will be available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/43d57ad83_bidspirit-images_global_ssl_fastly_net_343_v1_c33282d3.jpg", part: "", view_url: "#" },
  { name: "Moreshet", auction_number: "93", date: "Tuesday, Jun 30", time: "13:00", location: "Bnei Brak", description: "The 22th Chabad Auction", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/cf4a56f83_bidspirit-images_global_ssl_fastly_net_258_v1_726fdbcd.jpg", part: "", view_url: "#" },
  { name: "Winner'S", auction_number: "155", date: "Sunday, Jul 5", time: "13:00", location: "Jerusalem", description: "Catalog will be available soon", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/201615c3f_bidspirit-images_global_ssl_fastly_net_133_v1_824b360b.jpg", part: "", view_url: "#" },
  { name: "Jacov Jewelry", auction_number: "60", date: "Thursday, Jul 9", time: "11:00", location: "Holon", description: "Auction July 2026 LIMITED EDITION", image_url: "https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/687f80bb2_bidspirit-images_global_ssl_fastly_net_306_v1_27f6e0ee.jpg", part: "", view_url: "#" },
];

function FutureAuctionsSection() {
  return (
    <section className="bg-background py-12 border-t border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <SectionHeader title="Future Auctions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {futureAuctions.map((auction, index) => (
            <AuctionCard key={index} auction={{...auction, description: <span className="text-muted-foreground/60 italic">{auction.description}</span>}} index={index} buttonLabel="View Details" />
          ))}
        </div>
        <SectionFooterAction label="All Future Auctions" />
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
    <div className={`transition-opacity duration-700 bg-background min-h-screen ${loading ? "opacity-0" : "opacity-100"}`}>
      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes floatB {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes helloBarFadeInOut {
          0% { opacity: 0; } 11% { opacity: 1; } 78% { opacity: 1; } 100% { opacity: 0; }
        }
        @keyframes blinker {
          0% { opacity: 1.0; } 50% { opacity: 0.0; } 100% { opacity: 1.0; }
        }
      `}</style>
      <HeroSection />
      <FeaturedBannerSection />
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