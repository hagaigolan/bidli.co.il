import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

const CATEGORIES = ["אמנות", "יודאיקה", "אספנות", "נומיסמטיקה", "מטבעות", "בולים", "תכשיטים", "שעונים", "עיצוב הבית", "אופנה", "ספרים", "כלי נגינה", "יין ואלכוהול", "אלקטרוניקה", "רכבים", "נדל\"ן", "אחר"];
const CONDITIONS = ["חדש", "מצב מעולה", "מצב טוב", "מצב בינוני", "לא תקין"];

// פרסום מודרך — צ'אט עם עוזר AI שממלא את שדות טופס הפרסום מתיאור בשיחה.
// נדרשת התחברות, עם הגבלת קצב לפי משתמש (20 בקשות בשעה).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
    if (await isRateLimitedPersisted(base44, `guidedPublish:${user.id}`, 20, 3600000)) {
      return Response.json({ error: 'rate_limited', message: 'יותר מדי בקשות — נסה שוב בעוד כשעה' }, { status: 429 });
    }

    const { messages } = await req.json().catch(() => ({}));
    if (!Array.isArray(messages) || !messages.length) {
      return Response.json({ error: 'missing messages' }, { status: 400 });
    }
    const clean = messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: (m.content || '').toString().slice(0, 1000),
    }));

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `אתה עוזר פרסום חכם של פורטל המכרזים bidli. מוכר מתאר לך בשיחה פריט שהוא רוצה לפרסם במכרז.

שיחה עד כה ("מוכר" = המשתמש, "אתה" = העוזר):
${clean.map(m => `${m.role === 'user' ? 'מוכר' : 'אתה'}: ${m.content}`).join('\n')}

המשימה שלך:
1. אם חסרים פרטים חשובים (מה הפריט, מצבו, מקורו) — שאל שאלה אחת קצרה בעברית בשדה reply והשאר את שדות הטופס ריקים (אל תכלול אותם).
2. אם יש מספיק פרטים — מלא את שדות הטופס מהשיחה וכתוב reply קצר בעברית שמסביר מה מילאת ומה כדאי להשלים.

כללים:
- category חייב להיות בדיוק מהרשימה המוגדרת בסכמה; condition מהרשימה המוגדרת.
- starting_price — מספר: המלצה ריאלית למחיר פתיחה לפי שווי שוק בישראל (בדרך כלל 30%-50% מהשווי המוערך כדי לעודד הצעות).
- buy_now_price — מספר אופציונלי, גבוה מ-starting_price; השמט אם אין בסיס.
- title — קצר וכובש, עד 60 תווים, בעברית.
- description — בעברית, מפורט ומוכר, ללא הבטחות שווא.
- אל תמציא פרטים שלא נמסרו בשיחה (גיל, חתימות, יוצר, מצב) — אם חסרים, שאל במקום להמציא.`,
      response_json_schema: {
        type: 'object',
        properties: {
          reply: { type: 'string' },
          fields: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string', enum: CATEGORIES },
              condition: { type: 'string', enum: CONDITIONS },
              starting_price: { type: 'number' },
              buy_now_price: { type: 'number' },
              location: { type: 'string' },
            },
          },
        },
        required: ['reply'],
      },
    });

    // רק שדות מלאים עוברים — הטופס לא נדרס בשדות ריקים
    const fields = {};
    for (const [k, v] of Object.entries(llm.fields || {})) {
      if (v === null || v === undefined || v === '') continue;
      fields[k] = typeof v === 'number' ? String(v) : v;
    }
    return Response.json({ reply: llm.reply || '', fields });
  } catch (error) {
    console.error('guidedPublishAssistant error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}