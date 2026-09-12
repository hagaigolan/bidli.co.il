import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Loader2, XCircle, Trash2, Search } from "lucide-react";

const btnCls = "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 whitespace-nowrap";

const STATUS_LABELS = {
  active: "פעיל", ended: "הסתיים", awaiting_payment: "ממתין לתשלום", transfer_reported: "העברה דווחה",
  paid: "שולם", escrow: "Escrow", delivered: "נמסר", released: "שוחרר", disputed: "סכסוך", cancelled: "בוטל",
};

// ניהול מכרזים — ביטול מכרז של כל מוכר, מחיקה ומייל למוכר
export default function AdminAuctionsSection({ onSendEmail }) {
  const [products, setProducts] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");

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
      if (p.seller_email) {
        base44.integrations.Core.SendEmail({
          to: p.seller_email,
          subject: `המכרז "${p.title}" בוטל על ידי הנהלת bidli`,
          body: `שלום${p.seller_name ? " " + p.seller_name : ""},\n\nהמכרז "${p.title}" בוטל על ידי הנהלת bidli.\nסיבה: ${finalReason}\n\nלפניות להנהלה: mitugplus@gmail.com\n\nצוות bidli — הבית של פלטפורמת מכרזים שלך`,
        }).catch(() => {});
      }
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

  const term = search.trim().toLowerCase();
  const filtered = term
    ? products.filter(p =>
        (p.title || "").toLowerCase().includes(term) ||
        (p.seller_name || "").toLowerCase().includes(term) ||
        (p.seller_email || "").toLowerCase().includes(term))
    : products;

  return (
    <div dir="rtl">
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="חפש לפי כותרת, מוכר או אימייל..."
          className="w-full pr-10 pl-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right" />
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-green-700 bg-green-50 border border-green-100">
          {msg}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 overflow-hidden">
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