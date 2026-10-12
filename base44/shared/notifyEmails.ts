// Designed HTML email builders for tracking notifications:
// - seller publish confirmation (on product publish)
// - new-bid alerts to the seller and to the platform admin

import { shell, productCard, APP_BASE_URL, escHtml } from "./saleEmails.ts";

function priceHtml(amount) {
  return (amount ?? 0).toLocaleString("he-IL");
}

// ── Seller: auction published ──
export function sellerPublishEmail(product) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">המכרז שלך פורסם בהצלחה והוא כעת פעיל באתר bidli! 🎉 המכרז יימשך <strong style="color:#e5893d;">24 שעות</strong>, ובסיומו ההצעה הגבוהה ביותר תזכה במוצר.</p>
    ${productCard(product, productUrl)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f4f4f5;border-radius:14px;margin:16px 0;">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#3f3f46;">
        מחיר פתיחה: <strong>₪${priceHtml(product.starting_price)}</strong><br>
        משך המכרז: <strong>24 שעות מרגע הפרסום</strong><br>
        התשלום יתקבל בהעברה ישירה — ללא כרטיס אשראי וללא עמלות
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#71717a;">מעכשיו תקבל מייל בכל פעם שתוגש הצעה חדשה על המוצר, כדי שתוכל לעקוב אחרי המכרז בזמן אמת.</p>`;
  return {
    subject: `🎉 המכרז שלך פורסם: ${product.title}`,
    html: shell({
      title: "המכרז שלך פורסם!",
      heroColor: "#3e6b8a",
      heroEmoji: "🎉",
      heroLine: "המכרז פעיל למשך 24 שעות",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "צפה במכרז שלך →",
    }),
    text: `שלום ${product.seller_name || "מוכר"},\n\nהמכרז שלך פורסם בהצלחה באתר bidli!\n\nמוצר: ${product.title}\nמחיר פתיחה: ₪${priceHtml(product.starting_price)}\nמשך המכרז: 24 שעות מרגע הפרסום\n\nקישור למכרז: ${productUrl}\n\nתקבל מייל בכל פעם שתוגש הצעה חדשה על המוצר.`,
  };
}

// ── Seller: new bid on their auction (FOMO-driven) ──
export function sellerBidEmail(product, bid) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  // דחיפות: כמה זמן נותר לסיום המכרז
  const leftMs = product.ends_at ? new Date(product.ends_at).getTime() - Date.now() : 0;
  const leftLabel = leftMs <= 0
    ? "המכרז עומד להיסגר"
    : leftMs > 3600000
      ? `נותרו כ-${Math.floor(leftMs / 3600000)} שעות לסיום`
      : "⏰ נותרו פחות משעה לסיום!";
  const bidsCount = Math.max(1, product.bid_count ?? 1);
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">מישהו פשוט הציע על הפריט שלך — והמכרז <strong style="color:#e5893d;">מתלהט</strong> 🔥</p>
    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#71717a;text-align:center;">ההצעה החדשה:</p>
    <p style="margin:0 0 14px;font-size:40px;font-weight:900;color:#e5893d;text-align:center;line-height:1.2;">₪${priceHtml(bid.amount)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;margin:0 0 14px;overflow:hidden;" dir="rtl">
      <tr>
        <td style="background:#3e6b8a08;border:1px solid #3e6b8a22;border-bottom:none;padding:10px 14px;text-align:center;">
          <span style="display:block;font-size:16px;font-weight:900;color:#18181b;">${bidsCount} הצעות עד כה</span>
          <span style="display:block;font-size:11px;color:#71717a;font-weight:700;">מתחרים על הפריט שלך</span>
        </td>
      </tr>
      <tr>
        <td style="background:#e5893d08;border:1px solid #e5893d33;border-bottom:none;padding:10px 14px;text-align:center;">
          <span style="display:block;font-size:16px;font-weight:900;color:#e5893d;">${escHtml(product.highest_bidder || "מתחרה")}</span>
          <span style="display:block;font-size:11px;color:#71717a;font-weight:700;">במקום הראשון כרגע</span>
        </td>
      </tr>
      <tr>
        <td style="background:#3e6b8a08;border:1px solid #3e6b8a22;padding:10px 14px;text-align:center;">
          <span style="display:block;font-size:16px;font-weight:900;color:#3e6b8a;">${leftLabel}</span>
          <span style="display:block;font-size:11px;color:#71717a;font-weight:700;">לסגירת העסקה</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;margin:0 0 4px;" dir="rtl">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#7c2d12;">
        <strong>🔥 אל תפסיד את הרגע:</strong> ${bidsCount > 1 ? `כבר <strong>${bidsCount} קונים</strong> מתחרים על הפריט שלך, והמחיר רק עולה. ` : ""}המכרז נסגר בעוד רגע — ${leftMs <= 3600000 && leftMs > 0 ? "פחות משעה! " : ""}היכנס עכשיו לעקוב אחרי הקרב, ענה לקונים בצ'אט החי ודחוף אותם להצעה הבאה. מי שלא עוקב — מפסיד מכירה.
      </td></tr>
    </table>
    ${productCard(product, productUrl)}`;
  return {
    subject: `🚨 הצעה חדשה על "${product.title}" — ₪${priceHtml(bid.amount)} (${leftLabel})`,
    html: shell({
      title: "הצעה חדשה במכרז שלך!",
      heroColor: "#e5893d",
      heroEmoji: "🔥",
      heroLine: bidsCount > 1 ? `${bidsCount} הצעות בקרב — וזה רק מתחיל` : "ההצעה הראשונה נרשמה",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "🔥 רוצה לראות מי מתחרה? היכנס עכשיו →",
    }),
    text: `שלום ${product.seller_name || "מוכר"},\n\nהתקבלה הצעה חדשה על המוצר שלך:\n\nמוצר: ${product.title}\nהצעה חדשה: ₪${priceHtml(bid.amount)}\nסך ההצעות: ${bidsCount}\n${leftLabel}\n\nהיכנס עכשיו לעקוב אחרי הקרב ולענות לקונים בצ'אט החי:\n${productUrl}`,
  };
}

