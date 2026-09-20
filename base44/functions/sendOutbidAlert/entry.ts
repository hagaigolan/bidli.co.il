import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// התראת "הוצאת מהמשחק" למציע שעקפו אותו — הנמען מאומת בשרת מול
// second_bidder_email של המכרז (המוביל הקודם), כך שלא ניתן לשלוח
// לכתובת שרירותית (בעבר נשלח מהדפדפן לכתובת מ-localStorage).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, recipient_email } = await req.json().catch(() => ({}));
    if (!product_id || !recipient_email) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    const recipient = String(recipient_email).trim().toLowerCase();
    if ((product.second_bidder_email || '').trim().toLowerCase() !== recipient) {
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