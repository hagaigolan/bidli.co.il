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

// ── Seller: new bid on their auction ──
export function sellerBidEmail(product, bid) {
  const productUrl = `${APP_BASE_URL}/auction/${product.id}`;
  const body = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#18181b;">שלום ${escHtml(product.seller_name || "מוכר")},</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#3f3f46;">התקבלה הצעה חדשה על המוצר שלך! 🚀</p>
    <p style="margin:0 0 14px;font-size:34px;font-weight:900;color:#e5893d;text-align:center;">₪${priceHtml(bid.amount)}</p>
    ${productCard(product, productUrl)}
    <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#71717a;">סך ההצעות על המוצר עד כה: <strong>${product.bid_count ?? "—"}</strong>. המשך לעקוב — תקבל עדכון בכל הצעה חדשה.</p>`;
  return {
    subject: `🚀 הצעה חדשה על "${product.title}" — ₪${priceHtml(bid.amount)}`,
    html: shell({
      title: "הצעה חדשה במכרז שלך!",
      heroColor: "#e5893d",
      heroEmoji: "🚀",
      heroLine: "מישהו הציע על המוצר שלך",
      bodyHtml: body,
      ctaUrl: productUrl,
      ctaLabel: "צפה במכרז שלך →",
    }),
    text: `שלום ${product.seller_name || "מוכר"},\n\nהתקבלה הצעה חדשה על המוצר שלך:\n\nמוצר: ${product.title}\nהצעה חדשה: ₪${priceHtml(bid.amount)}\nסך ההצעות: ${product.bid_count ?? "—"}\n\nקישור למכרז: ${productUrl}`,
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