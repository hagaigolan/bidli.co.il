import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { captureAndRelease } from '../../shared/stripe.ts';

// Captures an authorized payment (the "late charge") and releases the escrow to the seller.
// Called when the buyer confirms receipt of the product.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, bidder_email } = await req.json().catch(() => ({}));
    if (!product_id) return Response.json({ error: 'missing product_id' }, { status: 400 });

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    if (bidder_email && product.highest_bidder_email !== bidder_email) {
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