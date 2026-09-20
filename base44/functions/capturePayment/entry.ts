import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { captureAndRelease } from '../../shared/stripe.ts';

// Captures an authorized payment (the "late charge") and releases the escrow to the seller.
// Called when the buyer confirms receipt of the product.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // חיוב הכרטיס מותר רק לזוכה עצמו (או לאדמין) — הזהות נגזרת מהמשתמש המחובר,
    // לא משדה שהלקוח שולח, כדי שאף אחד לא יוכל לגבות את הכסף במקום הקונה
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id) return Response.json({ error: 'missing product_id' }, { status: 400 });

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    const isWinner = (product.highest_bidder_email || '').trim().toLowerCase()
      === (user.email || '').trim().toLowerCase();
    if (!isWinner && user.role !== 'admin') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }
    if (!product.stripe_payment_intent_id) {
      return Response.json({ error: 'no payment intent' }, { status: 400 });
    }

    await captureAndRelease(base44, product, 'buyer');
    return Response.json({ status: 'released' });
  } catch (error) {
    console.error('capturePayment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}