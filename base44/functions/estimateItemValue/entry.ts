import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// מחשבון הערכת שווי — משלב מכירות שהסתיימו באתר עם ידע שוק רחב מהאינטרנט.
// פומבי לגולשים עם הגבלת קצב לפי IP (5 בקשות בשעה).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
    if (await isRateLimitedPersisted(base44, `estimateItemValue:${ip}`, 5, 3600000)) {
      return Response.json({ error: 'rate_limited', message: 'בוצעו יותר מדי בקשות — נסה שוב בעוד כשעה' }, { status: 429 });
    }

    const { item, category } = await req.json().catch(() => ({}));
    const cleanItem = (item || '').toString().trim().slice(0, 400);
    const cleanCategory = (category || '').toString().trim().slice(0, 60);
    if (!cleanItem) return Response.json({ error: 'missing item' }, { status: 400 });

    // מכירות שהסתיימו באתר — בסיס ההשוואה המקומי
    const allEnded = await base44.asServiceRole.entities.Product.filter({ status: 'ended' });
    const siteSales = (allEnded || [])
      .filter(p => p.highest_bidder && p.current_price)
      .filter(p => !cleanCategory || (p.category || '') === cleanCategory)
      .slice(0, 12)
      .map(p => ({ title: p.title, category: p.category || '', subcategory: p.subcategory || '', final_price: p.current_price }));

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה מומחה הערכת שווי של פריטי אספנות, אמנות, תכשיטים, יודאיקה ועתיקות בשוק הישראלי.
משתמש מבקש הערכת שווי לפריט הבא: "${cleanItem}" (קטגוריה: ${cleanCategory || 'לא צוין'}).

לפניך מכירות שהסתיימו לאחרונה באתר המכרזים bidli — שקל אותן בהערכה אם רלוונטיות:
${JSON.stringify(siteSales, null, 2)}

היעזר בידע מהאינטרנט על מכירות פומביות, חנויות עתיקות ושווקי אספנות בישראל ובעולם כדי להגיע לטווח ריאלי.
החזר:
- min_price ו-max_price — טווח שווי מוערך בשקלים חדשים (ILS), מספרים שלמים.
- confidence — רמת ביטחון (low/medium/high) בהתאם לכמות הנתונים שעמדו לרשותך.
- reasoning — הסבר קצר בעברית בלבד (2-4 משפטים) שמסביר מה הנחת. חובה: הכתיבה כולה בעברית, אין לכתוב באנגלית.
- tips — עד 3 טיפים קצרים בעברית בלבד למוכר שרוצה לפרסם את הפריט במכרז.
זו הערכה בלבד ואין בה כל התחייבות. אם הפריט עמום מדי, תן טווח רחב וציין זאת ב-reasoning.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          min_price: { type: 'number' },
          max_price: { type: 'number' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          reasoning: { type: 'string' },
          tips: { type: 'array', items: { type: 'string' } },
        },
        required: ['min_price', 'max_price', 'confidence', 'reasoning'],
      },
    });

    return Response.json({
      estimate: {
        min_price: llm.min_price,
        max_price: llm.max_price,
        confidence: llm.confidence,
        reasoning: llm.reasoning,
        tips: llm.tips || [],
      },
      site_sales: siteSales.slice(0, 5),
    });
  } catch (error) {
    console.error('estimateItemValue error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}