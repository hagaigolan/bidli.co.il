import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// ספירת סימוני "מועדפים" למוצר — מספר בלבד, ללא חשיפת זהות המשתמשים.
// הצפייה נדרשת גם לאורחים בדף המכרז, ולכן הספירה מתבצעת בהרשאת שירות
// (קריאת Favorite כרגיל מוגבלת לבעל הסימון בלבד).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id || typeof product_id !== 'string' || product_id.length > 64) {
      return Response.json({ error: 'product_id is required' }, { status: 400 });
    }
    const count = await base44.asServiceRole.entities.Favorite.count({ product_id });
    return Response.json({ count: count || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}