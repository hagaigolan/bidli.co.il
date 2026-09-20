import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// אישור המוכר שהתשלום התקבל בפועל — הזהות נגזרת מהמשתמש המחובר בשרת,
// והמייל לקונה נשלח מהשרת (בעבר נשלח מהדפדפן).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id) return Response.json({ error: 'missing product_id' }, { status: 400 });

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    // רק המוכר של המכרז רשאי לאשר קבלת תשלום
    const userEmail = (user.email || '').trim().toLowerCase();
    const isSeller =
      (product.seller_email || '').trim().toLowerCase() === userEmail ||
      (product.seller_user_id && product.seller_user_id === user.id);
    if (!isSeller) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    await base44.asServiceRole.entities.Product.update(product.id, {
      status: 'paid',
      payment_status: 'released',
      seller_confirmed_at: new Date().toISOString(),
    });

    try {
      if (product.highest_bidder_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: product.highest_bidder_email,
          subject: `✅ התשלום אושר — ${product.title}`,
          body: `שלום ${product.highest_bidder || ''},\n\nהמוכר אישר שההעברה עבור "${product.title}" התקבלה, וההזמנה סומנה כשולמה.\nמעכשיו תתואם המסירה ישירות מול המוכר.\n\nצוות bidli`,
        });
      }
    } catch (e) {
      console.error('confirmSalePayment buyer email failed:', e);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('confirmSalePayment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}