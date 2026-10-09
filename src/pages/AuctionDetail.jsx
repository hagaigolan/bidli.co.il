import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Clock, MapPin, User, TrendingUp, CheckCircle, Award, Eye, Zap, Bell, BellOff, MessageSquare, Heart, Pencil, RotateCcw, Star, Ban } from "lucide-react";
import { getOwnerKey } from "@/lib/favorites";
import { parseDbDate } from "@/lib/time";
import { isAnyEmailBanned } from "@/lib/banCheck";
import { useAuth } from "@/lib/AuthContext";
import OutbidNotificationModal from "@/components/OutbidNotificationModal";
import ImageSlider from "@/components/ImageSlider";
import RelatedProducts from "@/components/RelatedProducts";
import RelatedArticle from "@/components/RelatedArticle";
import SoldSimilar from "@/components/SoldSimilar";
import { BuyerFomoBanner, BuyerLiveBlock } from "@/components/BuyerFomo";
import { SellerTrustBadge } from "@/components/SellerBadge";
import ReviewModal from "@/components/ReviewModal";
import ProductChat from "@/components/ProductChat";
import ShareButton from "@/components/ShareButton";
import ProductEditModal from "@/components/ProductEditModal";
import LoginRequiredModal from "@/components/LoginRequiredModal";
import View3DButton from "@/components/View3DButton";
import CancelAuctionModal from "@/components/CancelAuctionModal";
import WinnerContactCard from "@/components/WinnerContactCard";
import AutoBidPanel from "@/components/AutoBidPanel";
import LiveBidFeed from "@/components/LiveBidFeed";
import BidLeaderboard from "@/components/BidLeaderboard";
import SoundToggle from "@/components/SoundToggle";
import { playBidPing, playTickTock, playHammer, playFireworks } from "@/lib/auctionSounds";
import confetti from "canvas-confetti";
import { setPageMeta } from "@/lib/seo";

// ── 1. LIVE URGENCY TIMER with color stages + anti-snipe ──────────────────────
function useCountdown(endsAt) {
  const calcLeft = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff, pct: Math.max(0, diff / (24 * 3600000)) };
  };
  const [left, setLeft] = useState(calcLeft);
  useEffect(() => {
    const t = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function TimerBlock({ endsAt, antiSnipeExtended }) {
  const left = useCountdown(endsAt);
  // אולם חי — טיק-טוק בדקה האחרונה, פטיש מכירה בסיום
  const prevTotalRef = useRef(left ? left.total : null);
  useEffect(() => {
    if (!left) {
      if (prevTotalRef.current !== null && prevTotalRef.current <= 60000) playHammer();
      prevTotalRef.current = null;
    } else {
      if (prevTotalRef.current !== null && left.total < prevTotalRef.current && left.total <= 60000) playTickTock();
      prevTotalRef.current = left.total;
    }
  }, [left]);
  const critical = left && left.total < 60000;   // דקה אחרונה — אדום מהבהב
  const urgent   = left && left.total < 3600000; // השעה האחרונה — אדום מהבהב ללחץ FOMO
  const color = urgent ? "#ff2200" : "#2d4f68";
  const pulseClass = urgent ? "animate-pulse" : "";

  if (!left) {
    return (
      <div className="rounded-2xl border border-gray-100 p-5 text-center" style={{ background: "#f9fafb" }}>
        <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="font-bold text-gray-700 text-lg">המכרז הסתיים</p>
        <p className="text-sm text-gray-400 mt-1">ההצעה הגבוהה ביותר אושרה</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 ${pulseClass}`}
      style={{ borderColor: color + "55", background: critical ? "#ff220010" : color + "08" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-bold" style={{ color }}>
            {critical ? "🔴 רגעים אחרונים!" : urgent ? "🔴 שעה אחרונה — אל תפספס!" : "המכרז מסתיים בעוד:"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {antiSnipeExtended && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white"
              style={{ background: "#ff6600" }}>+60 שנ׳ הוספו!</span>
          )}
          <SoundToggle />
        </div>
      </div>
      {left.total <= 10000 && (
        <div className="text-center mb-3 animate-neon-pulse">
          <p className="text-sm font-black mb-1" style={{ color }}>🔥 ההצעה הגבוהה לוקחת — שניות אחרונות!</p>
          <div className="text-6xl font-black font-mono" style={{ color, textShadow: `0 0 20px ${color}aa` }}>
            {String(left.s).padStart(2, "0")}
          </div>
        </div>
      )}
      <div className="flex flex-row-reverse gap-3 justify-center mb-3">
        {[{ v: left.h, l: "שעות" }, { v: left.m, l: "דקות" }, { v: left.s, l: "שניות" }].map(({ v, l }) => (
          <div key={l} className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl font-mono transition-all duration-300"
              style={{ background: "white", border: `2px solid ${color}66`, color,
                boxShadow: urgent ? `0 0 12px ${color}88` : "none" }}>
              {String(v).padStart(2, "0")}
            </div>
            <p className="text-xs text-gray-400 mt-1">{l}</p>
          </div>
        ))}
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${left.pct * 100}%`, background: `linear-gradient(to right, ${color}, ${color}99)` }} />
      </div>
    </div>
  );
}

// ── 2. SOCIAL PROOF — viewers count + last bid time ───────────────────────────
function SocialProofBar({ bidCount, lastBidTime }) {
  const [viewers] = useState(() => Math.floor(Math.random() * 28) + 7); // simulated
  const [secAgo, setSecAgo] = useState(null);

  useEffect(() => {
    if (!lastBidTime) return;
    const update = () => {
      const d = parseDbDate(lastBidTime);
      setSecAgo(d ? Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000)) : null);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [lastBidTime]);

  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: "#e5893d0f", border: "1px solid #e5893d33" }}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <Eye className="h-3 w-3" style={{ color: "#e5893d" }} />
        <span className="font-bold" style={{ color: "#e5893d" }}>{viewers} צופים כרגע</span>
      </div>
      {secAgo !== null && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="text-gray-600 font-medium">
            הצעה לפני {secAgo < 60 ? `${secAgo} שנ׳` : `${Math.floor(secAgo / 60)} דק׳`}
          </span>
        </div>
      )}
      {bidCount > 0 && (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
          <TrendingUp className="h-3 w-3 text-amber-600" />
          <span className="text-amber-700 font-bold">{bidCount} הצעות</span>
        </div>
      )}
    </div>
  );
}



