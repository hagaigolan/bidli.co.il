import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, setSoundEnabled, playBidPing } from "@/lib/auctionSounds";

// מתג השתקת אפקטי סאונד באולם המכרזים — ההעדפה נשמרת למשתמש
export default function SoundToggle() {
  const [enabled, setEnabled] = useState(isSoundEnabled());

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
    if (next) playBidPing(); // צליל אישור קצר
  };

  return (
    <button type="button" onClick={toggle} aria-label={enabled ? "השתקת צלילים" : "הפעלת צלילים"}
      title={enabled ? "השתק צלילים" : "הפעל צלילים"}
      className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold transition-all"
      style={enabled
        ? { background: "#e5893d15", color: "#e5893d" }
        : { background: "#f3f4f6", color: "#9ca3af" }}>
      {enabled ? <Volume2 className="h-3 w-3" aria-hidden="true" /> : <VolumeX className="h-3 w-3" aria-hidden="true" />}
      {enabled ? "צלילים פועלים" : "מושתק"}
    </button>
  );
}