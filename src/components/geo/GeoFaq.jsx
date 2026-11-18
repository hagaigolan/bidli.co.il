import { Link } from "react-router-dom";

/** רשימת שאלות ותשובות ארוכות — כל תשובה מוצגת במלואה, בפסקאות נפרדות. */
export default function GeoFaq({ items, title = "שאלות ותשובות", intro }) {
  return (
    <section className="mt-12">
      <h2 className="mb-3 text-2xl font-black text-gray-900 md:text-3xl">{title}</h2>
      {intro && <p className="mb-8 max-w-3xl text-[15px] leading-8 text-gray-600">{intro}</p>}

      <div className="space-y-9">
        {items.map((item) => (
          <article key={item.q}>
            <h3 className="mb-2.5 border-r-4 border-[#e5893d] pr-3 text-lg font-bold leading-snug text-[#2d4f68] md:text-xl">
              {item.q}
            </h3>
            {String(item.a).split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-3 text-[15px] leading-8 text-gray-700 md:text-base">{paragraph}</p>
            ))}
            {item.links?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {item.links.map((link) => (
                  <Link key={link.to + link.label} to={link.to}
                    className="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white"
                    style={{ borderColor: "#3e6b8a33", color: "#3e6b8a", background: "#3e6b8a08" }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}