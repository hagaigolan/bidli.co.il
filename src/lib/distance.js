import { lookupCityCoords } from "@/lib/cityCoords";

// סינון "קרוב אליי" — חישוב מרחק אווירי בין נקודת מוצא למיקום המכרז
export const RADIUS_OPTIONS = [10, 25, 50];

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a, b) {
  if (!a || !b) return null;
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

// נקודת המוצא: המיקום הנוכחי מהדפדפן, או העיר המרכזית שנבחרה
export function resolveCenter({ geoPoint, city }) {
  if (geoPoint && typeof geoPoint.lat === "number") return geoPoint;
  const hit = lookupCityCoords(city);
  return hit ? { lat: hit.lat, lng: hit.lng } : null;
}

// מרחק המכרז מנקודת המוצא (ק״מ) — null כשאין התאמת יישוב
export function productDistanceKm(product, center) {
  const loc = lookupCityCoords(product?.location);
  if (!loc || !center) return null;
  return haversineKm(center, loc);
}

export function withinRadius(product, center, radiusKm) {
  const d = productDistanceKm(product, center);
  return d !== null && d <= radiusKm;
}