import { Trophy, Upload, Bell, Package, Star } from "lucide-react";

// מה מקבלים בהרשמה — הסבר לאורחים בעמודי הכניסה וההרשמה
const BENEFITS = [
  { icon: Trophy, color: "#e5893d", text: "הגשת הצעות במכרזים חיים וקנייה מיידית במחיר היעד" },
  { icon: Package, color: "#00a35c", text: "הזכיות, ההזמנות ומעקב תשלום ומסירה — בדשבורד האישי" },
  { icon: Bell, color: "#3e6b8a", text: "שמירת פריטים למועדפים והתראה מיידית כשעוקפים אותך" },
  { icon: Upload, color: "#2d4f68", text: "פרסום מכרזים ומכירה בחינם — ללא עמלות נסתרות" },
  { icon: Star, color: "#f97316", text: "פרופיל מוכר, דירוגים ובניית מוניטין בקהילת האספנים" },
];

export default function RegistrationBenefits() {
  return (
    <div className="mt-6 pt-5 border-t border-border" dir="rtl">
      <p className="text-sm font-bold text-gray-900 mb-3">מה מקבלים בהרשמה?</p>
      <ul className="space-y-2">
        {BENEFITS.map(({ icon: Icon, color, text }) => (
          <li key={text} className="flex items-start gap-2 text-xs text-gray-500">
            <Icon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color }} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}