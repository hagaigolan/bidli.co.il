import { BadgeCheck, ScrollText, CalendarDays, Award } from "lucide-react";

// פרטי אותנטיות ומקור של הפריט — מוצג רק אם המוכר הזין לפחות שדה אחד
export default function AuthenticityBlock({ product }) {
  if (!product) return null;

  const rows = [
    product.has_certificate && {
      icon: BadgeCheck,
      label: "תעודת אותנטיות",
      value: product.certificate_issuer || "קיימת תעודה לפריט",
    },
    product.period && { icon: CalendarDays, label: "תקופה", value: product.period },
    product.provenance && { icon: ScrollText, label: "מקור ובעלות", value: product.provenance },
    product.expert_appraisal && { icon: Award, label: "הערכת מומחה", value: product.expert_appraisal },
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <div className="pt-2 border-t border-gray-100" dir="rtl">
      <p className="text-sm font-semibold text-gray-700 mb-2">אותנטיות ומקור</p>
      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "#3e6b8a" }} aria-hidden="true" />
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800">{label}: </span>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}