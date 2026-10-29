import { createClientFromRequest } from 'npm:@base44/sdk@0.8.53';
import { BASE_URL, pickEndingAuctions, toDigestItems, buildDigestEmail } from '../../shared/buildWeeklyDigest.ts';

// דייג'סט שבועי — נשלח פעם בשבוע, יום ראשון 19:00 (Asia/Jerusalem), מה-workflow "Weekly Digest".
// נמענים: איחוד של משתמשים רשומים (User) ושל נרשמים ל-NotificationPreference, לפי אימייל וללא כפילויות.
// מדולגים: notify_email=false, חשבונות מושהים/לא פעילים, ומי שהמערכת חסמה (הסרה מהרשימה/החזרה/ספאם).
// כל ריצה מתועדת ברישום סיכום ב-ActivationLog (תאריך, נשלחים, כשלים, מדולגים) למניעת שליחה כפולה.
// בניית המייל עצמה יושבת ב-base44/shared/buildWeeklyDigest.ts (משותף עם sendDigestTest).

const DIGEST_LOG_KEY = 'weekly-digest@bidli.co.il'; // מזהה רישום הסיכום — לא כתובת של משתמש אמיתי
const MIN_HOURS_BETWEEN_RUNS = 6 * 24; // 6 ימים — מונע שליחה כפולה של אותה ריצה שבועית

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

    // ── הנמענים: User + NotificationPreference, איחוד לפי אימייל ──
    const [users, prefs] = await Promise.all([
      base44.asServiceRole.entities.User.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.NotificationPreference.list('-created_date', 1000).catch(() => []),
    ]);

    const byEmail = new Map(); // email(lowercase) -> { email, firstName }
    const blocked = new Set(); // notify_email=false / חשבון מושהה
    const banned = new Set();

    for (const u of users || []) {
      const email = String(u.email || '').trim().toLowerCase();
      if (!email) continue;
      if (u.is_banned) { banned.add(email); blocked.add(email); continue; }
      byEmail.set(email, { email: String(u.email).trim(), firstName: (u.full_name || '').split(' ')[0] || '' });
    }

    for (const p of prefs || []) {
      const email = String(p.email || '').trim().toLowerCase();
      if (!email) continue;
      if (p.notify_email === false) { blocked.add(email); continue; }
      if (banned.has(email)) continue;
      const prefName = (p.name || '').split(' ')[0] || '';
      if (!byEmail.has(email)) {
        byEmail.set(email, { email: String(p.email).trim(), firstName: prefName });
      } else if (!byEmail.get(email).firstName && prefName) {
        byEmail.get(email).firstName = prefName;
      }
    }

    const recipients = [...byEmail.values()].filter(r => !blocked.has(r.email.toLowerCase()));

    // בדיקה יבשה (dry_run) — מחזיר דגימה של שני הגופים ואת מצב הנמענים בלי לשלוח דבר
    const body = await req.json().catch(() => ({}));
    if (body && body.dry_run) {
      const sample = buildDigestEmail(items, 'דנה');
      return Response.json({
        ok: true,
        dry_run: true,
        ending: ending.length,
        recipients: recipients.length,
        blocked: blocked.size,
        sample_text: sample.text,
        anchors_in_html: (sample.html.match(/<a /g) || []).length,
        auctions_link: `${BASE_URL}/auctions`,
      });
    }

    // ── שליחה אחת בשבוע בלבד: אם כבר נשלחה ריצה בששת הימים האחרונים — לא שולחים שוב ──
    const recentLogs = await base44.asServiceRole.entities.ActivationLog
      .filter({ user_email: DIGEST_LOG_KEY }, '-sent_at', 5).catch(() => []);
    const alreadySent = (recentLogs || []).some(l =>
      now - new Date(l.sent_at).getTime() < MIN_HOURS_BETWEEN_RUNS * 3600 * 1000);
    if (alreadySent) {
      return Response.json({ ok: true, sent: 0, reason: 'already_sent_this_week', recipients: recipients.length });
    }

    let sent = 0;
    let failed = 0;
    let suppressed = 0;
    for (let i = 0; i < recipients.length; i += 6) {
      const batch = recipients.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map(r => {
        const { subject, html, text } = buildDigestEmail(items, r.firstName || 'שלום');
        return base44.asServiceRole.integrations.Core.SendEmail({
          to: r.email,
          subject,
          html,
          text,
          category: 'marketing',
        });
      }));
      settled.forEach(res => {
        if (res.status === 'rejected') {
          failed++;
        } else if (res.value && res.value.success === false) {
          // הסיר את עצמו מהרשימה / כתובת חסומה — לא נשלח, לא נספר כהצלחה
          suppressed++;
          console.log('digest send suppressed:', res.value.reason || 'unknown');
        } else {
          sent++;
        }
      });
    }

    // ── רישום סיכום הריצה (תאריך, נשלחים, כשלים, מדולגים) ──
    await base44.asServiceRole.entities.ActivationLog.create({
      user_email: DIGEST_LOG_KEY,
      sent_at: new Date().toISOString(),
      description: `דייג'סט שבועי — ${items.length} מכרזים · נשלחו ${sent} · כשלים ${failed} · מדולגו ${suppressed} · נמענים ${recipients.length}`,
    }).catch(e => console.error('digest log failed:', e?.message || e));

    return Response.json({ ok: true, sent, failed, suppressed, ending: ending.length, recipients: recipients.length });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}