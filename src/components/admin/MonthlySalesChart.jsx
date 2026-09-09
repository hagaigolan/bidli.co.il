import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp } from "lucide-react";
import { isClosedSale } from "@/components/admin/ClosedSalesSection";

const MONTHS_BACK = 6;

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthlySalesChart({ products = [] }) {
  // היקף מכירות שנסגרו לפי חודש סיום המכרז
  const months = [];
  const now = new Date();
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString("he-IL", { month: "short" }), volume: 0, sales: 0 });
  }
  const monthMap = Object.fromEntries(months.map(m => [m.key, m]));

  products.filter(isClosedSale).forEach(p => {
    if (!p.ends_at) return;
    const m = monthMap[monthKey(new Date(p.ends_at))];
    if (!m) return;
    m.volume += Number(p.current_price) || 0;
    m.sales += 1;
  });

  const data = months.map(m => ({ label: m.label, volume: Math.round(m.volume), sales: m.sales }));
  const hasData = data.some(d => d.volume > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6" dir="rtl">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="h-4 w-4" style={{ color: "#e5893d" }} />
        <h2 className="text-sm font-black text-gray-900">היקף מכירות — {MONTHS_BACK} חודשים אחרונים</h2>
        <span className="text-xs text-gray-400">(מכירות שנסגרו עם זוכה, ₪)</span>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickFormatter={v => v >= 1000 ? `${Math.round(v / 1000)}K` : v} />
            <Tooltip
              formatter={(value, name) => name === "volume"
                ? [`₪${value.toLocaleString()}`, "היקף מכירות"]
                : [value, "מספר מכירות"]}
              labelStyle={{ fontWeight: "bold", color: "#374151" }}
              contentStyle={{ direction: "rtl", borderRadius: "0.75rem", border: "1px solid #f3f4f6", fontSize: "12px" }}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={i === data.length - 1 ? "#e5893d" : "#6aa3cd"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-300 text-sm">אין נתוני מכירות עדיין</div>
      )}
    </div>
  );
}