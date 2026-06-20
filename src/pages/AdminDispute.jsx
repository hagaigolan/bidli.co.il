import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { resolveDispute } from "@/functions/resolveDispute";
import {
  ShieldAlert, CheckCircle, XCircle, Clock, ArrowRight,
  RefreshCw, AlertTriangle, User, DollarSign, Lock
} from "lucide-react";

const STATUS_COLORS = {
  frozen: { bg: "#3b82f615", color: "#2563eb", label: "מוקפא" },
  disputed: { bg: "#ef444415", color: "#dc2626", label: "סכסוך" },
  released: { bg: "#22c55e15", color: "#16a34a", label: "שוחרר" },
  refunded: { bg: "#f59e0b15", color: "#d97706", label: "הוחזר" },
};

function EscrowRow({ escrow, onAction }) {
  const [loading, setLoading] = useState(false);
  const sc = STATUS_COLORS[escrow.status] || STATUS_COLORS.frozen;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      await resolveDispute({ escrow_id: escrow.id, action });
      onAction();
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3 shadow-sm" dir="rtl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{escrow.product_title}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> קונה: {escrow.buyer_name || escrow.buyer_email}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> מוכר: {escrow.seller_name || escrow.seller_email}</span>
          </div>
          {escrow.dispute_reason && (
            <div className="mt-2 px-3 py-1.5 rounded-lg text-xs text-red-700 bg-red-50 border border-red-100">
              <AlertTriangle className="h-3 w-3 inline ml-1" />
              {escrow.dispute_reason}
            </div>
          )}
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
          style={{ background: sc.bg, color: sc.color }}>
          {sc.label}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="font-black text-gray-900">₪{(escrow.amount || 0).toLocaleString()}</p>
          <p className="text-gray-400">סכום כולל</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="font-black" style={{ color: "#f700ff" }}>₪{(escrow.commission_amount || 0).toLocaleString()}</p>
          <p className="text-gray-400">עמלת פלטפורמה</p>
        </div>
        <div className="p-2 bg-gray-50 rounded-xl">
          <p className="font-black text-green-600">₪{(escrow.seller_payout || 0).toLocaleString()}</p>
          <p className="text-gray-400">למוכר</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Clock className="h-3 w-3" />
        שולם: {escrow.paid_at ? new Date(escrow.paid_at).toLocaleString("he-IL") : "—"}
        {escrow.dispute_opened_at && (
          <><span className="text-gray-300">·</span> סכסוך נפתח: {new Date(escrow.dispute_opened_at).toLocaleString("he-IL")}</>
        )}
      </div>

      {/* Action buttons — only for disputed or frozen */}
      {(escrow.status === "disputed" || escrow.status === "frozen") && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleAction("refund_buyer")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-60"
            style={{ borderColor: "#ef444466", color: "#dc2626", background: "#ef444408" }}>
            <XCircle className="h-3.5 w-3.5" /> החזר כספי לקונה
          </button>
          <button
            onClick={() => handleAction("release_seller")}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-60"
            style={{ borderColor: "#22c55e66", color: "#16a34a", background: "#22c55e08" }}>
            <CheckCircle className="h-3.5 w-3.5" /> שחרר כספים למוכר
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminDispute() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [bannedUsers, setBannedUsers] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      if (me?.role !== "admin") { setLoading(false); return; }

      const [allEscrows, users] = await Promise.all([
        base44.entities.Escrow.list("-created_date", 100),
        base44.entities.User.list("-created_date", 200),
      ]);
      setEscrows(allEscrows);
      setBannedUsers(users.filter(u => u.is_banned || (u.strikes || 0) >= 1));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#f700ff] rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Lock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-lg font-bold text-gray-800">גישה למנהלים בלבד</p>
      </div>
    </div>
  );

  const filteredEscrows = filterStatus === "all"
    ? escrows
    : escrows.filter(e => e.status === filterStatus);

  const stats = {
    frozen: escrows.filter(e => e.status === "frozen").length,
    disputed: escrows.filter(e => e.status === "disputed").length,
    released: escrows.filter(e => e.status === "released").length,
    totalFrozen: escrows.filter(e => e.status === "frozen").reduce((s, e) => s + (e.amount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <ShieldAlert className="h-5 w-5" style={{ color: "#f700ff" }} />
          <div className="flex-1">
            <h1 className="text-lg font-black text-gray-900">לוח בקרה — ניהול סכסוכים</h1>
            <p className="text-xs text-gray-400">גישת מנהל בלבד</p>
          </div>
          <button onClick={loadData} className="text-gray-400 hover:text-gray-600">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "כספים מוקפאים", value: stats.frozen, color: "#2563eb" },
            { label: "סכסוכים פתוחים", value: stats.disputed, color: "#dc2626" },
            { label: "שוחררו", value: stats.released, color: "#16a34a" },
            { label: "ס\"כ מוקפא (₪)", value: stats.totalFrozen.toLocaleString(), color: "#f700ff" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Escrow filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1 flex gap-1">
          {[
            { key: "all", label: `הכל (${escrows.length})` },
            { key: "disputed", label: `סכסוכים (${stats.disputed})` },
            { key: "frozen", label: `ממתין (${stats.frozen})` },
            { key: "released", label: `שוחרר (${stats.released})` },
          ].map(t => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${filterStatus === t.key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Escrow list */}
        <div className="space-y-3">
          {filteredEscrows.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">אין רשומות</p>
            </div>
          ) : filteredEscrows.map(escrow => (
            <EscrowRow key={escrow.id} escrow={escrow} onAction={loadData} />
          ))}
        </div>

        {/* Banned / Struck Users */}
        {bannedUsers.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 p-4">
            <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              משתמשים עם עבירות ({bannedUsers.length})
            </h2>
            <div className="space-y-2">
              {bannedUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{u.full_name || u.email}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: "#ef444415", color: "#dc2626" }}>
                      {u.strikes || 0} strikes
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-bold"
                      style={{ background: u.trust_score > 50 ? "#22c55e15" : "#ef444415", color: u.trust_score > 50 ? "#16a34a" : "#dc2626" }}>
                      {u.trust_score ?? 100}% אמינות
                    </span>
                    {u.is_banned && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-gray-900 text-white">חסום</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}