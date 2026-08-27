import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  stripeRequest,
  getOrCreateCustomer,
  stripePublishableKey,
  appMetadata,
} from '../../shared/stripe.ts';

// Creates a Stripe SetupIntent for a seller so they can register a payout card.
// No charge is made — the card is saved for the platform to pay out the sale proceeds.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { seller_email, seller_name } = await req.json().catch(() => ({}));
    if (!seller_email) {
      return Response.json({ error: 'missing seller_email' }, { status: 400 });
    }

    const customerId = await getOrCreateCustomer(seller_email, seller_name);

    const params = new URLSearchParams();
    params.set('customer', customerId);
    params.set('payment_method_types[0]', 'card');
    params.set('usage', 'off_session');
    for (const [k, v] of Object.entries(appMetadata(''))) {
      if (v) params.set(`metadata[${k}]`, v);
    }

    const si = await stripeRequest('POST', '/setup_intents', params, crypto.randomUUID());

    return Response.json({
      client_secret: si.client_secret,
      setup_intent_id: si.id,
      publishable_key: stripePublishableKey(),
    });
  } catch (error) {
    console.error('createSellerSetup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}