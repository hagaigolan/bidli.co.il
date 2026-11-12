import { Clock } from "lucide-react";
import useNow from "@/lib/useNow";

const pad = (n) => String(n).padStart(2, "0");

function split(endsAt, now) {
  const diff = new Date(endsAt).getTime() - now;
  if (!Number.isFinite(diff)) return { h: 0, m: 0, s: 0, over: true };
  const safe = Math.max(0, diff);
  return {
    h: Math.floor(safe / 3600000),
    m: Math.floor((safe % 3600000) / 60000),
    s: Math.floor((safe % 60000) / 1000),
    over: diff <= 0,
  };
}

// טיימר רץ למכרז ההפוך — גרסה קטנה לכרטיס וגרסה גדולה לדף הנחיתה
export default function DealCountdown({ endsAt, now: nowProp, size = "sm", className = "" }) {
  const tick = useNow();
  const now = nowProp ?? tick;
  const { h, m, s, over } = split(endsAt, now);

  if (over) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold text-gray-400 ${className}`}>
        <Clock className="h-3.5 w-3.5" aria-hidden="true" /> החלון נסגר
      </span>
    );
  }

  if (size === "lg") {
    const cells = [
      { value: pad(h), label: "שעות" },
      { value: pad(m), label: "דקות" },
      { value: pad(s), label: "שניות" },
    ];
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`} dir="ltr" aria-label="זמן שנותר למכרז">
        {cells.map(c => (
          <div key={c.label} className="rounded-xl px-3 py-2 text-center min-w-[64px]"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <p className="text-2xl sm:text-3xl font-black tabular-nums leading-none text-white">{c.value}</p>
            <p className="text-[10px] text-white/60 font-semibold mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-black tabular-nums ${className}`}>
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`}
    </span>
  );
}