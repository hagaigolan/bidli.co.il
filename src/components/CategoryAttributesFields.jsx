import { getCategoryAttributes } from "@/lib/categoryAttributes";

// שדות מאפיינים ייעודיים לפי הקטגוריה שנבחרה — כולם אופציונליים
export default function CategoryAttributesFields({ category, value = {}, onChange }) {
  const fields = getCategoryAttributes(category);
  if (!fields.length) return null;
  const setField = (key, v) => onChange({ ...value, [key]: v });

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 space-y-3" dir="rtl">
      <div>
        <p className="text-sm font-semibold text-gray-700">מאפיינים נוספים — {category}</p>
        <p className="text-xs text-gray-400 mt-0.5">אופציונלי. פרטים מדויקים עוזרים לקונים להחליט ומשפרים את הסינון בעמוד המכרזים.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(f => (
          <div key={f.key}>
            <label htmlFor={`attr-${f.key}`} className="block text-xs text-gray-500 mb-1">{f.label}</label>
            <input
              id={`attr-${f.key}`}
              value={value[f.key] || ""}
              onChange={e => setField(f.key, e.target.value)}
              placeholder={f.label}
              maxLength={120}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right"
            />
          </div>
        ))}
      </div>
    </div>
  );
}