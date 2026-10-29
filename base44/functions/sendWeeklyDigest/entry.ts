import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';

// דיגסט שבועי — שולח לכל המשתמשים הרשומים את 5 המכרזים שמסתיימים בקרוב (48 השעות הבאות).
// מופעל על ידי ה-workflow המתוזמן "Weekly Digest". שולח רק אם יש מכרזים שמסתיימים בקרוב.
// המייל נשלח כ-multipart/alternative אמיתי: html מעוצב + text/plain קריא (ללא מרקאפ),
// וכל פריט מקושר לעמוד המכרז שלו — גם בתמונת הכרטיס וגם בכותרת.

const BASE_URL = 'https://bidli.co.il';

const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    const now = Date.now();
    const windowEnd = now + 48 * 3600 * 1000;
    const products = await base44.asServiceRole.entities.Product.filter({ status: 'active' });
    const ending = products
      .filter(p => p.ends_at && new Date(p.ends_at) > new Date(now) && new Date(p.ends_at) < new Date(windowEnd))
      .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at))
      .slice(0, 5);
    if (!ending.length) {
      return Response.json({ ok: true, sent: 0, reason: 'no_ending_auctions' });
    }

    // ── נתונים לכל פריט — בסיס משותף ל-HTML ולטקסט ──
    const items = ending.map(p => {
      const hours = Math.max(1, Math.round((new Date(p.ends_at) - now) / 3600000));
      const price = (p.current_price || p.starting_price || 0).toLocaleString('he-IL');
      const endsText = new Date(p.ends_at).toLocaleString('he-IL', {
        timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
      return { p, hours, price, endsText, url: `${BASE_URL}/auction/${p.id}` };
    });

    // ── גרסת HTML: כל כרטיס עטוף בקישור לעמוד המכרז (תמונה + כותרת לחיצים) ──
    const itemCardsHtml = items.map(({ p, hours, price, url }) => `
      <tr><td style="padding:0 0 12px 0">
        <a href="${esc(url)}" style="display:block;text-decoration:none;color:#111827;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:12px" dir="rtl">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="direction:rtl;border-collapse:collapse">
            <tr>
              <td width="80" valign="middle" style="padding-left:12px">
                ${p.image_url ? `<img src="${esc(p.image_url)}" width="72" height="72" alt="${esc(p.title)}" style="border-radius:12px;object-fit:cover;display:block;border:0" />` : ''}
              </td>
              <td valign="middle" dir="rtl" style="text-align:right">
                <div style="color:#111827;font-weight:bold;font-size:15px;line-height:1.4">${esc(p.title)}</div>
                <div style="color:#6b7280;font-size:12px;margin-top:4px">${esc(p.category || '')} · מסתיים בעוד ${hours} שעות</div>
                <div style="color:#e5893d;font-weight:bold;font-size:14px;margin-top:3px">₪${price}</div>
              </td>
            </tr>
          </table>
        </a>
      </td></tr>`).join('');

    const itemsHtml = `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="direction:rtl;border-collapse:collapse">${itemCardsHtml}</table>`;

    // ── גרסת טקסט אמיתית (ללא HTML) — לקוחות שמציגים text/plain ──
    const itemsText = items.map(({ p, hours, price, endsText, url }, i) =>
      `${i + 1}. ${(p.title || '').trim()}\n` +
      `   מחיר נוכחי: ₪${price}\n` +
      `   מסתיים: ${endsText} (בעוד ${hours} שעות)\n` +
      `   ${url}`
    ).join('\n\n');

    // בדיקה יבשה (dry_run) — מחזיר דגימה של שני הגופים בלי לשלוח דבר
    const body = await req.json().catch(() => ({}));
    if (body && body.dry_run) {
      return Response.json({
        ok: true,
        dry_run: true,
        ending: ending.length,
        sample_text: `שלום דנה, אלה 5 המכרזים שמסתיימים בקרוב ב-bidli:\n\n${itemsText}\n\nלכל המכרזים הפעילים:\n${BASE_URL}/auctions`,
        anchors_in_html: (itemsHtml.match(/<a /g) || []).length,
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

        const html = `<div dir="rtl" style="background:#f4f4f5;padding:0;margin:0;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;border-collapse:collapse">
    <tr><td align="center" style="padding:0">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse;direction:rtl">
        <tr><td align="center" style="background:#111827;padding:20px">
          <img src="https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3b6383a35_logo.png" alt="bidli" width="110" style="display:block;border:0;max-width:110px" />
        </td></tr>
        <tr><td dir="rtl" style="padding:32px 32px 8px;text-align:right">
          <div style="color:#111827;font-size:26px;font-weight:800;line-height:1.2">שלום ${esc(firstName)}, אלה מסתיימים בקרוב</div>
          <div style="color:#6b7280;font-size:15px;line-height:1.6;padding-top:8px">5 המכרזים החמים של השבוע — עדיין אפשר להציע, עד הרגע האחרון.</div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px 8px">${itemsHtml}</td></tr>
        <tr><td align="center" style="padding:16px 32px 32px">
          <a href="${BASE_URL}/auctions" style="display:inline-block;background:#111827;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:16px">לצפייה בכל המכרזים החיים</a>
        </td></tr>
        <tr><td align="center" style="background:#111827;padding:20px;color:#9ca3af;font-size:12px;line-height:1.6">
          bidli — פורטל המכרזים המוביל בישראל · מכרזים נסגרים תוך 24 שעות · ללא עמלות<br />
          הודעה זו נשלחה אליך מכיוון שנרשמת ל-bidli
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>`;

        const text = `שלום ${firstName}, אלה 5 המכרזים שמסתיימים בקרוב ב-bidli:

${itemsText}

לכל המכרזים הפעילים:
${BASE_URL}/auctions

—
bidli — פורטל המכרזים המוביל בישראל · מכרזים נסגרים תוך 24 שעות · ללא עמלות
הודעה זו נשלחה אליך מכיוון שנרשמת ל-bidli`;

        return base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: '5 מכרזים שמסתיימים בקרוב ב-bidli',
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