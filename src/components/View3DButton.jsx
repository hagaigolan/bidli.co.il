import { useState } from "react";
import { Box, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Spin3DViewer from "./Spin3DViewer";

// כפתור "הצג ב-3D באמצעות AI" — מוצג כשכבה על תמונת המוצר בעמוד המכרז.
// אם הזוויות כבר נוצרו (מטמון) — נפתח מיד; אחרת מייצר אותן עם AI ואז נפתח.
export default function View3DButton({ product, isAuthenticated, onRequireLogin, onGenerated, className = "" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [frames, setFrames] = useState(null);

  const cached = (product?.spin3d_urls || []).filter(Boolean);

  const handleClick = async () => {
    if (loading) return;
    setError("");
    if (cached.length >= 2) {
      setFrames([product.image_url, ...cached].filter(Boolean));
      setOpen(true);
      return;
    }
    // יצירת זוויות חדשות דורשת התחברות (עלות קרדיטים לכל יצירה)
    if (!isAuthenticated) {
      onRequireLogin?.();
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("generate3dSpin", { product_id: product.id });
      const data = res?.data && Array.isArray(res.data.images) ? res.data : res;
      const images = data?.images || [];
      if (images.length >= 2) {
        setFrames(images);
        setOpen(true);
        if (data?.cached === false) onGenerated?.(images.slice(1));
      } else {
        setError("הייצור נכשל, נסו שנית");
      }
    } catch (e) {
      const msg = e?.response?.data?.error;
      setError(msg === "rate_limited"
        ? "בוצעו הרבה יצירות בשעה האחרונה — נסו שוב מאוחר יותר"
        : "שגיאה ביצירת התצוגה, נסו שנית");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="הצג ב-3D באמצעות AI"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 disabled:opacity-70 ${className}`}
        style={{
          background: "linear-gradient(135deg, #3e6b8a, #6aa3cd)",
          color: "white",
          boxShadow: "0 0 12px #3e6b8a66",
        }}
      >
        {loading
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> מייצר תצוגת 3D…</>
          : <><Box className="h-3.5 w-3.5" /> הצג ב-3D באמצעות AI</>}
      </button>
      {error && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold whitespace-nowrap">
          {error}
        </div>
      )}
      {open && frames && (
        <Spin3DViewer frames={frames} title={product?.title || ""} onClose={() => setOpen(false)} />
      )}
    </>
  );
}