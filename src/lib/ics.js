const pad = (n) => String(n).padStart(2, "0");

const toIcsDate = (date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;

const escapeText = (value) => String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// הורדת קובץ יומן (ICS) עם תזכורת 30 דקות לפני סיום המכרז
export function downloadAuctionIcs(product) {
  if (!product?.ends_at) return;
  const start = new Date(product.ends_at);
  const end = new Date(start.getTime() + 30 * 60000);
  const url = `${window.location.origin}/auction/${product.id}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//bidli//auctions//HE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:bidli-${product.id}@bidli.co.il`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeText(`סיום מכרז: ${product.title}`)}`,
    `DESCRIPTION:${escapeText(`המכרז מסתיים ב-bidli. להגשת הצעה: ${url}`)}`,
    `URL:${url}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText("30 דקות לסיום המכרז")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `bidli-auction-${product.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(link.href), 2000);
}