import { Wallet, Truck, Info } from "lucide-react";

// תנאי המשך העסקה אחרי הזכייה — מוצג לפני הגשת הצעה
export default function WinTermsInfo() {
  return (
    <div className="rounded-2xl border border-gray-200 p-4" dir="rtl" style={{ background: "#f9fafb" }}>
      <p className="flex items-center gap-2 text-sm font-black text-gray-800 mb-2">
        <Info className="h-4 w-4 flex-shrink-0" style={{ color: "#3e6b8a" }} aria-hidden="true" />
        זכית? כך ממשיכים
      </p>
      <ul className="space-y-1.5 text-xs text-gray-600">
        <li className="flex items-start gap-2">
          <Wallet className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#e5893d" }} aria-hidden="true" />
          <span>התשלום משולם ישירות למוכר — בהעברה בנקאית, bit או אמצעי אחר שהמוכר הגדיר</span>
        </li>
        <li className="flex items-start gap-2">
          <Truck className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: "#e5893d" }} aria-hidden="true" />
          <span>האיסוף או המשלוח מתואמים ישירות בין הקונה למוכר לאחר הזכייה</span>
        </li>
      </ul>
    </div>
  );
}