// ── Admin: real-time tracking update on every bid ──
export function adminBidEmail(product, bid) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const body = `
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">התקבלה הצעה חדשה במכרז <strong>${escHtml(product.title)}</strong>:</p>
    <p style="margin:0 0 14px;font-size:34px;font-weight:900;color:#e5893d;text-align:center;">₪${priceHtml(bid.amount)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f4f4f5;border-radius:14px;margin:16px 0;">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#3f3f46;">
        מציע: <strong>${escHtml(bid.bidder_name || "אנונימי")}</strong>${bid.bidder_email ? ` (${escHtml(bid.bidder_email)})` : ""}<br>
        מוכר: <strong>${escHtml(product.seller_name || "—")}</strong>${product.seller_email ? ` (${escHtml(product.seller_email)})` : ""}<br>
        סך ההצעות: <strong>${product.bid_count ?? "—"}</strong>
      </td></tr>
    </table>
    ${productCard(product, productUrl)}`;
  return {
    subject: `הצעה חדשה: ${product.title} — ₪${priceHtml(bid.amount)}`,
    html: shell({
      title: "עדכון הצעה חדשה",
      heroColor: "#3e6b8a",
      heroEmoji: "📊",
      heroLine: "מעקב מכרזים בזמן אמת",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "צפה במכרז →",
    }),
    text: `התקבלה הצעה חדשה במכרז "${product.title}"\n\nהצעה: ₪${priceHtml(bid.amount)}\nמציע: ${bid.bidder_name || "אנונימי"}${bid.bidder_email ? ` (${bid.bidder_email})` : ""}\nמוכר: ${product.seller_name || "—"} (${product.seller_email || "—"})\nסך ההצעות: ${product.bid_count ?? "—"}\n\nקישור: ${productUrl}`,
  };
}

// ── Seller: buyer question from the live chat, forwarded in real time ──
export function sellerQuestionEmail(product, { question, asker_name, asker_contact }) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const asker = asker_name || "קונה מהצ'אט";
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">⚡ נשאלה כרגע שאלה חדשה על המוצר שלך בצ'אט החי. ענה מהר — קונה שמקבל תשובה מהירה הרבה יותר מוכן להציע!</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border:1px solid #f4f4f5;border-radius:14px;margin:18px 0;">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#a1a1aa;">השאלה של ${escHtml(asker)}:</p>
        <p style="margin:0;font-size:16px;line-height:1.7;color:#18181b;white-space:pre-line;">${escHtml(question)}</p>
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:14px;margin:16px 0;">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#3f3f46;">
        שם השואל: <strong>${escHtml(asker)}</strong><br>
        ${asker_contact ? `דרך חזרה: <strong style="color:#e5893d;">${escHtml(asker_contact)}</strong><br>` : ""}
        השאלה נשלחה בזמן אמת מעמוד המכירה — ענה ישירות לשואל כדי לסגור את המכירה.
      </td></tr>
    </table>
    ${productCard(product, productUrl)}`;
  return {
    subject: `⚡ שאלה חדשה בצ'אט על "${product.title}"`,
    html: shell({
      title: "שאלה חדשה מקונה!",
      heroColor: "#e5893d",
      heroEmoji: "⚡",
      heroLine: "נשלח בזמן אמת מהצ'אט החי",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "צפה במכרז שלך →",
    }),
    text: `שלום ${product.seller_name || "מוכר"},\n\nנשאלה שאלה חדשה על "${product.title}" בצ'אט החי:\n\n"${question}"\n\nשואל: ${asker}${asker_contact ? ` (${asker_contact})` : ""}\n\nקישור למכרז: ${productUrl}\n\nענה מהר כדי לסגור את המכירה!`,
  };
}

