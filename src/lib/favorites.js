// Identifies the current visitor for their personal favorites list.
// Uses the bidder email when set, otherwise a stable per-device key.
export function getOwnerKey() {
  const email = localStorage.getItem("bidder_email");
  if (email) return email;
  let key = localStorage.getItem("fav_owner_key");
  if (!key) {
    key = "device-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("fav_owner_key", key);
  }
  return key;
}