import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isRateLimitedPersisted } from '../../shared/rateLimit.ts';

// שולח תשובת מוכר לשאלת לקוח (ProductQuestion) במייל ומסמן את הפנייה כטופלה.
// מיועד לסוכן התמיכה shop_support — פועל בשם המוכר המחובר בלבד:
// RLS מבטיח שרק המוכר שאליו הפנייה מיועדת יכול להשיב, והנמען נגזר מהרשומה בלבד.

const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    if (await isRateLimitedPersisted(base44, `sendQuestionReply:${user.id}`, RATE_LIMIT, RATE_WINDOW_MS)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }

    const { question_id, answer } = await req.json().catch(() => ({}));
    const qid = String(question_id || '').trim();
    const reply = String(answer || '').trim().slice(0, 2000);
    if (!qid || reply.length < 5) {
      return Response.json({ error: 'missing fields' }, { status: 400 });
    }

    // קריאה בשם המשתמש — RLS של ProductQuestion מגביל לפניות של המוכר עצמו (או אדמין)
    const items = await base44.entities.ProductQuestion.filter({ id: qid });
    if (!items.length) return Response.json({ error: 'not found' }, { status: 404 });
    const question = items[0];

    if (question.status === 'handled') {
      return Response.json({ error: 'already handled' }, { status: 409 });
    }

    // הנמען נגזר מהרשומה בלבד — ולידציה שמדובר בכתובת מייל תקינה ונקייה מתווי בקרה
    const recipient = String(question.asker_contact || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(recipient)) {
      return Response.json({ error: 'asker contact is not a valid email' }, { status: 422 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient,
      subject: `תשובה לשאלתך על "${question.product_title || 'המכרז'}" | bidli`,
      body: `שלום${question.asker_name ? ` ${question.asker_name}` : ''},\n\nהמוכר ענה לשאלתך על "${question.product_title || 'המכרז'}":\n\n${reply}\n\nלצפייה במכרז:\nhttps://bidli.co.il/auction/${question.product_id}\n\nצוות bidli`,
    });

    // סימון הפנייה כטופלה — בשם המשתמש, כך ש-RLS ממשיך להגן
    await base44.entities.ProductQuestion.update(qid, {
      status: 'handled',
      handled_at: new Date().toISOString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendQuestionReply error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}