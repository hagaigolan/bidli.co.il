import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail, ADMIN_EMAIL } from '../../shared/gmailSender.ts';
import { adminShell, escapeHtml, ADMIN_APP_URL } from '../../shared/adminEmailShell.ts';

// מנוע טיוטות המגזין — יוצר טיוטת מאמר חדשה מטעם סוכן ה-AI.
// מסיווג לסירוגין בין מאמר מחירון (מבוסס מכירות שהסתיימו בפועל באתר
// + ידע אינטרנטי) לבין מדריך מומחים. הטיוטה נשמרת עם סטטוס draft
// ("ממתין לאישור") ומייל נשלח לאדמין. פרסום רק לאחר אישור בממשק הניהול.
// מופעל על ידי ה-workflow המתוזמן ומכפתור "צור טיוטה" אצל האדמין.

const CATEGORIES = [
  "אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "מטבעות", "בולים",
  "תכשיטים", "שעונים", "עיצוב הבית", "אופנה", "ספרים", "כלי נגינה",
  "יין ואלכוהול", "אלקטרוניקה",
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'forbidden' }, { status: 403 });
    }

    // סירוגין בין מחירון למדריך, ורוטציית קטגוריות — הקטגוריה עם הכי מעט מאמרים
    const articles = await base44.asServiceRole.entities.Article.list('-created_date', 100);
    const makePriceGuide = articles.length % 2 === 1;
    const counts = new Map(CATEGORIES.map(c => [c, 0]));
    for (const a of articles) if (counts.has(a.category)) counts.set(a.category, counts.get(a.category) + 1);
    const category = [...CATEGORIES].sort((a, b) => counts.get(a) - counts.get(b))[0];

    // מחירון — טווחי מחירים ממכירות שהסתיימו בפועל בקטגוריה
    let salesStats = '';
    if (makePriceGuide) {
      const products = await base44.asServiceRole.entities.Product.filter({ category }, '-updated_date', 200);
      const ended = products.filter(p =>
        p.highest_bidder && p.current_price > 0 && p.ends_at && new Date(p.ends_at) <= new Date());
      const bySub = {};
      for (const p of ended) {
        const sub = String(p.subcategory || 'כללי').slice(0, 60);
        if (!bySub[sub]) bySub[sub] = [];
        bySub[sub].push(p.current_price);
      }
      salesStats = Object.entries(bySub).map(([sub, prices]) => {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
        return `${sub}: ${prices.length} מכירות, טווח ₪${min}–₪${max}, ממוצע ₪${avg}`;
      }).join('\n') || '(אין עדיין מכירות שהסתיימו בקטגוריה — הסתמך על ידע אינטרנטי בלבד)';
    }

    const typeBrief = makePriceGuide
      ? `כתוב מאמר מחירון לקטגוריה "${category}": טווחי מחירים לפי תת-קטגוריה בשוק הישראלי.
אלה מכירות שהסתיימו בפועל באתר bidli — שלב אותן כבסיס, והשלם מידע אינטרנטי עדכני:
${salesStats}
כלול טבלת מחירון לפי תת-קטגוריה, גורמים המשפיעים על המחיר, ואזכור תאריך העדכון.`
      : `כתוב מדריך מומחים לקטגוריה "${category}" — בחר אחד מהנושאים: זיהוי זיופים, הערכת שווי, אחסון ושימור, או סיפור מרתק מאחורי סוג פריט נחשק.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${typeBrief}

דרישות:
- עברית תקנית בלבד, גוף המאמר ב-Markdown.
- כותרת מושכת עם מילות מפתח לחיפוש בגוגל (שם הקטגוריה + "מכרז"${makePriceGuide ? ' + "מחירון"' : ''}).
- תקציר (excerpt) של שני משפטים.
- 600–900 מילים, מדורג היטב עם כותרות משנה.
- בסוף המאמר קישור פנימי: [מכרזי ${category} ב-bidli](/category/${encodeURIComponent(category)})
- cover_prompt: תיאור קצר באנגלית לתמונת שער מגזינית איכותית הקשורה לנושא (בלי טקסט בתמונה).`,
      add_context_from_internet: makePriceGuide,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          read_time: { type: 'number' },
          cover_prompt: { type: 'string' },
        },
        required: ['title', 'excerpt', 'content', 'read_time', 'cover_prompt'],
      },
    });

    const img = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: `Elegant magazine cover photo for a collectors' article about ${category} on an Israeli auction marketplace. ${llm.cover_prompt}. Editorial style, warm amber and deep blue accents, soft studio lighting, shallow depth of field, no text or lettering in the image.`,
    });

    const draft = await base44.asServiceRole.entities.Article.create({
      title: String(llm.title).slice(0, 200),
      excerpt: String(llm.excerpt).slice(0, 300),
      content: String(llm.content),
      category,
      tags: makePriceGuide ? [category, 'מחירון', 'מדריכי קנייה'] : [category, 'מדריך', 'אספנות'],
      cover_image_url: img.url,
      author: 'סוכן ה-AI של bidli',
      status: 'draft',
      read_time: Math.max(3, Math.min(15, Math.round(Number(llm.read_time) || 7))),
      is_price_guide: makePriceGuide,
      price_updated_at: makePriceGuide ? new Date().toISOString() : null,
      source: 'ai',
    });

    // מייל לאדמין על הטיוטה החדשה — כישלון מייל לא מאבד את הטיוטה
    let emailFailed = false;
    try {
      const html = adminShell({
        title: 'טיוטת מאמר חדשה ממתינה לאישור',
        heroEmoji: '📝',
        heroLine: `${makePriceGuide ? 'מאמר מחירון' : 'מדריך'} · קטגוריה: ${category}`,
        bodyHtml: `
          <h2 dir="rtl" style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1c1917;">${escapeHtml(draft.title)}</h2>
          <p dir="rtl" style="margin:0 0 14px;">${escapeHtml(draft.excerpt)}</p>
          <p dir="rtl" style="margin:0;color:#8a7f75;font-size:13px;">המאמר נוצר אוטומטית על ידי סוכן ה-AI של bidli וממתין לסקירתך — אישור, עריכה או דחייה בממשק הניהול.</p>`,
        ctaUrl: `${ADMIN_APP_URL}/admin/manage`,
        ctaLabel: 'לסקירת הטיוטה בממשק הניהול →',
      });
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
      await sendGmail(accessToken, {
        to: ADMIN_EMAIL,
        subject: `📝 טיוטה חדשה למגזין: ${draft.title}`,
        html,
        text: `טיוטה חדשה ממתינה לאישור: ${draft.title}\n${draft.excerpt}`,
      });
    } catch (e) {
      emailFailed = true;
    }

    return Response.json({
      ok: true,
      draft: { id: draft.id, title: draft.title, category, is_price_guide: makePriceGuide },
      email_failed: emailFailed,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}