import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

// פיד הצעות חי ומונפש — כל הצעה חדשה נכנסת באנימציית החלקה ומהבהבת
export default function LiveBidFeed({ bids, flashNew }) {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2"
        style={{ background: "linear-gradient(to right, #e5893d08, transparent)" }}>
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-bold text-gray-700">הצעות אחרונות — חי</span>
        <span className="text-xs text-gray-300 mr-auto" dir="ltr">LIVE</span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {bids.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">עדיין לא הוגשו הצעות — היה הראשון!</p>
        ) : (
          <AnimatePresence initial={false}>
            {bids.slice(0, 8).map((bid, i) => (
              <motion.div key={bid.id || i}
                initial={{ opacity: 0, x: -24, backgroundColor: "#e5893d33" }}
                animate={{ opacity: 1, x: 0, backgroundColor: i === 0 && flashNew ? "#dcfce7" : "rgba(0,0,0,0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="flex items-center justify-between px-4 py-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: i === 0 ? "linear-gradient(135deg, #e5893d, #3e6b8a)" : "#e5e7eb", color: i === 0 ? "white" : "#6b7280" }}>
                    {i === 0 ? "👑" : i + 1}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{bid.bidder_name || "אנונימי"}</span>
                  {i === 0 && (
                    <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                      className="flex items-center gap-0.5 text-xs font-bold" style={{ color: "#e5893d" }}>
                      <Zap className="h-3 w-3" aria-hidden="true" />
                    </motion.span>
                  )}
                </div>
                <span className="text-xs font-black" style={{ color: i === 0 ? "#e5893d" : "#374151" }}>
                  ₪{(bid.amount || 0).toLocaleString()}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}