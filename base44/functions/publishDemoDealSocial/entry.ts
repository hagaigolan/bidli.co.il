import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { postDemoBatchToInstagram } from '../../shared/lastMinuteSocial.ts';

// פרסום מכרזי ההדגמה של היום לאינסטגרם — שלב שני בוורקפלואו היומי, אחרי
// publishDemoLastMinute. מפרסם פוסט אחד עם כל החלונות שעוד לא פורסמו,
// ומסמן ig_posted_at כדי לא לפרסם פעמיים.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const since = Date.now() - 24 * 60 * 60 * 1000;
    const all = await base44.asServiceRole.entities.LastMinuteDeal.filter({ is_demo: true });
    const rows = Array.isArray(all) ? all : (all?.items || []);
    const pending = rows
      .filter((d: any) => !d.ig_posted_at && d.status === 'active' && new Date(d.created_date).getTime() >= since)
      .sort((a: any, b: any) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
      .slice(0, 5);

    if (!pending.length) return Response.json({ ok: true, sent: false, reason: 'nothing_pending' });

    const result = await postDemoBatchToInstagram(base44, pending);
    if (!result.ok) return Response.json({ ok: false, error: result.error }, { status: 502 });

    const postedAt = new Date().toISOString();
    await base44.asServiceRole.entities.LastMinuteDeal.bulkUpdate(
      pending.map((d: any) => ({ id: d.id, ig_posted_at: postedAt })),
    );

    return Response.json({ ok: true, sent: true, post_id: result.post_id, deals: pending.length });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}