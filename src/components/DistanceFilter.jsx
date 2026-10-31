import { Navigation, X, LocateFixed } from "lucide-react";
import MobileSelect from "@/components/MobileSelect";
import { RADIUS_OPTIONS } from "@/lib/distance";

// סינון מכרזים לפי מרחק — עיר מרכזית + רדיוס, או איתור המיקום הנוכחי בלחיצה בלבד
export default function DistanceFilter({
  cities, city, setCity, radius, setRadius,
  onNearMe, locating, geoError, usingGeo, isActive, onClear,
}) {
  const inputCls = "px-3 py-2 text-sm bg-background text-foreground border border-border rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right w-full";
  const centerLabel = usingGeo ? "המיקום שלי" : city;

  return (
    <div className="mt-3 pt-3 border-t border-border" dir="rtl">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <p className="flex items-center gap-1.5 text-xs font-black text-foreground">
          <Navigation className="h-3.5 w-3.5" style={{ color: "#3e6b8a" }} aria-hidden="true" />
          סינון לפי מרחק
        </p>
        {isActive && (
          <button type="button" onClick={onClear}
            className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
            style={{ background: "#3e6b8a0f", color: "#3e6b8a", border: "1px solid #3e6b8a44" }}>
            <X className="h-3 w-3" aria-hidden="true" />
            סינון מרחק פעיל — עד {radius} ק״מ מ{centerLabel} · לביטול לחץ
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">עיר מרכזית</label>
          <MobileSelect value={city} onChange={setCity} options={cities}
            placeholder="בחר עיר" title="עיר מרכזית" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="block text-[11px] text-muted-foreground mb-1">רדיוס מהנקודה</label>
          <div className="flex gap-1.5">
            {RADIUS_OPTIONS.map(km => {
              const on = radius === km;
              return (
                <button key={km} type="button" aria-pressed={on}
                  onClick={() => setRadius(on ? 0 : km)}
                  className="flex-1 py-2 rounded-xl border text-xs font-bold transition-all"
                  style={on
                    ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent", color: "#fff" }
                    : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))", background: "hsl(var(--background))" }}>
                  {km} ק״מ
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" onClick={onNearMe} disabled={locating}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-60"
          style={usingGeo
            ? { borderColor: "#00a35c66", color: "#00a35c", background: "#00a35c0f" }
            : { borderColor: "#3e6b8a44", color: "#3e6b8a", background: "#3e6b8a08" }}>
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          {locating ? "מאתר מיקום..." : usingGeo ? "אותר המיקום שלי" : "קרוב אליי"}
        </button>
      </div>

      {geoError && <p className="text-[11px] text-red-500 mt-1.5" role="status">{geoError}</p>}
      {!isActive && (city || usingGeo) && (
        <p className="text-[11px] text-muted-foreground mt-1.5">בחרו רדיוס כדי להפעיל את סינון המרחק</p>
      )}
    </div>
  );
}