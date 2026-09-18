import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail, ADMIN_EMAIL } from '../../shared/gmailSender.ts';
import { sellerBidEmail, adminBidEmail } from '../../shared/notifyEmails.ts';
import { sendWhatsAppText } from '../../shared/whatsapp.ts';
import { createAppNotification } from '../../shared/appNotifications.ts';

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

      // התראה בתוך האתר למוביל הקודם — תוצג בפעמון שבכותרת
      if (outbidEmail) {
        await createAppNotification(base44, {
          recipient_email: outbidEmail,
          recipient_name: outbidName,
          type: 'outbid',
          title: `עקפו אותך על "${product.title}"`,
          body: `${newBidderName} הגיש הצעה גבוהה יותר (₪${bid.amount}). לחץ להגשת הצעה גבוהה יותר.`,
          product_id: product.id,
          product_title: product.title,
          product_image_url: product.image_url || '',
          link: `/auction/${product.id}`,
        });
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

    // ── הצעה אוטומטית חד-פעמית ──
    // אם למציע אחר במכרז זה מוגדר סכום אוטומטי שטרם נוצל, וההצעה החדשה עקפה אותו —
    // המערכת מגישה בשמו הצעה של מחיר נוכחי + 1, עד גבול הסכום שבחר (פעם אחת בלבד)
    try {
      const stillActive = product.status === 'active' && new Date(product.ends_at) > new Date();
      if (stillActive) {
        const key = (s) => (s || '').trim().toLowerCase();
        const newBidderKey = key(bid.bidder_name);
        const sellerKeys = [key(product.seller_name), key(product.seller_email)].filter(Boolean);
        const autoBids = await base44.asServiceRole.entities.AutoBid.filter({ product_id: product.id, used: false });
        let currentPrice = product.current_price || product.starting_price || 0;
        let leader = { name: bid.bidder_name, email: bid.bidder_email || '', amount: bid.amount };
        const fired = [];
        for (let step = 0; step < 10; step++) {
          const eligible = autoBids
            .filter(a => !a.used
              && a.max_amount >= currentPrice + 1
              && key(a.bidder_name) !== newBidderKey
              && !sellerKeys.includes(key(a.bidder_name))
              && !sellerKeys.includes(key(a.bidder_email)))
            .sort((a, b) => b.max_amount - a.max_amount);
          if (!eligible.length) break;
          const a = eligible[0];
          const amount = currentPrice + 1;
          await base44.asServiceRole.entities.Product.update(product.id, {
            current_price: amount,
            highest_bidder: a.bidder_name,
            highest_bidder_email: a.bidder_email || '',
            second_bidder_name: leader.name || '',
            second_bidder_email: leader.email || '',
            second_bid_amount: leader.amount || 0,
            bid_count: (product.bid_count || 0) + 1,
          });
          await base44.asServiceRole.entities.Bid.create({
            product_id: product.id,
            product_title: product.title,
            product_image_url: product.image_url || '',
            product_ends_at: product.ends_at,
            bidder_name: a.bidder_name,
            bidder_email: a.bidder_email || '',
            amount,
            status: 'active',
          });
          await base44.asServiceRole.entities.AutoBid.update(a.id, { used: true, used_at: new Date().toISOString() });
          a.used = true;
          fired.push({ name: a.bidder_name, amount });
          currentPrice = amount;
          leader = { name: a.bidder_name, email: a.bidder_email || '', amount };
        }
        if (fired.length) results.push({ to: 'auto_bids', ok: true, fired });
      }
    } catch (e) {
      results.push({ to: 'auto_bids', ok: false, error: String(e) });
    }

    return Response.json({ ok: true, results });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}