// ── 4. OUTBID ALERT BANNER ────────────────────────────────────────────────────
function OutbidBanner({ show, currentLeader, onBidNow }) {
  if (!show) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce"
      style={{ maxWidth: 360, width: "90%" }}>
      <div className="rounded-2xl p-4 shadow-2xl text-white flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #ff2200, #e5893d)", boxShadow: "0 0 32px #ff220066" }}>
        <Bell className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-black">הוצאת מהמשחק! 😤</p>
          <p className="text-xs opacity-90">{currentLeader} עקף אותך</p>
        </div>
        <button onClick={onBidNow}
          className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all">
          הגדל הצעה →
        </button>
      </div>
    </div>
  );
}

// ── 5. STATUS-AWARE BID BUTTON (green=leading, red=outbid) ───────────────────
function BidButton({ isLeading, bidding }) {
  const bg = isLeading
    ? "linear-gradient(135deg, #00c853, #00e676)"
    : "linear-gradient(135deg, #e5893d, #3e6b8a)";
  const shadow = isLeading ? "0 0 16px #00c85355" : "0 0 16px #e5893d44";
  const label = isLeading ? "🏆 אתה מוביל — חזק עמדה" : "הגש הצעה";

  return (
    <button type="submit" disabled={bidding}
      className="w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all duration-500"
      style={{ background: bg, boxShadow: shadow }}>
      {bidding
        ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> שולח...</>
        : <><TrendingUp className="h-4 w-4" />{label}</>}
    </button>
  );
}

