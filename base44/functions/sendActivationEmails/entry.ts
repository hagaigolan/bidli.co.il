import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { shell } from '../../shared/saleEmails.ts';

const APP_URL = 'https://bidli.co.il';
const COOLDOWN_MS = 14 * 24 * 3600 * 1000; // לא לשלוח שוב לאותו משתמש בתוך 14 יום
const MAX_PER_RUN = 15;

// Scheduled by the "Activation Emails" workflow (every 3 days):
// משתמשים שנרשמו אך טרם פרסמו או הציעו — מקבלים מייל מעוצב אחד
// עם מכרזים חיים לפי תחומי העניין שלהם + קריאה לפרסום ראשון.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();

    // מי קיבל מייל הפעלה לאחרונה — מוצנן ל-14 יום
    const logs = await base44.asServiceRole.entities.ActivationLog.list('-sent_at', 300);
    const recent = new Set(
      logs.filter(l => now - new Date(l.sent_at).getTime() < COOLDOWN_MS)
        .map(l => (l.user_email || '').toLowerCase()));

    const users = await base44.asServiceRole.entities.User.list('-created_date', 300);
    const products = await base44.asServiceRole.entities.Product.filter({ status: 'active' });
    const sellerEmails = new Set(products.map(p => (p.seller_email || '').toLowerCase()));
    const bids = await base44.asServiceRole.entities.Bid.list('-created_date', 500);
    const bidderEmails = new Set(bids.map(b => (b.bidder_email || '').toLowerCase()));

    const activeProducts = products.filter(p => p.ends_at && new Date(p.ends_at).getTime() > now);

    let sent = 0;
    for (const user of users) {
      if (sent >= MAX_PER_RUN) break;
      const email = (user.email || '').toLowerCase();
      if (!email || recent.has(email) || sellerEmails.has(email) || bidderEmails.has(email)) continue;

      // מכרזים חיים לפי תחומי העניין; אם אין התאמה — המכרזים החמים ביותר
      const cats = new Set(user.interest_categories || []);
      let picks = activeProducts.filter(p => cats.has(p.category));
      if (picks.length < 3) {
        const extra = activeProducts
          .filter(p => !picks.includes(p) && (p.bid_count || 0) > 0)
          .sort((a, b) => (b.bid_count || 0) - (a.bid_count || 0));
        picks = [...picks, ...extra];
      }
      picks = picks.slice(0, 3);
      if (!picks.length) continue;

      const name = user.full_name || 'קונה ומוכר';
      const rows = picks.map(p => `
        <tr><td style="padding:10px 0;border-bottom:1px solid #f4f4f5;">
          <a href="${APP_URL}/auction/${p.id}" style="text-decoration:none;">
            <span style="font-size:15px;font-weight:800;color:#18181b;">${p.title}</span><br>
            <span style="font-size:13px;color:#e5893d;font-weight:700;">מ-${(p.current_price || p.starting_price || 0).toLocaleString('he-IL')} ₪</span>
            <span style="font-size:12px;color:#71717a;"> · ${p.category || ''}${p.bid_count ? ` · ${p.bid_count} הצעות` : ''}</span>
          </a>
        </td></tr>`).join('');

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: user.email,
          subject: `${name}, מחכים לך כאן — 3 מכרזים חמים בשבילך`,
          html: shell({
            title: 'ראינו שעדיין לא התחלת 💫',
            heroColor: '#e5893d',
            heroEmoji: '👋',
            heroLine: 'בוא ננסה — זה לוקח דקה',
            bodyHtml: `<p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${name},</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">הצעת מחיר לוקחת 10 שניות, ופרסום מכרז — דקתיים בלבד ובחינם. הנה מה שכרגע חם באתר:</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${rows}</table>
              <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#71717a;">רוצה למכור? פרסום המכרז חינם לחלוטין — תוך 24 שעות תדע אם יש לו קונה.</p>`,
            ctaUrl: `${APP_URL}/auctions`,
            ctaLabel: 'לכל המכרזים הפעילים →',
          }),
          text: `שלום ${name},\n\nהנה 3 מכרזים פעילים באתר bidli:\n${picks.map(p => `- ${p.title} (מ-${(p.current_price || p.starting_price || 0).toLocaleString('he-IL')} ₪): ${APP_URL}/auction/${p.id}`).join('\n')}\n\nפרסום מכרז חינם: ${APP_URL}/upload-product`,
        });
        sent++;
        await base44.asServiceRole.entities.ActivationLog.create({ user_email: email, sent_at: new Date().toISOString() });
      } catch (e) {
        console.error('sendActivationEmails email failed:', e?.message || e);
      }
    }

    return Response.json({ scanned: users.length, sent });
  } catch (error) {
    console.error('sendActivationEmails error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}