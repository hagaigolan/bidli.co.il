import { ListChecks } from "lucide-react";
import { filledAttributes } from "@/lib/categoryAttributes";

// טבלת "פרטים נוספים" בעמוד המכרז — מוצגת רק כשהמוכר מילא מאפיינים
export default function ExtraDetailsTable({ product }) {
  const rows = filledAttributes(product);
  if (!rows.length) return null;

  return (
    <div className="pt-2 border-t border-gray-100" dir="rtl">
      <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <ListChecks className="h-4 w-4" style={{ color: "#3e6b8a" }} aria-hidden="true" />
        פרטים נוספים
      </p>
      <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
        <caption className="sr-only">פרטים נוספים על הפריט</caption>
        <tbody>
          {rows.map(({ key, label, value }, i) => (
            <tr key={key} style={{ background: i % 2 === 0 ? "#fafafa" : "#ffffff" }}>
              <th scope="row" className="text-right align-top font-semibold text-gray-600 px-3 py-2 w-2/5">{label}</th>
              <td className="text-gray-800 px-3 py-2">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}