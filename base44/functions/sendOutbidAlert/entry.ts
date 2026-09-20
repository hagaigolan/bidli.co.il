import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// התראת "הוצאת מהמשחק" למציע שעקפו אותו — הנמען נגזר בשרת מ-
// second_bidder_email של המכרז (המוביל הקודם) בלבד, עם הגבלת קצב לכל IP,
// כדי שלא ניתן להשתמש בפונקציה כערוץ ספאם/הטרדה אנונימי.

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

export default async function (req: Request): Promise<Response> {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || 'unknown';
    const base44 = createClientFromRequest(req);
    // שכבת זיכרון מקומית (מסנן מהיר) + מונה מבוסס מסד נתונים — המגבלה תקפה בכל האיסולטים
    if (isRateLimited(ip) || await isRateLimitedPersisted(base44, `sendOutbidAlert:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }

    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    // הנמען נגזר מהרשומה בלבד — לא מקבלים כתובת מהקריאה
    const recipient = (product.second_bidder_email || '').trim().toLowerCase();
    if (!recipient) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      subject: `הוצאת מהמשחק! עקפו אותך על "${product.title}"`,
      body: `שלום ${product.second_bidder_name || ''},\n\n${product.highest_bidder || 'מציע אחר'} הגיש הצעה גבוהה יותר (₪${(product.current_price || 0).toLocaleString()}) על הפריט "${product.title}".\n\nלחץ כאן כדי לחזור ולהגיש הצעה גבוהה יותר:\nhttps://bidli.co.il/auction/${product.id}\n\nבהצלחה!\nצוות bidli`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendOutbidAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}