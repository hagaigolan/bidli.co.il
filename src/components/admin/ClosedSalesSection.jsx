import { Link } from "react-router-dom";
import { DollarSign, Gavel, Percent, Receipt } from "lucide-react";

const STATUS_LABELS = {
  ended: { label: "הסתיים עם זוכה", color: "#00c853" },
  awaiting_payment: { label: "ממתין לתשלום", color: "#e5893d" },
  transfer_reported: { label: "העברה דווחה", color: "#6aa3cd" },
  paid: { label: "שולם", color: "#00c853" },
  escrow: { label: "ב-Escrow", color: "#ff6600" },
  delivered: { label: "נמסר", color: "#3e6b8a" },
  released: { label: "שוחרר", color: "#16a34a" },
  disputed: { label: "בסכסוך", color: "#ef4444" },
};

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5" style={{ background: color + "06" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + "18" }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// עמלה לכל עסקה — לפי שיעור העמלה המרכזי שמגיע ממנוע העמלות (fees.ts)
function commissionFor(salePrice, rate) {
  const sale = Number(salePrice) || 0;
  return Math.round(sale * (Number(rate) || 0) * 100) / 100;
}

export default function ClosedSalesSection({ products = [], commissionRate = 0 }) {
  // "מכירה שנסגרה": כל מוצר עם זוכה בכל סטטוס — למעט בוטל ולמעט נסגר ללא זוכה
  const closedSales = products.filter(p =>
    p.highest_bidder && p.status !== "cancelled" && p.status !== "active"
  );

  const totalVolume = closedSales.reduce((s, p) => s + (Number(p.current_price) || 0), 0);
  const totalCommission = closedSales.reduce((s, p) => s + commissionFor(p.current_price, commissionRate), 0);

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-6" dir="rtl">
      <div className="flex items-center gap-2 mb-5">
        <Receipt className="h-4 w-4" style={{ color: "#e5893d" }} />
        <h2 className="text-sm font-black text-gray-900">מכירות שנסגרו</h2>
        <span className="text-xs text-gray-400">
          (עמלת מוכר: {(Number(commissionRate) || 0) * 100}%)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard icon={Gavel} label="מספר מכירות שנסגרו" value={closedSales.length} color="#3e6b8a" />
        <SummaryCard icon={DollarSign} label="היקף מכירות כולל" value={`₪${Math.round(totalVolume).toLocaleString()}`} color="#00c853" />
        <SummaryCard icon={Percent} label="סה״כ עמלות" value={`₪${totalCommission.toLocaleString()}`} color="#e5893d" />
      </div>

      {closedSales.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-gray-300 text-sm">אין עדיין מכירות שנסגרו</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-right font-medium py-2.5 px-2">מוצר</th>
                <th className="text-right font-medium py-2.5 px-2">מוכר</th>
                <th className="text-right font-medium py-2.5 px-2">זוכה</th>
                <th className="text-left font-medium py-2.5 px-2">מחיר זכייה</th>
                <th className="text-center font-medium py-2.5 px-2">סטטוס</th>
                <th className="text-right font-medium py-2.5 px-2">תאריך סיום</th>
                <th className="text-left font-medium py-2.5 px-2">עמלה</th>
              </tr>
            </thead>
            <tbody>
              {closedSales.map(p => {
                const st = STATUS_LABELS[p.status] || { label: p.status, color: "#9ca3af" };
                const commission = commissionFor(p.current_price, commissionRate);
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-2.5 px-2">
                      <Link to={`/auction/${p.id}`} className="font-semibold text-gray-800 hover:text-[#e5893d] transition-colors truncate block max-w-[180px]">
                        {p.title || "מוצר"}
                      </Link>
                    </td>
                    <td className="py-2.5 px-2 text-gray-600 truncate max-w-[120px]">{p.seller_name || p.seller_email || "—"}</td>
                    <td className="py-2.5 px-2 text-gray-600 truncate max-w-[120px]">{p.highest_bidder || "—"}</td>
                    <td className="py-2.5 px-2 font-bold text-gray-900 whitespace-nowrap">₪{(Number(p.current_price) || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-2">
                      <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{ background: st.color + "15", color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-500 whitespace-nowrap text-xs">
                      {p.ends_at ? new Date(p.ends_at).toLocaleDateString("he-IL") : "—"}
                    </td>
                    <td className="py-2.5 px-2 font-bold whitespace-nowrap" style={{ color: "#e5893d" }}>
                      ₪{commission.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}