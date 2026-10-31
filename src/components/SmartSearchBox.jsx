import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, Tag, MapPin, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { buildSuggestions } from "@/lib/smartSearch";
import VoiceSearchButton from "@/components/VoiceSearchButton";

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
  const [products, setProducts] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listId = useId();

  // טעינת המכרזים פעם אחת — ההצעות נבנות ממודעות אמיתיות
  const loadProducts = () => {
    if (products) return;
    base44.entities.Product.list("-created_date", 100)
      .then(setProducts)
      .catch(() => setProducts([]));
  };

  const groups = useMemo(
    () => (open ? buildSuggestions(value, products || []) : { categories: [], cities: [], terms: [] }),
    [open, value, products]
  );

  const flat = useMemo(() => [
    ...groups.categories.map((v) => ({ type: "קטגוריה", value: v, icon: Tag })),
    ...groups.cities.map((v) => ({ type: "עיר", value: v, icon: MapPin })),
    ...groups.terms.map((v) => ({ type: "מונח", value: v, icon: TrendingUp })),
  ], [groups]);

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
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
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
          loadProducts();
        }}
        onFocus={() => {
          loadProducts();
          if (value.trim().length >= 2) setOpen(true);
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
          className="absolute top-full mt-2 right-0 left-0 z-[80] max-h-80 overflow-y-auto rounded-2xl border border-border bg-background shadow-xl p-1.5 text-right"
        >
          {flat.map((item, i) => {
            const Icon = item.icon;
            const active = i === activeIndex;
            return (
              <li key={`${item.type}-${item.value}`} role="option" aria-selected={active} id={`${listId}-${i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-right transition-colors ${active ? "bg-muted font-bold" : "font-medium"}`}
                >
                  <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate text-foreground">{item.value}</span>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">{item.type}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}