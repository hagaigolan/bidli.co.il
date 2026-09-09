import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail, ADMIN_EMAIL } from '../../shared/gmailSender.ts';
import { sellerBidEmail, adminBidEmail } from '../../shared/notifyEmails.ts';

// Sends designed new-bid alerts — to the auction's seller and to the platform admin —
// on every new bid. Invoked by the "Bid Notifications" workflow (entity trigger: Bid create).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { bid_id } = await req.json();
    if (!bid_id) {
      return Response.json({ error: 'missing bid_id' }, { status: 400 });
    }

    const bid = await base44.asServiceRole.entities.Bid.get(bid_id);
    if (!bid || !bid.product_id) {
      return Response.json({ error: 'bid not found' }, { status: 404 });
    }

    const product = await base44.asServiceRole.entities.Product.get(bid.product_id);
    if (!product) {
      return Response.json({ error: 'product not found' }, { status: 404 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const results = [];

    if (product.seller_email) {
      try {
        const email = sellerBidEmail(product, bid);
        await sendGmail(accessToken, { to: product.seller_email, subject: email.subject, html: email.html, text: email.text });
        results.push({ to: 'seller', ok: true });
      } catch (e) {
        results.push({ to: 'seller', ok: false, error: String(e) });
      }
    }

    try {
      const email = adminBidEmail(product, bid);
      await sendGmail(accessToken, { to: ADMIN_EMAIL, subject: email.subject, html: email.html, text: email.text });
      results.push({ to: 'admin', ok: true });
    } catch (e) {
      results.push({ to: 'admin', ok: false, error: String(e) });
    }

    return Response.json({ ok: true, results });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}