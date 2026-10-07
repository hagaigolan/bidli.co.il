import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// מחיקת חשבון עצמית (GDPR/חוק הגנת הפרטיות): מוחק את כל הרשומות השייכות
// למשתמש המחובר לפי כתובת האימייל שלו, ולאחר מכן מנסה למחוק את רשומת
// המשתמש עצמה. מוגן באימות — כל משתמש יכול למחוק רק את עצמו.

const DELETE_PLAN: Array<[string, string]> = [
  ['Product', 'seller_email'],
  ['BarterItem', 'owner_email'],
  ['Favorite', 'owner_key'],
  ['Bid', 'bidder_email'],
  ['AppNotification', 'recipient_email'],
  ['CollectionComment', 'collector_key'],
  ['CollectionComment', 'commenter_key'],
  ['CollectionLike', 'collector_key'],
  ['CollectionLike', 'liked_by_key'],
  ['CollectorFollow', 'follower_key'],
  ['CollectorFollow', 'followed_key'],
  ['InterestAlert', 'owner_email'],
  ['SavedSearch', 'owner_email'],
  ['NotificationPreference', 'email'],
  ['AutoBid', 'bidder_email'],
  ['Review', 'reviewer_email'],
  ['Review', 'seller_email'],
  ['ProductQuestion', 'seller_email'],
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || !me.email) {
      return Response.json({ error: 'unauthorized' }, { status: 401 });
    }
    const email = String(me.email).trim().toLowerCase();

    const deleted: Record<string, number> = {};
    // באצ'ים של 6 מחיקות במקביל (הנחיית זמן ריצה של פונקציות שרת)
    for (let i = 0; i < DELETE_PLAN.length; i += 6) {
      await Promise.allSettled(DELETE_PLAN.slice(i, i + 6).map(async ([entity, field]) => {
        const rows = await base44.asServiceRole.entities[entity]
          .filter({ [field]: email }, '-created_date', 500).catch(() => []);
        if (rows && rows.length) {
          await base44.asServiceRole.entities[entity]
            .deleteMany({ [field]: email }).catch(() => null);
          deleted[entity] = (deleted[entity] || 0) + rows.length;
        }
      }));
    }

    // מחיקת רשומת המשתמש עצמה (דורשת הרמה לשירות-מלא)
    let user_deleted = false;
    try {
      const users = await base44.asServiceRole.entities.User
        .filter({ email }, '-created_date', 5);
      for (const u of (users || [])) {
        await base44.asServiceRole.entities.User.delete(u.id).catch(() => null);
      }
      user_deleted = (users || []).length > 0;
    } catch (e) {
      console.error('user record deletion failed:', e?.message || e);
    }

    return Response.json({ ok: true, deleted, user_deleted });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}