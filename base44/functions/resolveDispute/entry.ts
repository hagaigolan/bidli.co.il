import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin action: resolve a dispute — refund buyer OR release to seller
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { escrow_id, action } = await req.json(); // action: 'refund_buyer' | 'release_seller'
    if (!escrow_id || !action) {
      return Response.json({ error: 'Missing escrow_id or action' }, { status: 400 });
    }

    const escrows = await base44.asServiceRole.entities.Escrow.filter({ id: escrow_id });
    if (!escrows.length) return Response.json({ error: 'Escrow not found' }, { status: 404 });
    const escrow = escrows[0];

    const now = new Date().toISOString();
    const newStatus = action === 'refund_buyer' ? 'refunded' : 'released';

    await base44.asServiceRole.entities.Escrow.update(escrow.id, {
      status: newStatus,
      resolved_at: now,
      resolved_by: user.email || 'admin',
    });

    await base44.asServiceRole.entities.Product.update(escrow.product_id, {
      status: action === 'refund_buyer' ? 'cancelled' : 'released',
      payment_status: action === 'refund_buyer' ? 'refunded' : 'released',
    });

    // Notify buyer
    if (escrow.buyer_email) {
      const msg = action === 'refund_buyer'
        ? `הסכסוך ב-"${escrow.product_title}" הוכרע לטובתך. הכסף יוחזר אליך בקרוב.`
        : `הסכסוך ב-"${escrow.product_title}" הוכרע. הכסף שוחרר למוכר.`;
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.buyer_email,
        subject: `bidli — עדכון סכסוך: ${escrow.product_title}`,
        body: msg,
      });
    }

    return Response.json({ success: true, action, escrow_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});