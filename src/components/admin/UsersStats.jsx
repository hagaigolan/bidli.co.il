import { useState } from "react";

// סטטיסטיקות משתמשים — סך המשתמשים הרשומים, פעילים/מושהים ומספר הנרשמים לפי תקופה
const PERIODS = [
  { key: "today", label: "היום" },
  { key: "week", label: "השבוע" },
  { key: "month", label: "החודש" },
];

export function formatLastLogin(iso) {
  if (!iso) return "טרם התחבר/ה";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "טרם התחבר/ה";
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit",
  }).format(d);
}

export default function UsersStats({ users }) {
  const [period, setPeriod] = useState("month");

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = dayStart - 6 * 24 * 3600 * 1000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const from = period === "today" ? dayStart : period === "week" ? weekStart : monthStart;

  const total = users.length;
  const active = users.filter(u => !u.is_banned).length;
  const banned = total - active;
  const registered = users.filter(u => {
    const t = new Date(u.created_date).getTime();
    return !Number.isNaN(t) && t >= from;
  }).length;

  const tile = (label, value, color, bg) => (
    <div className="rounded-2xl border border-gray-100 bg-white px-3 py-3 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <p className="text-xl font-black" style={{ color }}>{value.toLocaleString("he-IL")}</p>
      <p className="text-[11px] font-semibold mt-0.5" style={{ color }}>{label}</p>
      <span className="block h-0.5 w-8 mx-auto mt-1.5 rounded-full" style={{ background: bg }} />
    </div>
  );

  return (
    <div className="mb-4 space-y-2.5" dir="rtl">
      <div className="grid grid-cols-3 gap-2">
        {tile("סה\"כ משתמשים", total, "#3e6b8a", "#3e6b8a33")}
        {tile("פעילים", active, "#00c853", "#00c85333")}
        {tile("מושהים", banned, "#ef4444", "#ef444433")}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3.5" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <p className="text-xs font-bold text-gray-700">נרשמו לאתר</p>
          <div className="flex gap-1.5">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                aria-pressed={period === p.key}
                className="text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all"
                style={period === p.key
                  ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", color: "#fff", borderColor: "transparent" }
                  : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-2xl font-black" style={{ color: "#e5893d" }}>
          {registered.toLocaleString("he-IL")}
          <span className="text-xs font-bold text-gray-400 mr-1.5">
            {period === "today" ? "נרשמו היום" : period === "week" ? "נרשמו בשבוע האחרון" : "נרשמו החודש"}
          </span>
        </p>
      </div>
    </div>
  );
}