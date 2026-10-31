import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

// בורר תואם-נייטיב: במובייל נפתח כ-bottom sheet (Vaul), בדסקטופ נשאר select רגיל
function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export default function MobileSelect({
  value,
  onChange,
  options = [],
  placeholder = "",
  title,
  disabled = false,
  className = "",
  id,
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const opts = options.map(o => (typeof o === "string" ? { value: o, label: o } : o));
  const current = opts.find(o => o.value === value);

  if (!isMobile) {
    return (
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={className}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  return (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${className} flex items-center justify-between gap-2 disabled:opacity-60`}
      >
        <span className={`truncate ${current ? "" : "text-muted-foreground"}`}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent dir="rtl" className="z-[70] max-h-[80vh] bg-background">
          <DrawerHeader className="pb-1">
            <DrawerTitle className="text-base font-black text-foreground text-right">
              {title || placeholder || "בחירה"}
            </DrawerTitle>
          </DrawerHeader>
          <div
            className="overflow-y-auto px-2 pb-[calc(1rem+var(--safe-bottom))]"
            role="listbox"
            aria-label={title || placeholder}
          >
            {opts.map(o => {
              const active = o.value === value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl text-sm text-right transition-colors ${
                    active ? "font-bold" : "font-medium text-foreground hover:bg-muted"
                  }`}
                  style={active ? { background: "#e5893d12", color: "#e5893d" } : undefined}
                >
                  <span className="truncate">{o.label}</span>
                  {active && <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}