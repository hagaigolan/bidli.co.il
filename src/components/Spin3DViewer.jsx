import { useState, useEffect, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw, MoveHorizontal } from "lucide-react";

// צופה תלת-מימד — סחרור רציף של זוויות המוצר שנוצרו עם AI.
// גרירה אופקית מסובבת את הפריט, וניתן להפעיל/לעצור סחרור אוטומטי.
export default function Spin3DViewer({ frames = [], title = "", onClose }) {
  const imgs = frames.filter(Boolean);
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const drag = useRef(null);

  // סחרור אוטומטי
  useEffect(() => {
    if (!playing || imgs.length < 2) return;
    const t = setInterval(() => setPos(p => (p + 0.08) % imgs.length), 50);
    return () => clearInterval(t);
  }, [playing, imgs.length]);

  const onKey = useCallback(e => { if (e.key === "Escape") onClose(); }, [onClose]);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  const L = Math.max(imgs.length, 1);
  const index = Math.floor(pos) % L;

  const onDown = (e) => {
    drag.current = { x: e.clientX, pos };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPlaying(false);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    setPos(((drag.current.pos - dx * (L / 600)) % L + L) % L);
  };
  const onUp = () => { drag.current = null; };

  return (
    <div dir="rtl" className="fixed inset-0 z-[80] bg-black/92 flex items-center justify-center"
      role="dialog" aria-modal="true" aria-label={`תצוגת 3D — ${title}`}>
      <button onClick={onClose} aria-label="סגירה"
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all z-10">
        <X className="h-5 w-5" />
      </button>

      {title && (
        <p className="absolute top-5 right-5 text-white/70 text-sm font-bold max-w-[60vw] truncate">{title}</p>
      )}

      {/* התמונה המסתובבת */}
      <div className="flex flex-col items-center gap-4 select-none">
        <img
          src={imgs[index]}
          alt={title}
          draggable={false}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          className="max-w-[90vw] max-h-[70vh] object-contain rounded-2xl cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
        />
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-black/60">
          {imgs.length > 1 && (
            <button onClick={() => setPlaying(p => !p)} aria-label={playing ? "עצירת סחרור" : "הפעלת סחרור"}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
          <button onClick={() => { setPos(0); setPlaying(true); }} aria-label="איפוס זווית"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all">
            <RotateCcw className="h-4 w-4" />
          </button>
          <span className="text-white/60 text-xs font-bold flex items-center gap-1.5 px-1">
            <MoveHorizontal className="h-3.5 w-3.5" /> גרור לסחרור
          </span>
        </div>
      </div>
    </div>
  );
}