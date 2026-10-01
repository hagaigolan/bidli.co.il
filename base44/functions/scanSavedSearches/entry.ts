import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const APP_URL = 'https://bidli.co.il';
// תדירות ההתראות — מספר השעות המינימלי בין סריקה לסריקה
const FREQ_MIN_HOURS = { instant: 0, daily: 20, weekly: 24 * 6.5 };

// מופעל מתוזמן (כל שעה) מהרכיב "Saved Search Scanner":
// בודק מכרזים חדשים שפורסמו מאז הסריקה הקודמת של כל חיפוש שמור,
// תואמים לקטגוריה ולמחיר המקסימלי — ושולח מייל והתראה בפעמון לבעל החיפוש.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const searches = await base44.asServiceRole.entities.SavedSearch.filter({ active: true }, '-created_date', 200);
    const recentProducts = await base44.asServiceRole.entities.Product.list('-created_date', 100);
    let notified = 0;

    for (const search of (searches || [])) {
      const minHours = FREQ_MIN_HOURS[search.frequency] ?? 20;
      const last = search.last_scan_at ? new Date(search.last_scan_at).getTime() : null;
      if (last && minHours > 0 && now.getTime() - last < minHours * 3600000) continue;

      // אם אין סריקה קודמת — מכסים רק את שבעת הימים האחרונים כדי לא להציף מכרזים ישנים
      const since = last || (now.getTime() - 7 * 24 * 3600000);

      const matches = (recentProducts || []).filter(p => {
        const created = new Date(p.created_date).getTime();
        if (!(created > since)) return false;
        if (p.status !== 'active' || !p.ends_at || new Date(p.ends_at) <= now) return false;
        if (search.category && (p.category || '') !== search.category) return false;
        if (search.max_price && (p.starting_price || 0) > search.max_price) return false;
        return true;
      }).slice(0, 5);

      if (matches.length && search.owner_email) {
        if (search.notify_email !== false) {
          const lines = matches.map(p =>
            `• ${p.title} — פתיחה: ₪${(p.starting_price || 0).toLocaleString('he-IL')}\n  ${APP_URL}/auction/${p.id}`
          ).join('\n');
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: search.owner_email,
              subject: `🔔 ${matches.length} מכרזים חדשים תואמים לחיפוש שלך — ${search.label}`,
              body: `שלום ${search.owner_name || ''},\n\nנמצאו מכרזים חדשים התואמים לחיפוש השמור שלך "${search.label}":\n\n${lines}\n\nההצעות נסגרות מהר — אל תפסיד/י!\n\nצוות bidli`,
            });
            notified++;
          } catch (e) {
            console.error('scanSavedSearches email failed:', e?.message || e);
          }
        }

        await base44.asServiceRole.entities.AppNotification.bulkCreate(matches.map(p => ({
          recipient_email: (search.owner_email || '').trim().toLowerCase(),
          recipient_name: search.owner_name || '',
          type: 'new_match',
          title: `מכרז חדש תואם לחיפוש שלך — "${search.label}"`,
          body: `${p.title} — פתיחה ב-₪${(p.starting_price || 0).toLocaleString('he-IL')}`,
          product_id: p.id,
          product_title: p.title,
          product_image_url: p.image_url || '',
          link: `/auction/${p.id}`,
        }))).catch(() => {});
      }

      await base44.asServiceRole.entities.SavedSearch.update(search.id, { last_scan_at: now.toISOString() }).catch(() => {});
    }

    return Response.json({ scanned: (searches || []).length, notified });
  } catch (error) {
    console.error('scanSavedSearches error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}