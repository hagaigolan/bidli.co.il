import { SELLER_COMMISSION_RATE, BUYER_HANDLING_RATE } from '../../shared/fees.ts';

// Public fee configuration for the frontend (My Orders breakdown, payment panel).
// The single source of truth is base44/shared/fees.ts — changing the rates there
// changes both charging and display across the platform.
export default async function(req: Request): Promise<Response> {
  try {
    return Response.json({
      seller_commission_rate: SELLER_COMMISSION_RATE,
      buyer_handling_rate: BUYER_HANDLING_RATE,
    });
  } catch (error) {
    console.error('getFeeConfig error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}