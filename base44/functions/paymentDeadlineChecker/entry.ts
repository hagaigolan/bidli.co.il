import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Runs every 30 min. If winner hasn't paid after 24h → strike + offer to second bidder
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const overdueProducts = await base44.asServiceRole.entities.Product.filter({ status: 'awaiting_payment' });
    const overdue = overdueProducts.filter(p => p.payment_deadline && new Date(p.payment_deadline) <= now);

    const results = [];
    for (const product of overdue) {
      // Add strike to winner's trust score
      if (product.highest_bidder_email) {
        const users = await base44.asServiceRole.entities.User.filter({ email: product.highest_bidder_email });
        if (users.length) {
          const u = users[0];
          const newStrikes = (u.strikes || 0) + 1;
          const newTrustScore = Math.max(0, 100 - newStrikes * 33);
          const isBanned = newStrikes >= 3;
          await base44.asServiceRole.entities.User.update(u.id, {
            strikes: newStrikes,
            trust_score: newTrustScore,
            is_banned: isBanned,
            ban_reason: isBanned ? 'שלושה אי-תשלומים' : u.ban_reason,
          });
        }
      }

      // If there's a second bidder, offer them 12h
      if (product.second_bidder_email) {
        const secondDeadline = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
        await base44.asServiceRole.entities.Product.update(product.id, {
          status: 'awaiting_payment',
          highest_bidder: product.second_bidder_name,
          highest_bidder_email: product.second_bidder_email,
          current_price: product.second_bid_amount,
          payment_deadline: secondDeadline,
          second_bidder_name: null,
          second_bidder_email: null,
          second_bid_amount: null,
        });

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: product.second_bidder_email,
          subject: `⚡ הצעה שנייה — אתה הבא! ${product.title}`,
          body: `שלום ${product.second_bidder_name},\n\nהמציע הראשי ב"${product.title}" לא השלים את תשלומו.\nיש לך 12 שעות לרכוש את המוצר במחיר ₪${product.second_bid_amount?.toLocaleString()}.\n\nהיכנס לאזור האישי שלך ב-bidli להשלמת הרכישה.`,
        });
        results.push({ id: product.id, action: 'offered_to_second_bidder' });
      } else {
        // No second bidder — cancel auction
        await base44.asServiceRole.entities.Product.update(product.id, { status: 'cancelled' });
        results.push({ id: product.id, action: 'cancelled_no_second_bidder' });
      }
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});