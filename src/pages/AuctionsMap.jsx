import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { setPageMeta } from "@/lib/seo";
import { lookupCityCoords } from "@/lib/cityCoords";
import { ArrowRight, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// מפת המכרזים הפעילים — פינים לפי מיקום האיסוף/המוכר
const CENTER = [31.9, 34.9];

const pinIcon = (label) => L.divIcon({
  className: "",
  html: `<div style="background:linear-gradient(135deg,#e5893d,#3e6b8a);color:#fff;font-weight:900;font-size:11px;padding:4px 8px;border-radius:999px;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap;border:2px solid #fff;">${label}</div>`,
  iconSize: [0, 0],
  iconAnchor: [30, 14],
});

// מיקוד המפה אוטומטית על המכרזים הפעילים — כך מפת ישראל נראית מלאה וכל הפינים במסגרת
function MapAdjuster({ pins }) {
  const map = useMap();
  useEffect(() => {
    if (!pins.length) return;
    const bounds = L.latLngBounds(pins.map(p => [p.coords.lat, p.coords.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    // תיקון תצוגה כשגודל המכל מתעדכן אחרי הרינדור הראשוני (אריחים אפורים)
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map, pins]);
  return null;
}

export default function AuctionsMap() {
  const [pins, setPins] = useState(null);

  useEffect(() => {
    setPageMeta({
      title: "מפת מכרזים — מצא מכרזים פעילים לפי מיקום | bidli",
      description: "מפה אינטראקטיבית של המכרזים הפעילים באתר לפי מיקום האיסוף העצמי — ראה מה סגור אליך והצע מחיר.",
    });
    base44.entities.Product.list("-created_date", 60)
      .then(items => {
        const now = new Date();
        const mapped = (items || [])
          .filter(p => p.status !== "cancelled" && p.ends_at && new Date(p.ends_at) > now)
          .map(p => ({ ...p, coords: lookupCityCoords(p.location) }))
          .filter(p => p.coords)
          .slice(0, 40);
        setPins(mapped);
      })
      .catch(() => setPins([]));
  }, []);

  const unlocated = pins === null ? 0 : Math.max(0, pins.length);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-gray-100 py-6 px-4" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
        <div className="max-w-6xl mx-auto">
          <Link to="/auctions" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            חזרה לרשימת המכרזים
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #e5893d18, #3e6b8a11)", border: "1px solid #e5893d44" }}>
              <MapPin className="h-5 w-5" style={{ color: "#e5893d" }} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">מפת המכרזים</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {pins === null ? "טוען מכרזים..." : `${unlocated} מכרזים פעילים עם מיקום מוגדר — לחץ/י על פין למעבר למכרז`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {pins === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-gray-100 border-t-[#e5893d] rounded-full animate-spin" />
          </div>
        ) : pins.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="font-bold text-gray-700 mb-1">אין מכרזים עם מיקום מוגדר כרגע</p>
            <p className="text-sm text-gray-400">המכרזים שמציינים עיר או אזור יופיעו כאן אוטומטית</p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ height: "70vh", minHeight: 420 }}>
              <MapContainer center={CENTER} zoom={7} scrollWheelZoom style={{ height: "100%", width: "100%" }} dir="ltr">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapAdjuster pins={pins} />
                {pins.map(p => (
                  <Marker key={p.id} position={[p.coords.lat, p.coords.lng]} icon={pinIcon(`₪${(p.current_price || p.starting_price || 0).toLocaleString()}`)}>
                    <Popup>
                      <div dir="rtl" style={{ textAlign: "right", minWidth: 160 }}>
                        <strong style={{ display: "block", marginBottom: 4 }}>{p.title}</strong>
                        <span style={{ color: "#e5893d", fontWeight: 900 }}>
                          ₪{(p.current_price || p.starting_price || 0).toLocaleString()}
                        </span>
                        {p.location && <span style={{ display: "block", fontSize: 11, color: "#71717a" }}>{p.location}</span>}
                        <a href={`/auction/${p.id}`} style={{ display: "block", marginTop: 6, color: "#3e6b8a", fontWeight: 700, fontSize: 12 }}>
                          למכרז ←
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              המיקום מבוסס על העיר/האזור שהמוכר ציין — מתאים במיוחד לעתיקות ולפריטים גדולים הדורשים איסוף עצמי
            </p>
          </>
        )}
      </div>
    </div>
  );
}