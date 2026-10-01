import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { GraduationCap, CheckCircle, XCircle, Trash2, Phone, Mail } from "lucide-react";

const STATUS_LABELS = {
  pending: { label: "ממתין לאישור", color: "#f59e0b", bg: "#f59e0b0f" },
  approved: { label: "מאושר", color: "#00a35c", bg: "#00a35c0f" },
  rejected: { label: "נדחה", color: "#9ca3af", bg: "#f3f4f6" },
};

// ניהול דירקטוריון המומחים — אישור, דחייה ומחיקה של רישומים
export default function ExpertsSection() {
  const [experts, setExperts] = useState(null);
  const [filter, setFilter] = useState("pending");

  const load = () => {
    base44.entities.Expert.list("-created_date", 100)
      .then(setExperts)
      .catch(() => setExperts([]));
  };
  useEffect(load, []);

  const update = async (id, data) => {
    await base44.entities.Expert.update(id, data).catch(() => {});
    load();
  };
  const remove = async (id) => {
    await base44.entities.Expert.delete(id).catch(() => {});
    load();
  };

  if (!experts) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
    </div>
  );

  const shown = experts.filter(e => filter === "all" || e.status === filter);

  return (
    <div dir="rtl">
      <div className="flex gap-2 mb-5 flex-wrap">
        {["pending", "approved", "rejected", "all"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f ? "text-white" : "text-gray-600 border border-gray-200 bg-white"
            }`}
            style={filter === f ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}>
            {f === "pending" ? `ממתינים (${experts.filter(e => e.status === "pending").length})`
              : f === "approved" ? `מאושרים (${experts.filter(e => e.status === "approved").length})`
              : f === "rejected" ? "נדחו" : "הכל"}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 bg-white">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: "#3e6b8a08", border: "1px solid #3e6b8a33" }}>
            <GraduationCap className="h-6 w-6 text-gray-400" />
          </div>
          <p className="font-bold text-gray-600 text-sm">אין רישומים להצגה</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map(e => {
            const cfg = STATUS_LABELS[e.status] || STATUS_LABELS.pending;
            return (
              <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{e.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "#3e6b8a0f", color: "#3e6b8a" }}>{e.profession}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {e.city && <>{e.city} · </>}{e.bio ? e.bio.slice(0, 80) : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500" dir="ltr">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {e.status !== "approved" && (
                    <button onClick={() => update(e.id, { status: "approved", approved_at: new Date().toISOString() })}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all"
                      style={{ background: "linear-gradient(135deg, #00a35c, #00e676)" }}>
                      <CheckCircle className="h-3.5 w-3.5" /> אישור
                    </button>
                  )}
                  {e.status !== "rejected" && (
                    <button onClick={() => update(e.id, { status: "rejected" })}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                      <XCircle className="h-3.5 w-3.5" /> דחייה
                    </button>
                  )}
                  <button onClick={() => remove(e.id)} aria-label="מחק"
                    className="text-gray-300 hover:text-red-500 transition-colors p-2">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}