// ── 6. PRICE GAP PROGRESS BAR ─────────────────────────────────────────────────
function PriceProgress({ startingPrice, currentPrice, myLastBid }) {
  if (!myLastBid || myLastBid >= currentPrice) return null;
  const gap = currentPrice - myLastBid;
  const pct = Math.max(5, Math.min(95, (myLastBid / currentPrice) * 100));
  return (
    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-amber-700 font-semibold">ההצעה שלך</span>
        <span className="text-amber-800 font-black">רק ₪{gap.toLocaleString()} מהמוביל!</span>
      </div>
      <div className="w-full h-2.5 rounded-full bg-amber-200 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: "linear-gradient(to right, #f59e0b, #e5893d)" }} />
      </div>
      <p className="text-xs text-amber-600 mt-1">הוסף ₪{gap + 1} כדי לחזור לראש</p>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bidFormRef = useRef(null);
  const { user: authUser, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [bidderName, setBidderName] = useState(() => localStorage.getItem("bidder_name") || "");
  const [flashNew, setFlashNew] = useState(false);
  const [outbidShow, setOutbidShow] = useState(false);
  const [myLastBid, setMyLastBid] = useState(null);
  const [antiSnipeExtended, setAntiSnipeExtended] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [buyerReviewed, setBuyerReviewed] = useState(false);
  const [sellerReviewed, setSellerReviewed] = useState(false);
  const [reviewDirection, setReviewDirection] = useState("buyer");
  const [favSaved, setFavSaved] = useState(false);
  const [favError, setFavError] = useState("");
  // ── 7. notifications opt-in ──
  const [notifEnabled, setNotifEnabled] = useState(() => !!localStorage.getItem("notif_channels"));
  const [showNotifModal, setShowNotifModal] = useState(false);

  // Load product
  useEffect(() => {
    base44.entities.Product.filter({ id }).then(items => {
      if (items.length) setProduct(items[0]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  // ── SEO: מטא-תגיות ונתונים מובנים (Product/Offer) לעמוד המכרז ──
  useEffect(() => {
    if (!product) return;
    const price = Number(product.current_price || product.starting_price || 0);
    const isActive = product.status === "active" && new Date(product.ends_at) > new Date();
    const cleanDesc = String(product.description || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    const catKw = product.category ? [product.category, `מכרז ${product.category}`, `לקנות ${product.category}`] : [];
    setPageMeta({
      title: `${product.title} — מכרז ${product.category || "אונליין"} חי ב-bidli${product.location ? ` | ${product.location}` : ""}`,
      description: cleanDesc
        ? `${cleanDesc} מכרז חי ב-bidli — מחיר נוכחי ₪${price.toLocaleString("he-IL")}${product.location ? `, ${product.location}` : ""} · ${product.bid_count || 0} הצעות${isActive ? " · הצע מחיר עכשיו לפני סגירת המכרז" : ""}.`
        : `${product.title} במכרז אונליין ב-bidli. מחיר נוכחי ₪${price.toLocaleString("he-IL")}${product.location ? ` · ${product.location}` : ""} · ${product.bid_count || 0} הצעות.`,
      image: product.image_url,
      keywords: [product.title, product.subcategory, product.location, ...catKw, "מכרז אונליין", "מכרזים בישראל"],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: cleanDesc || product.title,
          image: product.image_urls || (product.image_url ? [product.image_url] : undefined),
          category: product.category,
          offers: {
            "@type": "Offer",
            priceCurrency: "ILS",
            price,
            availability: isActive ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            url: window.location.href,
            priceValidUntil: product.ends_at,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "bidli", item: window.location.origin },
            product.category ? { "@type": "ListItem", position: 2, name: product.category, item: `${window.location.origin}/category/${encodeURIComponent(product.category)}` } : undefined,
            { "@type": "ListItem", position: product.category ? 3 : 2, name: product.title },
          ].filter(Boolean),
        },
      ],
    });
  }, [product?.id, product?.current_price, product?.status]);

  // Check if already saved to favorites
  useEffect(() => {
    if (!id) return;
    base44.entities.Favorite.filter({ product_id: id, owner_key: getOwnerKey() })
      .then(items => setFavSaved(items.length > 0))
      .catch(() => {});
  }, [id]);

  const toggleFavorite = async () => {
    if (!product) return;
    setFavError("");
    try {
      const existing = await base44.entities.Favorite.filter({ product_id: product.id, owner_key: getOwnerKey() });
      if (existing.length) {
        await base44.entities.Favorite.delete(existing[0].id);
        setFavSaved(false);
      } else {
        await base44.entities.Favorite.create({
          product_id: product.id,
          product_title: product.title,
          product_image_url: product.image_url || "",
          product_ends_at: product.ends_at,
          owner_key: getOwnerKey(),
          notify_email: localStorage.getItem("notif_email") || localStorage.getItem("bidder_email") || "",
          notify_phone: localStorage.getItem("notif_phone") || "",
        });
        setFavSaved(true);
      }
    } catch { setFavError("שגיאה בעדכון המועדפים, נסה שנית"); }
  };

  // בדיקה אם המשתמש כבר דירג את הצד השני במכרז זה (הדירוג ההדדי נפתח לאחר המסירה)
  useEffect(() => {
    if (!id || !product) return;
    const myEmails = [
      (localStorage.getItem("bidder_email") || "").trim().toLowerCase(),
      (authUser?.email || "").trim().toLowerCase(),
    ].filter(Boolean);
    const myNameTrim = (localStorage.getItem("bidder_name") || "").trim();
    if (!myEmails.length && !myNameTrim) return;
    const isMine = r =>
      myEmails.includes((r.reviewer_email || "").trim().toLowerCase()) ||
      (myNameTrim && r.reviewer_name === myNameTrim);
    const sellerEmail = (product.seller_email || "").trim().toLowerCase();
    const buyerEmail = (product.highest_bidder_email || "").trim().toLowerCase();
    base44.entities.Review.filter({ product_id: id })
      .then(reviews => {
        const mine = reviews.filter(isMine);
        setBuyerReviewed(!!sellerEmail && mine.some(r =>
          ((r.reviewee_email || r.seller_email || "")).trim().toLowerCase() === sellerEmail));
        setSellerReviewed(!!buyerEmail && mine.some(r =>
          (r.reviewee_email || "").trim().toLowerCase() === buyerEmail));
      }).catch(() => {});
  }, [id, product?.seller_email, product?.highest_bidder_email, product?.status]);

  // Load bid history
  useEffect(() => {
    if (!id) return;
    base44.entities.Bid.filter({ product_id: id }, "-created_date", 20)
      .then(setBids).catch(() => {});
  }, [id]);

  // Real-time product subscription
  useEffect(() => {
    const unsub = base44.entities.Product.subscribe((event) => {
      if (event.data?.id !== id) return;
      if (event.type === "update") {
        const prev = product;
        setProduct(event.data);
        // Flash new bid in feed
        setFlashNew(true);
        setTimeout(() => setFlashNew(false), 1500);
        // אולם חי — צליל להצעה חדשה שהגיעה בזמן אמת
        if ((event.data.current_price || 0) > (prev?.current_price || 0)) playBidPing();
        // הארכת זמן חד-פעמית — באנר חי כשזמן הסיום הוארך בפועל
        if (prev?.ends_at && new Date(event.data.ends_at) > new Date(prev.ends_at)) {
          setAntiSnipeExtended(true);
          setTimeout(() => setAntiSnipeExtended(false), 5000);
        }
        // Outbid alert
        const myName = localStorage.getItem("bidder_name");
        if (myName && prev?.highest_bidder === myName && event.data.highest_bidder !== myName) {
          setOutbidShow(true);
          setTimeout(() => setOutbidShow(false), 6000);
          // Send email/WhatsApp notifications
          const notifChannels = localStorage.getItem("notif_channels");
          if (notifChannels) {
            const channels = JSON.parse(notifChannels);
            const notifEmail = localStorage.getItem("notif_email");
            const notifPhone = localStorage.getItem("notif_phone");
            const pageUrl = window.location.href;
            const productTitle = event.data.title;
            const newPrice = event.data.current_price;
            const newLeader = event.data.highest_bidder;

            if (channels.email && notifEmail) {
              // הנמען מאומת בשרת מול המציע המשני (המוביל הקודם) — לא ניתן לשלוח לכתובת שרירותית
              base44.functions.invoke("sendOutbidAlert", {
                product_id: id,
                recipient_email: notifEmail,
              }).catch(() => {});
            }

            if (channels.whatsapp && notifPhone) {
              const cleanPhone = notifPhone.replace(/[^0-9]/g, "").replace(/^0/, "972");
              const msg = encodeURIComponent(`הוצאת מהמשחק! 😤\n${newLeader} הגיש ₪${(newPrice||0).toLocaleString()} על "${productTitle}".\nלחץ להגיש הצעה גבוהה יותר: ${pageUrl}`);
              // Open WhatsApp link (works on mobile, opens chat on desktop)
              const waUrl = `https://wa.me/${cleanPhone}?text=${msg}`;
              window.open(waUrl, "_blank");
            }
          }
        }
        // Reload bids
        base44.entities.Bid.filter({ product_id: id }, "-created_date", 20).then(setBids).catch(() => {});
      }
    });
    return unsub;
  }, [id, product, notifEnabled]);

  const mySellerEmail = (localStorage.getItem("seller_email") || localStorage.getItem("bidder_email") || "").trim().toLowerCase();
  const isMyAuction = !!(product && product.seller_email && mySellerEmail &&
    mySellerEmail === product.seller_email.trim().toLowerCase());
  const isSellerViewing = isMyAuction ||
    !!(product && ((product.seller_user_id && authUser && product.seller_user_id === authUser.id) ||
      (product.seller_email && authUser?.email &&
        product.seller_email.trim().toLowerCase() === authUser.email.trim().toLowerCase())));
  const ended = product && new Date(product.ends_at) <= new Date();
  const cancelled = product?.status === "cancelled";
  // עריכה — המוכר עצמו, או אדמין על מכרזים פיקטיביים שפורסמו ע"י הסוכן "בידלי"
  const isAdmin = authUser?.role === "admin";
  const canEdit = isSellerViewing || (isAdmin && product?.seller_user_id?.startsWith("bidli-agent"));
  const minBid = product ? (product.current_price || product.starting_price || 0) + 1 : 1;
  const myName = bidderName || localStorage.getItem("bidder_name");
  const isLeading = !!myName && product?.highest_bidder === myName;
  // דירוג הדדי — זמין לאחר שהמוצר סופק לקונה
  const deliveredToBuyer = product && ["delivered", "released"].includes(product.status);
  const myEmails = [
    (localStorage.getItem("bidder_email") || "").trim().toLowerCase(),
    (authUser?.email || "").trim().toLowerCase(),
  ].filter(Boolean);
  const iAmBuyer = !!product?.highest_bidder && (
    (myName && product.highest_bidder.trim() === myName.trim()) ||
    (product.highest_bidder_email && myEmails.includes(product.highest_bidder_email.trim().toLowerCase()))
  );

  // ── אפקט זיקוקים איטי ומיוחד ל-3 שניות סביב כפתור הגשת ההצעה ──
  const confettiCanvasRef = useRef(null);
  const confettiRafRef = useRef(null);
  useEffect(() => () => {
    if (confettiRafRef.current) cancelAnimationFrame(confettiRafRef.current);
  }, []);
  const startBidConfetti = () => {
    playFireworks();
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const fire = confetti.create(canvas, { resize: true, useTargetWidth: true });
    const colors = ["#e5893d", "#e8b04a", "#3e6b8a", "#6aa3cd", "#00c853", "#ffffff"];
    const end = Date.now() + 3000;
    let lastLaunch = 0;
    let lastBurst = 0;
    const frame = () => {
      const now = Date.now();
      // שיגור — זיקוק אמיתי שעף מהתחתית לשמיים
      if (now - lastLaunch > 280) {
        lastLaunch = now;
        const x = 0.2 + Math.random() * 0.6;
        fire({ particleCount: 3, angle: 90, spread: 24, startVelocity: 52, decay: 0.91, gravity: 0.9, ticks: 90, scalar: 1.5, shapes: ["circle"], origin: { x, y: 1 }, colors: ["#e8b04a", "#e5893d", "#ffffff"] });
        // הבהוב בקצה הזיקוק — ניצוץ לבן קטן וקצר שנשאר מאחורי השיגור
        fire({ particleCount: 2, angle: 90, spread: 40, startVelocity: 46, decay: 0.9, gravity: 0.9, ticks: 40, scalar: 0.7, shapes: ["circle"], origin: { x: x + 0.02, y: 0.97 }, colors: ["#ffffff", "#fff3d6"] });
      }
      // פיצוץ — התפרצות עיגולית איטית בשמיים
      if (now - lastBurst > 650) {
        lastBurst = now;
        const bx = 0.15 + Math.random() * 0.7;
        const by = 0.15 + Math.random() * 0.35;
        fire({ particleCount: 38, angle: 90, spread: 360, startVelocity: 16, decay: 0.93, gravity: 0.25, ticks: 420, scalar: 1.3, shapes: ["circle"], origin: { x: bx, y: by }, colors });
        // הבהוב בקצות הזיקוק — ניצוצות לבנים קצרים סביב הפיצוץ
        fire({ particleCount: 12, angle: 90, spread: 360, startVelocity: 13, decay: 0.9, gravity: 0.2, ticks: 90, scalar: 0.6, shapes: ["circle"], origin: { x: bx, y: by }, colors: ["#ffffff", "#fff3d6"] });
      }
      if (now < end) confettiRafRef.current = requestAnimationFrame(frame);
      else fire.reset();
    };
    frame();
  };

  const handleBid = async (e) => {
    e.preventDefault();
    // חסימת הגשת הצעות למשתמש שאינו מחובר
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (!bidAmount || parseFloat(bidAmount) < minBid) {
      setBidError(`ההצעה חייבת להיות לפחות ₪${minBid}`);
      return;
    }
    // Anti-shill: block seller from bidding on own auction
    // זהות המציע נגזרת מהחשבון המחובר בלבד — לא מ-localStorage שניתן לזייף
    const myEmail = authUser?.email || "";
    const knownEmails = [
      myEmail,
      localStorage.getItem("seller_email"),
      authUser?.email,
    ].map(e => (e || "").trim().toLowerCase()).filter(Boolean);
    const myNameTrim = (bidderName || "").trim();
    const authEmail = (authUser?.email || "").trim().toLowerCase();
    const sellerEmail = (product.seller_email || "").trim().toLowerCase();
    const sameEmail = sellerEmail && knownEmails.includes(sellerEmail);
    const sameName = product.seller_name && myNameTrim &&
      product.seller_name.trim().toLowerCase() === myNameTrim.toLowerCase();
    const sameUser = product.seller_user_id && authUser && product.seller_user_id === authUser.id;
    if (sameEmail || sameName || sameUser) {
      setBidError("אין לך הרשאה להגיש הצעה — זהו מכרז שפרסמת בעצמך");
      return;
    }
    // חסימת משתמש מושהה מהגשת הצעות
    if (await isAnyEmailBanned([myEmail, authUser?.email])) {
      setBidError("חשבונך מושהה — אין אפשרות להגיש הצעות. לפניות: mitugplus@gmail.com");
      return;
    }
    setBidding(true); setBidError("");
    try {
      const newPrice = parseFloat(bidAmount);
      const name = bidderName || "אנונימי";
      if (bidderName) localStorage.setItem("bidder_name", bidderName);
      setMyLastBid(newPrice);
      // Track second bidder for fallback in case winner doesn't pay
      const updateData = {
        current_price: newPrice,
        highest_bidder: name,
        highest_bidder_email: myEmail || "",
        bid_count: (product.bid_count || 0) + 1,
      };
      // הארכת זמן חד-פעמית — הצעה ב-60 השניות האחרונות מוסיפה 60 שניות
      const remainingMs = new Date(product.ends_at) - Date.now();
      const extendAuction = remainingMs > 0 && remainingMs <= 60000 && !product.snipe_extended;
      if (extendAuction) {
        // מוסיפים 60 שניות לזמן הסיום הקיים — לא מאפסים את המונה ל-60
        updateData.ends_at = new Date(new Date(product.ends_at).getTime() + 60000).toISOString();
        updateData.snipe_extended = true;
      }
      // Previous leader becomes second bidder
      if (product.highest_bidder && product.highest_bidder !== name) {
        updateData.second_bidder_name = product.highest_bidder;
        updateData.second_bidder_email = product.highest_bidder_email || "";
        updateData.second_bid_amount = product.current_price || 0;
      }
      await base44.entities.Product.update(product.id, updateData);
      await base44.entities.Bid.create({
        product_id: product.id, product_title: product.title,
        product_image_url: product.image_url || "",
        product_ends_at: product.ends_at,
        bidder_name: name, bidder_email: myEmail || "", amount: newPrice, status: "active",
      });
      setProduct(p => ({ ...p, ...updateData }));
      setBids(prev => [{ bidder_name: name, amount: newPrice, id: Date.now() }, ...prev]);
      if (extendAuction) {
        setAntiSnipeExtended(true);
        setTimeout(() => setAntiSnipeExtended(false), 5000);
        // התראה בפעמון לכל המציעים במכרז על הארכת הזמן
        const recipients = [...new Map(
          [...bids, { bidder_name: name, bidder_email: myEmail }]
            .filter(b => (b.bidder_email || "").trim())
            .map(b => [(b.bidder_email || "").trim().toLowerCase(), b])
        ).values()];
        if (recipients.length) {
          base44.entities.AppNotification.bulkCreate(recipients.map(b => ({
            recipient_email: (b.bidder_email || "").trim().toLowerCase(),
            recipient_name: b.bidder_name || "",
            type: "extension",
            title: `הארכת זמן חד-פעמית — 60 שניות נוספו למכרז "${product.title}"`,
            body: "הוגשה הצעה ברגעים האחרונים וזמן המכרז הוארך ב-60 שניות. זו ההזדמנות להגיש הצעה נוספת!",
            product_id: product.id,
            product_title: product.title,
            product_image_url: product.image_url || "",
            link: `/auction/${product.id}`,
          }))).catch(() => {});
        }
      }
      setFlashNew(true); setTimeout(() => setFlashNew(false), 1500);
      setBidAmount(""); setBidSuccess(true);
      startBidConfetti();
      setTimeout(() => setBidSuccess(false), 3000);
    } catch { setBidError("שגיאה, נסה שנית"); }
    finally { setBidding(false); }
  };

  // ── קנה עכשיו — רכישה מיידית במחיר היעד שמסיימת את המכרז ──
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (isSellerViewing) {
      setBidError("אין אפשרות לרכוש מכרז שפרסמת בעצמך");
      return;
    }
    // זהות המציע נגזרת מהחשבון המחובר בלבד — לא מ-localStorage שניתן לזייף
    const myEmail = authUser?.email || "";
    if (await isAnyEmailBanned([myEmail, authUser?.email])) {
      setBidError("חשבונך מושהה — אין אפשרות לבצע רכישה. לפניות: mitugplus@gmail.com");
      return;
    }
    setBidding(true); setBidError("");
    try {
      const name = bidderName || localStorage.getItem("bidder_name") || "אנונימי";
      if (bidderName) localStorage.setItem("bidder_name", bidderName);
      const endsAt = new Date().toISOString();
      const updateData = {
        current_price: product.buy_now_price,
        highest_bidder: name,
        highest_bidder_email: myEmail,
        bid_count: (product.bid_count || 0) + 1,
        ends_at: endsAt,
      };
      // המוביל הקודם הוצא מההובלה — לשם התראת וואצאפ
      if (product.highest_bidder && product.highest_bidder !== name) {
        updateData.second_bidder_name = product.highest_bidder;
        updateData.second_bidder_email = product.highest_bidder_email || "";
        updateData.second_bid_amount = product.current_price || 0;
      }
      await base44.entities.Product.update(product.id, updateData);
      await base44.entities.Bid.create({
        product_id: product.id,
        product_title: product.title,
        product_image_url: product.image_url || "",
        product_ends_at: endsAt,
        bidder_name: name,
        bidder_email: myEmail,
        amount: product.buy_now_price,
        is_winning: true,
        status: "won",
      });
      setProduct(p => ({ ...p, ...updateData }));
    } catch { setBidError("שגיאה, נסה שנית"); }
    finally { setBidding(false); }
  };

  // פרסום חוזר של מכרז שלא נמכר — העתקת כל הפרטים לטופס הפרסום
  const handleRepublish = () => {
    const draft = {
      title: product.title,
      description: product.description || "",
      category: product.category || "",
      condition: product.condition || "",
      location: product.location || "",
      starting_price: product.starting_price,
      buy_now_price: product.buy_now_price,
      image_url: product.image_url || "",
      image_urls: product.image_urls || [],
    };
    if (isMyAuction) {
      draft.seller_name = product.seller_name || "";
      draft.seller_email = product.seller_email || "";
      draft.seller_phone = product.seller_phone || "";
    }
    localStorage.setItem("republish_draft", JSON.stringify(draft));
    navigate("/upload-product");
  };

  const enableNotifications = () => {
    setShowNotifModal(true);
  };

  const handleNotifSave = ({ email, phone, channels }) => {
    setNotifEnabled(true);
  };

  const lastBidTime = bids[0]?.created_date;

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">מוצר לא נמצא</h2>
        <button onClick={() => navigate("/auctions")} className="text-sm" style={{ color: "#e5893d" }}>לכל המכרזים</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* ── 4. OUTBID ALERT ── */}
      <OutbidBanner
        show={outbidShow}
        currentLeader={product.highest_bidder}
        onBidNow={() => { setOutbidShow(false); bidFormRef.current?.scrollIntoView({ behavior: "smooth" }); }}
      />

      {/* Back */}
      <div className="border-b border-gray-100 px-4 py-3">
        <button onClick={() => navigate("/auctions")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowRight className="h-4 w-4 rotate-180" />
          חזרה למכרזים
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div>
            <ImageSlider
              images={[...(product.image_urls || []), product.image_url].filter(Boolean)}
              alt={product.title}
            >
              {/* ── 5. STATUS BADGE on image ── */}
              {!ended && (
                <div className="absolute top-3 right-3">
                  {isLeading
                    ? <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #00c853, #00e676)", boxShadow: "0 0 12px #00c85366" }}>🏆 אתה מוביל!</span>
                    : myLastBid && <span className="px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "linear-gradient(135deg, #ff6600, #e5893d)", boxShadow: "0 0 12px #ff660066" }}>⚠️ עקפו אותך</span>
                    }
                    </div>
                    )}
              {/* ── תצוגת 3D באמצעות AI ── */}
              <View3DButton
                product={product}
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => setShowLoginModal(true)}
                onGenerated={(urls) => urls && setProduct(p => (p ? { ...p, spin3d_urls: urls } : p))}
                className="absolute top-3 left-3 z-10"
              />
                    </ImageSlider>
            {/* ── 3. BID FEED + LEADERBOARD ── */}
            <div className="mt-4 space-y-4">
              <LiveBidFeed bids={bids} flashNew={flashNew} />
              <BidLeaderboard bids={bids} />
            </div>

            {/* ── LIVE CHAT — שאלות למוכר ── */}
            <div className="mt-4">
              <ProductChat product={product} inline />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              {product.category && (
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold mb-2 inline-block"
                  style={{ background: "#e5893d15", color: "#e5893d" }}>{product.category}</span>
              )}
              <h1 className="text-2xl font-black text-gray-900 mt-1">{product.title}</h1>
              {product.condition && <p className="text-sm text-gray-400 mt-1">מצב: {product.condition}</p>}

              {canEdit && !ended && (
                <button type="button" onClick={() => setShowEdit(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all"
                  style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> עריכת פרטי המכרז
                </button>
              )}

              {/* ── ביטול מכרז עצמי — מוצג למוכר בלבד ── */}
              {isSellerViewing && !ended && !cancelled && (
                <button type="button" onClick={() => setShowCancelModal(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all hover:bg-red-50"
                  style={{ borderColor: "#ef444455", color: "#ef4444", background: "#ef44440a" }}>
                  <Ban className="h-3.5 w-3.5" aria-hidden="true" /> ביטול המכרז
                </button>
              )}

              {/* ── FAVORITES TOGGLE ── */}
              <button type="button" onClick={toggleFavorite}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02]"
                style={favSaved
                  ? { background: "#e5893d15", borderColor: "#e5893d", color: "#e5893d" }
                  : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}>
                <Heart className={`h-4 w-4 ${favSaved ? "fill-current" : ""}`} />
                {favSaved ? "נשמר למועדפים ♥" : "שמור למועדפים"}
              </button>
              {favError && <p className="text-xs text-red-500 mt-1.5">{favError}</p>}
              <ShareButton product={product} />
            </div>

            {/* ── FOMO BANNER ── */}
            <BuyerFomoBanner />
            {/* ── LIVE BIDDING PRESSURE ── */}
            <BuyerLiveBlock bidCount={product.bid_count} lastBidTime={lastBidTime} />

            {/* ── 1. TIMER ── */}
            {!cancelled && <TimerBlock endsAt={product.ends_at} antiSnipeExtended={antiSnipeExtended} />}

            {/* Price */}
            <div className="p-4 rounded-2xl transition-all duration-500"
              style={{ background: isLeading ? "linear-gradient(135deg, #00c85308, #00e67605)" : "linear-gradient(135deg, #e5893d08, #3e6b8a05)",
                border: isLeading ? "1px solid #00c85333" : "1px solid #e5893d22" }}>
              <div className="flex items-end justify-between mb-1">
                <div>
                  <p className="text-xs text-gray-400">מחיר נוכחי</p>
                  <p className="text-3xl font-black text-gray-900 transition-all duration-300">
                    ₪{(product.current_price || product.starting_price || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-left">
                  {product.highest_bidder && (
                    <p className="text-xs font-semibold" style={{ color: isLeading ? "#00c853" : "#3e6b8a" }}>
                      {isLeading ? "🏆 אתה מוביל!" : `מוביל: ${product.highest_bidder}`}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400">מחיר התחלתי: ₪{(product.starting_price || 0).toLocaleString()}</p>
              {product.buy_now_price && (
                <p className="text-xs font-semibold mt-1" style={{ color: "#00a35c" }}>
                  ⚡ קנה עכשיו ללא מכרז ב-₪{product.buy_now_price.toLocaleString()}
                </p>
              )}
            </div>

            {/* ── 6. PRICE GAP PROGRESS ── */}
            <PriceProgress
              startingPrice={product.starting_price}
              currentPrice={product.current_price || product.starting_price}
              myLastBid={!isLeading ? myLastBid : null}
            />

            {/* Bid Form / Ended / Cancelled */}
            {cancelled ? (
              <div className="rounded-2xl border p-5 text-center" style={{ borderColor: "#f3f4f6", background: "#f9fafb" }}>
                <Ban className="h-8 w-8 mx-auto mb-2 text-gray-400" aria-hidden="true" />
                <p className="font-bold text-gray-700 text-lg">מכרז זה בוטל על ידי המוכר</p>
                <p className="text-sm text-gray-400 mt-1">כל ההצעות בוטלו — מוזמנים לעיין במכרזים פעילים אחרים באתר</p>
              </div>
            ) : !ended ? (
              <form ref={bidFormRef} onSubmit={handleBid} className="relative space-y-3">
                <canvas ref={confettiCanvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true" />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">שמך (אופציונלי)</label>
                  <input value={bidderName} onChange={e => setBidderName(e.target.value)}
                    placeholder="הכנס שם"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">סכום הצעתך (₪)</label>
                  <input type="number" min={minBid} step="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                    placeholder={`מינימום ₪${minBid}`}
                    className="w-full px-4 py-3 text-lg font-bold bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] focus:ring-2 focus:ring-[#e5893d22] transition-all text-right" />
                </div>

                {/* Quick bid buttons */}
                <div className="flex gap-2">
                  {[minBid, minBid + 50, minBid + 100].map(amt => (
                    <button key={amt} type="button" onClick={() => setBidAmount(String(amt))}
                      className="flex-1 text-xs py-2 rounded-xl border font-bold transition-all hover:scale-105"
                      style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                      ₪{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {bidError && <p className="text-xs text-red-500">{bidError}</p>}
                {bidSuccess && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                    <CheckCircle className="h-4 w-4" /> הצעתך נרשמה בהצלחה!
                  </div>
                )}

                {/* ── 5. STATUS-AWARE BUTTON ── */}
                <BidButton isLeading={isLeading} bidding={bidding} />

                {/* ── קנה עכשיו — רכישה מיידית במחיר היעד ── */}
                {product.buy_now_price && (product.current_price || product.starting_price || 0) < product.buy_now_price && (
                  <button type="button" onClick={handleBuyNow} disabled={bidding}
                    className="w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:scale-[1.01]"
                    style={{ background: "linear-gradient(135deg, #00c853, #00a3c4)", boxShadow: "0 0 16px #00c85355" }}>
                    <Zap className="h-4 w-4" aria-hidden="true" />
                    {bidding ? "מבצע רכישה..." : `קנה עכשיו ב-₪${product.buy_now_price.toLocaleString()}`}
                  </button>
                )}

                {/* ── 7. NOTIFICATIONS OPT-IN ── */}
                <button type="button" onClick={notifEnabled ? () => setShowNotifModal(true) : enableNotifications}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all border"
                  style={notifEnabled
                    ? { background: "#00c85310", borderColor: "#00c85344", color: "#00c853" }
                    : { background: "#e5893d08", borderColor: "#e5893d33", color: "#e5893d" }}>
                  {notifEnabled
                    ? <><Bell className="h-3.5 w-3.5" /> התראות מופעלות ✓ — לחץ לעדכון פרטים</>
                    : <><BellOff className="h-3.5 w-3.5" /> הפעל התראות — קבל/י מייל/ווצאפ אם יעקפו אותך</>}
                </button>

                {/* ── הצעה אוטומטית חד-פעמית ── */}
                {!isSellerViewing && (
                  <AutoBidPanel product={product} onRequireLogin={() => setShowLoginModal(true)} />
                )}
              </form>
            ) : (
              <div className="rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                <div className="p-4 text-center border-b border-gray-100">
                  <Award className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  {product.highest_bidder
                    ? <><p className="font-bold text-gray-800">הזוכה: {product.highest_bidder}</p>
                       <p className="text-lg font-black mt-1" style={{ color: "#e5893d" }}>₪{(product.current_price || 0).toLocaleString()}</p></>
                    : <p className="text-sm text-gray-500">לא הוגשו הצעות</p>}
                </div>
                {product.highest_bidder && (
                  <div className="p-3 text-xs text-gray-500 space-y-1" dir="rtl">
                    <div className="flex justify-between font-semibold text-gray-800">
                      <span>מחיר מכירה סופי</span>
                      <span>₪{(product.current_price || 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}
                {!product.highest_bidder && (
                  <div className="p-3 border-t border-gray-100">
                    <button type="button" onClick={handleRepublish}
                      className="w-full text-white text-sm py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" /> פרסום חוזר — עריכה מחדש של המכרז
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-1.5">כל הפרטים והתמונות יועתקו לטופס הפרסום וניתן לערוך אותם לפני הפרסום מחדש</p>
                  </div>
                )}
              </div>
            )}

            {/* ── זוכה — פרטי קשר של המוכר עם לחצני שיחה וואטסאפ ── */}
            {ended && !cancelled && iAmBuyer && <WinnerContactCard product={product} />}

            {/* Meta */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              {product.location && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /><span>{product.location}</span>
                </div>
              )}
              {product.seller_name && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {product.seller_photo_url
                    ? <img src={product.seller_photo_url} alt={product.seller_name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" style={{ border: "1px solid #e5e7eb" }} />
                    : <User className="h-4 w-4" />}
                  {product.seller_email ? (
                    <Link to={`/seller/${encodeURIComponent(product.seller_email)}`}
                      className="font-semibold hover:text-[#e5893d] transition-colors underline decoration-transparent hover:decoration-[#e5893d]">
                      מוכר: {product.seller_name}
                    </Link>
                  ) : product.seller_user_id ? (
                    <Link to={`/seller/id/${encodeURIComponent(product.seller_user_id)}`}
                      className="font-semibold hover:text-[#e5893d] transition-colors underline decoration-transparent hover:decoration-[#e5893d]">
                      מוכר: {product.seller_name}
                    </Link>
                  ) : (
                    <span>מוכר: {product.seller_name}</span>
                  )}
                </div>
              )}
            </div>

            {product.description && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">תיאור</p>
                <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* ── SELLER TRUST BADGE ── */}
            {product.seller_email && (
              <SellerTrustBadge sellerEmail={product.seller_email} sellerName={product.seller_name} />
            )}

            {/* ── דירוג הדדי — נפתח לאחר שהמוצר סופק לקונה ── */}
            {deliveredToBuyer && product.highest_bidder && (iAmBuyer || isSellerViewing) && (
              <div className="space-y-2">
                {iAmBuyer && (buyerReviewed ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border"
                    style={{ borderColor: "#22c55e44", color: "#16a34a", background: "#22c55e08" }}>
                    <Star className="h-4 w-4" aria-hidden="true" />
                    כבר דירגת את המוכר במכרז זה ✓
                  </div>
                ) : (
                  <button onClick={() => { setReviewDirection("buyer"); setShowReviewModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:scale-[1.01]"
                    style={{ borderColor: "#f59e0b66", color: "#b45309", background: "#f59e0b08" }}>
                    <MessageSquare className="h-4 w-4" />
                    דרג את המוכר — עזור לקהילה 🏆
                  </button>
                ))}
                {isSellerViewing && (sellerReviewed ? (
                  <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border"
                    style={{ borderColor: "#22c55e44", color: "#16a34a", background: "#22c55e08" }}>
                    <Star className="h-4 w-4" aria-hidden="true" />
                    כבר דירגת את הקונה במכרז זה ✓
                  </div>
                ) : (
                  <button onClick={() => { setReviewDirection("seller"); setShowReviewModal(true); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:scale-[1.01]"
                    style={{ borderColor: "#3e6b8a66", color: "#3e6b8a", background: "#3e6b8a08" }}>
                    <MessageSquare className="h-4 w-4" />
                    דרג את הקונה — {product.highest_bidder}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RELATED PRODUCTS + ARTICLE ── */}
      {product?.category && (
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <RelatedProducts category={product.category} excludeId={product.id} />
          <RelatedArticle category={product.category} />
          <SoldSimilar category={product.category} excludeId={product.id} />
        </div>
      )}

      {showNotifModal && (
        <OutbidNotificationModal
          onClose={() => setShowNotifModal(false)}
          onSave={handleNotifSave}
        />
      )}

      {showEdit && !ended && canEdit && (
        <ProductEditModal
          product={product}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            base44.entities.Product.filter({ id }).then(items => {
              if (items.length) setProduct(items[0]);
            }).catch(() => {});
          }}
        />
      )}

      {showLoginModal && (
        <LoginRequiredModal onClose={() => setShowLoginModal(false)} />
      )}

      {showCancelModal && product && (
        <CancelAuctionModal
          product={product}
          onClose={() => setShowCancelModal(false)}
          onDone={() => {
            setShowCancelModal(false);
            setProduct(p => (p ? { ...p, status: "cancelled" } : p));
          }}
        />
      )}

      {showReviewModal && (
        <ReviewModal
          product={product}
          direction={reviewDirection}
          reviewerName={reviewDirection === "seller"
            ? (localStorage.getItem("seller_name") || product.seller_name || authUser?.full_name || "")
            : myName}
          reviewerEmail={reviewDirection === "seller"
            ? (localStorage.getItem("seller_email") || authUser?.email || "")
            : localStorage.getItem("bidder_email")}
          onClose={() => setShowReviewModal(false)}
          onDone={() => { if (reviewDirection === "buyer") setBuyerReviewed(true); else setSellerReviewed(true); }}
        />
      )}

    </div>
  );
}