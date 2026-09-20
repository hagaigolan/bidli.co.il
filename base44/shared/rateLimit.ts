// הגבלת קצב מבוססת מסד נתונים (ישות RateLimit) — המונים אינם נשמרים בזיכרון
// האיסולט בלבד, ולכן המגבלה תקפה בכל האיסולטים ובכל אתחול מחדש.
// מיועד לפונקציות פומביות ללא התחברות; הגישה לרשומות עצמן נעולה לשרת
// (הפונקציות פועלות דרך asServiceRole שעוקף RLS, וה-RLS חוסם משתמשי אפליקציה).

// צורך מקום אחד במכסה לחלון הנוכחי. מחזיר true אם חרג מהמכסה.
export async function isRateLimitedPersisted(base44, bucket, limit, windowMs) {
  const now = Date.now();
  const rows = await base44.asServiceRole.entities.RateLimit
    .filter({ key: bucket }, "-updated_date", 5).catch(() => []);
  const row = (rows || []).find(r => r.window_start && now - Date.parse(r.window_start) < windowMs);
  if (!row) {
    await base44.asServiceRole.entities.RateLimit.create({
      key: bucket,
      window_start: new Date(now).toISOString(),
      count: 1,
    }).catch(() => null);
    return false;
  }
  if (row.count >= limit) return true;
  await base44.asServiceRole.entities.RateLimit
    .update(row.id, { count: row.count + 1 }).catch(() => null);
  return false;
}