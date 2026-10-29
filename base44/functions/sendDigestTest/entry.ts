import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { pickEndingAuctions, toDigestItems, buildDigestEmail } from '../../shared/buildWeeklyDigest.ts';

// בדיקת תצוגה לדייג'סט — שולח עותק אחד בלבד לכתובת שהתבקשה, עם אותם נתונים
// ואותה בנייה בדיוק כמו השליחה השבועית. אינו כותב, אינו מסמן ואינו שולח לאף נמען אחר.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const to = String(body.to || user.email).trim();
    if (!EMAIL_RE.test(to)) {
      return Response.json({ error: 'invalid_email' }, { status: 400 });
    }

    const now = Date.now();
    const products = await base44.asServiceRole.entities.Product.filter({ status: 'active' });
    const ending = pickEndingAuctions(products, now);
    if (!ending.length) {
      return Response.json({ ok: true, sent: 0, reason: 'no_ending_auctions', to });
    }

    const items = toDigestItems(ending, now);
    const firstName = (user.full_name || '').split(' ')[0] || 'שלום';
    const { subject, html, text } = buildDigestEmail(items, firstName);

    const res = await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject: `[בדיקה] ${subject}`,
      html,
      text,
      category: 'transactional',
    });

    return Response.json({
      ok: true,
      sent: 1,
      to,
      ending: ending.length,
      auctions: items.map(i => ({ title: i.p.title, url: i.url })),
      anchors_in_html: (html.match(/<a /g) || []).length,
      text_starts_with: text.slice(0, 80),
      send_result: res,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}