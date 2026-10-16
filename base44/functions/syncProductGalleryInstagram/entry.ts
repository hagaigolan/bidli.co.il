import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { postProductToInstagram } from '../../shared/instagramSync.ts';

// שיתוף גלריית מכרז לחשבון האינסטגרם העסקי — מחייב משתמש מחובר
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const productId = String(body.product_id || '').trim();
    if (!productId) return Response.json({ error: 'missing product_id' }, { status: 400 });

    const product = await base44.entities.Product.get(productId).catch(() => null);
    if (!product) return Response.json({ error: 'not found' }, { status: 404 });

    const result = await postProductToInstagram(base44, product);
    return Response.json(result, { status: result.ok ? 200 : 502 });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}