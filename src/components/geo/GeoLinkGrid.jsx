import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** רשת קישורים פנימיים לעמודי קטגוריה, מדריכים וכלים. */
export default function GeoLinkGrid({ title, links, intro }) {
  return (
    <section className="mt-12">
      {title && <h2 className="mb-3 text-2xl font-black text-gray-900 md:text-3xl">{title}</h2>}
      {intro && <p className="mb-6 max-w-3xl text-[15px] leading-8 text-gray-600">{intro}</p>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.to + link.label} to={link.to}
            className="group rounded-2xl border border-gray-100 p-4 transition-all hover:-translate-y-0.5 hover:border-[#e5893d55] hover:shadow-sm">
            <p className="mb-1 flex items-center justify-between gap-2 text-sm font-bold text-gray-900 group-hover:text-[#c9722c]">
              {link.label}
              <ArrowLeft className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            </p>
            {link.desc && <p className="text-xs leading-6 text-gray-500">{link.desc}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}