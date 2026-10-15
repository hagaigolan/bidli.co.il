import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { sendCancelEmail } from "@/lib/adminEmails";
import { Mail, Loader2, XCircle, Trash2, Search } from "lucide-react";

const btnCls = "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 whitespace-nowrap";

const STATUS_LABELS = {
  active: "פעיל", ended: "הסתיים", awaiting_payment: "ממתין לתשלום", transfer_reported: "העברה דווחה",
  paid: "שולם", escrow: "Escrow", delivered: "נמסר", released: "שוחרר", disputed: "סכסוך", cancelled: "בוטל",
};

// ניהול מכרזים — ביטול מכרז של כל מוכר, מחיקה ומייל למוכר
export default function AdminAuctionsSection({ onSendEmail }) {
  const { user } = useAuth();
  const [products, setProducts] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all"); // all | mine | others
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    base44.entities.Product.list("-created_date", 300)
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const patchLocal = (id, data) =>
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));

  const cancelAuction = async (p) => {
    if (busy || p.status === "cancelled") return;
    const reason = window.prompt(`סיבת ביטול המכרז "${p.title}" (תישלח למוכר במייל):`, "הפרת תנאי השימוש");
    if (reason === null) return;
    const finalReason = reason.trim() || "הפרת תנאי השימוש";
    setBusy(p.id); setMsg("");
    try {
      await base44.entities.Product.update(p.id, { status: "cancelled" });
      patchLocal(p.id, { status: "cancelled" });
      if (p.seller_email) sendCancelEmail(p.seller_email, p.seller_name || "", p.title, finalReason).catch(() => {});
      setMsg(`המכרז "${p.title}" בוטל ונשלח מייל למוכר`);
    } catch {
      setMsg("ביטול המכרז נכשל, נסה שנית");
    } finally { setBusy(null); }
  };

  const deleteAuction = async (p) => {
    if (busy) return;
    if (!window.confirm(`למחוק סופית את המכרז "${p.title}"? פעולה זו בלתי הפיכה.`)) return;
    setBusy(p.id); setMsg("");
    try {
      await base44.entities.Product.delete(p.id);
      setProducts(prev => prev.filter(x => x.id !== p.id));
      setMsg(`המכרז "${p.title}" נמחק`);
    } catch {
      setMsg("המחיקה נכשלה, נסה שנית");
    } finally { setBusy(null); }
  };

  if (!products) return (
    <div className="py-12 flex justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-300" aria-hidden="true" />
    </div>
  );

  const isMine = (p) =>
    (p.seller_email && user?.email && p.seller_email.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
    (p.seller_user_id && user?.id && p.seller_user_id === user.id);

  const term = search.trim().toLowerCase();
  const filtered = products
    .filter(p => ownerFilter === "all" || (ownerFilter === "mine" ? isMine(p) : !isMine(p)))
    .filter(p => statusFilter === "all" || p.status === statusFilter)
    .filter(p => !term ||
      (p.title || "").toLowerCase().includes(term) ||
      (p.seller_name || "").toLowerCase().includes(term) ||
      (p.seller_email || "").toLowerCase().includes(term));

  return (
    <div dir="rtl">
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="חפש לפי כותרת, מוכר או אימייל..."
          className="w-full pr-10 pl-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" />
      </div>

      {/* ── סינון: בעלות + סטטוס ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1.5">
          {[
            { id: "all", label: "הכול" },
            { id: "mine", label: "המכרזים שלי" },
            { id: "others", label: "של אחרים" },
          ].map(o => (
            <button key={o.id} onClick={() => setOwnerFilter(o.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                ownerFilter === o.id ? "text-white" : "bg-white text-gray-600 border-gray-200 hover:text-[#e5893d]"
              }`}
              style={ownerFilter === o.id ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent" } : undefined}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setStatusFilter("all")}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
              statusFilter === "all" ? "text-white" : "bg-white text-gray-600 border-gray-200 hover:text-[#e5893d]"
            }`}
            style={statusFilter === "all" ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent" } : undefined}>
            כל הסטטוסים
          </button>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
                statusFilter === key ? "text-white" : "bg-white text-gray-600 border-gray-200 hover:text-[#e5893d]"
              }`}
              style={statusFilter === key ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent" } : undefined}>
              {label}
            </button>
          ))}
        </div>
        {(ownerFilter !== "all" || statusFilter !== "all") && (
          <button onClick={() => { setOwnerFilter("all"); setStatusFilter("all"); }}
            className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors">
            איפוס סינון
          </button>
        )}
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-green-700 bg-green-50 border border-green-100">
          {msg}
        </div>
      )}

      {/* ── מובייל: כרטיסים ── */}
      <div className="sm:hidden space-y-2.5">
        {filtered.slice(0, 100).map(p => (
          <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-3.5"
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start gap-3 mb-2">
              {p.image_url
                ? <img src={p.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-xl">🏺</div>}
              <div className="flex-1 min-w-0">
                <a href={`/auction/${p.id}`} className="block font-bold text-sm text-gray-800 hover:text-[#e5893d] transition-colors line-clamp-2">
                  {p.title || "—"}
                </a>
                <p className="text-xs text-gray-400 truncate mt-0.5">{p.seller_name || "—"}{p.seller_email ? ` · ${p.seller_email}` : ""}</p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 mt-0.5"
                style={p.status === "cancelled"
                  ? { background: "#ef444415", color: "#ef4444" }
                  : p.status === "active"
                    ? { background: "#00c85315", color: "#00c853" }
                    : { background: "#f3f4f6", color: "#6b7280" }}>
                {STATUS_LABELS[p.status] || p.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span className="font-black text-gray-900">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</span>
              <span className="font-bold">{p.bid_count || 0} הצעות</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.seller_email && (
                <button onClick={() => onSendEmail(p.seller_email)} className={btnCls}
                  style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                  <Mail className="h-3 w-3 inline ml-1" aria-hidden="true" /> מייל
                </button>
              )}
              {p.status !== "cancelled" && (
                <button onClick={() => cancelAuction(p)} disabled={busy === p.id} className={btnCls}
                  style={{ borderColor: "#f9731644", color: "#ea580c", background: "#f9731608" }}>
                  {busy === p.id ? <Loader2 className="h-3 w-3 inline animate-spin" aria-hidden="true" />
                    : <><XCircle className="h-3 w-3 inline ml-1" aria-hidden="true" /> בטל</>}
                </button>
              )}
              <button onClick={() => deleteAuction(p)} disabled={busy === p.id} className={btnCls}
                style={{ borderColor: "#ef444444", color: "#ef4444", background: "#ef444408" }}>
                <Trash2 className="h-3 w-3 inline ml-1" aria-hidden="true" /> מחק
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── דסקטופ: טבלה ── */}
      <div className="hidden sm:block rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400">
                <th className="px-4 py-2.5 text-right font-semibold">מכרז</th>
                <th className="px-4 py-2.5 text-right font-semibold">מוכר</th>
                <th className="px-4 py-2.5 text-right font-semibold">מחיר</th>
                <th className="px-4 py-2.5 text-right font-semibold">הצעות</th>
                <th className="px-4 py-2.5 text-right font-semibold">סטטוס</th>
                <th className="px-4 py-2.5 text-right font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <a href={`/auction/${p.id}`} className="font-semibold text-gray-800 hover:text-[#e5893d] transition-colors">
                      {p.title || "—"}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs font-semibold">{p.seller_name || "—"}</p>
                    {p.seller_email && <p className="text-gray-400 text-xs" dir="ltr">{p.seller_email}</p>}
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800">₪{(p.current_price || p.starting_price || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{p.bid_count || 0}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={p.status === "cancelled"
                        ? { background: "#ef444415", color: "#ef4444" }
                        : p.status === "active"
                          ? { background: "#00c85315", color: "#00c853" }
                          : { background: "#f3f4f6", color: "#6b7280" }}>
                      {STATUS_LABELS[p.status] || p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.seller_email && (
                        <button onClick={() => onSendEmail(p.seller_email)} className={btnCls}
                          style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                          <Mail className="h-3 w-3 inline ml-1" aria-hidden="true" /> מייל למוכר
                        </button>
                      )}
                      {p.status !== "cancelled" && (
                        <button onClick={() => cancelAuction(p)} disabled={busy === p.id} className={btnCls}
                          style={{ borderColor: "#f9731644", color: "#ea580c", background: "#f9731608" }}>
                          {busy === p.id ? <Loader2 className="h-3 w-3 inline animate-spin" aria-hidden="true" />
                            : <><XCircle className="h-3 w-3 inline ml-1" aria-hidden="true" /> בטל מכרז</>}
                        </button>
                      )}
                      <button onClick={() => deleteAuction(p)} disabled={busy === p.id} className={btnCls}
                        style={{ borderColor: "#ef444444", color: "#ef4444", background: "#ef444408" }}>
                        <Trash2 className="h-3 w-3 inline ml-1" aria-hidden="true" /> מחק
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length === 0 && <p className="text-center text-sm text-gray-400 py-8">לא נמצאו מכרזים</p>}
      {filtered.length > 100 && <p className="text-center text-xs text-gray-400 py-3">מוצגים 100 המכרזים הראשונים מתוך {filtered.length}</p>}
    </div>
  );
}