// ── Bidder: the auction they bid on was cancelled by the seller ──
export function bidderCancelEmail(product, bidderName) {
  const auctionsUrl = `${APP_BASE_URL}/auctions`;
  const name = bidderName || "לקוח bidli";
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(name)},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">המוכר ביטל את המכרז <strong style="color:#18181b;">${escHtml(product.title)}</strong>, שהצעת בו הצעה. ההצעה שלך בוטלה אוטומטית ולא תחויב בדבר.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">מצטערים על אי הנוחות 🙏 מכרזים חדשים מתפרסמים באתר כל הזמן — מוזמנים לעיין במכרזים הפעילים ולמצוא פריט מעניין נוסף.</p>
    ${productCard(product, auctionsUrl)}`;
  return {
    subject: `המכרז "${product.title}" בוטל`,
    html: shell({
      title: "המכרז בוטל",
      heroColor: "#6b7280",
      heroEmoji: "🚫",
      heroLine: "המוכר ביטל את המכרז",
      bodyHtml: body,
      ctaUrl: auctionsUrl,
      ctaLabel: "לכל המכרזים הפעילים →",
    }),
    text: `שלום ${name},\n\nהמוכר ביטל את המכרז "${product.title}" שהצעת בו. ההצעה בוטלה ולא תחויב בדבר.\n\nמכרזים פעילים: ${auctionsUrl}`,
  };
}

// ── Seller: their item was saved to a user's favorites ──
export function sellerFavoriteEmail(product, saverName) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const name = saverName || "משתמש באתר";
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">❤️ <strong>${escHtml(name)}</strong> שמר כרגע את הפריט שלך <strong style="color:#e5893d;">${escHtml(product.title)}</strong> ברשימת המועדפים — סימן שיש בו עניין אמיתי!</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:14px;margin:16px 0;" dir="rtl">
      <tr><td style="padding:14px 16px;font-size:14px;line-height:1.9;color:#9d174d;">
        <strong>💡 טיפ:</strong> כל שומר במועדפים הוא קונה פוטנציאלי. שתף את המכרז בקבוצות ובין מכרים, והיערך להצעות בשעות הסיום — רוב ההצעות מגיעות ברגע האחרון!
      </td></tr>
    </table>
    ${productCard(product, productUrl)}`;
  return {
    subject: `❤️ ${escHtml(product.title)} נשמר במועדפים`,
    html: shell({
      title: "הפריט שלך נשמר במועדפים!",
      heroColor: "#e5893d",
      heroEmoji: "❤️",
      heroLine: "קונה פוטנציאלי עוקב אחרי המכרז שלך",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "צפה במכרז שלך →",
    }),
    text: `שלום ${product.seller_name || "מוכר"},\n\n${name} שמר את "${product.title}" ברשימת המועדפים — סימן שיש בו עניין אמיתי!\n\nקישור למכרז: ${productUrl}\n\nהיערך להצעות בשעות הסיום.`,
  };
}

// ── Collector: new auction matching their interests (categories / product keywords) ──
export function interestAlertEmail(product, ownerName, reasonLabel) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(ownerName || "אספן")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">התפרסם כרגע מכרז חדש שתואם לתחומי העניין שבחרת — <strong style="color:#e5893d;">${escHtml(reasonLabel)}</strong>. המכרז פתוח ל-24 שעות בלבד, אז שווה להציע מוקדם!</p>
    ${productCard(product, productUrl)}`;
  return {
    subject: `🆕 מכרז חדש בתחום שלך: ${product.title}`,
    html: shell({
      title: "מכרז חדש בשבילך!",
      heroColor: "#e5893d",
      heroEmoji: "🆕",
      heroLine: reasonLabel,
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "הצע מחיר עכשיו →",
    }),
    text: `שלום ${ownerName || "אספן"},\n\nהתפרסם מכרז חדש בתחום שעקבת אחריו (${reasonLabel}):\n\nמוצר: ${product.title}\nמחיר פתיחה: ₪${(product.starting_price || 0).toLocaleString("he-IL")}\nמשך המכרז: 24 שעות\n\nקישור למכרז: ${productUrl}`,
  };
}