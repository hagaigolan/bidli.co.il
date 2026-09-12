import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { buyerSaleEmail, sellerSaleEmail } from '../../shared/saleEmails.ts';
import { createAppNotification } from '../../shared/appNotifications.ts';

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

      // התראה בתוך האתר לזוכה
      if (product.highest_bidder_email) {
        await createAppNotification(base44, {
          recipient_email: product.highest_bidder_email,
          recipient_name: product.highest_bidder || '',
          type: 'won',
          title: `🏆 זכית במכרז: ${product.title}`,
          body: `ההצעה שלך (₪${product.current_price}) היא הגבוהה ביותר. ניתן להשלים את התשלום מעמוד המכרז.`,
          product_id: product.id,
          product_title: product.title,
          product_image_url: product.image_url || '',
          link: `/auction/${product.id}`,
        });
      }

      // Send designed email to the winner (buyer)
      if (product.highest_bidder_email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: product.highest_bidder_email,
            subject: `🏆 זכית במכרז: ${product.title}`,
            body: buyerSaleEmail(product, product.highest_bidder),
          });
        } catch (e) {
          results.push({ id: product.id, action: 'winner_email_failed', error: String(e) });
        }
      }

      // התראה בתוך האתר למוכר
      if (product.seller_email) {
        await createAppNotification(base44, {
          recipient_email: product.seller_email,
          recipient_name: product.seller_name || '',
          type: 'sold',
          title: `💰 המוצר שלך נמכר: ${product.title}`,
          body: `${product.highest_bidder} זכה במכרז ב-₪${product.current_price}. ניתן לצפות בפרטים מעמוד המכרז.`,
          product_id: product.id,
          product_title: product.title,
          product_image_url: product.image_url || '',
          link: `/auction/${product.id}`,
        });
      }

      // Send designed email to the seller — sale notification + need to enter payout card
      if (product.seller_email) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: product.seller_email,
            subject: `💰 המוצר שלך נמכר: ${product.title}`,
            body: sellerSaleEmail(product, product.highest_bidder),
          });
        } catch (e) {
          results.push({ id: product.id, action: 'seller_email_failed', error: String(e) });
        }
      }

      results.push({ id: product.id, action: 'awaiting_payment', winner: product.highest_bidder });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});