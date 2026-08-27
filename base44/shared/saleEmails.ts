// Designed HTML email builders for sale notifications.
// Both buyer (winner) and seller receive a branded email with a link to the auction page.

const APP_URL = "https://bid-it-now-app.base44.app";

function shell({ title, heroColor, heroEmoji, heroLine, bodyHtml, ctaUrl, ctaLabel }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',system-ui,Segoe UI,Arial,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.06);">
        <tr>
          <td style="padding:28px 32px;text-align:center;background:linear-gradient(135deg,${heroColor}1a,${heroColor}08);border-bottom:1px solid ${heroColor}22;">
            <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:16px;background:linear-gradient(135deg,#f700ff,#9d00ff);font-size:28px;">${heroEmoji}</div>
            <h1 style="margin:14px 0 4px;font-size:22px;font-weight:900;color:#18181b;">${title}</h1>
            <p style="margin:0;font-size:14px;color:#71717a;font-weight:600;">${heroLine}</p>
          </td>
        </tr>
        <tr><td style="padding:28px 32px;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:0 32px 28px;">
          <a href="${ctaUrl || APP_URL + "/auctions"}" style="display:block;text-align:center;text-decoration:none;background:linear-gradient(135deg,#f700ff,#9d00ff);color:#ffffff;font-weight:800;font-size:15px;padding:14px 20px;border-radius:14px;box-shadow:0 4px 16px rgba(247,0,255,0.35);">${ctaLabel || "צפה במכרז ב-bid-it →"}</a>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">bid-it — פלטפורמת מכרזים לאמנות, יודאיקה ואספנות<br>הודעה זו נשלחה אוטומטית, אין להשיב.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function productCard(product, productUrl) {
  const price = (product.current_price ?? product.starting_price ?? 0).toLocaleString("he-IL");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f4f4f5;border-radius:14px;margin:18px 0;">
    <tr>
      <td style="padding:14px;">
        ${product.image_url ? `<img src="${product.image_url}" alt="" style="display:block;width:96px;height:96px;border-radius:10px;object-fit:cover;margin:0 auto;">` : `<div style="width:96px;height:96px;border-radius:10px;background:#f4f4f5;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:36px;">🏺</div>`}
      </td>
      <td style="padding:14px;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:800;color:#18181b;">${product.title}</p>
        ${product.category ? `<p style="margin:0 0 8px;font-size:12px;color:#f700ff;font-weight:700;">${product.category}</p>` : ""}
        <p style="margin:0;font-size:20px;font-weight:900;color:#18181b;">₪${price}</p>
      </td>
    </tr>
  </table>
  <a href="${productUrl}" style="display:block;text-align:center;text-decoration:none;background:#ffffff;border:2px solid #f700ff44;color:#f700ff;font-weight:800;font-size:14px;padding:12px 18px;border-radius:12px;">קישור ישיר למכירה →</a>`;
}

export function buyerSaleEmail(product, winnerName) {
  const productUrl = `${APP_URL}/auction/${product.id}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${winnerName || "זוכה"},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">ברכותינו! 🎉 זכית במכרז. עליך להשלים את התשלום תוך <strong style="color:#f700ff;">24 שעות</strong> כדי לאשר את הזכייה. הסכום יוחזק באסקרו מאובטח עד אישור קבלת המוצר.</p>
    ${productCard(product, productUrl)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#71717a;">לאחר התשלום, יש לאשר קבלת המוצר באזור האישי כדי שהתשלום יועבר למוכר. במקרה של בעיה ניתן לפתוח סכסוך מול צוות bid-it.</p>`;
  return shell({
    title: "זכית במכרז!",
    heroColor: "#9d00ff",
    heroEmoji: "🏆",
    heroLine: "ההצעה שלך היא הגבוהה ביותר",
    bodyHtml: body,
  });
}

export function sellerSaleEmail(product, winnerName) {
  const productUrl = `${APP_URL}/auction/${product.id}`;
  const payoutUrl = `${APP_URL}/seller-payout?email=${encodeURIComponent(product.seller_email || "")}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${product.seller_name || "מוכר"},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">המוצר שלך נמכר! 💰 ${winnerName ? `הזוכה הוא <strong>${winnerName}</strong>` : "נמצא זוכה"} והמחיר הסופי רשום מטה. הכסף יוחזק באסקרו מאובטח ויועבר אליך לאחר שהקונה יאשר קבלת המוצר.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;margin:8px 0 16px;">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#92400e;">
        <strong style="color:#b45309;">פעולה נדרשת — הזנת כרטיס לקבלת התשלום</strong><br>
        כדי שנוכל להעביר אליך את סכום המכירה, יש להזין פרטי כרטיס אשראי / חשבון לזיכוי באזור האישי. ללא הזנת פרטי תשלום, שחרור הכסף יתעכב.
      </td></tr>
    </table>
    ${productCard(product, productUrl)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#71717a;">תקבל עדכון במייל כשהקונה יאשר את התשלום והמשלוח. במידה והקונה לא ישלם בזמן, המכרז יועבר למציע השני או יבוטל.</p>`;
  return shell({
    title: "המוצר שלך נמכר!",
    heroColor: "#00c853",
    heroEmoji: "💰",
    heroLine: "המכרז הסתיים בהצלחה",
    bodyHtml: body,
    ctaUrl: payoutUrl,
    ctaLabel: "הזן כרטיס לקבלת התשלום →",
  });
}

export const APP_BASE_URL = APP_URL;