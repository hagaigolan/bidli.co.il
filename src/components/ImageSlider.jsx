import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const MAX_ZOOM = 6;

export default function ImageSlider({ images = [], alt = "", children }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  const touch = useRef(null);
  const pinch = useRef(null);

  const imgs = [...new Set(images.filter(Boolean))];
  const total = imgs.length;

  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const go = useCallback((dir) => {
    setIndex(i => (i + dir + total) % total);
    resetZoom();
  }, [total]);

  useEffect(() => { setIndex(0); resetZoom(); }, [total]);

  const openLightboxAt = (i) => { setIndex(i); resetZoom(); setLightbox(true); };
  const closeLightbox = () => { setLightbox(false); resetZoom(); };

  const setZoomAt = (z) => {
    const next = Math.min(MAX_ZOOM, Math.max(1, z));
    if (next === 1) setPan({ x: 0, y: 0 });
    setZoom(next);
  };

  const toggleZoomDouble = () => {
    if (zoom > 1) { resetZoom(); } else { setZoom(2.5); setPan({ x: 0, y: 0 }); }
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") go(-1);
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "+" || e.key === "=") setZoomAt(zoom + 0.5);
      if (e.key === "-") setZoomAt(zoom - 0.5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go, zoom]);

  // Swipe navigation (main slider, mobile)
  const onSwipeStart = (e) => { touch.current = e.touches[0]?.clientX; };
  const onSwipeEnd = (e) => {
    if (touch.current == null || total < 2) return;
    const dx = (e.changedTouches[0]?.clientX || 0) - touch.current;
    if (dx < -40) go(1);
    if (dx > 40) go(-1);
    touch.current = null;
  };

  // Mouse pan when zoomed (lightbox)
  const onPointerDown = (e) => {
    if (e.pointerType === "touch" || zoom <= 1) return;
    drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    e.target.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (drag.current) setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => { drag.current = null; };

  // Touch pan + pinch zoom (lightbox)
  const onLightboxTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinch.current = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom };
      drag.current = null;
    } else if (e.touches.length === 1 && zoom > 1) {
      const t = e.touches[0];
      drag.current = { x: t.clientX - pan.x, y: t.clientY - pan.y, touch: true };
    }
  };
  const onLightboxTouchMove = (e) => {
    if (pinch.current && e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      setZoomAt(pinch.current.zoom * (dist / pinch.current.dist));
    } else if (drag.current?.touch && e.touches.length === 1) {
      const t = e.touches[0];
      setPan({ x: t.clientX - drag.current.x, y: t.clientY - drag.current.y });
    }
  };
  const onLightboxTouchEnd = () => {
    if (pinch.current) pinch.current = null;
    if (drag.current?.touch) drag.current = null;
  };

  if (!total) {
    return (
      <div className="rounded-2xl overflow-hidden bg-gray-50 aspect-square flex items-center justify-center text-6xl">
        🏺
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div
        className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square"
        onTouchStart={onSwipeStart}
        onTouchEnd={onSwipeEnd}
      >
        <img
          src={imgs[index]}
          alt={alt}
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => openLightboxAt(index)}
          draggable={false}
        />

        {/* Overlay content (status badges etc.) */}
        {children}

        {/* Arrows */}
        {total > 1 && (
          <>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 z-10">
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }}
              className="absolute top-1/2 -translate-y-1/2 left-2 w-9 h-9 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 z-10">
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <button type="button" onClick={() => openLightboxAt(index)}
          className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/85 hover:bg-white shadow-md transition-all z-10">
          <Maximize2 className="h-3.5 w-3.5 text-gray-700" />
          <span className="text-xs font-bold text-gray-700">הגדל</span>
        </button>

        {/* Counter */}
        {total > 1 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs font-bold z-10">
            {index + 1} / {total}
          </div>
        )}
      </div>

      {/* Thumbnails — click opens the image in the lightbox */}
      {total > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {imgs.map((src, i) => (
            <button key={i} type="button" onClick={() => openLightboxAt(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === index ? "border-[#f700ff] shadow-md" : "border-gray-200 hover:border-gray-300 opacity-75 hover:opacity-100"}`}>
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox with zoom */}
      {lightbox && (
        <div className="fixed inset-0 z-[70] bg-black/92 flex items-center justify-center" onClick={closeLightbox}>
          {/* Close */}
          <button onClick={closeLightbox}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10">
            <X className="h-5 w-5" />
          </button>

          {/* Zoom controls */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 z-10"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomAt(zoom - 0.5)} disabled={zoom <= 1}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-white text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoomAt(zoom + 0.5)} disabled={zoom >= MAX_ZOOM}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30">
              <ZoomIn className="h-4 w-4" />
            </button>
            {zoom > 1 && (
              <button onClick={resetZoom}
                className="px-3 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all">
                איפוס
              </button>
            )}
          </div>

          {/* Hint */}
          <p className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/50 text-xs z-10 pointer-events-none">
            לחיצה כפולה או צביטה להגדלה · גרור להזזה
          </p>

          {/* Counter */}
          {total > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold z-10">
              {index + 1} / {total}
            </div>
          )}

          {/* Arrows */}
          {total > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); go(-1); }}
                className="absolute top-1/2 -translate-y-1/2 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all z-10">
                <ChevronRight className="h-6 w-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); go(1); }}
                className="absolute top-1/2 -translate-y-1/2 left-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all z-10">
                <ChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={imgs[index]}
            alt={alt}
            className="max-w-[92vw] max-h-[82vh] object-contain select-none transition-transform duration-150"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, cursor: zoom > 1 ? "grab" : "zoom-in" }}
            onClick={e => e.stopPropagation()}
            onDoubleClick={toggleZoomDouble}
            onWheel={e => { e.stopPropagation(); setZoomAt(zoom + (e.deltaY < 0 ? 0.5 : -0.5)); }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onTouchStart={onLightboxTouchStart}
            onTouchMove={onLightboxTouchMove}
            onTouchEnd={onLightboxTouchEnd}
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}