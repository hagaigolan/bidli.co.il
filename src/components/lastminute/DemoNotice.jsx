import { Megaphone } from "lucide-react";

// סימון "פרסומת לדוגמה" בראש מכרז הדגמה — כדי שהמכרז לא ייראה כהזמנה אמיתית
export default function DemoNotice({ className = "" }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 ${className}`}
      style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
      role="note">
      <Megaphone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: "#c2410c" }} aria-hidden="true" />
      <p className="text-[11px] font-bold leading-relaxed" style={{ color: "#9a3412" }}>
        פרסומת לדוגמה — מכרז הדגמה להמחשת המערכת. אינו שירות אמיתי ואינו ניתן לרכישה.
      </p>
    </div>
  );
}