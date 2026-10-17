import { Check } from "lucide-react";

// מחוון התקדמות פשוט ב-3 שלבים לטופס הפרסום: פרטים ← תמונות ← פרסום
const STEPS = ["פרטים", "תמונות", "פרסום"];

export default function UploadProgress({ hasDetails, hasImages, publishing }) {
  const current = publishing ? 2 : hasImages ? 2 : hasDetails ? 1 : 0;

  return (
    <div className="flex items-center gap-1.5 overflow-hidden" dir="rtl" aria-label="מחוון התקדמות פרסום">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center gap-1.5 min-w-0">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
                done || active ? "text-white border-transparent" : "text-gray-400 border-gray-200"
              }`}
              style={done
                ? { background: "#00a844" }
                : active
                ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)" }
                : undefined}
            >
              {done ? <Check className="h-3 w-3" aria-hidden="true" /> : <span>{i + 1}</span>}
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}