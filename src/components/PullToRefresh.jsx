import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

// מחוות משיכה לרענון (pull-to-refresh) — מרעננת נתונים מהשרת כשהעמוד בראשו
const THRESHOLD = 70;
const MAX_PULL = 110;

export default function PullToRefresh({ onRefresh, children }) {
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pullRef = useRef(0);
  const busyRef = useRef(false);
  const refreshRef = useRef(onRefresh);

  refreshRef.current = onRefresh;

  const setDist = (d) => {
    pullRef.current = d;
    setPull(d);
  };

  useEffect(() => {
    const onStart = (e) => {
      if (busyRef.current || window.scrollY > 0) { startY.current = null; return; }
      startY.current = e.touches[0].clientY;
      setDragging(true);
    };

    const onMove = (e) => {
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current) setDist(0);
        return;
      }
      if (e.cancelable) e.preventDefault();
      setDist(Math.min(MAX_PULL, dy * 0.55));
    };

    const onEnd = async () => {
      startY.current = null;
      setDragging(false);
      if (busyRef.current || pullRef.current < THRESHOLD) { setDist(0); return; }
      busyRef.current = true;
      setRefreshing(true);
      setDist(THRESHOLD);
      try {
        await refreshRef.current?.();
      } finally {
        busyRef.current = false;
        setRefreshing(false);
        setDist(0);
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const visible = pull > 0 || refreshing;

  return (
    <>
      <div
        aria-live="polite"
        className="fixed left-1/2 -translate-x-1/2 z-[45] pointer-events-none transition-opacity duration-200"
        style={{ top: "calc(var(--safe-top) + 10px)", opacity: visible ? 1 : 0 }}
      >
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-gray-200 shadow-lg">
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            style={{
              color: "#e5893d",
              transform: refreshing ? undefined : `rotate(${Math.min(180, (pull / THRESHOLD) * 180)}deg)`,
            }}
            aria-hidden="true"
          />
          <span className="text-xs font-bold text-gray-600">
            {refreshing ? "מרענן..." : pull >= THRESHOLD ? "שחרר לרענון" : "משוך לרענון"}
          </span>
        </div>
      </div>

      {/* ה-transform מוחל רק בזמן משיכה — כדי לא לשבור אלמנטים fixed בעמוד */}
      <div
        style={pull > 0
          ? { transform: `translateY(${pull}px)`, transition: dragging ? "none" : "transform 0.25s ease" }
          : undefined}
      >
        {children}
      </div>
    </>
  );
}