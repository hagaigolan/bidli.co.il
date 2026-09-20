import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// Answers a buyer's question about a specific product listing from the live chat.
// The LLM call runs server-side (service role) so integration credits can't be
// spent freely from the browser — callers can only ask about an existing product.
// Narrow, app-specific operation: product_id + short question in, one answer out.
// Public app — guests allowed, so the endpoint is guarded by input validation
// and a per-IP rate limit instead of login.

const RATE_LIMIT = 10;
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

function buildPrompt(product: any, question: string): string {
  const details = [
    `כותרת: ${product.title}`,
    product.category && `קטגוריה: ${product.category}`,
    product.condition && `מצב מוצהר: ${product.condition}`,
    product.description && `תיאור: ${product.description}`,
    product.location && `מיקום: ${product.location}`,
    `מחיר התחלתי: ₪${(product.starting_price || 0).toLocaleString()}`,
    `מחיר נוכחי: ₪${(product.current_price || product.starting_price || 0).toLocaleString()}`,
    product.bid_count ? `מספר הצעות: ${product.bid_count}` : null,
    product.ends_at && `מועד סיום: ${new Date(product.ends_at).toLocaleString("he-IL")}`,
    product.seller_name && `מוכר: ${product.seller_name}`,
  ].filter(Boolean).join("\n");

  return `אתה עוזר השירות של פלטפורמת המכירות bidli. ענה בעברית, בקצרה ובידידות, על שאלת הקונה.
ענה אך ורק על סמך נתוני המכרז הבאים. אם מידע מבוקש לא קיים בנתונים — ציין זאת בכנות והצע לפנות לצוות המכירה בוואטסאפ.
אל תמציא פרטים, מידות או הערכות שלא נמסרו, ואין לתת הערכת שווי מחייבת.

נתוני המכרז:
${details}

שאלת הקונה: ${question}`;
}

export default async function(req: Request): Promise<Response> {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || 'unknown';
    const base44 = createClientFromRequest(req);
    // שכבת זיכרון מקומית (מסנן מהיר) + מונה מבוסס מסד נתונים — המגבלה תקפה בכל האיסולטים
    if (isRateLimited(ip) || await isRateLimitedPersisted(base44, `answerProductQuestion:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }
    const { product_id, question } = await req.json();
    const q = (question || "").toString().trim().slice(0, 500);
    if (!product_id || !q) {
      return Response.json({ error: 'missing product_id or question' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.get(product_id).catch(() => null);
    if (!product || product.status === 'cancelled') {
      return Response.json({ error: 'product not found' }, { status: 404 });
    }

    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: buildPrompt(product, q),
    });
    const answer = typeof res === 'string' ? res : res?.response ?? res?.message ?? res?.data ?? '';

    return Response.json({ answer: answer || '' });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}