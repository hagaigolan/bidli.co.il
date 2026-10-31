import { SORT_OPTIONS } from "@/lib/auctionSort";

// בקרת מיון מכרזים — משותפת לעמוד הבית ולעמוד כל המכרזים
export default function SortBar({ sort, onChange, options = SORT_OPTIONS }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 mb-5" dir="rtl">
      {options.map(opt => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          aria-pressed={sort === opt.id}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            sort === opt.id
              ? "text-white"
              : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-orange-50 hover:text-[#e5893d]"
          }`}
          style={sort === opt.id ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" } : undefined}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}