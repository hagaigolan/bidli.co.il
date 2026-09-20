import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { sendGmail } from '../../shared/gmailSender.ts';
import { sellerQuestionEmail } from '../../shared/notifyEmails.ts';

// Forwards a buyer's question from the product live chat to the seller's email
// in real time, so the seller can reply fast and close the sale.
// Called directly from the product page chat (public app — no login required).

// הגבלת קצב לכל IP — מונע שימוש בפונקציה כממסר ספאם/פישינג בלתי מוגבל
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const rateMap = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (rateMap.get(ip) || []).filter((t: number) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    rateMap.set(ip, arr);
    return true;
  }
  arr.push(now);
  rateMap.set(ip, arr);
  return false;
}

export default async function (req: Request): Promise<Response> {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      || req.headers.get('cf-connecting-ip') || 'unknown';
    if (isRateLimited(ip)) {
      return Response.json({ error: 'too many requests' }, { status: 429 });
    }

    const base44 = createClientFromRequest(req);
    const { product_id, question, asker_name, asker_contact } = await req.json();
    const q = (question || "").toString().trim().slice(0, 1000);
    if (!product_id || !q) {
      return Response.json({ error: 'missing product_id or question' }, { status: 400 });
    }

    const product = await base44.asServiceRole.entities.Product.get(product_id).catch(() => null);
    if (!product || !product.seller_email) {
      return Response.json({ error: 'product not found' }, { status: 404 });
    }

    // שמירת הפנייה למעקב המוכר — כך שהמוכר יוכל לסמן אותה כ"טופלה"
    await base44.asServiceRole.entities.ProductQuestion.create({
      product_id: product.id,
      product_title: product.title || "",
      question: q,
      asker_name: (asker_name || "").toString().slice(0, 120),
      asker_contact: (asker_contact || "").toString().slice(0, 120),
      seller_email: product.seller_email,
      seller_name: product.seller_name || "",
      seller_user_id: product.seller_user_id || "",
      status: "open",
    }).catch(() => null);

    const email = sellerQuestionEmail(product, {
      question: q,
      asker_name: (asker_name || "").toString().slice(0, 120),
      asker_contact: (asker_contact || "").toString().slice(0, 120),
    });

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
    await sendGmail(accessToken, {
      to: product.seller_email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return Response.json({ ok: true, to: product.seller_email });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}