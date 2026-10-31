import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { getRecentSearches } from "@/lib/searchHistory";

// "החיפושים האחרונים שלי" — עד 10 חיפושים שבוצעו בפועל, עם קישור לחזרה על החיפוש
export default function RecentSearchesSection() {
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 mb-4">
      <h2 className="text-sm font-black text-gray-900 mb-3 flex items-center gap-2">
        <SearchIcon className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
        החיפושים האחרונים שלי
      </h2>

      {searches.length === 0 ? (
        <p className="text-xs text-gray-400">עדיין לא ביצעת חיפושים</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {searches.map((term) => (
            <li key={term}>
              <Link
                to={`/search?q=${encodeURIComponent(term)}`}
                className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.02]"
                style={{ background: "#e5893d0f", borderColor: "#e5893d33", color: "#b4671f" }}
              >
                {term}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}