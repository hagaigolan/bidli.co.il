import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// דיווח הקונה על ביצוע ההעברה למוכר — הזהות נגזרת מהמשתמש המחובר בשרת,
// והמייל למוכר נשלח מהשרת (בעבר נשלח מהדפדפן).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const { product_id, reference } = await req.json().catch(() => ({}));
    if (!product_id) return Response.json({ error: 'missing product_id' }, { status: 400 });

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    // רק הזוכה במכרז רשאי לדווח על העברה
    const userEmail = (user.email || '').trim().toLowerCase();
    if ((product.highest_bidder_email || '').trim().toLowerCase() !== userEmail) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    const ref = (reference || '').toString().trim().slice(0, 200);
    await base44.asServiceRole.entities.Product.update(product.id, {
      status: 'transfer_reported',
      transfer_reported_at: new Date().toISOString(),
      transfer_reference: ref,
    });

    try {
      if (product.seller_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: product.seller_email,
          subject: `💸 הקונה דיווח על העברה — ${product.title}`,
          body: `שלום ${product.seller_name || ''},\n\nהקונה ${product.highest_bidder || ''} דיווח שהעביר את סכום הזכייה (₪${(product.current_price || 0).toLocaleString()}) עבור "${product.title}".${ref ? `\n\nאסמכתא שהוזנה על ידי הקונה: ${ref}` : ''}\n\nלאחר שהכסף התקבל בפועל, יש לאשר קבלת תשלום באזור האישי:\nhttps://bidli.co.il/profile\n\nצוות bidli`,
        });
      }
    } catch (e) {
      console.error('reportTransfer seller email failed:', e);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('reportTransfer error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}