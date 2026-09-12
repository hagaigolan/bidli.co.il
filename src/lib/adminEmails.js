import { base44 } from "@/api/base44Client";

// תבנית מייל יוקרתית עבור הודעות הנהלה — לוגו וורדמארק, מסגרת כפולה, פונטים מיוחדים, RTL מלא
const APP_URL = "https://bidli.co.il";
const CONTACT = "mitugplus@gmail.com";

const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Heebo:wght@400;500;700&display=swap" rel="stylesheet">`;

export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wordmarkHtml() {
  return `<div dir="rtl" style="font-family:'Frank Ruhl Libre',Georgia,'Times New Roman',serif;font-size:36px;font-weight:900;letter-spacing:3px;line-height:1;color:#e5893d;">bidli<span style="color:#3e6b8a;">.</span></div>
  <p dir="rtl" style="margin:6px 0 0;font-family:'Heebo',Helvetica,Arial,sans-serif;font-size:10px;font-weight:500;letter-spacing:4px;color:#b8a893;">פלטפורמת המכרזים שלך</p>`;
}

function reasonBox(label, reason) {
  return `<table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f2;border:1px solid #eadbc8;border-radius:12px;margin:14px 0;">
    <tr><td dir="rtl" align="right" style="padding:14px 18px;font-size:14px;line-height:1.8;color:#3f3f46;text-align:right;">
      <strong style="display:block;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:15px;color:#e5893d;margin-bottom:4px;">${label}</strong>
      ${escapeHtml(reason)}
    </td></tr>
  </table>`;
}

function adminShell({ title, heroEmoji, heroLine, bodyHtml, ctaUrl, ctaLabel }) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${FONT_LINKS}</head>
<body dir="rtl" style="margin:0;padding:0;background:#f7f2ec;font-family:'Heebo',Helvetica,Arial,sans-serif;color:#1c1917;direction:rtl;">
  <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f2ec;padding:28px 12px;direction:rtl;">
    <tr><td dir="rtl" align="center">
      <table role="presentation" dir="rtl" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5d5c1;border-radius:18px;box-shadow:0 8px 32px rgba(120,80,30,0.08);direction:rtl;">
        <tr><td dir="rtl" style="padding:10px;">
          <table role="presentation" dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e6d6;border-radius:12px;direction:rtl;">
            <tr><td dir="rtl" align="center" style="padding:32px 32px 14px;text-align:center;border-bottom:1px solid #f3ece2;direction:rtl;">
              ${wordmarkHtml()}
              ${heroEmoji ? `<div style="font-size:26px;margin:18px 0 2px;">${heroEmoji}</div>` : ""}
              <h1 dir="rtl" style="margin:8px 0 6px;font-family:'Frank Ruhl Libre',Georgia,'Times New Roman',serif;font-size:25px;font-weight:900;color:#1c1917;text-align:right;">${escapeHtml(title)}</h1>
              ${heroLine ? `<p dir="rtl" style="margin:0;font-size:13px;font-weight:500;color:#8a7f75;text-align:right;">${escapeHtml(heroLine)}</p>` : ""}
            </td></tr>
            <tr><td dir="rtl" align="right" style="padding:26px 32px 4px;font-family:'Heebo',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.9;color:#3f3f46;text-align:right;direction:rtl;">
              ${bodyHtml}
            </td></tr>
            <tr><td dir="rtl" align="center" style="padding:24px 32px 8px;">
              <a href="${ctaUrl}" dir="rtl" style="display:block;text-align:center;text-decoration:none;background:linear-gradient(135deg,#e5893d,#3e6b8a);color:#ffffff;font-family:'Heebo',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 20px;border-radius:12px;">${escapeHtml(ctaLabel)}</a>
            </td></tr>
            <tr><td dir="rtl" style="padding:20px 32px 28px;border-top:1px solid #f3ece2;text-align:center;">
              <p dir="rtl" style="margin:0 0 5px;font-family:'Frank Ruhl Libre',Georgia,serif;font-size:13px;font-weight:700;color:#c6b098;">✦ <a href="${APP_URL}" style="color:#c6b098;text-decoration:none;">bidli — הבית של פלטפורמת מכרזים שלך</a> ✦</p>
              <p dir="rtl" style="margin:0;font-size:11px;color:#a8a29e;line-height:1.7;">הודעה זו נשלחה מטעם הנהלת bidli · לפניות: ${CONTACT} · <a href="${APP_URL}" style="color:#e5893d;text-decoration:none;">חזרה לאתר bidli</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// שליחת מייל מנהלה בתבנית המעוצבת — תמיד עם קישור חזרה לאתר
export async function sendAdminEmail({ to, subject, title, heroEmoji = "✉️", heroLine = "", bodyHtml, ctaUrl, ctaLabel }) {
  const html = adminShell({
    title: title || subject,
    heroEmoji,
    heroLine,
    bodyHtml,
    ctaUrl: ctaUrl || APP_URL,
    ctaLabel: ctaLabel || "חזרה לאתר bidli →",
  });
  await base44.integrations.Core.SendEmail({
    to,
    subject,
    html,
    from_name: "bidli הנהלה",
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