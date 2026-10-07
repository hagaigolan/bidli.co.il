import { useRef } from "react";

// הגנת אנטי-בוט בלתי נראית לטפסים (תחליף קל ל-reCAPTCHA ללא תלות חיצונית):
// שדה דבש (Honeypot) — שדה קלט נסתר שבני אדם לא רואים ולא ממלאים, ואילו בוטים
// אוטומטיים ממלאים כל שדה שהם מוצאים; והגבלת זמן — שליחה תוך פחות ממספר
// שניות מטעינת הטופס מעידה על שליחה אוטומטית ולא אנושית.

export function useAntiBot(minSeconds = 4) {
  const mountedAt = useRef(Date.now());
  const isBot = (honeypotValue) => {
    if (honeypotValue) return true; // שדה הדבש הוזן — סימן ברור לבוט
    return Date.now() - mountedAt.current < minSeconds * 1000;
  };
  return { isBot };
}

export default function HoneypotField({ value, onChange }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", top: 0, height: 0, overflow: "hidden" }}>
      <label htmlFor="website-hp">אין למלא שדה זה</label>
      <input id="website-hp" name="website" type="text" tabIndex={-1} autoComplete="off"
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}