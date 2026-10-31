import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// ספירת צפיות במכרז — מספר בלבד, לצורך מדדי הביצוע של המוכרים.
// הצפייה נדרשת גם לאורחים, ולכן העדכון מתבצע בהרשאת שירות.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id } = await req.json().catch(() => ({}));
    if (!product_id || typeof product_id !== 'string' || product_id.length > 64) {
      return Response.json({ error: 'product_id is required' }, { status: 400 });
    }
    const product = await base44.asServiceRole.entities.Product.get(product_id)
      .catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!product) return Response.json({ error: 'Not found' }, { status: 404 });
    const views = (product.views || 0) + 1;
    await base44.asServiceRole.entities.Product.update(product_id, { views });
    return Response.json({ views });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}