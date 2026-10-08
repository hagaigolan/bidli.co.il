import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';

// דיגסט שבועי — שולח לכל המשתמשים הרשומים את 5 המכרזים שמסתיימים בקרוב (48 השעות הבאות).
// מופעל על ידי ה-workflow המתוזמן "Weekly Digest". שולח רק אם יש מכרזים שמסתיימים בקרוב.
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

    const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const itemRows = ending.map(p => {
      const hours = Math.max(1, Math.round((new Date(p.ends_at) - now) / 3600000));
      const price = (p.current_price || p.starting_price || 0).toLocaleString('he-IL');
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb" dir="rtl">
          <table role="presentation" width="100%" dir="rtl" style="direction:rtl"><tr>
            <td width="76" valign="top">${p.image_url ? `<img src="${esc(p.image_url)}" width="64" height="64" alt="${esc(p.title)}" style="border-radius:12px;object-fit:cover;display:block" />` : ''}</td>
            <td valign="middle" dir="rtl">
              <a href="https://bidli.co.il/auction/${p.id}" style="color:#111827;font-weight:bold;font-size:14px;text-decoration:none" dir="rtl">${esc(p.title)}</a>
              <div style="color:#6b7280;font-size:12px;margin-top:4px" dir="rtl">${esc(p.category || '')} · מסתיים בעוד ${hours} שעות</div>
              <div style="color:#e5893d;font-weight:bold;font-size:13px;margin-top:2px" dir="rtl">₪${price}</div>
            </td>
          </tr></table>
        </td>
      </tr>`;
    }).join('');
    const itemsHtml = `<table width="100%" role="presentation" dir="rtl" style="direction:rtl;border-collapse:collapse">${itemRows}</table>`;

    // הנמענים — כל המשתמשים הרשומים (ללא כפילויות אימייל)
    const users = await base44.asServiceRole.entities.User.list('-created_date', 300);
    const recipients = [...new Map(users.filter(u => u.email).map(u => [u.email, u])).values()];

    let sent = 0;
    for (let i = 0; i < recipients.length; i += 6) {
      const batch = recipients.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map(u =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          template_name: 'WeeklyDigest',
          variables: {
            first_name: (u.full_name || '').split(' ')[0] || 'שלום',
            items_html: itemsHtml,
          },
        })
      ));
      sent += settled.filter(s => s.status === 'fulfilled').length;
    }

    return Response.json({ ok: true, sent, ending: ending.length, recipients: recipients.length });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}