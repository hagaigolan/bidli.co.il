import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const APP_URL = 'https://bid-it-now-app.base44.app';

// Scheduled by the "Favorite Reminder" workflow (every 15 minutes):
// emails users who favorited an item whose auction closes within the next hour.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const favs = await base44.asServiceRole.entities.Favorite.list('-created_date', 500);
    let sent = 0;

    for (const fav of favs) {
      if (fav.reminder_sent) continue;
      const items = await base44.asServiceRole.entities.Product.filter({ id: fav.product_id });
      if (!items.length) {
        await base44.asServiceRole.entities.Favorite.update(fav.id, { reminder_sent: true });
        continue;
      }
      const product = items[0];
      const minutesLeft = (new Date(product.ends_at).getTime() - now) / 60000;
      if (minutesLeft <= 0) {
        // Already ended — mark so we never scan it again
        await base44.asServiceRole.entities.Favorite.update(fav.id, { reminder_sent: true });
        continue;
      }
      if (minutesLeft > 60) continue; // not closing yet — a later run will catch it

      const email = (fav.notify_email || '').trim();
      if (email) {
        const link = `${APP_URL}/auction/${product.id}`;
        const price = (product.current_price || product.starting_price || 0).toLocaleString();
        const mins = Math.max(1, Math.round(minutesLeft));
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `⏰ שעה אחרונה! המכרז "${product.title}" נסגר בקרוב`,
            body: `שלום,\n\nהמכרז ששמרת למועדפים "${product.title}" נסגר בעוד כ-${mins} דקות!\nמחיר נוכחי: ₪${price}\n\nאל תפסיד את המציאה — הגש הצעה עכשיו:\n${link}\n\nבהצלחה!\nצוות bid-it`,
          });
          sent++;
        } catch (e) {
          console.error('favoriteReminder email failed:', e?.message || e);
        }
      }
      await base44.asServiceRole.entities.Favorite.update(fav.id, { reminder_sent: true });
    }

    return Response.json({ scanned: favs.length, sent });
  } catch (error) {
    console.error('favoriteReminder error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}