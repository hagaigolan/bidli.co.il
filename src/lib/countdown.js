// פורמט זמן שנותר למכרז — קצר וברור: "3:41:12", "12:05" או "הסתיים"
export function formatTimeLeft(endsAt, now = Date.now()) {
  const diff = new Date(endsAt).getTime() - now;
  if (!Number.isFinite(diff)) return "";
  if (diff <= 0) return "הסתיים";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} ימים`;
  }
  const pad = (n) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

export function isLiveAuction(product, now = Date.now()) {
  if (!product) return false;
  if (product.status !== "active") return false;
  return new Date(product.ends_at).getTime() > now;
}