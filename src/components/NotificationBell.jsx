import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bell, Zap, Trophy, Banknote, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const TYPE_META = {
  outbid: { icon: Zap, color: "#e5893d", bg: "#e5893d15" },
  won: { icon: Trophy, color: "#16a34a", bg: "#22c55e15" },
  sold: { icon: Banknote, color: "#3e6b8a", bg: "#3e6b8a15" },
  cancelled: { icon: XCircle, color: "#9ca3af", bg: "#f3f4f6" },
  extension: { icon: Clock, color: "#f59e0b", bg: "#f59e0b15" },
};

function timeAgo(dateStr) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "עכשיו";
  if (min < 60) return `לפני ${min} דק׳`;
  const h = Math.floor(min / 60);
  if (h < 24) return `לפני ${h} שע׳`;
  return `לפני ${Math.floor(h / 24)} ימים`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const wrapRef = useRef(null);

  const emails = [...new Set([
    (user?.email || "").trim().toLowerCase(),
    (localStorage.getItem("notif_email") || "").trim().toLowerCase(),
    (localStorage.getItem("bidder_email") || "").trim().toLowerCase(),
  ].filter(Boolean))];

  const load = async () => {
    if (!emails.length) { setItems([]); setLoading(false); return; }
    try {
      const lists = await Promise.all(
        emails.map(e => base44.entities.AppNotification.filter({ recipient_email: e }, "-created_date", 30))
      );
      const seen = new Set();
      const merged = lists.flat()
        .filter(n => !seen.has(n.id) && seen.add(n.id))
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 30);
      setItems(merged);
    } catch { /* התראות אינן זמינות כרגע */ }
    finally { setLoading(false); }
  };

  // טעינה ראשונית + עדכון חי כשמתקבלת התראה חדשה
  useEffect(() => { load(); }, [user?.email]);
  useEffect(() => {
    const unsub = base44.entities.AppNotification.subscribe(() => { load(); });
    return unsub;
  }, [user?.email]);

  // סגירה בלחיצה מחוץ לפאנל
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = items.filter(n => !n.is_read).length;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    // פתיחת הפאנל מסמנת את כל ההתראות כנקראו
    if (next && unread) {
      try {
        await Promise.all(emails.map(e =>
          base44.entities.AppNotification.updateMany(
            { recipient_email: e, is_read: false },
            { $set: { is_read: true } }
          )
        ));
        setItems(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch { /* אם הסימון נכשל — ההתראות עדיין מוצגות */ }
    }
  };

  const openItem = (n) => {
    setOpen(false);
    const path = n.link || (n.product_id ? `/auction/${n.product_id}` : null);
    if (path) navigate(path);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button type="button" onClick={toggle} aria-label="התראות"
        className="relative h-9 w-9 inline-flex items-center justify-center text-gray-500 hover:text-[#e5893d] rounded-xl transition-colors">
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #e5893d, #e5893d)" }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div dir="rtl"
          className="fixed left-2 right-2 top-16 sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:mt-2 sm:w-80 rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900">התראות</h3>
            {unread > 0 && (
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: "#e5893d" }}>
                {unread} חדשות
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Bell className="h-7 w-7 mx-auto mb-2 text-gray-300" aria-hidden="true" />
                <p className="text-sm font-bold text-gray-500">אין התראות</p>
                <p className="text-xs text-gray-400 mt-1">כשיעקפו אותך, תזכה במכרז או שמכרז יבוטל — ההתראה תופיע כאן</p>
              </div>
            ) : (
              items.map(n => {
                const meta = TYPE_META[n.type] || TYPE_META.outbid;
                const Icon = meta.icon;
                return (
                  <button key={n.id} type="button" onClick={() => openItem(n)}
                    className={`w-full text-right flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors hover:bg-orange-50/50 ${!n.is_read ? "bg-orange-50/60" : ""}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: n.product_image_url ? "#fff" : meta.bg, border: "1px solid #f3f4f6" }}>
                      {n.product_image_url
                        ? <img src={n.product_image_url} alt="" className="w-full h-full object-cover" />
                        : <Icon className="h-4 w-4" style={{ color: meta.color }} aria-hidden="true" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2">{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_date)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#e5893d" }} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}