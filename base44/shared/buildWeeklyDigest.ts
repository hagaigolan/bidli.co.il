// בניית מייל הדייג'סט השבועי — מקור אמת אחד ל-HTML ולטקסט.
// משותף ל-sendWeeklyDigest (השליחה השבועית) ול-sendDigestTest (שליחת בדיקה לנמען אחד).
// ה-HTML כולל קישור לחיץ לכל מכרז (תמונה + כותרת), וה-text/plain נקי לחלוטין ממרקאפ.

export const BASE_URL = 'https://bidli.co.il';
export const DIGEST_SUBJECT = '5 מכרזים שמסתיימים בקרוב ב-bidli';
const LOGO_URL = 'https://media.base44.com/images/public/6a32f31cf5e6cd9c550cedeb/3b6383a35_logo.png';

const esc = (s) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 5 המכרזים הפעילים שמסתיימים ב-48 השעות הקרובות, לפי מועד סיום
export function pickEndingAuctions(products, now) {
  const windowEnd = now + 48 * 3600 * 1000;
  return (products || [])
    .filter(p => p.ends_at && new Date(p.ends_at) > new Date(now) && new Date(p.ends_at) < new Date(windowEnd))
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at))
    .slice(0, 5);
}

export function toDigestItems(ending, now) {
  return (ending || []).map(p => {
    const hours = Math.max(1, Math.round((new Date(p.ends_at) - now) / 3600000));
    const price = (p.current_price || p.starting_price || 0).toLocaleString('he-IL');
    const endsText = new Date(p.ends_at).toLocaleString('he-IL', {
      timeZone: 'Asia/Jerusalem', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
    return { p, hours, price, endsText, url: `${BASE_URL}/auction/${p.id}` };
  });
}

// ── גרסת HTML: כל כרטיס עטוף בקישור לעמוד המכרז שלו ──
function itemsHtml(items) {
  const cards = items.map(({ p, hours, price, url }) => `
      <tr><td style="padding:0 0 12px 0">
        <a href="${esc(url)}" style="display:block;text-decoration:none;color:#111827;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:12px" dir="rtl">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="direction:rtl;border-collapse:collapse">
            <tr>
              <td width="80" valign="middle" style="padding-left:12px">
                ${p.image_url ? `<img src="${esc(p.image_url)}" width="72" height="72" alt="${esc(p.title)}" style="border-radius:12px;object-fit:cover;display:block;border:0" />` : ''}
              </td>
              <td valign="middle" dir="rtl" style="text-align:right">
                <div style="color:#111827;font-weight:bold;font-size:15px;line-height:1.4">${esc(p.title)}</div>
                <div style="color:#6b7280;font-size:12px;margin-top:4px">${esc(p.category || '')} · מסתיים בעוד ${hours} שעות</div>
                <div style="color:#e5893d;font-weight:bold;font-size:14px;margin-top:3px">₪${price}</div>
              </td>
            </tr>
          </table>
        </a>
      </td></tr>`).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="direction:rtl;border-collapse:collapse">${cards}</table>`;
}

// ── גרסת טקסט אמיתית (ללא HTML) — לקוחות שמציגים text/plain ──
function itemsText(items) {
  return items.map(({ p, hours, price, endsText, url }, i) =>
    `${i + 1}. ${(p.title || '').trim()}\n` +
    `   מחיר נוכחי: ₪${price}\n` +
    `   מסתיים: ${endsText} (בעוד ${hours} שעות)\n` +
    `   ${url}`
  ).join('\n\n');
}

export function buildDigestEmail(items, firstName) {
  const name = firstName || 'שלום';

  const html = `<div dir="rtl" style="background:#f4f4f5;padding:0;margin:0;direction:rtl">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;border-collapse:collapse">
    <tr><td align="center" style="padding:0">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="width:100%;max-width:600px;background:#ffffff;border-collapse:collapse;direction:rtl">
        <tr><td align="center" style="background:#111827;padding:20px">
          <a href="${BASE_URL}" style="text-decoration:none;border:0"><img src="${LOGO_URL}" alt="bidli" width="110" style="display:block;border:0;max-width:110px" /></a>
        </td></tr>
        <tr><td dir="rtl" style="padding:32px 32px 8px;text-align:right">
          <div style="color:#111827;font-size:26px;font-weight:800;line-height:1.2">שלום ${esc(name)}, אלה מסתיימים בקרוב</div>
          <div style="color:#6b7280;font-size:15px;line-height:1.6;padding-top:8px">5 המכרזים החמים של השבוע — עדיין אפשר להציע, עד הרגע האחרון.</div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px 8px">${itemsHtml(items)}</td></tr>
        <tr><td align="center" style="padding:16px 32px 32px">
          <a href="${BASE_URL}/auctions" style="display:inline-block;background:#111827;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:16px">לצפייה בכל המכרזים החיים</a>
        </td></tr>
        <tr><td align="center" style="background:#111827;padding:20px;color:#9ca3af;font-size:12px;line-height:1.6">
          bidli — פורטל המכרזים המוביל בישראל · מכרזים נסגרים תוך 24 שעות · ללא עמלות<br />
          הודעה זו נשלחה אליך מכיוון שנרשמת ל-bidli
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>`;

  const text = `שלום ${name}, אלה 5 המכרזים שמסתיימים בקרוב ב-bidli:

${itemsText(items)}

לכל המכרזים הפעילים:
${BASE_URL}/auctions

—
bidli — פורטל המכרזים המוביל בישראל · מכרזים נסגרים תוך 24 שעות · ללא עמלות
הודעה זו נשלחה אליך מכיוון שנרשמת ל-bidli`;

  return { subject: DIGEST_SUBJECT, html, text };
}