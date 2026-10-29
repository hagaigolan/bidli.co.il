import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { BASE_URL, pickEndingAuctions, toDigestItems, buildDigestEmail } from '../../shared/buildWeeklyDigest.ts';

// דיגסט שבועי — שולח לכל המשתמשים הרשומים את 5 המכרזים שמסתיימים בקרוב (48 השעות הבאות).
// מופעל על ידי ה-workflow המתוזמן "Weekly Digest". שולח רק אם יש מכרזים שמסתיימים בקרוב.
// המייל נשלח כ-multipart/alternative אמיתי: html מעוצב + text/plain קריא (ללא מרקאפ),
// וכל פריט מקושר לעמוד המכרז שלו — גם בתמונת הכרטיס וגם בכותרת.
// בניית המייל עצמה יושבת ב-base44/shared/buildWeeklyDigest.ts (משותף עם sendDigestTest).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    const now = Date.now();
    const products = await base44.asServiceRole.entities.Product.filter({ status: 'active' });
    const ending = pickEndingAuctions(products, now);
    if (!ending.length) {
      return Response.json({ ok: true, sent: 0, reason: 'no_ending_auctions' });
    }
    const items = toDigestItems(ending, now);

    // בדיקה יבשה (dry_run) — מחזיר דגימה של שני הגופים בלי לשלוח דבר
    const body = await req.json().catch(() => ({}));
    if (body && body.dry_run) {
      const sample = buildDigestEmail(items, 'דנה');
      return Response.json({
        ok: true,
        dry_run: true,
        ending: ending.length,
        sample_text: sample.text,
        anchors_in_html: (sample.html.match(/<a /g) || []).length,
        auctions_link: `${BASE_URL}/auctions`,
      });
    }

    // הנמענים — כל המשתמשים הרשומים (ללא כפילויות אימייל)
    const users = await base44.asServiceRole.entities.User.list('-created_date', 300);
    const recipients = [...new Map(users.filter(u => u.email).map(u => [u.email, u])).values()];

    let sent = 0;
    for (let i = 0; i < recipients.length; i += 6) {
      const batch = recipients.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map(u => {
        const firstName = (u.full_name || '').split(' ')[0] || 'שלום';
        const { subject, html, text } = buildDigestEmail(items, firstName);
        return base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject,
          html,
          text,
          category: 'marketing',
        });
      }));
      sent += settled.filter(s => s.status === 'fulfilled').length;
    }

    return Response.json({ ok: true, sent, ending: ending.length, recipients: recipients.length });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}