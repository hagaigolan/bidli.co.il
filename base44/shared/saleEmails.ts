// Designed HTML email builders for sale notifications.
// Transfer-based flow: the winner pays the seller directly (KashCash / Bit / bank
// transfer), reports the transfer in the app, and the seller confirms receipt.

const APP_URL = "https://bidli.co.il";

const METHOD_LABELS = {
  kashcash: "קשקאש",
  bit: "ביט",
  bank: "העברה בנקאית",
};

// נטרול תגיות HTML בשדות שמגיעים מהמשתמשים — לפני הצבה בתוך תבניות מייל
export function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paymentMethodHtml(product) {
  const label = METHOD_LABELS[product.seller_payment_method];
  if (!label) return "";
  if (product.seller_payment_method === "bank") {
    return `<p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#3f3f46;">אמצעי התשלום שהוגדר על ידי המוכר: <strong>${label}</strong></p>
      ${product.seller_bank_details
        ? `<div style="background:#fafafa;border:1px solid #f4f4f5;border-radius:12px;padding:12px 14px;margin:8px 0;font-size:14px;line-height:1.7;color:#18181b;white-space:pre-line;">${escHtml(product.seller_bank_details)}</div>`
        : ""}`;
  }
  return `<p style="margin:0;font-size:15px;line-height:1.7;color:#3f3f46;">אמצעי התשלום שהוגדר על ידי המוכר: <strong>${label}</strong> — <strong style="color:#e5893d;">${escHtml(product.seller_payme_phone || "")}</strong></p>`;
}

function stepsBox(stepsHtml) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:14px;margin:16px 0;">
    <tr><td style="padding:16px 18px;font-size:14px;line-height:1.9;color:#3f3f46;">
      <strong style="color:#7e22ce;">שלושה שלבים וההזמנה שלך שלמה:</strong><br>
      ${stepsHtml}
    </td></tr>
  </table>`;
}

export function shell({ title, heroColor, heroEmoji, heroLine, bodyHtml, ctaUrl, ctaLabel }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @media only screen and (max-width:600px) {
    .wrap { padding: 10px 6px !important; }
    .hero { padding: 22px 14px !important; }
    .pad  { padding: 20px 14px !important; }
    .cta  { padding: 0 14px 20px !important; }
    .foot { padding: 16px 14px 22px !important; }
    .pc-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
  }
</style></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Inter',system-ui,Segoe UI,Arial,sans-serif;color:#18181b;direction:rtl;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" class="wrap" style="background:#f4f4f5;padding:24px 12px;direction:rtl;">
    <tr><td align="center" dir="rtl">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="rtl" style="width:100%;max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 6px 30px rgba(0,0,0,0.06);direction:rtl;">
        <tr>
          <td class="hero" style="padding:28px 32px;text-align:center;background:linear-gradient(135deg,${heroColor}1a,${heroColor}08);border-bottom:1px solid ${heroColor}22;">
            <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:16px;background:linear-gradient(135deg,#e5893d,#3e6b8a);font-size:28px;">${heroEmoji}</div>
            <h1 style="margin:14px 0 4px;font-size:22px;font-weight:900;color:#18181b;">${title}</h1>
            <p style="margin:0;font-size:14px;color:#71717a;font-weight:600;">${heroLine}</p>
          </td>
        </tr>
        <tr><td dir="rtl" class="pad" style="padding:28px 32px;direction:rtl;word-break:break-word;overflow-wrap:anywhere;">
          ${bodyHtml}
        </td></tr>
        <tr><td class="cta" style="padding:0 32px 28px;">
          <a href="${ctaUrl || APP_URL + "/auctions"}" style="display:block;text-align:center;text-decoration:none;background:linear-gradient(135deg,#e5893d,#3e6b8a);color:#ffffff;font-weight:800;font-size:15px;padding:14px 20px;border-radius:14px;box-shadow:0 4px 16px rgba(247,0,255,0.35);">${ctaLabel || "צפה במכרז ב-bidli →"}</a>
        </td></tr>
        <tr><td class="foot" style="padding:20px 32px 28px;border-top:1px solid #f4f4f5;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">bidli — הבית של פלטפורמת מכרזים שלך<br>הודעה זו נשלחה אוטומטית, אין להשיב.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function productCard(product, productUrl) {
  const price = (product.current_price ?? product.starting_price ?? 0).toLocaleString("he-IL");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f4f4f5;border-radius:14px;margin:18px 0;">
    <tr>
      <td class="pc-cell" style="padding:14px;">
        ${product.image_url ? `<img src="${escHtml(product.image_url)}" alt="" style="display:block;width:96px;height:96px;border-radius:10px;object-fit:cover;margin:0 auto;">` : `<div style="width:96px;height:96px;border-radius:10px;background:#f4f4f5;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:36px;">🏺</div>`}
      </td>
      <td class="pc-cell" style="padding:14px;vertical-align:top;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:800;color:#18181b;">${escHtml(product.title)}</p>
        ${product.category ? `<p style="margin:0 0 8px;font-size:12px;color:#e5893d;font-weight:700;">${escHtml(product.category)}</p>` : ""}
        <p style="margin:0;font-size:20px;font-weight:900;color:#18181b;">₪${price}</p>
      </td>
    </tr>
  </table>
  <a href="${productUrl}" style="display:block;text-align:center;text-decoration:none;background:#ffffff;border:2px solid #e5893d44;color:#e5893d;font-weight:800;font-size:14px;padding:12px 18px;border-radius:12px;">קישור ישיר למכירה →</a>`;
}

