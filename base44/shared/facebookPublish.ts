// שליחת התראת פרסום מוצר ל-webhook חיצוני שמפעיל פרסום אוטומטי בפייסבוק.
// ה-token מוטמע בתוך כתובת ה-webhook עצמה — ולכן אינו נשלח ב-body.
// ה-body מכיל תוכן פרסומי בלבד: אסור לכלול בו שם מוכר, אימייל, טלפון או כל פרט מזהה.

const WEBHOOK_URL = 'https://cwebhooks.base44.com/api/hooks/v0kc4vtQ4i0a0Z6FQGGOBS8KUbmbYrlWuqNHle0MaMo';
const VIEW_URL_BASE = 'https://bidli.co.il/auction/';

// נקרא מיד אחרי יצירה ופרסום מוצלח של מוצר. מנגנון נגד כפילויות: מוצר שכבר
// סומן ב-fb_posted_at לא נשלח שוב. כל כשל נבלע ונרשם בלוג — פרסום המוצר
// באתר אינו נפגע גם אם ה-webhook נכשל.
export async function notifyProductPublishedToFacebook(base44: any, product: any): Promise<void> {
  try {
    if (!product || !product.id) return;
    if (product.fb_posted_at) {
      console.log('facebook publish webhook skipped — already sent for product', product.id);
      return;
    }

    const body = {
      event: 'product.published',
      product: {
        id: product.id,
        title: product.title || null,
        description: product.description || null,
        category: product.category || null,
        condition: product.condition || null,
        starting_price: product.starting_price ?? null,
        buy_now_price: product.buy_now_price ?? null,
        current_price: product.current_price ?? product.starting_price ?? null,
        image_url: product.image_url || null,
        image_urls: (Array.isArray(product.image_urls) && product.image_urls.length) ? product.image_urls : null,
        ends_at: product.ends_at || null,
        view_url: VIEW_URL_BASE + product.id,
      },
    };

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`webhook returned status ${res.status}`);
    }

    // סימון מועד השליחה על רשומת המוצר — הערבה לאירוע יחיד לכל מוצר
    await base44.asServiceRole.entities.Product.update(product.id, {
      fb_posted_at: new Date().toISOString(),
    }).catch((e: any) => console.error('facebook publish marker update failed:', e?.message || e));

    console.log('facebook publish webhook sent for product', product.id);
  } catch (e: any) {
    // השגיאה נבלעת — פרסום המוצר באתר ממשיך כרגיל
    console.error('facebook publish webhook failed:', e?.message || e);
  }
}