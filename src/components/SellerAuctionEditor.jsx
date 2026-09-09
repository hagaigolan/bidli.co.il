import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Gavel, RefreshCw, Pencil } from "lucide-react";
import ProductEditModal from "@/components/ProductEditModal";

export default function SellerAuctionEditor() {
  const sellerEmail = localStorage.getItem("seller_email") || localStorage.getItem("bidder_email");
  const [products, setProducts] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    if (!sellerEmail) { setProducts([]); return; }
    try {
      const items = await base44.entities.Product.filter({ seller_email: sellerEmail, status: "active" }, "-created_date", 100);
      setProducts(items.filter(p => new Date(p.ends_at) > new Date()));
    } catch { setProducts([]); }
  };

  useEffect(() => { load(); }, []);

  if (products === null || products.length === 0) return null;

  return (
    <div className="mb-6" dir="rtl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f700ff22, #9d00ff11)", border: "1px solid #f700ff33" }}>
          <Gavel className="h-5 w-5" style={{ color: "#f700ff" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">המכרזים הפעילים שלי</p>
          <p className="text-xs text-gray-400">עריכת פרטי המכרז — המחיר ניתן לעריכה רק לפני הצעה ראשונה</p>
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {p.image_url
                  ? <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">🏺</div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/auction/${p.id}`} className="text-sm font-semibold text-gray-800 truncate block hover:text-[#f700ff] transition-colors">
                  {p.title}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{p.bid_count || 0} הצעות</span>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(p)}
                className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border transition-all flex-shrink-0"
                style={{ borderColor: "#f700ff44", color: "#f700ff", background: "#f700ff08" }}>
                <Pencil className="h-3.5 w-3.5" /> עריכה
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductEditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}