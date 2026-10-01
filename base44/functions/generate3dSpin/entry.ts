import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// תצוגת 3D באמצעות AI — מייצר זוויות נוספות של תמונת המוצר (צד ואחורי) ומחזיר
// רצף תמונות לסחרור 360°. התוצאות נשמרות על המוצר (spin3d_urls) כך שכל צפייה
// נוספת באותו מוצר נטענת מיידית מהמטמון, בלי עלות נוספת.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const productId = String(body.product_id || '');
    if (!productId) {
      return Response.json({ error: 'Missing product_id' }, { status: 400 });
    }

    const products = await base44.asServiceRole.entities.Product.filter({ id: productId });
    const product = products[0];
    if (!product) {
      return Response.json({ error: 'not_found' }, { status: 404 });
    }

    // מטמון — זוויות שנוצרו כבר מוחזרות מיד
    const cached = Array.isArray(product.spin3d_urls)
      ? product.spin3d_urls.filter(Boolean)
      : [];
    if (cached.length >= 2) {
      return Response.json({
        cached: true,
        images: [product.image_url, ...cached].filter(Boolean),
      });
    }

    // הגבלת יצירה: 20 יצירות לשעה למשתמש (כל יצירה = 2 תמונות AI)
    const limited = await isRateLimitedPersisted(
      base44, `generate3dSpin:${user.email}`, 20, 60 * 60 * 1000
    );
    if (limited) {
      return Response.json({ error: 'rate_limited' }, { status: 429 });
    }

    const references = [product.image_url, ...(product.image_urls || [])]
      .filter(Boolean);
    if (!references.length) {
      return Response.json({ error: 'no_images' }, { status: 400 });
    }

    const basePrompt =
      'Professional studio product photograph for an auction listing: the EXACT same item as in the reference photo — same object, materials, colors, proportions, markings, labels and condition. ' +
      'Identical clean neutral background and soft studio lighting as the reference. Catalog style, no text or logos in the image.';

    const angles = [
      'Angle: three-quarter left side view of the item (rotated roughly 45 degrees to the left).',
      'Angle: rear view of the item seen from behind.',
    ];

    const generated = (await Promise.all(
      angles.map(angle =>
        base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: `${basePrompt} ${angle}`,
          existing_image_urls: references.slice(0, 2),
        }).catch(() => null)
      )
    )).map(img => img?.url).filter(Boolean);

    if (!generated.length) {
      return Response.json({ error: 'generation_failed' }, { status: 502 });
    }

    await base44.entities.Product.update(product.id, { spin3d_urls: generated });

    return Response.json({
      cached: false,
      images: [product.image_url, ...generated].filter(Boolean),
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}