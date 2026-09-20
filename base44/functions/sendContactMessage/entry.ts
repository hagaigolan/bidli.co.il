import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

const CONTACT_EMAIL = 'mitugplus@gmail.com';

// הגבלת קצב פניות לכל IP — הטופס פומבי וללא התחברות
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateMap = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter((t: number) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    rateMap.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateMap.set(ip, arr);
  return false;
}

// שליחת פנייה מעמוד "צור קשר" — הנמען קבוע בשרת (תמיכת bidli),
// כך שלא ניתן לנצל את הפונקציה לשליחת מיילים לכתובות שרירותיות.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || 'unknown';
    // שכבת זיכרון מקומית (מסנן מהיר) + מונה מבוסס מסד נתונים — המגבלה תקפה בכל האיסולטים
    if (isRateLimited(ip) || await isRateLimitedPersisted(base44, `sendContactMessage:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }

    const { name, email, topic, message } = await req.json().catch(() => ({}));
    const n = (name || '').toString().trim().slice(0, 120);
    const e = (email || '').toString().trim().slice(0, 200);
    const t = (topic || '').toString().trim().slice(0, 100);
    const m = (message || '').toString().trim().slice(0, 4000);
    if (!n || !m || !/.+@.+\..+/.test(e)) {
      return Response.json({ error: 'missing or invalid fields' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: CONTACT_EMAIL,
      subject: `פנייה חדשה מהאתר: ${t || 'שאלה כללית'}`,
      body: `פנייה חדשה מעמוד "צור קשר"\n\nנושא: ${t || '—'}\nשם: ${n}\nאימייל: ${e}\n\nההודעה:\n${m}`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendContactMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}