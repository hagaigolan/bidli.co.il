import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";

// חיפוש קולי — Web Speech API בעברית. אם הדפדפן לא תומך, הכפתור לא מוצג כלל.
export default function VoiceSearchButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const supportsSpeech =
    typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      try {
        recRef.current?.abort?.();
      } catch {}
    };
  }, []);

  if (!supportsSpeech) return null;

  const stop = () => {
    try {
      recRef.current?.stop?.();
    } catch {}
    setListening(false);
  };

  const start = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "he-IL";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript || "";
      if (text.trim()) onResult(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? "עצור חיפוש קולי" : "חיפוש קולי"}
      title={listening ? "עצור חיפוש קולי" : "חיפוש קולי"}
      aria-pressed={listening}
      className="absolute left-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
      style={listening
        ? { background: "#ff220018", color: "#ff2200" }
        : { background: "transparent", color: "#9ca3af" }}
    >
      <Mic className={`h-4 w-4 ${listening ? "animate-pulse" : ""}`} aria-hidden="true" />
    </button>
  );
}