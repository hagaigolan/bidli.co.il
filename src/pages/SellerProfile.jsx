import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SellerTrustBadge } from "@/components/SellerBadge";
import ReviewsBio from "@/components/ReviewsBio";
import { MapPin, Clock, Flame, Package } from "lucide-react";

function CardTimer({ endsAt }) {
  const calc = () => {
    const diff = new Date(endsAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, total: diff };
  };
  const [left, setLeft] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!left) {
    return <span className="px-2 py-1 rounded-lg text-xs font-bold text-white" style={{ background: "#6b7280" }}>הסתיים</span>;
  }
  const critical = left.total < 60 * 60 * 1000;
  const urgent = left.total < 3 * 60 * 60 * 1000;
  const bg = critical ? "#ef4444" : urgent ? "#f97316" : "#2d4f68";
  const time = left.h > 0
    ? `${String(left.h).padStart(2, "0")}:${String(left.m).padStart(2, "0")}:${String(left.s).padStart(2, "0")}`
    : `${String(left.m).padStart(2, "0")}:${String(left.s).padStart(2, "0")}`;
  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black text-white font-mono ${critical ? "animate-pulse" : ""}`}
      style={{ background: bg }}>
      {critical ? <Flame className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      {time}
    </span>
  );
}

function ProductCard({ product }) {
  const ended = new Date(product.ends_at) <= new Date();
  return (
    <Link to={`/auction/${product.id}`}
      className="block bg-white border border-gray-100 rounded-2xl overflow-hidden group hover:border-transparent transition-all duration-300 card-neon"
      style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
      <div className="relative overflow-hidden aspect-[4/3] bg-gray-50">
        {product.image_url
          ? <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🏺</div>}
        {ended && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: "#6b7280cc" }}>הסתיים</span>
        )}
      </div>
      <div className="p-3" dir="rtl">
        <h3 className="font-bold text-gray-900 text-xs leading-snug mb-1.5 line-clamp-1">{product.title}</h3>
        {product.location && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="font-black text-sm text-gray-900">₪{(product.current_price || product.starting_price || 0).toLocaleString()}</p>
          {product.ends_at && <CardTimer endsAt={product.ends_at} />}
        </div>
      </div>
    </Link>
  );
}

export default function SellerProfile() {
  const { email: rawEmail } = useParams();
  const email = decodeURIComponent(rawEmail || "");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (!email) return;
    base44.entities.Product.filter({ seller_email: email }, "-created_date", 100)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [email]);

  const now = Date.now();
  const active = products.filter(p => p.ends_at && new Date(p.ends_at) > now && p.status !== "cancelled");
  const ended = products.filter(p => !p.ends_at || new Date(p.ends_at) <= now);
  const shown = activeTab === "active" ? active : ended;
  const sellerName = products[0]?.seller_name;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <div className="border-b border-gray-100 px-4 py-5" style={{ background: "linear-gradient(135deg, #e5893d08, #ffffff)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
            style={{ background: "linear-gradient(135deg, #e5893d22, #3e6b8a11)", border: "1px solid #e5893d33" }}>
            {(sellerName || email || "?")[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{sellerName || email}</h1>
            <p className="text-sm text-gray-400">כל המכירות של המוכר ב-bidli</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SellerTrustBadge sellerEmail={email} sellerName={sellerName} />
        </div>

        <ReviewsBio email={email} />

        <div className="flex gap-1 p-1 bg-gray-50 rounded-xl mb-5 max-w-xs">
          <button onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "active" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            פעילות ({active.length})
          </button>
          <button onClick={() => setActiveTab("ended")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "ended" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            הסתיימו ({ended.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">
              {activeTab === "active" ? "אין מכירות פעילות כרגע" : "אין מכירות שהסתיימו"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {shown.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}