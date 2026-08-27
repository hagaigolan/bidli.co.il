import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  stripeRequest,
  getOrCreateCustomer,
  toMinorUnits,
  appMetadata,
  stripePublishableKey,
} from '../../shared/stripe.ts';

// Creates (or reuses) a Stripe PaymentIntent in MANUAL capture mode for a won auction.
// The buyer's card is authorized (funds held) at winning; the actual charge (capture)
// happens later — on buyer confirmation or automatically after 3 days.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, bidder_email } = await req.json().catch(() => ({}));
    if (!product_id || !bidder_email) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    const winnerEmail = product.highest_bidder_email || '';
    if (!winnerEmail) return Response.json({ error: 'no winner' }, { status: 400 });
    if (winnerEmail !== bidder_email) return Response.json({ error: 'forbidden' }, { status: 403 });
    if (product.status !== 'awaiting_payment') {
      return Response.json({ error: 'not awaiting payment' }, { status: 400 });
    }

    // Reuse an existing PaymentIntent if we already created one (idempotent retries).
    let piId = product.stripe_payment_intent_id;
    let clientSecret = product.stripe_payment_intent_client_secret;

    if (!piId) {
      const customerId = product.stripe_customer_id || await getOrCreateCustomer(winnerEmail, product.highest_bidder);
      const params = new URLSearchParams();
      params.set('amount', String(toMinorUnits(product.current_price || product.starting_price || 0)));
      params.set('currency', 'ils');
      params.set('customer', customerId);
      params.set('capture_method', 'manual');
      params.set('description', `bid-it auction: ${product.title}`);
      params.set('metadata[product_id]', product_id);
      for (const [k, v] of Object.entries(appMetadata(product_id))) {
        if (v) params.set(`metadata[${k}]`, v);
      }
      const pi = await stripeRequest('POST', '/payment_intents', params, crypto.randomUUID());
      piId = pi.id;
      clientSecret = pi.client_secret;
      await base44.asServiceRole.entities.Product.update(product_id, {
        stripe_customer_id: customerId,
        stripe_payment_intent_id: piId,
        stripe_payment_intent_client_secret: clientSecret,
      });
    }

    return Response.json({
      client_secret: clientSecret,
      payment_intent_id: piId,
      publishable_key: stripePublishableKey(),
    });
  } catch (error) {
    console.error('createPayment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}