import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Publishes a new auction listing. The seller's identity (name, email, user id,
// photo) is derived server-side from the authenticated account — client-supplied
// identity fields are ignored, so a poster cannot impersonate someone else or
// redirect platform emails to a victim's address. Only listing content and the
// seller's own payment-detail fields are accepted from the client.

const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];
const PAYMENT_METHODS = ["kashcash", "bit", "bank"];

const str = (v: any, max = 5000) => (v == null ? "" : String(v).trim().slice(0, max));

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
    const paymentMethod = str(body.seller_payment_method, 20);
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
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return Response.json({ error: 'invalid payment method' }, { status: 400 });
    }
    if (paymentMethod === 'bank' && !bankDetails) {
      return Response.json({ error: 'bank details required' }, { status: 400 });
    }
    const subcategory = str(body.subcategory, 100);
    const condition = str(body.condition, 20);
    if (condition && !CONDITIONS.includes(condition)) {
      return Response.json({ error: 'invalid condition' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.create({
      title,
      description: str(body.description),
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
      seller_payme_phone: paymePhone,
      seller_bank_details: bankDetails,
      location: str(body.location, 120),
      ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      bid_count: 0,
    });

    return Response.json({ ok: true, product_id: product.id, seller_email: me.email });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}