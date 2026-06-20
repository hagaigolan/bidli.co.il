import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called by scheduled automation every 5 minutes
// Finds auctions that just ended and transitions them to awaiting_payment
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    // Find active auctions past their end time
    const allProducts = await base44.asServiceRole.entities.Product.filter({ status: 'active' });
    const ended = allProducts.filter(p => p.ends_at && p.ends_at <= now);

    const results = [];
    for (const product of ended) {
      if (!product.highest_bidder) {
        // No bids — just mark ended
        await base44.asServiceRole.entities.Product.update(product.id, { status: 'ended' });
        results.push({ id: product.id, action: 'ended_no_bids' });
        continue;
      }

      // Set payment deadline = 24h from now
      const paymentDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await base44.asServiceRole.entities.Product.update(product.id, {
        status: 'awaiting_payment',
        payment_deadline: paymentDeadline,
      });

      // Send email to winner
      if (product.highest_bidder_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: product.highest_bidder_email,
          subject: `🏆 זכית במכרז: ${product.title}`,
          body: `שלום ${product.highest_bidder},\n\nזכית במכרז "${product.title}" במחיר ₪${product.current_price?.toLocaleString()}.\n\nיש לך 24 שעות להשלים את התשלום. לאחר מכן הזכייה תבוטל.\n\nעבור לאזור האישי שלך ב-bid-it להשלמת הרכישה.`,
        });
      }

      results.push({ id: product.id, action: 'awaiting_payment', winner: product.highest_bidder });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});