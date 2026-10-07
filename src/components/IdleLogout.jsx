import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

// התנתקות אוטומטית לאחר 30 דקות של חוסר פעילות (אין לחיצות, הקלדה,
// גלילה או תזוזת עכבר) — מצמצם את הסיכון לחשיפת חשבון שנשאר פתוח
// במחשב משותף או גנוב. נטען פעם אחת בכל עמוד דרך ה-Layout.

const IDLE_MS = 30 * 60 * 1000;

export default function IdleLogout() {
  const timer = useRef(null);

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        try {
          if (await base44.auth.isAuthenticated()) await base44.auth.logout();
        } catch {}
      }, IDLE_MS);
    };
    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}