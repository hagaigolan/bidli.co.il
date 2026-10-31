// מחוון טעינה קליל לעמודים שנטענים עצל (React.lazy) — מונע הבהוב מסך ריק
export default function RouteLoader() {
  return (
    <div className="w-full flex items-center justify-center py-24" role="status" aria-live="polite" dir="rtl">
      <div
        className="w-8 h-8 rounded-full border-4 border-gray-100 animate-spin"
        style={{ borderTopColor: "#e5893d" }}
        aria-hidden="true"
      />
      <span className="sr-only">טוען…</span>
    </div>
  );
}