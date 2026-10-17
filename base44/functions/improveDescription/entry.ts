// הרחבת תיאור מוצר באמצעות AI — משדרג תיאור קצר לתיאור מלא ומפורט של כמה שורות.
// חייב התחברות; מקבל רק כותרת, תיאור, קטגוריה ומצב — ומחזיר תיאור מורחב בעברית.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || '').slice(0, 200);
    const description = String(body.description || '').slice(0, 2000);
    const category = String(body.category || '').slice(0, 100);
    const condition = String(body.condition || '').slice(0, 100);
    if (!title || !description) {
      return Response.json({ error: 'יש למלא כותרת ותיאור קצר לפני השדרוג' }, { status: 400 });
    }

    const prompt = `אתה עוזר למוכרים בפלטפורמת מכירות פומביות בישראל בשם bidli לכתוב תיאורי מוצר מושכים.
הרחב את תיאור המוצר הבא לתיאור מפורט של כ-4-6 משפטים בעברית.

כותרת המוצר: ${title}
תיאור שהמוכר כתב: ${description}
${category ? `קטגוריה: ${category}` : ''}
${condition ? `מצב המוצר: ${condition}` : ''}

כללים:
- שמור על כל העובדות שהמוכר סיפק והרחב סביבן בלבד.
- אל תמציא פרטים שאינם ידועים: לא גיל מדויק, לא שמות אמנים, לא מידות ולא אותנטיות — אם המוכר לא סיפק אותם, אל תוסיף אותם.
- כתוב בגוף שלישי מתוך נקודת מבט של מוכר מכירה פומבית, טון חם ומקצועי.
- אפשר לציין את הפוטנציאל של הפריט (פריט אספנות, מתנה, פריט תצוגה) במשפט אחד.
- טקסט פשוט בלבד — בלי כותרות, בלי תבליטים, בלי סימני מרקדאון.
- החזר רק את טקסט התיאור המורחב עצמו, בלבד, בלי שום הקדמה או הסבר.

החזר את התיאור המורחב בתור מחרוזת.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    const text = typeof result === 'string' ? result.trim() : String(result ?? '').trim();
    if (!text) return Response.json({ error: 'ה-AI לא החזיר תיאור, נסה שנית' }, { status: 502 });

    return Response.json({ description: text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}