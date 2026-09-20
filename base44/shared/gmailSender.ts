// Gmail sender — sends designed notifications from the builder's connected Gmail
// account via the Gmail API (shared connector "gmail", scope gmail.send).

import libmime from "npm:libmime@1";

const ADMIN_EMAIL = "hagaigol1@gmail.com";

function utf8Base64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

// Builds an RFC 2822 multipart/alternative message.
// Subject is encoded with RFC 2047 (via libmime) so Hebrew and emoji are safe;
// bodies are base64-encoded, so the raw message is pure ASCII.
const EMAIL_RE = /^[^\s@,;:"'<>\\]+@[^\s@,;:"'<>\\]+\.[^\s@,;:"'<>\\]+$/;

// מניעת הזרקת כותרות (CRLF) — הנמען עלול להגיע מרשומות שנוצרות בצד הלקוח
// (למשל bidder_email מהצעה פומבית), ולכן מנקים תווי בקרה ומוודאים כתובת אחת תקינה
// לפני בניית ההודעה הגולמית.
function sanitizeRecipient(to) {
  const cleaned = String(to || "").replace(/[\u0000-\u001f\u007f]+/g, "");
  const first = cleaned.split(",")[0].trim();
  if (!EMAIL_RE.test(first)) {
    throw new Error("invalid recipient address");
  }
  return first;
}

export async function sendGmail(accessToken, { to, subject, html, text }) {
  const recipient = sanitizeRecipient(to);
  const boundary = "bidli_" + crypto.randomUUID().replace(/-/g, "");
  const raw = [
    `To: ${recipient}`,
    `Subject: ${libmime.encodeWords(subject)}`,
    "MIME-Version: 1.0",
    `Date: ${new Date().toUTCString()}`,
    `Message-Id: <${crypto.randomUUID()}@bidli.co.il>`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    utf8Base64(text || ""),
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    utf8Base64(html),
    `--${boundary}--`,
  ].join("\r\n");

  const rawB64url = btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: rawB64url }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gmail send failed (${res.status}): ${detail}`);
  }
  return { to: recipient, subject, ok: true };
}

export { ADMIN_EMAIL };