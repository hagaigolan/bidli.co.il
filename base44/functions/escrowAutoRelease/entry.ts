import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { captureAndRelease } from '../../shared/stripe.ts';

// Runs daily. Auto-releases escrow 3 days after payment if buyer hasn't confirmed.
// Captures the authorized Stripe payment and marks escrow + product as released.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const escrows = await base44.asServiceRole.entities.Escrow.filter({ status: 'frozen' });
    const due = escrows.filter((e) => e.release_after && new Date(e.release_after) <= now);

    const results = [];
    for (const escrow of due) {
      try {
        const products = await base44.asServiceRole.entities.Product.filter({ id: escrow.product_id });
        if (products.length) {
          await captureAndRelease(base44, products[0], 'auto');
        } else {
          await base44.asServiceRole.entities.Escrow.update(escrow.id, {
            status: 'released',
            released_at: now.toISOString(),
            resolved_by: 'auto',
          });
        }
        results.push({ escrow_id: escrow.id, action: 'released' });
      } catch (error) {
        console.error('escrowAutoRelease error for', escrow.id, error);
        results.push({ escrow_id: escrow.id, action: 'error', error: error.message });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}