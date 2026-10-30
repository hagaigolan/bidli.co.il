// מייל שכנוע למוכר שמכרזו הסתיים בלי מכירה — "פרסם שוב" בלחיצה אחת.
// הפריט, התמונות והפרטים שמורים במערכת, ולכן הכפתור פותח את טופס הפרסום
// כשהוא כבר מלא מראש (כולל התמונות) וניתן לערוך מחיר או כל פרט אחר.

import { shell, productCard, escHtml, APP_BASE_URL } from "./saleEmails.ts";

function daysAgo(endsAt) {
  const t = new Date(endsAt).getTime();
  if (Number.isNaN(t)) return null;
  const days = Math.floor((Date.now() - t) / (24 * 3600 * 1000));
  return days > 0 ? days : null;
}

export function republishNudgeEmail(product) {
  const republishUrl = `${APP_BASE_URL}/upload-product?republish=${product.id}`;
  const auctionUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const firstName = String(product.seller_name || "").trim().split(" ")[0] || "שלום";
  const days = daysAgo(product.ends_at);

  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(firstName)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">
      המכרז של <strong>"${escHtml(product.title)}"</strong> הסתיים${days ? ` לפני ${days} ימים` : ""} בלי מכירה — אבל זה לא סוף הסיפור.
      לא כל פריט מוצא קונה בניסיון הראשון, וההזדמנות הבאה שלך נמצאת במרחק לחיצה אחת.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;margin:0 0 4px;">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#3f3f46;">
        <strong style="color:#c2410c;">פרסום מחדש לוקח פחות מדקה:</strong><br>
        ✅ התמונות כבר שמורות — אין צורך להעלות אותן שוב<br>
        ✅ כל הפרטים, הקטגוריה ותיאור הפריט כבר מלאים<br>
        ✅ אפשר לשנות מחיר התחלתי, "קנה עכשיו" או כל פרט אחר לפני הפרסום
      </td></tr>
    </table>

    ${productCard(product, auctionUrl)}

    <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#71717a;">
      טיפ קטן שמעלה סיכויי מכירה: מחיר התחלתי נמוך מזמין יותר מציעים, ופריט עם כמה הצעות מגיע בסוף למחיר גבוה יותר.
      גם הוספת תמונה נוספת אחת מגדילה את סיכויי המכירה.
    </p>
    <p style="margin:10px 0 0;font-size:13px;line-height:1.7;color:#a1a1aa;">פרסום המכרז חינם, בלי עמלות ובלי התחייבות.</p>`;

  const text = `שלום ${firstName},

המכרז שלך "${product.title}" הסתיים בלי מכירה — אבל אפשר לנסות שוב בקלות.
התמונות והפרטים כבר שמורים במערכת: לוחצים על "פרסם שוב", עורכים מחיר אם רוצים, וזה עולה לאוויר מיד.

לפרסום מחדש: ${republishUrl}
לצפייה במכרז שהסתיים: ${auctionUrl}

פרסום חינם, בלי עמלות.`;

  const html = shell({
    title: "שווה ניסיון נוסף 💫",
    heroColor: "#e5893d",
    heroEmoji: "🔁",
    heroLine: "פרסום מחדש לוקח פחות מדקה — התמונות כבר שם",
    bodyHtml: body,
    ctaUrl: republishUrl,
    ctaLabel: "פרסם שוב ←",
  });

  return { subject: `"${product.title}" לא נמכר — פרסם שוב בלחיצה אחת`, html, text };
}