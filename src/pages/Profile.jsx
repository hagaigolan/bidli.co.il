import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SalesManager from "@/components/SalesManager";
import SellerAuctionEditor from "@/components/SellerAuctionEditor";
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
    <span className="text-xs font-mono font-bold" style={{ color: urgent ? "#f700ff" : "#0088ff" }}>
      {String(left.h).padStart(2,"0")}:{String(left.m).padStart(2,"0")}:{String(left.s).padStart(2,"0")}
    </span>
  );
}

const STATUS_CONFIG = {
  active: { label: "מוביל", color: "#22c55e", bg: "#22c55e15", icon: TrendingUp },
  outbid: { label: "הוצעת", color: "#f700ff", bg: "#f700ff15", icon: XCircle },
  won:    { label: "זכית!", color: "#9d00ff", bg: "#9d00ff15", icon: Trophy },
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
          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#f700ff] transition-colors">
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
            style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
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
  const [name, setName] = useState(() => localStorage.getItem("bidder_name") || "");
  const [email, setEmail] = useState(() => localStorage.getItem("bidder_email") || "");
  const [editingProfile, setEditingProfile] = useState(false);

  const loadData = async () => {
    setLoading(true);
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

  const saveProfile = () => {
    localStorage.setItem("bidder_name", name);
    localStorage.setItem("bidder_email", email);
    setEditingProfile(false);
    loadData();
  };

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
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #f700ff08, #ffffff)" }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-4">
            <ArrowRight className="h-4 w-4 rotate-180" /> חזרה
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
              👤
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">{localStorage.getItem("bidder_name") || "האזור האישי שלי"}</h1>
              {localStorage.getItem("bidder_email") && <p className="text-sm text-gray-400">{localStorage.getItem("bidder_email")}</p>}
            </div>
            <button onClick={() => setEditingProfile(true)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#f700ff66] hover:text-[#f700ff] transition-all">
              עריכת פרופיל
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingProfile(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl" dir="rtl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-black text-gray-900 mb-4">עריכת פרופיל</h2>
              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">שם</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="השם שלך"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all text-right" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">אימייל</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                    className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#f700ff88] transition-all" dir="ltr" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">הזן את אותם פרטים שהשתמשת בהם בהצעות כדי לראות את ההיסטוריה שלך.</p>
              <div className="flex gap-2">
                <button onClick={saveProfile} className="flex-1 text-white text-sm py-2.5 rounded-xl font-bold"
                  style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>שמור</button>
                <button onClick={() => setEditingProfile(false)}
                  className="flex-1 text-gray-600 text-sm py-2.5 rounded-xl font-semibold border border-gray-200">ביטול</button>
              </div>
            </div>
          </div>
        )}

        <SellerAuctionEditor />

        {!hasProfile && !editingProfile && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">הגדר את הפרופיל שלך</h2>
            <p className="text-sm text-gray-400 mb-6">הזן את השם והאימייל שבהם אתה משתמש בהצעות כדי לראות את ההיסטוריה שלך</p>
            <button onClick={() => setEditingProfile(true)} className="text-white text-sm px-6 py-2.5 rounded-xl font-bold"
              style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
              הגדר פרופיל
            </button>
          </div>
        )}

        {hasProfile && (
          <>
            <Link to="/my-orders"
              className="flex items-center gap-3 p-3.5 rounded-2xl border mb-6 transition-all hover:shadow-md"
              style={{ borderColor: "#9d00ff33", background: "linear-gradient(135deg, #9d00ff08, #f700ff05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #9d00ff22, #f700ff11)", border: "1px solid #9d00ff33" }}>
                <Package className="h-5 w-5" style={{ color: "#9d00ff" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">ההזמנות שלי</p>
                <p className="text-xs text-gray-400">המוצרים שזכית בהם וסטטוס התשלום שלהם</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-gray-300" />
            </Link>

            <Link to="/favorites"
              className="flex items-center gap-3 p-3.5 rounded-2xl border mb-6 transition-all hover:shadow-md"
              style={{ borderColor: "#f700ff33", background: "linear-gradient(135deg, #f700ff08, #9d00ff05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
                <Heart className="h-5 w-5" style={{ color: "#f700ff" }} />
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
                { label: "הצעות פעילות", value: activeBids.length, color: "#0088ff", icon: Clock },
                { label: "מוביל", value: leadingBids.length, color: "#22c55e", icon: TrendingUp },
                { label: "זכיות", value: wonBids.length, color: "#9d00ff", icon: Trophy },
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
                <div className="w-7 h-7 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
              </div>
            ) : filteredBids.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">
                  {activeTab === "all" ? "לא השתתפת במכרזים עדיין" : "אין הצעות בקטגוריה זו"}
                </p>
                {activeTab === "all" && (
                  <Link to="/auctions" className="inline-block mt-4 text-white text-sm px-5 py-2 rounded-xl font-bold"
                    style={{ background: "linear-gradient(135deg, #f700ff, #9d00ff)" }}>
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