import { useEffect, useState } from "react";
import { ArrowLeftRight, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { COMPARE_EVENT, MAX_COMPARE, getCompareIds, toggleCompare } from "@/lib/compare";

// כפתור "הוסף להשוואה" — משמש בכרטיסי מכרז ובלשונית הפעולות של עמוד הפריט
export default function CompareButton({ productId, variant = "card" }) {
  const [active, setActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const sync = () => setActive(getCompareIds().includes(productId));
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    return () => window.removeEventListener(COMPARE_EVENT, sync);
  }, [productId]);

  const handle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleCompare(productId);
    if (res.full) {
      toast({
        title: `אפשר להשוות עד ${MAX_COMPARE} פריטים`,
        description: "הסר פריט אחד מההשוואה כדי להוסיף פריט חדש.",
      });
    }
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-pressed={active}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all hover:scale-[1.02]"
        style={active
          ? { background: "#2d4f6815", borderColor: "#2d4f68", color: "#2d4f68" }
          : { background: "white", borderColor: "#e5e7eb", color: "#6b7280" }}
      >
        {active ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
        {active ? "בהשוואה — לחץ להסרה" : "הוסף להשוואה"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={active}
      aria-label={active ? "הסר מהשוואה" : "הוסף להשוואה"}
      title={active ? "בהשוואה" : "הוסף להשוואה"}
      className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
      style={active
        ? { background: "#2d4f68", borderColor: "#2d4f68", color: "white" }
        : { background: "rgba(255,255,255,0.92)", borderColor: "#e5e7eb", color: "#6b7280" }}
    >
      {active ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}