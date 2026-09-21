// אפקטי סאונד לאולם המכרזים החי — Web Audio API, בלי קבצים חיצוניים
// מתג השתקה נשמר ב-localStorage ומכובד בכל הפונקציות

const STORAGE_KEY = "auction_sound_enabled";

export function isSoundEnabled() {
  return localStorage.getItem(STORAGE_KEY) !== "off";
}

export function setSoundEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
}

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!getCtx._ctx || getCtx._ctx.state === "closed") getCtx._ctx = new AC();
  if (getCtx._ctx.state === "suspended") getCtx._ctx.resume().catch(() => {});
  return getCtx._ctx;
}

// צליל בסיסי — תדירות, משך, סוג גל, עוצמה והשהיה
function tone(freq, dur, { type = "sine", gain = 0.12, delay = 0 } = {}) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  const t0 = ctx.currentTime + delay;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  vol.gain.setValueAtTime(gain, t0);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(vol).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// טינג להצעה חדשה — שני צלילים עולים וקצרים
export function playBidPing() {
  tone(880, 0.12, { type: "triangle", gain: 0.1 });
  tone(1320, 0.18, { type: "triangle", gain: 0.08, delay: 0.09 });
}

// טיק-טוק של הדקה האחרונה — תנות עדינות מתחלפות
export function playTickTock() {
  tone(1000, 0.05, { type: "square", gain: 0.05 });
}

// פטיש מכירה — שתי מכות נמוכות וחזקות
export function playHammer() {
  tone(180, 0.22, { type: "square", gain: 0.16 });
  tone(140, 0.3, { type: "square", gain: 0.14, delay: 0.18 });
  tone(90, 0.35, { type: "sine", gain: 0.12, delay: 0.2 });
}