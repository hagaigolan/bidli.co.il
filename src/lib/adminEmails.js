import { base44 } from "@/api/base44Client";

// שליחת מייל הנהלה מבוצעת בשרת (פונקציית sendAdminEmail) עם בדיקת הרשאת אדמין,
// כדי שמשתמשים רגילים לא יוכלו לשלוח מיילים בשם ההנהלה מהדפדפן
const APP_URL = "https://bidli.co.il";

export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function reasonBox(label, reason) {
  return `<table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border:1px solid #eadbc8;border-radius:12px;margin:14px 0;">
    <tr><td dir="rtl" align="right" style="padding:14px 18px;font-size:14px;line-height:1.8;color:#3f3f46;text-align:right;">
      <strong style="display:block;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:15px;color:#e5893d;margin-bottom:4px;">${label}</strong>
      ${escapeHtml(reason)}
    </td></tr>
  </table>`;
}

// שליחת מייל מנהלה — התבנית נבנית בשרת ונשלחת רק לאחר בדיקת הרשאת אדמין
export async function sendAdminEmail({ to, subject, title, heroEmoji = "✉️", heroLine = "", bodyHtml, ctaUrl, ctaLabel }) {
  await base44.functions.invoke("sendAdminEmail", {
    to,
    subject,
    title,
    heroEmoji,
    heroLine,
    bodyHtml,
    ctaUrl,
    ctaLabel,
  });
}

// הודעת השהיית משתמש
export function sendBanEmail(to, name, reason) {
  const hello = name ? `שלום ${name},` : "שלום,";
  return sendAdminEmail({
    to,
    subject: "חשבונך הושהה ב-bidli",
    title: "חשבונך הושהה",
    heroEmoji: "⛔",
    heroLine: "הודעה רשמית מהנהלת bidli",
    bodyHtml: `
      <p dir="rtl" style="margin:0 0 6px;font-weight:700;color:#1c1917;text-align:right;">${escapeHtml(hello)}</p>
      <p dir="rtl" style="margin:0;text-align:right;">חשבונך הושהה מפעילות בפלטפורמת bidli, לרבות הגשת הצעות מחיר ופרסום מכרזים.</p>
      ${reasonBox("סיבת ההשהיה", reason)}`,
  });
}

// הודעת ביטול מכרז על ידי ההנהלה
export function sendCancelEmail(to, sellerName, productTitle, reason) {
  const hello = sellerName ? `שלום ${sellerName},` : "שלום,";
  return sendAdminEmail({
    to,
    subject: `המכרז "${productTitle}" בוטל על ידי הנהלת bidli`,
    title: "המכרז שלך בוטל",
    heroEmoji: "⚖️",
    heroLine: "הודעה רשמית מהנהלת bidli",
    ctaUrl: `${APP_URL}/my-sales`,
    ctaLabel: "חזרה לאתר — למכירות שלי →",
    bodyHtml: `
      <p dir="rtl" style="margin:0 0 6px;font-weight:700;color:#1c1917;text-align:right;">${escapeHtml(hello)}</p>
      <p dir="rtl" style="margin:0;text-align:right;">המכרז <strong style="color:#e5893d;">${escapeHtml(productTitle)}</strong> בוטל על ידי הנהלת bidli והוסר מהתצוגה הציבורית.</p>
      ${reasonBox("סיבת הביטול", reason)}`,
  });
}