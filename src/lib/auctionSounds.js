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

// רעש לבן קצר — בסיס להתפוצצויות זיקוקים
function noiseBurst(dur, { gain = 0.08, delay = 0, filterFreq = 3000 } = {}) {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime + delay;
  const len = Math.ceil(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = filterFreq;
  const vol = ctx.createGain();
  vol.gain.setValueAtTime(gain, t0);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(vol).connect(ctx.destination);
  src.start(t0);
}

// זיקוקים — שריקה עולה ואחריה סדרת התפוצצויות קשקוש, במשך 3 שניות
export function playFireworks() {
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;
  // שריקת השיגור — תדירות מטפסת
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.6);
  vol.gain.setValueAtTime(0.06, ctx.currentTime);
  vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
  osc.connect(vol).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.75);
  // פיצוץ ראשי + קשקוש נגרר לאורך 3 שניות
  noiseBurst(0.5, { gain: 0.1, delay: 0.65, filterFreq: 2000 });
  noiseBurst(0.35, { gain: 0.07, delay: 1.2, filterFreq: 3500 });
  noiseBurst(0.3, { gain: 0.06, delay: 1.7, filterFreq: 4000 });
  noiseBurst(0.25, { gain: 0.05, delay: 2.2, filterFreq: 4500 });
  noiseBurst(0.2, { gain: 0.04, delay: 2.6, filterFreq: 5000 });
}