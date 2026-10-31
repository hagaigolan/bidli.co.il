import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Flag, CheckCircle, Clock } from "lucide-react";

// דיווחים על מכרזים — תצוגה וסימון "טופל" בלבד (אין מחיקה אוטומטית)
export default function ReportsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    base44.entities.AuctionReport.list("-created_date", 100)
      .then(setReports)
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  const markHandled = async (id) => {
    setBusyId(id);
    try {
      await base44.entities.AuctionReport.update(id, { status: "handled" });
      setReports((list) => list.map((r) => (r.id === id ? { ...r, status: "handled" } : r)));
    } finally {
      setBusyId(null);
    }
  };

  const openCount = reports.filter((r) => r.status !== "handled").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
          <Flag className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
          דיווחים על מכרזים
        </h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#e5893d15", color: "#e5893d" }}>
          {openCount} ממתינים לטיפול
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 py-4 text-center">טוען דיווחים...</p>
      ) : reports.length === 0 ? (
        <p className="text-xs text-gray-400 py-4 text-center">אין דיווחים</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => {
            const handled = r.status === "handled";
            return (
              <li
                key={r.id}
                className="rounded-xl border p-3"
                style={{ borderColor: handled ? "#e5e7eb" : "#e5893d44", background: handled ? "#f9fafb" : "#e5893d08" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: "#ef444415", color: "#b91c1c" }}>
                        {r.reason}
                      </span>
                      {r.auctionId && (
                        <Link to={`/auction/${r.auctionId}`} className="text-xs font-bold text-gray-800 truncate hover:underline">
                          {r.auctionTitle || "צפייה במכרז"}
                        </Link>
                      )}
                    </div>
                    {r.details && <p className="text-xs text-gray-600 leading-relaxed">{r.details}</p>}
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {r.createdDate ? new Date(r.createdDate).toLocaleString("he-IL") : ""}
                      {r.reporterId ? " · דווח על ידי משתמש מחובר" : " · דיווח אנונימי"}
                    </p>
                  </div>
                  {handled ? (
                    <span className="text-[11px] font-bold flex items-center gap-1 flex-shrink-0" style={{ color: "#16a34a" }}>
                      <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> טופל
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markHandled(r.id)}
                      disabled={busyId === r.id}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white disabled:opacity-60 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }}
                    >
                      {busyId === r.id ? "מסמן..." : "סמן כטופל"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}