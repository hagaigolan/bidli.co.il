import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SalesManager from "@/components/SalesManager";
import SellerAuctionEditor from "@/components/SellerAuctionEditor";
import ProfileEditModal from "@/components/ProfileEditModal";
import ProfileStatsCard from "@/components/ProfileStatsCard";
import { useAuth } from "@/lib/AuthContext";
import {
  Clock, TrendingUp, Award, Package, ChevronLeft, ArrowRight, Heart,
  Trophy, XCircle, RefreshCw
} from "lucide-react";

function useCountdown(endsAt) {
  const calcLeft = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s };
  };
  const [left, setLeft] = useState(calcLeft);
  useEffect(() => {
    const t = setInterval(() => setLeft(calcLeft()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

function MiniTimer({ endsAt }) {
  const left = useCountdown(endsAt);
  if (!left) return <span className="text-xs text-gray-400">הסתיים</span>;
  const urgent = left.h === 0 && left.m < 30;
  return (
    <span className="text-xs font-mono font-bold" style={{ color: urgent ? "#e5893d" : "#2d4f68" }}>
      {String(left.h).padStart(2,"0")}:{String(left.m).padStart(2,"0")}:{String(left.s).padStart(2,"0")}
    </span>
  );
}

const STATUS_CONFIG = {
  active: { label: "מוביל", color: "#22c55e", bg: "#22c55e15", icon: TrendingUp },
  outbid: { label: "הוצעת", color: "#e5893d", bg: "#e5893d15", icon: XCircle },
  won:    { label: "זכית!", color: "#3e6b8a", bg: "#3e6b8a15", icon: Trophy },
  lost:   { label: "לא זכית", color: "#9ca3af", bg: "#f3f4f6", icon: XCircle },
};

function BidRow({ bid, product, onReload }) {
  const ended = product ? new Date(product.ends_at) <= new Date() : false;
  const isLeading = !!(product && product.highest_bidder === bid.bidder_name && product.current_price === bid.amount);
  const status = ended ? (isLeading ? "won" : "lost") : (isLeading ? "active" : "outbid");
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = cfg.icon;
  const needsPayment = ended && isLeading && product && product.status === "awaiting_payment";
  const reportedTransfer = ended && isLeading && product && product.status === "transfer_reported";

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      <Link to={`/auction/${bid.product_id}`}
        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-all group">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          {bid.product_image_url
            ? <img src={bid.product_image_url} alt={bid.product_title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
        </div>
        <div className="flex-1 min-w-0" dir="rtl">
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#e5893d] transition-colors">
            {bid.product_title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">הצעתי:</span>
            <span className="text-xs font-bold text-gray-700">₪{bid.amount?.toLocaleString()}</span>
            {product && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">מחיר נוכחי:</span>
                <span className="text-xs font-bold text-gray-700">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {product && <MiniTimer endsAt={product.ends_at} />}
            <span className="text-gray-200">·</span>
            <span className="text-xs text-gray-400">{new Date(bid.created_date).toLocaleDateString("he-IL")}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="px-2.5 py-1 rounded-full flex items-center gap-1"
            style={{ background: cfg.bg, color: cfg.color }}>
            <Icon className="h-3 w-3" />
            <span className="text-xs font-bold">{cfg.label}</span>
          </div>
          <ChevronLeft className="h-3 w-3 text-gray-300 rotate-180" />
        </div>
      </Link>

      {/* תשלום בהעברה — מעבר לההזמנות שלי */}
      {needsPayment && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-50" dir="rtl">
          <Link to="/my-orders"
            className="block text-center text-xs py-2.5 rounded-xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
            להשלמת התשלום בהעברה →
          </Link>
        </div>
      )}
      {reportedTransfer && (
        <div className="px-3 pb-3 pt-1 border-t border-gray-50 text-xs text-gray-500 text-center" dir="rtl">
          ההעברה דווחה — ממתין לאישור המוכר. מעקב בעמוד "ההזמנות שלי".
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMeta, setProfileMeta] = useState(() => ({
    name: localStorage.getItem("bidder_name") || "",
    email: localStorage.getItem("bidder_email") || "",
    photo: localStorage.getItem("profile_photo_url") || "",
  }));
  const { user: authUser } = useAuth();

  const loadData = async () => {
    setLoading(true);
    setProfileMeta({
      name: localStorage.getItem("bidder_name") || "",
      email: localStorage.getItem("bidder_email") || "",
      photo: localStorage.getItem("profile_photo_url") || "",
    });
    try {
      const storedName = localStorage.getItem("bidder_name");
      const storedEmail = localStorage.getItem("bidder_email");
      if (!storedName && !storedEmail) { setLoading(false); return; }
      const allBids = await base44.entities.Bid.list("-created_date", 100);
      const myBids = allBids.filter(b =>
        (storedName && b.bidder_name === storedName) ||
        (storedEmail && b.bidder_email === storedEmail)
      );
      setBids(myBids);
      const uniqueProductIds = [...new Set(myBids.map(b => b.product_id))];
      const productMap = {};
      await Promise.all(uniqueProductIds.map(async (pid) => {
        const items = await base44.entities.Product.filter({ id: pid });
        if (items.length) productMap[pid] = items[0];
      }));
      setProducts(productMap);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const activeBids = bids.filter(b => { const p = products[b.product_id]; return p && new Date(p.ends_at) > new Date(); });
  const wonBids = bids.filter(b => { const p = products[b.product_id]; return p && new Date(p.ends_at) <= new Date() && p.highest_bidder === b.bidder_name && p.current_price === b.amount; });
  const leadingBids = activeBids.filter(b => { const p = products[b.product_id]; return p && p.highest_bidder === b.bidder_name; });

  const filteredBids = bids.filter(b => {
    const p = products[b.product_id];
    const ended = p && new Date(p.ends_at) <= new Date();
    const isLeading = p && p.highest_bidder === b.bidder_name && p.current_price === b.amount;
    if (activeTab === "active") return !ended;
    if (activeTab === "won") return ended && isLeading;
    if (activeTab === "lost") return ended && !isLeading;
    return true;
  });

  const hasProfile = localStorage.getItem("bidder_name") || localStorage.getItem("bidder_email");

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            {profileMeta.photo
              ? <img src={profileMeta.photo} alt={profileMeta.name || "פרופיל"} className="w-14 h-14 rounded-2xl object-cover" style={{ border: "1px solid #e5893d33" }} />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
                👤
              </div>}
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">{profileMeta.name || authUser?.full_name || "האזור האישי שלי"}</h1>
              {(profileMeta.email || authUser?.email) && <p className="text-sm text-gray-400" dir="ltr">{profileMeta.email || authUser?.email}</p>}
            </div>
            <button onClick={() => setEditingProfile(true)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#e5893d66] hover:text-[#e5893d] transition-all">
              עריכת פרופיל
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {editingProfile && (
          <ProfileEditModal
            onClose={() => setEditingProfile(false)}
            onSaved={loadData}
          />
        )}

        <SellerAuctionEditor />

        {(profileMeta.email || authUser?.email) && (
          <ProfileStatsCard email={(profileMeta.email || authUser?.email).trim()} />
        )}

        {!hasProfile && !editingProfile && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">הגדר את הפרופיל שלך</h2>
            <p className="text-sm text-gray-400 mb-6">הזן את השם והאימייל שבהם אתה משתמש בהצעות כדי לראות את ההיסטוריה שלך</p>
            <button onClick={() => setEditingProfile(true)} className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              הגדר פרופיל
            </button>
          </div>
        )}

        {hasProfile && (
          <>
            <Link to="/my-orders"
              className="flex items-center gap-3 p-3.5 rounded-2xl border mb-6 transition-all hover:shadow-md"
              style={{ borderColor: "#3e6b8a33", background: "linear-gradient(135deg, #3e6b8a08, #e5893d05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3e6b8a22, #e5893d11)", border: "1px solid #3e6b8a33" }}>
                <Package className="h-5 w-5" style={{ color: "#3e6b8a" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">ההזמנות שלי</p>
                <p className="text-xs text-gray-400">המוצרים שזכית בהם וסטטוס התשלום שלהם</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-gray-300" />
            </Link>

            <Link to="/favorites"
              className="flex items-center gap-3 p-3.5 rounded-2xl border mb-6 transition-all hover:shadow-md"
              style={{ borderColor: "#e5893d33", background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
                <Heart className="h-5 w-5" style={{ color: "#e5893d" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">המועדפים שלי</p>
                <p className="text-xs text-gray-400">התכשיטים והעתיקות ששמרת למעקב</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-gray-300" />
            </Link>

            <SalesManager />

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "הצעות פעילות", value: activeBids.length, color: "#2d4f68", icon: Clock },
                { label: "מוביל", value: leadingBids.length, color: "#22c55e", icon: TrendingUp },
                { label: "זכיות", value: wonBids.length, color: "#3e6b8a", icon: Trophy },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="p-3 rounded-2xl border border-gray-100 text-center" style={{ background: color + "06" }}>
                  <Icon className="h-5 w-5 mx-auto mb-1" style={{ color }} />
                  <p className="text-xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-4">
              {[
                { key: "all", label: `הכל (${bids.length})` },
                { key: "active", label: `פעילות (${activeBids.length})` },
                { key: "won", label: `זכיות (${wonBids.length})` },
                { key: "lost", label: "הפסדים" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
              </div>
            ) : filteredBids.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">
                  {activeTab === "all" ? "לא השתתפת במכרזים עדיין" : "אין הצעות בקטגוריה זו"}
                </p>
                {activeTab === "all" && (
                  <Link to="/auctions" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
                    לכל המכרזים
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBids.map(bid => (
                  <BidRow key={bid.id} bid={bid} product={products[bid.product_id]} onReload={loadData} />
                ))}
              </div>
            )}

            <button onClick={loadData} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto mt-6 transition-colors">
              <RefreshCw className="h-3 w-3" /> רענן נתונים
            </button>
          </>
        )}
      </div>
    </div>
  );
}