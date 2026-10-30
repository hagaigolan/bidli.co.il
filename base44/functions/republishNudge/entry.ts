import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { republishNudgeEmail } from '../../shared/republishEmails.ts';

// תזכורת "פרסם שוב" — נשלחת אוטומטית למוכרים אמיתיים שמכרזם הסתיים ללא מכירה,
// 5 ימים לאחר מועד הסיום. הכפתור במייל פותח את טופס הפרסום עם כל הפריט,
// הפרטים והתמונות מלאים מראש, וניתן לערוך מחיר או כל פרט אחר לפני הפרסום.
// מופעל מה-workflow "Republish Nudge" (יומי).

const DAY = 24 * 3600 * 1000;
const AFTER_DAYS = 5; // מתי לשלוח
const CATCHUP_DAYS = 9; // חלון השלמה — אם ריצה פספסה יום, המייל עדיין יישלח
const FICTIONAL_PREFIX = 'bidli-agent'; // מוכרי הדמו של האתר — לא נשלח להם

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body?.dry_run;

    const now = Date.now();

    // ── שליחת בדיקה: מייל "פרסם שוב" לדוגמה אל הכתובת שב-request בלבד ──
    const testEmail = String(body?.test_email || '').trim();
    if (testEmail) {
      // עדיף מוצר אמיתי עם תמונה — כדי שקישורי הבדיקה יעבדו בפועל ויטענו את הפריט
      const explicitId = String(body?.test_product_id || '').trim();
      let real = explicitId
        ? await base44.asServiceRole.entities.Product.get(explicitId).catch(() => null)
        : null;
      if (!real) {
        const own = await base44.asServiceRole.entities.Product
          .filter({ seller_email: user.email }, '-created_date', 5).catch(() => []);
        const recent = await base44.asServiceRole.entities.Product
          .filter({}, '-created_date', 20).catch(() => []);
        real = [...(own || []), ...(recent || [])].find(p => p && p.id && p.image_url) || null;
      }
      // בבדיקה אפשר להצביע ישירות על מוצר קיים (המזהה והפרטים מגיעים ב-request)
      const sample = {
        id: explicitId || real?.id || 'sample-republish',
        title: String(body?.test_title || '').trim() || real?.title || 'ציור שמן מקורי — נוף ירושלמי, חתום',
        image_url: String(body?.test_image || '').trim() || real?.image_url || '',
        starting_price: real?.starting_price || 750,
        category: real?.category || 'אמנות',
        condition: real?.condition || 'מצב מעולה',
        seller_name: user.full_name || real?.seller_name || '',
        ends_at: new Date(now - AFTER_DAYS * DAY).toISOString(),
      };
      const mail = republishNudgeEmail(sample);
      const result = await base44.asServiceRole.integrations.Core.SendEmail({
        to: testEmail,
        subject: `[בדיקה] ${mail.subject}`,
        html: mail.html,
        text: mail.text,
        category: 'transactional',
      });
      return Response.json({ ok: true, test: true, sent_to: testEmail, subject: mail.subject, used_product: real?.id || null, result });
    }

    const from = new Date(now - CATCHUP_DAYS * DAY).toISOString();
    const to = new Date(now - AFTER_DAYS * DAY).toISOString();

    // מכרזים שהסתיימו לפני 5 ימים (עד 9 ימים אחורה) ולא נשלחה להם תזכורת
    const ended = await base44.asServiceRole.entities.Product.filter({
      status: 'ended',
      ends_at: { $gte: from, $lte: to },
    }, '-ends_at', 300);

    const candidates = (ended || []).filter(p =>
      p &&
      !p.highest_bidder &&                              // הסתיים ללא מכירה
      !p.republish_mail_at &&                           // טרם נשלחה תזכורת
      p.seller_email &&                                 // יש כתובת לשליחה
      !String(p.seller_user_id || '').startsWith(FICTIONAL_PREFIX) // מוכר אמיתי בלבד
    );

    // אימות שהמוכר הוא משתמש רשום ופעיל
    const emails = [...new Set(candidates.map(p => String(p.seller_email).trim().toLowerCase()))];
    const users = await base44.asServiceRole.entities.User.filter({ email: { $in: emails } }, '-created_date', 500).catch(() => []);
    const allowed = new Set((users || []).filter(u => u && !u.is_banned).map(u => String(u.email || '').trim().toLowerCase()));

    const targets = candidates.filter(p => allowed.has(String(p.seller_email).trim().toLowerCase()));

    if (dryRun) {
      return Response.json({
        ok: true,
        dry_run: true,
        matched: candidates.length,
        ended_in_window: (ended || []).length,
        eligible: targets.length,
        sample_subject: targets[0] ? republishNudgeEmail(targets[0]).subject : null,
        items: targets.slice(0, 20).map(p => ({ id: p.id, title: p.title, seller_email: p.seller_email, ends_at: p.ends_at })),
      });
    }

    if (!targets.length) {
      return Response.json({ ok: true, matched: candidates.length, eligible: 0, sent: 0 });
    }

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < targets.length; i += 6) {
      const batch = targets.slice(i, i + 6);
      const settled = await Promise.allSettled(batch.map(async p => {
        const mail = republishNudgeEmail(p);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: p.seller_email,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          category: 'transactional',
        });
        await base44.asServiceRole.entities.Product.update(p.id, {
          republish_mail_at: new Date().toISOString(),
        });
        return p.id;
      }));
      settled.forEach((res, idx) => {
        if (res.status === 'rejected') {
          failed++;
          console.error('republish nudge failed:', batch[idx]?.id, res.reason?.message || res.reason);
        } else {
          sent++;
        }
      });
    }

    return Response.json({ ok: true, matched: candidates.length, eligible: targets.length, sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}