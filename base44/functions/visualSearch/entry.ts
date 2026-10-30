import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// חיפוש חזותי — המשתמש מעלה תמונה של פריט, המודל מזהה מהו,
// והמערכת מחזירה מכרזים דומים מהקטלוג.

const CATEGORIES = [
  "אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "תכשיטים", "עיצוב הבית",
  "אופנה", "רכבים", 'נדל"ן', "ספרים", "בולים", "מטבעות", "כלי נגינה",
  "יין ואלכוהול", "שעונים", "אלקטרוניקה",
];

// ניקוד רלוונטיות: התאמת מילות מפתח היא הקובעת, הקטגוריה רק מחזקת
// מילים כלליות מדי — לא מעידות על דמיון בין פריטים
const GENERIC_WORDS = new Set([
  'חשמלי', 'מטבל', 'מטבח', 'חדש', 'ישן', 'וינטג', "וינטג'", 'עתיק', 'יפה',
  'איכותי', 'מקצועי', 'אלגנטי', 'גדול', 'קטן', 'בית', 'מודרני', 'קלאסי',
]);

function scoreProduct(product, analysis) {
  const hay = [
    product.title, product.description, product.category,
    product.subcategory, product.condition,
  ].filter(Boolean).join(' ').toLowerCase();

  let hits = 0;
  let specific = 0;
  for (const raw of analysis.keywords || []) {
    const kw = String(raw || '').trim().toLowerCase();
    if (kw.length < 2) continue;
    if (GENERIC_WORDS.has(kw)) continue;
    if (!hay.includes(kw)) continue;
    hits++;
    // מילה ארוכה או צירוף מילים מעידים על התאמה מדויקת יותר
    if (kw.length >= 5 || kw.includes(' ')) specific++;
  }

  const typeHit = !!analysis.item_type && hay.includes(String(analysis.item_type).toLowerCase());

  let score = hits * 4 + specific * 3;
  if (typeHit) score += 3;
  if (analysis.category && product.category === analysis.category) score += 2;

  // מכרז חי עדיף על פריט שהסתיים — כדי שהמשתמש יוכל להציע על מה שמצא
  const live = product.status === 'active' && new Date(product.ends_at).getTime() > Date.now();
  if (live) score += 6;

  return { score, relevant: hits > 0 || typeHit, live };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const imageUrl = String(body?.image_url || '').trim();
    if (!imageUrl) return Response.json({ error: 'image_url is required' }, { status: 400 });

    // רק קבצים שהועלו דרך המערכת — מניעת שליפת כתובות חיצוניות
    let host = '';
    try { host = new URL(imageUrl).hostname.toLowerCase(); } catch { host = ''; }
    if (!host.endsWith('base44.com')) {
      return Response.json({ error: 'יש להעלות תמונה מתוך המערכת' }, { status: 400 });
    }

    const ip = String(req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (await isRateLimitedPersisted(base44, `visualSearch:${ip}`, 15, 60 * 60 * 1000)) {
      return Response.json({ error: 'בוצעו יותר מדי חיפושים — נסו שוב בעוד שעה' }, { status: 429 });
    }

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה מנוע חיפוש חזותי בשוק מכרזים ישראלי לאמנות, תכשיטים, עתיקות ואספנות.
נתח את התמונה שהועלת והחזר:
1. item_type — מה הפריט, בשתיים עד ארבע מילים בעברית (למשל: "ציור שמן", "טבעת זהב", "שעון יד").
2. category — הקטגוריה המתאימה ביותר מתוך הרשימה: ${CATEGORIES.join(', ')}.
3. keywords — שלוש עד שש מילות חיפוש בעברית שיעזרו למצוא פריטים דומים בקטלוג (חומר, סגנון, תקופה, סוג החפץ). מילים בודדות, בלי מילות קישור.
4. description — תיאור קצר של הפריט בשורה אחת בעברית.
אם התמונה אינה של חפץ (למשל נוף, מסך, אדם בלבד) — החזר keywords ריקים ו-item_type כללי.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          item_type: { type: 'string' },
          category: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
        },
        required: ['item_type', 'keywords'],
      },
    });

    const result = (analysis && typeof analysis === 'object') ? analysis : {};
    const keywords = Array.isArray(result.keywords)
      ? result.keywords.map((k) => String(k || '').trim()).filter((k) => k.length >= 2).slice(0, 6)
      : [];

    const page = await base44.asServiceRole.entities.Product.filter({}, { sort: '-created_date', limit: 200 });
    const products = (page?.items || []).filter((p) => p && p.id && p.status !== 'cancelled');

    const analysisForMatch = { ...result, keywords };
    let ranked = products
      .map((p) => ({ product: p, ...scoreProduct(p, analysisForMatch) }))
      .filter((row) => row.relevant)
      .sort((a, b) => (Number(b.live) - Number(a.live)) || (b.score - a.score))
      .slice(0, 12)
      .map((row) => row.product);

    // אין התאמת מילות מפתח — מציגים מכרזים חיים באותה קטגוריה, אם זוהתה
    if (!ranked.length && result.category) {
      ranked = products
        .filter((p) => p.category === result.category)
        .sort((a, b) => (b.status === 'active' ? 1 : 0) - (a.status === 'active' ? 1 : 0))
        .slice(0, 8);
    }

    const items = ranked.map((p) => ({
      id: p.id,
      title: p.title,
      image_url: p.image_url,
      category: p.category,
      condition: p.condition,
      location: p.location,
      current_price: p.current_price,
      starting_price: p.starting_price,
      bid_count: p.bid_count,
      status: p.status,
      ends_at: p.ends_at,
    }));

    return Response.json({
      ok: true,
      analysis: {
        item_type: String(result.item_type || ''),
        category: String(result.category || ''),
        keywords,
        description: String(result.description || ''),
      },
      count: items.length,
      items,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}