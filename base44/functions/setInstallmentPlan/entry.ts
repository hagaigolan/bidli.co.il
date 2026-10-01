import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// הקונה (הזוכה במכרז) בוחר לשלם בתשלומים — 2 עד 4 תשלומים בהעברה ישירה.
// הזהות נגזרת מהמשתמש המחובר בשרת בלבד, והתוכנית נקבעת רק לפני תחילת הדיווחים.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const { product_id, installments_count } = await req.json().catch(() => ({}));
    const count = parseInt(installments_count, 10);
    if (!product_id || !count || count < 2 || count > 4) {
      return Response.json({ error: 'invalid fields' }, { status: 400 });
    }

    const items = await base44.asServiceRole.entities.Product.filter({ id: product_id });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const product = items[0];

    if ((product.highest_bidder_email || '').trim().toLowerCase() !== (user.email || '').trim().toLowerCase()) {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }
    if (product.status !== 'awaiting_payment') {
      return Response.json({ error: 'not awaiting payment' }, { status: 400 });
    }
    if (product.installments_count > 1 && (product.installments_paid || 0) > 0) {
      return Response.json({ error: 'plan already started' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Product.update(product.id, {
      installments_count: count,
      installments_paid: 0,
    });

    return Response.json({ ok: true, installments_count: count });
  } catch (error) {
    console.error('setInstallmentPlan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}