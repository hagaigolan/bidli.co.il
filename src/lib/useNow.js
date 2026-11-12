import { useEffect, useState } from "react";

// שעון משותף לרכיבי מכרז — מתעדכן כל שנייה כדי שהמחיר היורד והטיימר יזוזו ביחד
export default function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}