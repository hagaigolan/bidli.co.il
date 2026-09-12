import { base44 } from "@/api/base44Client";

// בדיקה אם אחת מהכתובות שייכת למשתמש מושהה (is_banned)
export async function isAnyEmailBanned(emails) {
  const list = (emails || []).map(e => (e || "").trim().toLowerCase()).filter(Boolean);
  for (const email of list) {
    try {
      const users = await base44.entities.User.filter({ email });
      if (users.length > 0 && users[0].is_banned) return true;
    } catch {}
  }
  return false;
}