export function buyerSaleEmail(product, winnerName) {
  const productUrl = `${APP_URL}/auction/${product.id}`;
  const ordersUrl = `${APP_URL}/my-orders`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(winnerName || "זוכה")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">ברכותינו! 🎉 זכית במכרז. עליך להעביר את סכום הזכייה ישירות למוכר תוך <strong style="color:#e5893d;">24 שעות</strong> — בהעברה ישירה, ללא כרטיס אשראי.</p>
    ${paymentMethodHtml(product)}
    ${productCard(product, productUrl)}
    ${stepsBox(`
      <strong>1.</strong> בצע את ההעברה למוכר בסכום הזכייה.<br>
      <strong>2.</strong> דווח על ההעברה בעמוד "ההזמנות שלי" (אפשר לצרף אסמכתא).<br>
      <strong>3.</strong> המוכר יאשר שהכסף התקבל — וההזמנה תסומן כשולמה. משם תתואם המסירה ישירות מול המוכר.`)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#71717a;">חשוב: אי-דיווח על העברה בתוך 24 שעות עשוי להעביר את הזכייה למציע המשני. שמור את אישור ההעברה שלך.</p>`;
  return shell({
    title: "זכית במכרז!",
    heroColor: "#3e6b8a",
    heroEmoji: "🏆",
    heroLine: "ההצעה שלך היא הגבוהה ביותר",
    bodyHtml: body,
    ctaUrl: ordersUrl,
    ctaLabel: "לדיווח על ההעברה בההזמנות שלי →",
  });
}

export function sellerSaleEmail(product, winnerName, winnerPhone) {
  const productUrl = `${APP_URL}/auction/${product.id}`;
  const profileUrl = `${APP_URL}/profile`;
  const method = METHOD_LABELS[product.seller_payment_method] || "העברה";
  const winnerDetails = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;margin:16px 0;">
      <tr><td style="padding:14px 16px;font-size:15px;line-height:1.9;color:#3f3f46;">
        <strong style="color:#15803d;">פרטי הזוכה לצורך העברת הכספים ותיאום המסירה:</strong><br>
        שם: <strong>${escHtml(winnerName || "—")}</strong><br>
        ${winnerPhone ? `טלפון: <strong style="color:#e5893d;">${escHtml(winnerPhone)}</strong><br>` : ""}
        מייל: <strong>${escHtml(product.highest_bidder_email || "—")}</strong>
      </td></tr>
    </table>`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">המוצר שלך נמכר! 💰 ${winnerName ? `הזוכה הוא <strong>${escHtml(winnerName)}</strong>` : "נמצא זוכה"} והמחיר הסופי רשום מטה. הקונה יעביר אליך את הסכום ישירות ב<strong>${method}</strong> — ללא כרטיס אשראי וללא עמלות.</p>
    ${winnerDetails}
    ${productCard(product, productUrl)}
    ${stepsBox(`
      <strong>1.</strong> הקונה יבצע את ההעברה וידווח עליה במערכת.<br>
      <strong>2.</strong> תקבל מייל כשהקונה ידווח על ההעברה.<br>
      <strong>3.</strong> לאחר שהכסף התקבל בפועל — אשר קבלת תשלום באזור האישי, וההזמנה תסומן כשולמה.`)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#71717a;">במידה והקונה לא ידווח על העברה בזמן, הזכייה תועבר למציע המשני או שהמכרז יבוטל.</p>`;
  return shell({
    title: "המוצר שלך נמכר!",
    heroColor: "#00c853",
    heroEmoji: "💰",
    heroLine: "המכרז הסתיים בהצלחה",
    bodyHtml: body,
    ctaUrl: profileUrl,
    ctaLabel: "לאזור האישי שלי →",
  });
}

export function secondChanceEmail(product, secondBidderName) {
  const productUrl = `${APP_URL}/auction/${product.id}`;
  const ordersUrl = `${APP_URL}/my-orders`;
  const price = (product.second_bid_amount ?? product.current_price ?? 0).toLocaleString("he-IL");
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(secondBidderName || "מציע")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">⚡ ההזדמנות שלך הגיעה! המציע הראשי במכרז <strong>"${escHtml(product.title)}"</strong> לא השלים את התשלום בזמן — והזכייה מוצעת עכשיו לך, במחיר ההצעה שלך: <strong style="color:#e5893d;">₪${price}</strong>.</p>
    <p style="margin:0 0 6px;font-size:15px;line-height:1.7;color:#3f3f46;">לרשותך <strong style="color:#e5893d;">12 שעות</strong> להשלמת הרכישה. לאחר מכן תועבר הזכייה הלאה או המכרז יבוטל.</p>
    ${productCard({ ...product, current_price: product.second_bid_amount ?? product.current_price }, productUrl)}
    ${stepsBox(`
      <strong>1.</strong> בצע את ההעברה למוכר בסכום הזכייה.<br>
      <strong>2.</strong> דווח על ההעברה בעמוד "ההזמנות שלי".<br>
      <strong>3.</strong> המוכר יאשר שהכסף התקבל — וההזמנה תסומן כשולמה.`)}
    <p style="margin:16px 0 0;font-size:13px;line-height:1.7;color:#71717a;">אפשר גם לחזור לעיין במכרזים נוספים: <a href="${APP_URL}" style="color:#3e6b8a;font-weight:700;text-decoration:none;">עמוד הבית של bidli ←</a></p>`;
  return shell({
    title: "הצעה שנייה — אתה הבא!",
    heroColor: "#e5893d",
    heroEmoji: "⚡",
    heroLine: "הזכייה מוצעת לך במחיר ההצעה שלך",
    bodyHtml: body,
    ctaUrl: ordersUrl,
    ctaLabel: "להשלמת הרכישה בההזמנות שלי →",
  });
}

export const APP_BASE_URL = APP_URL;