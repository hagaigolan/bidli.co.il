import { SlidersHorizontal, X, Timer, Store } from "lucide-react";
import { CATEGORIES, CONDITIONS } from "@/lib/productMeta";
import MobileSelect from "@/components/MobileSelect";
import DistanceFilter from "@/components/DistanceFilter";

// לוח סינון לעמוד כל המכרזים — קטגוריה, טווח מחירים, מצב פריט, עיר ומסתיים בקרוב
export default function AuctionsFilterPanel({
  category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice,
  condition, setCondition, city, setCity, endingSoon, setEndingSoon,
  keyword, setKeyword, storeOnly, setStoreOnly,
  cities, count, totalCount, onReset,
  distanceActive, distanceCity, setDistanceCity, radius, setRadius,
  onNearMe, locating, geoError, usingGeo, onClearDistance,
  makers = [], models = [], maker, setMaker, model, setModel,
}) {
  const hasActive = category || minPrice || maxPrice || condition || city || endingSoon || keyword || storeOnly || distanceActive || maker || model;
  const chipCls = (on) =>
    `text-xs font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap ${
      on ? "text-white" : "bg-background text-muted-foreground hover:text-[#e5893d] hover:border-[#e5893d66]"
    }`;
  const chipStyle = (on) =>
    on ? { background: "linear-gradient(135deg, #e5893d, #3e6b8a)", borderColor: "transparent" } : { borderColor: "hsl(var(--border))" };
  const inputCls = "px-3 py-2 text-sm bg-background text-foreground border border-border rounded-xl focus:outline-none focus:border-[#e5893d88] transition-all text-right w-full";

  return (
    <div className="rounded-2xl border border-border bg-card p-4 mb-4" dir="rtl"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="flex items-center gap-2 text-sm font-black text-foreground">
          <SlidersHorizontal className="h-4 w-4" style={{ color: "#e5893d" }} aria-hidden="true" />
          סינון מכרזים
        </p>
        <div className="flex items-center gap-3">
          {hasActive && (
            <button onClick={onReset}
              className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> איפוס מסננים
            </button>
          )}
          <span className="text-xs font-black px-3 py-1.5 rounded-full"
            style={{ background: "#e5893d0f", color: "#e5893d", border: "1px solid #e5893d33" }}>
            {count} מתוך {totalCount} מכרזים
          </span>
        </div>
      </div>

      {/* קטגוריות — סינון במקום, בלי ניווט לעמודי קטגוריה */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-0.5">
        <button onClick={() => setCategory("")} className={chipCls(!category) + " flex-shrink-0"} style={chipStyle(!category)}>
          כל הקטגוריות
        </button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(category === c ? "" : c)}
            className={chipCls(category === c) + " flex-shrink-0"} style={chipStyle(category === c)}>
            {c}
          </button>
        ))}
      </div>

      {/* מילת מפתח — חיפוש בכותרות ובתיאורים */}
      <div className="mb-2">
        <label htmlFor="filter-keyword" className="block text-[11px] text-muted-foreground mb-1">מילת מפתח</label>
        <input id="filter-keyword" value={keyword || ""} onChange={e => setKeyword(e.target.value)}
          placeholder="לדוגמה: שעון, טבעת, חנוכייה..." className={inputCls} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 items-end">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">מחיר מ-</label>
          <input type="number" min="0" value={minPrice || ""} onChange={e => setMinPrice(Number(e.target.value) || 0)}
            placeholder="0" className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">מחיר עד-</label>
          <input type="number" min="0" value={maxPrice || ""} onChange={e => setMaxPrice(Number(e.target.value) || 0)}
            placeholder="ללא הגבלה" className={inputCls} dir="ltr" />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">מצב הפריט</label>
          <MobileSelect value={condition} onChange={setCondition} options={CONDITIONS}
            placeholder="כל המצבים" title="מצב הפריט" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">עיר</label>
          <MobileSelect value={city} onChange={setCity} options={cities}
            placeholder="כל הערים" title="עיר" className={inputCls} />
        </div>
        <button type="button" onClick={() => setEndingSoon(!endingSoon)} aria-pressed={endingSoon}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all"
          style={endingSoon
            ? { borderColor: "#e5893d", color: "#e5893d", background: "#e5893d0f" }
            : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))", background: "hsl(var(--background))" }}>
          <Timer className="h-3.5 w-3.5" aria-hidden="true" />
          מסתיים בקרוב
        </button>
        <button type="button" onClick={() => setStoreOnly(!storeOnly)} aria-pressed={storeOnly}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all"
          style={storeOnly
            ? { borderColor: "#3e6b8a", color: "#3e6b8a", background: "#3e6b8a0f" }
            : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))", background: "hsl(var(--background))" }}>
          <Store className="h-3.5 w-3.5" aria-hidden="true" />
          חדש מהחנות
        </button>
      </div>

      {/* סינון לפי מאפייני הפריט — יצרן ודגם מתוך המכרזים הפעילים */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end mt-3">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">יצרן / מותג</label>
          <MobileSelect value={maker || ""} onChange={setMaker} options={makers}
            placeholder="כל היצרנים" title="יצרן" className={inputCls} />
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">דגם</label>
          <MobileSelect value={model || ""} onChange={setModel} options={models}
            placeholder="כל הדגמים" title="דגם" className={inputCls} />
        </div>
        {makers.length === 0 && models.length === 0 && (
          <p className="col-span-2 text-[11px] text-muted-foreground">
            הסינון לפי יצרן ודגם יתמלא אוטומטית ברגע שיפורסמו מכרזים עם פרטי יצרן ודגם.
          </p>
        )}
      </div>

      {/* סינון לפי מרחק — עיר מרכזית + רדיוס, או איתור המיקום הנוכחי בלחיצה */}
      <DistanceFilter
        cities={cities}
        city={distanceCity}
        setCity={setDistanceCity}
        radius={radius}
        setRadius={setRadius}
        onNearMe={onNearMe}
        locating={locating}
        geoError={geoError}
        usingGeo={usingGeo}
        isActive={distanceActive}
        onClear={onClearDistance}
      />
    </div>
  );
}