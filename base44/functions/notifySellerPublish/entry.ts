import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail } from '../../shared/gmailSender.ts';
import { sellerPublishEmail } from '../../shared/notifyEmails.ts';

// Sends the seller a designed confirmation email right after they publish a product.
// Invoked by the "Seller Publish Notification" workflow (entity trigger: Product create).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return Response.json({ error: 'missing product_id' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.get(product_id);
    if (!product) {
      return Response.json({ error: 'product not found' }, { status: 404 });
    }
    if (!product.seller_email) {
      return Response.json({ ok: true, skipped: 'no seller email' });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    const email = sellerPublishEmail(product);
    await sendGmail(accessToken, { to: product.seller_email, subject: email.subject, html: email.html, text: email.text });

    return Response.json({ ok: true, sent_to: product.seller_email });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}