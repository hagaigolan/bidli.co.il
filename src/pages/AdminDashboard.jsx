import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, Gavel, CheckCircle, XCircle, DollarSign, Users, ShieldAlert, Lock, UserPlus, ArrowLeftRight } from "lucide-react";
import { getFeeConfig } from "@/functions/getFeeConfig";
import ClosedSalesSection from "@/components/admin/ClosedSalesSection";
import MonthlySalesChart from "@/components/admin/MonthlySalesChart";

const NEON_COLORS = ["#e5893d", "#3e6b8a", "#6aa3cd", "#2d4f68", "#00c853", "#ff6600"];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5"
      style={{ background: color + "06" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: color + "18" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs" dir="rtl">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  const SECRET_PIN = "1234"; // change as needed

  const [stats, setStats] = useState({
    activeAuctions: 0,
    endedWithWinner: 0,
    endedNoWinner: 0,
    cancelled: 0,
    disputed: 0,
    totalProducts: 0,
    totalBids: 0,
    totalUsers: 0,
    frozenEscrow: 0,
  });
  const [dailyData, setDailyData] = useState([]);
  const [auctionsByCategory, setAuctionsByCategory] = useState([]);
  const [outcomeData, setOutcomeData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [feeRate, setFeeRate] = useState(0);
  const [barterStats, setBarterStats] = useState({ active: 0, completed: 0, total: 0 });
  const [barterDailyData, setBarterDailyData] = useState([]);
  const [usersThisWeek, setUsersThisWeek] = useState(0);
  const [usersDailyData, setUsersDailyData] = useState([]);

  const checkPin = () => {
    if (pinInput === SECRET_PIN) {
      setAuthorized(true);
      loadData();
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1500);
    }
  };

  const loadData = async () => {
    setLoading(true);
    getFeeConfig().then(r => setFeeRate(r?.data?.seller_commission_rate ?? 0)).catch(() => {});
    try {
      const [products, bids, escrows, barters, users] = await Promise.all([
        base44.entities.Product.list("-created_date", 500),
        base44.entities.Bid.list("-created_date", 200),
        base44.entities.Escrow.list("-created_date", 200),
        base44.entities.BarterItem.list("-created_date", 500),
        base44.entities.User.list("-created_date", 1000),
      ]);

      // Core stats
      const active = products.filter(p => p.status === "active").length;
      const withWinner = products.filter(p =>
        ["awaiting_payment","paid","escrow","delivered","released"].includes(p.status) ||
        (p.status === "ended" && p.highest_bidder)
      ).length;
      const cancelled = products.filter(p => p.status === "cancelled").length;
      const disputed = products.filter(p => p.status === "disputed").length;
      const noWinner = products.filter(p => p.status === "ended" && !p.highest_bidder).length;

      const frozenEscrow = escrows.filter(e => e.status === "frozen").reduce((s, e) => s + (e.amount || 0), 0);
      setAllProducts(products);

      setStats({
        activeAuctions: active,
        endedWithWinner: withWinner,
        endedNoWinner: noWinner,
        cancelled,
        disputed,
        totalProducts: products.length,
        totalBids: bids.length,
        frozenEscrow,
      });

      // Daily stats (last 14 days)
      const dayMap = {};
      const now = Date.now();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        dayMap[key] = { date: key, "מכרזים": 0 };
      }
      products.forEach(p => {
        const d = new Date(p.created_date);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        if (dayMap[key]) dayMap[key]["מכרזים"]++;
      });
      setDailyData(Object.values(dayMap));

      // משתמשים חדשים — ספירת שבוע + טרנד יומי (14 ימים)
      const weekAgo = now - 7 * 86400000;
      setUsersThisWeek(users.filter(u => new Date(u.created_date).getTime() >= weekAgo).length);
      const barterMap = {};
      const usersMap = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        barterMap[key] = 0;
        usersMap[key] = 0;
      }
      barters.forEach(b => {
        const d = new Date(b.created_date);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        if (key in barterMap) barterMap[key]++;
      });
      users.forEach(u => {
        const d = new Date(u.created_date);
        const key = `${d.getDate()}/${d.getMonth() + 1}`;
        if (key in usersMap) usersMap[key]++;
      });
      setBarterDailyData(Object.entries(barterMap).map(([date, v]) => ({ date, "בארטר": v })));
      setUsersDailyData(Object.entries(usersMap).map(([date, v]) => ({ date, "משתמשים חדשים": v })));

      // סטטוסי בארטר
      setBarterStats({
        active: barters.filter(b => b.status === "active").length,
        completed: barters.filter(b => b.status === "completed").length,
        total: barters.length,
      });

      // By category
      const catMap = {};
      products.forEach(p => {
        const cat = p.category || "אחר";
        if (!catMap[cat]) catMap[cat] = 0;
        catMap[cat]++;
      });
      setAuctionsByCategory(
        Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 7)
          .map(([name, value]) => ({ name, value }))
      );

      // Outcome pie
      setOutcomeData([
        { name: "הסתיים עם זוכה", value: withWinner, color: "#00c853" },
        { name: "ללא מציעים", value: noWinner, color: "#9ca3af" },
        { name: "בוטל", value: cancelled, color: "#e5893d" },
        { name: "סכסוך", value: disputed, color: "#ff6600" },
        { name: "פעיל", value: active, color: "#2d4f68" },
      ].filter(d => d.value > 0));

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const successRate = stats.totalProducts > 0
    ? Math.round((stats.endedWithWinner / stats.totalProducts) * 100)
    : 0;

  // PIN gate
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="w-full max-w-sm mx-4">
          <div className="rounded-2xl border border-white/10 p-8 text-center"
            style={{ background: "linear-gradient(135deg, #0a0014, #0d0020)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 24px #e5893d55" }}>
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-black text-white mb-1">דשבורד ניהול</h1>
            <p className="text-white/40 text-xs mb-6">הזן קוד גישה</p>
            <input
              type="password"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && checkPin()}
              placeholder="••••"
              className={`w-full text-center text-2xl font-mono tracking-widest px-4 py-3 rounded-xl border bg-white/5 text-white outline-none transition-all mb-4 ${pinError ? "border-red-500 animate-pulse" : "border-white/10 focus:border-[#e5893d88]"}`}
            />
            <button onClick={checkPin}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)", boxShadow: "0 0 16px #e5893d44" }}>
              כניסה
            </button>
            {pinError && <p className="text-red-400 text-xs mt-3">קוד שגוי, נסה שנית</p>}
          </div>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-white/10 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}>
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900">דשבורד ניהול</h1>
              <p className="text-xs text-gray-400">bidli — נתונים בזמן אמת</p>
            </div>
          </div>
          <button onClick={() => navigate(-1)}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl transition-colors">
            יציאה
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Gavel} label="מכרזים פעילים" value={stats.activeAuctions} sub={`מתוך ${stats.totalProducts} סה״כ`} color="#2d4f68" />
          <StatCard icon={CheckCircle} label="אחוז הצלחה" value={`${successRate}%`} sub={`${stats.endedWithWinner} מכרזים הסתיימו עם זוכה`} color="#00c853" />
          <StatCard icon={ShieldAlert} label="כספים מוקפאים" value={`₪${Math.round(stats.frozenEscrow).toLocaleString()}`} sub="ב-Escrow כרגע" color="#ff6600" />
          <StatCard icon={UserPlus} label="משתמשים חדשים השבוע" value={usersThisWeek} sub="נרשמו ב-7 הימים האחרונים" color="#6aa3cd" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="סך הצעות מחיר" value={stats.totalBids.toLocaleString()} color="#3e6b8a" />
          <StatCard icon={CheckCircle} label="מכרזים עם זוכה" value={stats.endedWithWinner} color="#00c853" />
          <StatCard icon={XCircle} label="בוטלו / ללא זוכה" value={stats.cancelled + stats.endedNoWinner} color="#e5893d" />
          <StatCard icon={ShieldAlert} label="סכסוכים פתוחים" value={stats.disputed} color="#ff6600" />
        </div>

        {/* Closed sales with commissions */}
        <ClosedSalesSection products={allProducts} commissionRate={feeRate} />

        {/* Bottom row: pie + bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Outcome Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-black text-gray-900 mb-5">התפלגות תוצאות מכרזים</h2>
            {outcomeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      dataKey="value" paddingAngle={3}>
                      {outcomeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {outcomeData.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">אין נתונים עדיין</div>
            )}
          </div>

          {/* Auctions by category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-black text-gray-900 mb-5">מכרזים לפי קטגוריה</h2>
            {auctionsByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={auctionsByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="מכרזים" radius={[0, 6, 6, 0]}>
                    {auctionsByCategory.map((_, i) => (
                      <Cell key={i} fill={NEON_COLORS[i % NEON_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-300 text-sm">אין נתונים עדיין</div>
            )}
          </div>
        </div>

        {/* Daily auctions trend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-black text-gray-900 mb-5">מכרזים חדשים — 14 ימים אחרונים</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="מכרזים" fill="#3e6b8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* פעילות בארטר + משתמשים חדשים */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Barter activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <ArrowLeftRight className="h-4 w-4" style={{ color: "#3e6b8a" }} />
              <h2 className="text-sm font-black text-gray-900">היקף פעילות בארטר — 14 ימים אחרונים</h2>
            </div>
            <div className="flex gap-2 mb-4">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: "#00c85315", color: "#00c853" }}>{barterStats.active} פעילים</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ background: "#3e6b8a15", color: "#3e6b8a" }}>{barterStats.completed} הושלמו</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-gray-100 text-gray-500">{barterStats.total} סה״כ</span>
            </div>
            {barterDailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barterDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="בארטר" fill="#3e6b8a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">אין נתונים עדיין</div>
            )}
          </div>

          {/* New users */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <UserPlus className="h-4 w-4" style={{ color: "#00c853" }} />
              <h2 className="text-sm font-black text-gray-900">משתמשים חדשים — 14 ימים אחרונים</h2>
            </div>
            <p className="text-xs text-gray-400 mb-4">{usersThisWeek} נרשמו בשבוע האחרון</p>
            {usersDailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={usersDailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="משתמשים חדשים" stroke="#00c853" strokeWidth={2.5} dot={{ r: 3, fill: "#00c853" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-300 text-sm">אין נתונים עדיין</div>
            )}
          </div>
        </div>

        {/* Monthly sales volume */}
        <MonthlySalesChart products={allProducts} />

      </div>
    </div>
  );
}