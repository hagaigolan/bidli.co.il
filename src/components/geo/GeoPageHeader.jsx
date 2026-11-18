import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

/** כותרת עמוד GEO: פירורי לחם, כותרת ראשית, פסקת פתיחה ותיבת "בקצרה" לתשובה ישירה. */
export default function GeoPageHeader({ title, lead, quickAnswer, breadcrumb = [] }) {
  return (
    <header className="border-b border-gray-100 px-4 py-10" style={{ background: "linear-gradient(135deg, #e5893d08, #3e6b8a05)" }}>
      <div className="mx-auto max-w-4xl">
        <nav aria-label="מיקום בעמוד" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-gray-400">
          <Link to="/" className="hover:text-gray-600">בידלי</Link>
          {breadcrumb.map((item, i) => (
            <span key={item.to || i} className="flex items-center gap-1">
              <ChevronLeft className="h-3 w-3" aria-hidden="true" />
              {item.to
                ? <Link to={item.to} className="hover:text-gray-600">{item.name}</Link>
                : <span className="text-gray-600">{item.name}</span>}
            </span>
          ))}
        </nav>

        <h1 className="mb-4 text-3xl font-black leading-tight text-gray-900 md:text-4xl">{title}</h1>
        {lead && <p className="max-w-3xl text-base leading-8 text-gray-600 md:text-lg">{lead}</p>}

        {quickAnswer && (
          <div className="mt-6 rounded-2xl border p-5" style={{ borderColor: "#e5893d40", background: "#e5893d0a" }}>
            <p className="mb-2 text-xs font-black" style={{ color: "#c9722c" }}>בקצרה</p>
            <p className="text-[15px] leading-8 text-gray-700">{quickAnswer}</p>
          </div>
        )}
      </div>
    </header>
  );
}