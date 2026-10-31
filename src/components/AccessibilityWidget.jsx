import { useEffect, useState } from "react";
import { Accessibility, X, Check } from "lucide-react";

const STORAGE_KEY = "a11y_settings";

const OPTIONS = [
  { id: "large_text", label: "הגדלת טקסט", className: "a11y-large-text" },
  { id: "high_contrast", label: "ניגודיות גבוהה", className: "a11y-high-contrast" },
  { id: "reduce_motion", label: "הפחתת תנועה", className: "a11y-reduce-motion" },
  { id: "underline_links", label: "הדגשת קישורים", className: "a11y-underline-links" },
  { id: "letter_spacing", label: "ריווח בין אותיות", className: "a11y-letter-spacing" },
  { id: "line_height", label: "ריווח בין שורות", className: "a11y-line-height" },
  { id: "large_cursor", label: "סמן עכבר גדול", className: "a11y-large-cursor" },
  { id: "strong_focus", label: "מיקוד בולט", className: "a11y-strong-focus" },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    OPTIONS.forEach((opt) => {
      root.classList.toggle(opt.className, !!settings[opt.id]);
    });
  }, [settings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (id) => setSettings(s => ({ ...s, [id]: !s[id] }));
  const activeCount = OPTIONS.filter(o => settings[o.id]).length;

  return (
    <div
      className="fixed left-4 z-[90] bottom-[calc(var(--tabbar-h)+var(--safe-bottom)+1.5rem)]"
      dir="rtl"
    >
      {open && (
        <div
          role="dialog"
          aria-label="הגדרות נגישות"
          className="absolute bottom-16 left-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">נגישות</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת הגדרות נגישות"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="p-2">
            {OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                role="switch"
                aria-checked={!!settings[opt.id]}
                onClick={() => toggle(opt.id)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors text-right"
              >
                <span className="flex items-center gap-2">
                  {settings[opt.id] ? (
                    <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "#e5893d" }}>
                      <Check className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-md border-2 border-gray-200" aria-hidden="true" />
                  )}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
          {activeCount > 0 && (
            <div className="px-4 py-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSettings({})}
                className="text-xs font-semibold text-gray-500 hover:text-[#e5893d] transition-colors"
              >
                איפוס הגדרות
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label="הגדרות נגישות"
        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg, #3e6b8a, #2d4f68)" }}
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
        {activeCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
            style={{ background: "#e5893d" }}
          >
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}