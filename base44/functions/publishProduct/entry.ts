import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { waitUntil } from 'base44:runtime';
import { interestAlertEmail } from '../../shared/notifyEmails.ts';
import { sanitizeText, containsProfanity } from '../../shared/contentSafety.ts';

// Publishes a new auction listing. The seller's identity (name, email, user id,
// photo) is derived server-side from the authenticated account — client-supplied
// identity fields are ignored, so a poster cannot impersonate someone else or
// redirect platform emails to a victim's address. Only listing content and the
// seller's own payment-detail fields are accepted from the client.

const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];
const PAYMENT_METHODS = ["kashcash", "bit", "bank"];

// כל קלט הטקסט עובר ניקוי XSS (הסרת תגיות, תכונות אירוע ותווי בקרה)
const str = (v: any, max = 5000) => sanitizeText(v, max);

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || !me.email) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // חסימת משתמש מושהה מפרסום מכרזים — נבדקת בשרת מול רשומת המשתמש
    const users = await base44.asServiceRole.entities.User.filter({ email: me.email }).catch(() => []);
    if (users.length && users[0].is_banned) {
      return Response.json({ error: 'banned' }, { status: 403 });
    }

    // ── תוכן המכרז (קלט לקוחי מוגבל לרשימת שדות) ──
    const title = str(body.title, 200);
    const startingPrice = Number(body.starting_price);
    const buyNowPrice = body.buy_now_price != null && body.buy_now_price !== "" ? Number(body.buy_now_price) : null;
    const paymentMethods = Array.isArray(body.seller_payment_methods)
      ? body.seller_payment_methods.filter((m: any) => PAYMENT_METHODS.includes(m)).slice(0, 3)
      : [];
    const paymentMethod = PAYMENT_METHODS.includes(body.seller_payment_method)
      ? body.seller_payment_method
      : paymentMethods[0] || '';
    const paymePhone = str(body.seller_payme_phone, 40);
    const bankDetails = str(body.seller_bank_details, 500);
    const imageUrls = Array.isArray(body.image_urls)
      ? body.image_urls.filter((u: any) => typeof u === 'string' && u.startsWith('http')).slice(0, 8)
      : [];

    if (!title || !Number.isFinite(startingPrice) || startingPrice <= 0) {
      return Response.json({ error: 'missing title or starting_price' }, { status: 400 });
    }
    if (buyNowPrice !== null && (!Number.isFinite(buyNowPrice) || buyNowPrice <= startingPrice)) {
      return Response.json({ error: 'buy_now_price must be above starting_price' }, { status: 400 });
    }
    if (!paymentMethod) {
      return Response.json({ error: 'invalid payment method' }, { status: 400 });
    }
    const methodsToStore = paymentMethods.length ? paymentMethods : [paymentMethod];
    if (methodsToStore.includes('bank') && !bankDetails) {
      return Response.json({ error: 'bank details required' }, { status: 400 });
    }
    const subcategory = str(body.subcategory, 100);
    const condition = str(body.condition, 20);
    if (condition && !CONDITIONS.includes(condition)) {
      return Response.json({ error: 'invalid condition' }, { status: 400 });
    }
    const description = str(body.description);
    const location = str(body.location, 120);

    // סינון מילים פוגעניות — חסימת פרסום תוכן לא הולם
    if (containsProfanity(`${title} ${description} ${location}`)) {
      return Response.json({ error: 'profanity' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.create({
      title,
      description,
      category: str(body.category, 100),
      subcategory,
      condition: condition || undefined,
      is_stock: !!body.is_stock,
      starting_price: startingPrice,
      buy_now_price: buyNowPrice,
      current_price: startingPrice,
      image_url: imageUrls[0] || '',
      image_urls: imageUrls,
      // ── זהות המוכר — נגזרת בשרת מהחשבון המחובר בלבד ──
      seller_name: me.full_name || '',
      seller_email: me.email,
      seller_user_id: me.id,
      seller_photo_url: me.photo_url || '',
      // פרטי קבלת התשלום — קלט לקוחי לגיטימי
      seller_phone: str(body.seller_phone, 40),
      seller_payment_method: paymentMethod,
      seller_payment_methods: methodsToStore,
      seller_payme_phone: paymePhone,
      seller_bank_details: bankDetails,
      location,
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      bid_count: 0,
    });

    // ── התראות אינטרסים: מייל מעוצב + התראת פעמון לאספנים שעוקבים אחרי הקטגוריה או המוצר ──
    waitUntil((async () => {
      try {
        const cat = product.category || '';
        const titleLc = (product.title || '').toLowerCase();
        const alerts = await base44.asServiceRole.entities.InterestAlert.filter({ active: true }, '-created_date', 500);
        const matched = (alerts || []).filter(a =>
          a.owner_email && a.owner_email !== me.email &&
          ((Array.isArray(a.categories) && a.categories.includes(cat)) ||
          (Array.isArray(a.keywords) && a.keywords.some(k => k && titleLc.includes(String(k).toLowerCase()))))
        ).slice(0, 50);
        for (const a of matched) {
          const label = (Array.isArray(a.categories) && a.categories.includes(cat))
            ? cat
            : (a.keywords.find(k => titleLc.includes(String(k).toLowerCase())) || 'תחומי העניין שלך');
          const mail = interestAlertEmail(product, a.owner_name, label);
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({ to: a.owner_email, subject: mail.subject, html: mail.html, text: mail.text });
          } catch (e) {
            console.error('interest alert email failed:', e?.message || e);
          }
          await base44.asServiceRole.entities.AppNotification.create({
            recipient_email: (a.owner_email || '').trim().toLowerCase(),
            recipient_name: a.owner_name || '',
            type: 'new_match',
            title: 'מכרז חדש בתחום שעקבת אחריו',
            body: `${product.title} — פתיחה ב-₪${(product.starting_price || 0).toLocaleString('he-IL')}`,
            product_id: product.id,
            product_title: product.title,
            product_image_url: product.image_url || '',
            link: `/auction/${product.id}`,
          }).catch(() => {});
        }
      } catch (e) {
        console.error('interest alerts failed:', e);
      }
    })());

    return Response.json({ ok: true, product_id: product.id, seller_email: me.email });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}