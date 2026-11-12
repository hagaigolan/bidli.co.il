import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// מחיר המכרז ההפוך מחושב בשרת — הלקוח מציג אותו אבל לא קובע אותו.
// יורד לינארית ממחיר המחירון לרצפה לאורך חלון המכרז.
function priceAt(deal: any, now: number): number {
  const list = Number(deal?.list_price) || 0;
  const floor = Number(deal?.floor_price) || 0;
  const start = new Date(deal?.auction_starts_at || deal?.created_date || 0).getTime();
  const end = new Date(deal?.auction_ends_at || 0).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return floor || list;
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return Math.max(floor, Math.round(list - (list - floor) * progress));
}

// "קנה עכשיו": סוגר את החלון במחיר הרגע, מתעד את הקונה ברשומה הפרטית שלו
// ומחשב את עמלת ההצלה ואת היתרה שעוברת לעסק (מודל ה-Success Fee).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const { deal_id, phone } = await req.json().catch(() => ({}));
    if (!deal_id) return Response.json({ error: 'missing deal_id' }, { status: 400 });

    const deal = await base44.asServiceRole.entities.LastMinuteDeal
      .get(deal_id)
      .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
    if (!deal) return Response.json({ error: 'not found' }, { status: 404 });

    // מכרז הדגמה ("פרסומת לדוגמה") אינו שירות אמיתי — לא נמכר לאף אחד
    if (deal.is_demo) return Response.json({ error: 'demo_deal' }, { status: 403 });

    if (deal.status !== 'active') return Response.json({ error: 'deal_closed', status: deal.status }, { status: 409 });

    const now = Date.now();
    if (new Date(deal.auction_ends_at).getTime() <= now) {
      await base44.asServiceRole.entities.LastMinuteDeal.update(deal.id, { status: 'expired' });
      return Response.json({ error: 'auction_ended' }, { status: 409 });
    }

    if (deal.created_by_id && deal.created_by_id === user.id) {
      return Response.json({ error: 'own_deal' }, { status: 403 });
    }

    const price = priceAt(deal, now);
    const feeRate = Number(deal.fee_rate ?? 12) || 0;
    const platformFee = Math.round((price * feeRate) / 100);
    const payout = price - platformFee;

    const updated = await base44.asServiceRole.entities.LastMinuteDeal.update(deal.id, {
      status: 'sold',
      sold_price: price,
      sold_at: new Date(now).toISOString(),
      buyer_user_id: user.id,
    });

    // הרשומה הפרטית: כתובת וטלפון העסק + פרטי הקונה + פירוט העמלה.
    // העסקה כבר נסגרה — כשל כאן לא מבטל אותה, רק מדווח.
    try {
      const existing = await base44.asServiceRole.entities.LastMinuteBooking.filter({ deal_id: deal.id });
      const rows = Array.isArray(existing) ? existing : (existing?.items || []);
      const details = {
        buyer_user_id: user.id,
        buyer_name: user.full_name || '',
        buyer_email: user.email || '',
        buyer_phone: String(phone || '').trim().slice(0, 40),
        sold_price: price,
        platform_fee: platformFee,
        business_payout: payout,
      };
      if (rows.length) {
        await base44.asServiceRole.entities.LastMinuteBooking.update(rows[0].id, details);
      } else {
        await base44.asServiceRole.entities.LastMinuteBooking.create({
          deal_id: deal.id,
          deal_title: deal.title,
          business_name: deal.business_name,
          slot_start: deal.slot_start,
          ...details,
        });
      }
    } catch (bookingError) {
      console.error('last-minute booking write failed:', bookingError);
    }

    return Response.json({ ok: true, deal: updated, sold_price: price, platform_fee: platformFee, business_payout: payout });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}