import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// פרופיל אמון למוכר — נתונים אמיתיים בלבד מתוך בסיס הנתונים:
// תאריך ההצטרפות, מספר המכרזים שלו (פעילים + שהסתיימו) ודירוג מביקורות קיימות.
// אין כאן שום ערך מומצא — כשאין ביקורות הדירוג מוחזר כ-null.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body.seller_email === 'string' ? body.seller_email.trim() : '';
    const userId = typeof body.seller_user_id === 'string' ? body.seller_user_id.trim() : '';
    if ((!rawEmail && !userId) || rawEmail.length > 200 || userId.length > 64) {
      return Response.json({ error: 'seller_email or seller_user_id is required' }, { status: 400 });
    }

    // כל המכרזים של המוכר — לפי אימייל או לפי מזהה משתמש
    const query = rawEmail ? { seller_email: rawEmail } : { seller_user_id: userId };
    const products = await base44.asServiceRole.entities.Product.filter(query, 'created_date', 500);

    const now = Date.now();
    let active = 0;
    let ended = 0;
    for (const p of products) {
      if (p.status === 'cancelled') continue;
      if (p.ends_at && new Date(p.ends_at) > now) active += 1;
      else ended += 1;
    }

    // תאריך ההצטרפות של המוכר — לפי רשומת המשתמש, ואם אין — לפי המכרז הראשון שלו
    const userEmail = rawEmail || products[0]?.seller_email || '';
    let joined = null;
    try {
      const users = userId
        ? await base44.asServiceRole.entities.User.filter({ id: userId })
        : (userEmail ? await base44.asServiceRole.entities.User.filter({ email: userEmail.toLowerCase() }) : []);
      joined = users?.[0]?.created_date || null;
    } catch {
      joined = null;
    }
    if (!joined) {
      const oldest = products[products.length - 1];
      joined = oldest?.created_date || null;
    }

    // דירוג אמיתי בלבד — מחושב מהביקורות שנכתבו על המוכר
    const reviewEmail = userEmail || '';
    const reviews = reviewEmail
      ? await base44.asServiceRole.entities.Review.filter({ seller_email: reviewEmail }, '-created_date', 300)
      : [];
    const rated = reviews.filter(r => Number(r.rating) > 0);
    const rating = rated.length
      ? Math.round((rated.reduce((sum, r) => sum + Number(r.rating), 0) / rated.length) * 10) / 10
      : null;

    return Response.json({
      name: products[0]?.seller_name || '',
      joined_at: joined,
      auctions_count: active + ended,
      active_count: active,
      ended_count: ended,
      reviews_count: rated.length,
      rating,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}