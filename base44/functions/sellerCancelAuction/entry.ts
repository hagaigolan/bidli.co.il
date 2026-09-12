import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail } from '../../shared/gmailSender.ts';
import { bidderCancelEmail } from '../../shared/notifyEmails.ts';
import { sendWhatsAppText } from '../../shared/whatsapp.ts';

// ביטול מכרז עצמי למוכר:
// - אין הצעות → ביטול מיידי ללא השלכות
// - יש הצעות → מותר רק עד 12 שעות לפני הסיום, מתוודע למציעים (מייל + וואצאפ למי שאישר),
//   ונספר למכסה של 3 ביטולים של מכרזים עם הצעות (מונה פנימי על רשומת המשתמש)
const CANCEL_WINDOW_MS = 12 * 60 * 60 * 1000;
const MAX_CANCELS_WITH_BIDS = 3;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ ok: false, code: 'unauthorized' }, { status: 401 });
    }

    const { product_id } = await req.json();
    if (!product_id) {
      return Response.json({ error: 'missing product_id' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.get(product_id);
    if (!product) {
      return Response.json({ error: 'product not found' }, { status: 404 });
    }

    // הביטול מוגבל למוכר בלבד — אימות מול פרטי המוכר המחובר
    const sellerUserId = (product.seller_user_id || '').trim();
    const sellerEmail = (product.seller_email || '').trim().toLowerCase();
    const myEmail = (user.email || '').trim().toLowerCase();
    const isSeller = (sellerUserId && sellerUserId === user.id) ||
      (sellerEmail && myEmail && sellerEmail === myEmail);
    if (!isSeller) {
      return Response.json({ ok: false, code: 'forbidden' });
    }

    if (product.status === 'cancelled') {
      return Response.json({ ok: true, code: 'already_cancelled' });
    }

    const endsAt = product.ends_at ? new Date(product.ends_at).getTime() : 0;
    if (endsAt && endsAt <= Date.now()) {
      return Response.json({ ok: false, code: 'ended' });
    }

    const bids = await base44.asServiceRole.entities.Bid.filter({ product_id }, '-created_date', 100);
    const activeBids = bids.filter(b => b.status === 'active' || b.status === 'outbid');
    const hasBids = activeBids.length > 0;

    let cancelCount = 0;
    if (hasBids) {
      // ביטול מכרז עם הצעות מותר רק עד 12 שעות לפני הסיום
      if (endsAt - Date.now() < CANCEL_WINDOW_MS) {
        return Response.json({ ok: false, code: 'too_late' });
      }
      // מכסה של 3 ביטולים של מכרזים עם הצעות
      const userRecord = await base44.asServiceRole.entities.User.get(user.id).catch(() => null);
      cancelCount = userRecord?.cancelled_with_bids || 0;
      if (cancelCount >= MAX_CANCELS_WITH_BIDS) {
        return Response.json({ ok: false, code: 'limit_reached' });
      }
    }

    // ביצוע הביטול — סטטוס cancelled הקיים בסכימה
    await base44.asServiceRole.entities.Product.update(product_id, { status: 'cancelled' });

    if (!hasBids) {
      return Response.json({ ok: true, code: 'cancelled_no_bids' });
    }

    // סימון כל ההצעות כבוטלות + עדכון המונה הפנימי של המוכר
    await base44.asServiceRole.entities.Bid.bulkUpdate(
      activeBids.map(b => ({ id: b.id, status: 'cancelled' }))
    );
    await base44.asServiceRole.entities.User.update(user.id, { cancelled_with_bids: cancelCount + 1 });

    // התראה לכל המציעים — מייל ברנדי + וואצאפ למי שאישר התראות וואצאפ
    const results = [];
    try {
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      const seen = new Set();
      for (const bid of activeBids) {
        const email = (bid.bidder_email || '').trim().toLowerCase();
        const key = email || `name:${(bid.bidder_name || '').trim()}`;
        if (!key || seen.has(key)) continue;
        seen.add(key);

        if (email) {
          try {
            const mail = bidderCancelEmail(product, bid.bidder_name);
            await sendGmail(accessToken, { to: email, subject: mail.subject, html: mail.html, text: mail.text });
            results.push({ to: email, email: 'ok' });
          } catch (e) {
            results.push({ to: email, email: 'failed', error: String(e) });
          }
        }

        try {
          let prefs = email
            ? await base44.asServiceRole.entities.NotificationPreference.filter({ email })
            : [];
          if (!prefs.length && bid.bidder_name) {
            prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ name: bid.bidder_name });
          }
          const pref = prefs.find(p => p.notify_whatsapp && p.whatsapp_phone);
          if (pref) {
            const res = await sendWhatsAppText(
              pref.whatsapp_phone,
              `המכרז על "${product.title}" בוטל על ידי המוכר. כל ההצעות בוטלו.\nמוזמנים לעיין במכרזים פעילים נוספים באתר bidli.`
            );
            results.push({ to: email || bid.bidder_name, whatsapp: res.ok ? 'ok' : 'failed', error: res.error });
          }
        } catch (e) {
          results.push({ to: email || bid.bidder_name, whatsapp: 'failed', error: String(e) });
        }
      }
    } catch (e) {
      results.push({ notifications: 'failed', error: String(e) });
    }

    return Response.json({ ok: true, code: 'cancelled_with_bids', notified: results });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}