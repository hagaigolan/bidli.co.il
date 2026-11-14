// ── "בקצרה" — תשובה ישירה בראש המאמר ──
// מנועי חיפוש וכלי AI מצטטים בקלות פסקה שעונה על השאלה מיד, לפני ההסבר הארוך
export default function QuickAnswer({ text }) {
  if (!text) return null;
  return (
    <div
      className="rounded-2xl border p-5 mb-6"
      style={{ borderColor: "#e5893d33", background: "#e5893d08" }}
      dir="rtl"
    >
      <p className="text-xs font-black mb-2" style={{ color: "#e5893d" }}>בקצרה</p>
      <p className="text-base leading-relaxed text-gray-800 font-medium">{text}</p>
    </div>
  );
}