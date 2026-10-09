import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { sendBanEmail } from "@/lib/adminEmails";
import { Mail, ShieldCheck, ShieldOff, Loader2, Ban, RotateCcw, Eye } from "lucide-react";
import UserDetailModal from "@/components/admin/UserDetailModal";

const btnCls = "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 whitespace-nowrap";

// ניהול משתמשים — צפייה במיילים, השהיה/שחרור, הרשאות אדמין, שליחת מייל
export default function UsersSection({ onSendEmail }) {
  const [users, setUsers] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState("");
  const [detailUser, setDetailUser] = useState(null);

  useEffect(() => {
    base44.entities.User.list("-created_date", 200)
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const patchLocal = (id, data) =>
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...data } : u)));

  const toggleBan = async (u) => {
    if (busy) return;
    setBusy(u.id); setMsg("");
    try {
      if (u.is_banned) {
        await base44.entities.User.update(u.id, { is_banned: false, ban_reason: "" });
        patchLocal(u.id, { is_banned: false, ban_reason: "" });
        setMsg(`${u.email || "המשתמש"} שוחרר מהשהייה`);
      } else {
        const reason = window.prompt(`סיבת השהיית ${u.email} (תישלח למשתמש במייל):`, "הפרת תנאי השימוש");
        if (reason === null) return;
        const finalReason = reason.trim() || "הפרת תנאי השימוש";
        await base44.entities.User.update(u.id, { is_banned: true, ban_reason: finalReason });
        if (u.email) sendBanEmail(u.email, u.full_name || "", finalReason).catch(() => {});
        patchLocal(u.id, { is_banned: true, ban_reason: finalReason });
        setMsg(`${u.email} הושהה ונשלח לו מייל הודעה`);
      }
    } catch {
      setMsg("הפעולה נכשלה, נסה שנית");
    } finally { setBusy(null); }
  };

  const toggleRole = async (u) => {
    if (busy) return;
    const newRole = u.role === "admin" ? "user" : "admin";
    if (newRole === "admin" && !window.confirm(`להעניק הרשאות אדמין מלאות ל-${u.email}?`)) return;
    setBusy(u.id); setMsg("");
    try {
      await base44.entities.User.update(u.id, { role: newRole });
      patchLocal(u.id, { role: newRole });
      setMsg(`${u.email || "המשתמש"} הוגדר כעת כ${newRole === "admin" ? "אדמין" : "משתמש רגיל"}`);
    } catch {
      setMsg("הפעולה נכשלה, נסה שנית");
    } finally { setBusy(null); }
  };

  if (!users) return (
    <div className="py-12 flex justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-gray-300" aria-hidden="true" />
    </div>
  );

  return (
    <div dir="rtl">
      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold text-green-700 bg-green-50 border border-green-100">
          {msg}
        </div>
      )}
      {/* ── מובייל: כרטיסים ── */}
      <div className="sm:hidden space-y-2.5">
        {users.map(u => (
          <div key={u.id} onClick={() => setDetailUser(u)}
            className="rounded-2xl border border-gray-100 bg-white p-3.5 cursor-pointer"
            style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{u.full_name || "—"}</p>
                <p className="text-xs text-gray-400 truncate" dir="ltr">{u.email || "—"}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold"
                  style={u.role === "admin" ? { background: "#3e6b8a15", color: "#3e6b8a" } : { background: "#f3f4f6", color: "#6b7280" }}>
                  {u.role === "admin" ? "אדמין" : "משתמש"}
                </span>
                {u.is_banned
                  ? <span className="text-[11px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#ef4444" }}>מושהה</span>
                  : <span className="text-[11px] px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#00c853" }}>פעיל</span>}
              </div>
            </div>
            <div onClick={e => e.stopPropagation()} className="flex flex-wrap gap-1.5">
              <button onClick={() => setDetailUser(u)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap"
                style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                <Eye className="h-3 w-3 inline ml-1" aria-hidden="true" /> פעילות
              </button>
              {u.email && (
                <button onClick={() => onSendEmail(u.email)} className={btnCls}
                  style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                  <Mail className="h-3 w-3 inline ml-1" aria-hidden="true" /> מייל
                </button>
              )}
              <button onClick={() => toggleBan(u)} disabled={busy === u.id} className={btnCls}
                style={u.is_banned
                  ? { borderColor: "#00c85344", color: "#00c853", background: "#00c85308" }
                  : { borderColor: "#ef444444", color: "#ef4444", background: "#ef444408" }}>
                {busy === u.id ? <Loader2 className="h-3 w-3 inline animate-spin" aria-hidden="true" />
                  : u.is_banned ? <><RotateCcw className="h-3 w-3 inline ml-1" aria-hidden="true" /> שחרר</>
                    : <><Ban className="h-3 w-3 inline ml-1" aria-hidden="true" /> השהה</>}
              </button>
              <button onClick={() => toggleRole(u)} disabled={busy === u.id} className={btnCls}
                style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                <ShieldOff className="h-3 w-3 inline ml-1" aria-hidden="true" />
                {u.role === "admin" ? "הסר אדמין" : "מנה אדמין"}
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
                <th className="px-4 py-2.5 text-right font-semibold">משתמש</th>
                <th className="px-4 py-2.5 text-right font-semibold">אימייל</th>
                <th className="px-4 py-2.5 text-right font-semibold">הרשאה</th>
                <th className="px-4 py-2.5 text-right font-semibold">סטטוס</th>
                <th className="px-4 py-2.5 text-right font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50 cursor-pointer" onClick={() => setDetailUser(u)}>
                  <td className="px-4 py-3 font-semibold text-gray-800">{u.full_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">
                    {u.email || "—"}
                    <button onClick={() => setDetailUser(u)}
                      className="mr-2 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-all"
                      style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                      <Eye className="h-3 w-3 inline ml-1" aria-hidden="true" /> פעילות
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={u.role === "admin"
                        ? { background: "#3e6b8a15", color: "#3e6b8a" }
                        : { background: "#f3f4f6", color: "#6b7280" }}>
                      {u.role === "admin" ? "אדמין" : "משתמש"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_banned ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#ef4444" }}>מושהה</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#00c853" }}>פעיל</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                      {u.email && (
                        <button onClick={() => onSendEmail(u.email)} className={btnCls}
                          style={{ borderColor: "#e5893d44", color: "#e5893d", background: "#e5893d08" }}>
                          <Mail className="h-3 w-3 inline ml-1" aria-hidden="true" /> מייל
                        </button>
                      )}
                      <button onClick={() => toggleBan(u)} disabled={busy === u.id} className={btnCls}
                        style={u.is_banned
                          ? { borderColor: "#00c85344", color: "#00c853", background: "#00c85308" }
                          : { borderColor: "#ef444444", color: "#ef4444", background: "#ef444408" }}>
                        {busy === u.id ? <Loader2 className="h-3 w-3 inline animate-spin" aria-hidden="true" />
                          : u.is_banned ? <><RotateCcw className="h-3 w-3 inline ml-1" aria-hidden="true" /> שחרר</>
                            : <><Ban className="h-3 w-3 inline ml-1" aria-hidden="true" /> השהה</>}
                      </button>
                      <button onClick={() => toggleRole(u)} disabled={busy === u.id} className={btnCls}
                        style={{ borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
                        <ShieldOff className="h-3 w-3 inline ml-1" aria-hidden="true" />
                        {u.role === "admin" ? "הסר אדמין" : "מנה אדמין"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {users.length === 0 && <p className="text-center text-sm text-gray-400 py-8">אין משתמשים רשומים</p>}

      {detailUser && (
        <UserDetailModal user={detailUser} onClose={() => setDetailUser(null)} />
      )}
    </div>
  );
}