import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { adminShell, ADMIN_APP_URL } from '../../shared/adminEmailShell.ts';

// שליחת מייל מטעם ההנהלה — אדמינים בלבד, הבדיקה מתבצעת בשרת
// (בעבר נשלח מהדפדפן, מה שאיפשר לכל משתמש לשלוח מיילים בשם ההנהלה)
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });

    const { to, subject, title, heroEmoji, heroLine, bodyHtml, ctaUrl, ctaLabel } =
      await req.json().catch(() => ({}));
    if (!to || !subject || !bodyHtml) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    const html = adminShell({
      title: title || subject,
      heroEmoji: heroEmoji || '✉️',
      heroLine: heroLine || '',
      bodyHtml,
      ctaUrl: ctaUrl || ADMIN_APP_URL,
      ctaLabel: ctaLabel || 'חזרה לאתר bidli →',
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: String(to).trim().slice(0, 200),
      subject: String(subject).slice(0, 200),
      html,
      from_name: 'bidli הנהלה',
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendAdminEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}