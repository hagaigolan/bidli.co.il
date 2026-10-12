import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { sendGmail } from '../../shared/gmailSender.ts';
import { sellerFavoriteEmail } from '../../shared/notifyEmails.ts';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// מייל "נשמר במועדפים" למוכר — הנמען נגזר בשרת מ-seller_email של המוצר בלבד
// (לא ניתן להשתמש בפונקציה כערוץ ספאם לכתובת שרירותית), עם הגבלת קצב לכל IP.
// כותב ההצעה המאוחרת: אם השומר זהה למוכר — לא נשלח דבר.

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export default async function (req: Request): Promise<Response> {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || 'unknown';
    const base44 = createClientFromRequest(req);

    if (await isRateLimitedPersisted(base44, `notifySellerFavorite:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }

    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const product = await base44.asServiceRole.entities.Product.get(product_id);
    if (!product) return Response.json({ error: 'not found' }, { status: 404 });

    // הנמען נגזר מהרשומה בלבד — לא מקבלים כתובת מהקריאה
    const recipient = (product.seller_email || '').trim().toLowerCase();
    if (!recipient) return Response.json({ ok: true, skipped: 'no seller email' });

    // המוכר ששמר את הפריט שלו עצמו — אין משמעות להתראה
    const saverEmail = (user.email || '').trim().toLowerCase();
    if (saverEmail === recipient) {
      return Response.json({ ok: true, skipped: 'self' });
    }

    const email = sellerFavoriteEmail(product, user.full_name || '');
    await sendGmail(
      (await base44.asServiceRole.connectors.getConnection('gmail')).accessToken,
      { to: recipient, subject: email.subject, html: email.html, text: email.text },
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error('notifySellerFavorite error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}