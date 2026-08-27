import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { stripeRequest } from '../../shared/stripe.ts';

// After a seller confirms card setup, persist the payout card on all of their
// sold products (awaiting_payment / paid / escrow / delivered) so the platform
// can pay out the sale proceeds to that card.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { seller_email, setup_intent_id } = await req.json().catch(() => ({}));
    if (!seller_email || !setup_intent_id) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const si = await stripeRequest('GET', `/setup_intents/${setup_intent_id}`);
    if (si.status !== 'succeeded') {
      return Response.json({ error: 'setup not succeeded' }, { status: 400 });
    }
    const pmId = si.payment_method;
    if (!pmId) return Response.json({ error: 'no payment method' }, { status: 400 });

    const pm = await stripeRequest('GET', `/payment_methods/${pmId}`);
    const card = pm.card || {};

    const SOLD_STATUSES = ['awaiting_payment', 'paid', 'escrow', 'delivered'];
    const all = await base44.asServiceRole.entities.Product.filter({ seller_email });
    const sold = all.filter((p) => SOLD_STATUSES.includes(p.status));

    let count = 0;
    for (const p of sold) {
      await base44.asServiceRole.entities.Product.update(p.id, {
        seller_payout_method_id: pmId,
        seller_card_last4: card.last4 || '',
        seller_card_brand: card.brand || '',
      });
      count++;
    }

    return Response.json({
      saved: count,
      last4: card.last4 || '',
      brand: card.brand || '',
    });
  } catch (error) {
    console.error('confirmSellerPayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}