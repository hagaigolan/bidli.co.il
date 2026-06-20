import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Runs daily. Auto-releases escrow 7 days after shipping if buyer hasn't confirmed.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const escrows = await base44.asServiceRole.entities.Escrow.filter({ status: 'frozen' });
    const autoRelease = escrows.filter(e => e.release_after && new Date(e.release_after) <= now);

    const results = [];
    for (const escrow of autoRelease) {
      await base44.asServiceRole.entities.Escrow.update(escrow.id, {
        status: 'released',
        released_at: now.toISOString(),
        resolved_by: 'auto',
      });
      await base44.asServiceRole.entities.Product.update(escrow.product_id, {
        status: 'released',
        payment_status: 'released',
      });
      results.push({ escrow_id: escrow.id, action: 'auto_released' });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});