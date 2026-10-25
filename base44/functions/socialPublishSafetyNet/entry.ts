// רשת בטיחות לפרסום חברתי: נקרא מה-Workflow על Product (create/update) כאשר
// status = active ו-fb_posted_at ריק — מוצרים שנוצרו ישירות ב-DB (seed/ייבוא)
// ולא עברו דרך publishProduct. שולח את אותו webhook במדויק באמצעות המודול
// המשותף ש-publishProduct עצמו משתמש בו, ומסמן fb_posted_at בהצלחה.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { notifyProductPublishedToFacebook } from '../../shared/facebookPublish.ts';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    // נקרא רק מה-Workflow (יוצר ה-workflow = מנהל) — חסימת קריאות ישירות
    const user = await base44.auth.me();
    if (!user || !user.email) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const productId = typeof body.product_id === 'string' ? body.product_id : '';
    if (!productId) return Response.json({ error: 'missing product_id' }, { status: 400 });

    // טעינה מחדש מה-DB — גם כשהטריגר לא צירף את הרשומה וגם לבדיקת מצב עדכנית
    const product = await base44.asServiceRole.entities.Product.get(productId).catch(() => null);
    if (!product) return Response.json({ error: 'not_found' }, { status: 404 });

    // הגנה כפולה מפני שליחה כפולה: הטריגר בדק לפני ההפעלה, כאן בודקים שוב
    if (product.fb_posted_at || product.status !== 'active') {
      return Response.json({ ok: true, sent: false, reason: product.fb_posted_at ? 'already_posted' : 'not_active' });
    }

    // אותו webhook, אותו payload, אותו סימון fb_posted_at — בדיוק כמו ב-publishProduct
    await notifyProductPublishedToFacebook(base44, product);

    // וידוא שה-webhook הצליח — הסימון fb_posted_at מתעדכן רק בהצלחה
    const after = await base44.asServiceRole.entities.Product.get(productId).catch(() => null);
    const sent = !!(after && after.fb_posted_at);
    return Response.json({ ok: true, sent, product_id: productId });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}