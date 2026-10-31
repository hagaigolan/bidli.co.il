import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, Tag, MapPin, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildSuggestions } from "@/lib/smartSearch";
import VoiceSearchButton from "@/components/VoiceSearchButton";

const GROUPS = [
  { key: "categories", label: "קטגוריות", icon: Tag },
  { key: "cities", label: "ערים", icon: MapPin },
  { key: "terms", label: "מונחים ומותגים פופולריים", icon: TrendingUp },
];

// תיבת החיפוש הראשית: חיפוש מילות מפתח חכם, השלמה אוטומטית מתוך המכרזים וחיפוש קולי
export default function SmartSearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = "למשל: גיטרה אקוסטית עד 3000 במרכז",
  inputClassName = "",
  containerClassName = "",
  autoFocus = false,
}) {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  // טעינת המכרזים פעם אחת עם הרכבת הרכיב — ההצעות מוכנות עוד לפני ההקלדה
  useEffect(() => {
    let alive = true;
    base44.entities.Product.filter({}, "-created_date", 200)
      .then((res) => {
        if (!alive) return;
        const list = Array.isArray(res) ? res : res?.items || [];
        setProducts(list);
      })
      .catch(() => setProducts([]));
    return () => { alive = false; };
  }, []);

  const groups = useMemo(
    () => buildSuggestions(value, products),
    [value, products]
  );

  // כל ההצעות השטוחות — לפי אותו סדר שבו הן מוצגות (לאינדקס החצים)
  const flat = useMemo(
    () => GROUPS.flatMap((g) => groups[g.key].map((v) => ({ ...g, value: v }))),
    [groups]
  );

  // חיתוך ההצעות לקבוצות עם אינדקס פתיחה לכל קבוצה
  const sections = useMemo(() => {
    let start = 0;
    return GROUPS
      .map((g) => ({ ...g, values: groups[g.key] }))
      .filter((g) => g.values.length > 0)
      .map((g) => {
        const withIndex = { ...g, start };
        start += g.values.length;
        return withIndex;
      });
  }, [groups]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  const submit = (term) => {
    const finalTerm = String(term ?? value).trim();
    setOpen(false);
    onSubmit(finalTerm);
  };

  const choose = (item) => {
    onChange(item.value);
    submit(item.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "ArrowDown" && flat.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i + 1) % flat.length);
      return;
    }
    if (e.key === "ArrowUp" && flat.length) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flat[activeIndex]) choose(flat[activeIndex]);
      else submit();
    }
  };

  const showList = open && flat.length > 0;

  return (
    <div ref={boxRef} className={`relative ${containerClassName}`} dir="rtl">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        autoFocus={autoFocus}
        role="combobox"
        aria-label="חיפוש באתר"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (String(value || "").trim().length >= 2) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
      />
      <VoiceSearchButton
        onResult={(text) => {
          onChange(text);
          submit(text);
        }}
      />

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label="הצעות חיפוש"
          className="absolute top-full mt-2 right-0 left-0 z-[120] max-h-80 overflow-y-auto rounded-2xl border border-border bg-background shadow-xl py-1.5 text-right"
        >
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <li key={section.key} role="presentation">
                <p className="flex items-center gap-1.5 px-3 pt-1.5 pb-1 text-[11px] font-bold text-muted-foreground">
                  <SectionIcon className="h-3 w-3" aria-hidden="true" />
                  {section.label}
                </p>
                <ul role="presentation">
                  {section.values.map((v, i) => {
                    const index = section.start + i;
                    const active = index === activeIndex;
                    return (
                      <li key={`${section.key}-${v}`} role="option" aria-selected={active} id={`${listId}-${index}`}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => choose({ value: v })}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-right transition-colors ${active ? "bg-muted font-bold" : "font-medium"} hover:bg-muted`}
                        >
                          <span className="flex-1 truncate text-foreground">{v}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {section.key !== sections[sections.length - 1].key && <div className="mx-3 my-1 border-t border-border" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}