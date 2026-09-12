import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail, ADMIN_EMAIL } from '../../shared/gmailSender.ts';
import { sellerBidEmail, adminBidEmail } from '../../shared/notifyEmails.ts';
import { sendWhatsAppText } from '../../shared/whatsapp.ts';

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

    // וואצאפ למוביל הקודם שהוצא מההובלה — אם הפעיל התראות וואצאפ
    try {
      const outbidEmail = (product.second_bidder_email || '').trim().toLowerCase();
      const outbidName = (product.second_bidder_name || '').trim();
      const newBidderName = (bid.bidder_name || '').trim();
      if ((outbidEmail || outbidName) && newBidderName && outbidName !== newBidderName) {
        let prefs = outbidEmail
          ? await base44.asServiceRole.entities.NotificationPreference.filter({ email: outbidEmail })
          : [];
        if (!prefs.length && outbidName) {
          prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ name: outbidName });
        }
        const pref = prefs.find(p => p.notify_whatsapp && p.whatsapp_phone);
        if (pref) {
          const pageUrl = `https://bidli.base44.app/auction/${product.id}`;
          const msg = `עקפו אותך! 😤\n${newBidderName} הגיש הצעה גבוהה יותר (₪${bid.amount}) על "${product.title}".\nלהגשת הצעה גבוהה יותר: ${pageUrl}`;
          const res = await sendWhatsAppText(pref.whatsapp_phone, msg);
          results.push({ to: 'outbid_whatsapp', ok: res.ok, error: res.error });
        }
      }
    } catch (e) {
      results.push({ to: 'outbid_whatsapp', ok: false, error: String(e) });
    }

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