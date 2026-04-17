"use client"

import { useCallback, useMemo } from "react"
import { type CityData, getCityTime, isWorkHour } from "@/lib/timezone-data"

interface TimeSliderProps {
  utcHour: number
  onUtcHourChange: (hour: number) => void
  cities: CityData[]
}

const PAD = 1.5 
const positionFor = (h: number) => PAD + (h / 24) * (100 - 2 * PAD)

export function TimeSlider({ utcHour, onUtcHourChange, cities }: TimeSliderProps) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  
  // 1. Setup Local Context
  const localOffset = useMemo(() => new Date().getTimezoneOffset() / 60, [])
  const getUtcFromLocal = useCallback((localH: number) => (localH + localOffset + 24) % 24, [localOffset])
  const getLocalFromUtc = useCallback((utcH: number) => (utcH - localOffset + 24) % 24, [localOffset])

  // 2. Map Overlap to Local Hours
  const overlapMap = useMemo(() => {
    return hours.map((localH) => {
      if (cities.length < 2) return 0
      const utcH = getUtcFromLocal(localH)
      return cities.filter((city) => isWorkHour(getCityTime(city, utcH))).length
    })
  }, [cities, hours, getUtcFromLocal])

  const currentLocalHour = getLocalFromUtc(utcHour)

  // 3. User Interaction (Local Space -> UTC Data)
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const fraction = x / rect.width;
    
      // Map the horizontal click to a decimal hour (0.0 to 23.0)
      const insetFraction = (fraction * 100 - PAD) / (100 - 2 * PAD);
      const localHourDecimal = Math.max(0, Math.min(23.99, insetFraction * 24));
      
      // Convert this decimal local time back to UTC
      onUtcHourChange(getUtcFromLocal(localHourDecimal));
    },
    [onUtcHourChange, getUtcFromLocal, PAD]
  )

  const handleDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons === 1) handleClick(e)
  }, [handleClick])

  return (
    <div className="w-full px-6 lg:px-10">
      {/* 1. Kept your original Title and Time Display */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/90">
          Local Timeline
        </span>
        <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">
          {(() => {
            const h = Math.floor(currentLocalHour);
            const m = Math.round((currentLocalHour % 1) * 60);
            const finalH = m === 60 ? (h + 1) % 24 : h;
            const finalM = m === 60 ? 0 : m;
            return `${String(finalH).padStart(2, "0")}:${String(finalM).padStart(2, "0")}`;
          })()}
        </span>
      </div>

      {/* 2. Main Slider Container (Kept your original h-18 and styling) */}
      <div
        className="relative h-24 cursor-pointer select-none rounded-xl border border-glass-border bg-glass backdrop-blur-xl overflow-hidden"
        onClick={handleClick}
        onMouseMove={handleDrag}
        role="slider"
        aria-label="Local hour selector"
      >
        {/* 1. LAYER: GOLDEN HOUR BACKGROUND */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {hours.map((h) => {
            const utcH = getUtcFromLocal(h);
            const isGolden = cities.length >= 2 && cities.every(c => isWorkHour(getCityTime(c, utcH)));
            if (!isGolden) return null;

            const left = positionFor(h);
            const right = h < 23 ? positionFor(h + 1) : (100 - PAD);

            return (
              <div
                key={`golden-${h}`}
                className="absolute inset-y-0 bg-emerald-500/20"
                style={{ left: `${left}%`, width: `${(right - left) + 0.1}%` }}
              />
            );
          })}
        </div>

        {/* 2. LAYER: CITY LANES & SPLIT-RANGE BARS */}
        <div className="flex flex-col h-full relative z-10">
          {cities.map((city) => {
            const cityHours = hours.filter(h => isWorkHour(getCityTime(city, getUtcFromLocal(h))));
            if (cityHours.length === 0) return null;

            // Logic to detect wrap-around (e.g., hours are [0,1,2, 22,23])
            const isWrapped = cityHours.includes(0) && cityHours.includes(23) && 
                              cityHours.length < 24 && 
                              !cityHours.every((val, i) => i === 0 || val === cityHours[i-1] + 1);

            const renderBar = (start: number, end: number, keySuffix: string) => {
              const left = positionFor(start);
              const right = positionFor(end);
              
              return (
                <div
                  key={`city-bar-${city.id}-${keySuffix}`}
                  className="absolute inset-y-0 bg-emerald-500/20"
                  style={{
                    left: `${left}%`,
                    width: `${right - left}%`, 
                  }}
                />
              );
            };

            return (
              <div key={city.id} className="relative flex-1 border-b border-white/5 last:border-0 flex items-center">
                <span className="absolute left-4 z-20 text-[9px] font-medium uppercase text-white/40 pointer-events-none select-none">
                  {city.name}
                </span>

                {!isWrapped ? (
                  // Continuous range: Draw one bar
                  renderBar(cityHours[0], cityHours[cityHours.length - 1] + 1, "cont")
                ) : (
                  // Wrapped range: Draw two bars (Start of day + End of day)
                  <>
                    {/* Bar 1: Midnight to morning transition */}
                    {renderBar(0, cityHours.filter(h => h < 12).reverse()[0] + 1, "start")}
                    {/* Bar 2: Evening to midnight transition */}
                    {renderBar(cityHours.filter(h => h >= 12)[0], 24, "end")}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* 3. LAYER: MATTE SLATE-200 PLAYHEAD */}
        <div
          className="absolute top-0 h-full w-[3px] bg-slate-200 pointer-events-none z-30"
          style={{
            left: `${positionFor(currentLocalHour)}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="absolute -top-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm bg-slate-200" />
          <div className="absolute -bottom-1 left-1/2 h-2 w-4 -translate-x-1/2 rounded-sm bg-slate-200" />
        </div>
      </div>

      {/* 4. Kept your original 12-hour labels */}
      <div className="relative mt-2 h-4">
        {hours.map((h) => {
          if (h % 3 !== 0) return null
          const display12 = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`
          return (
            <span key={h} className="absolute -translate-x-1/2 text-[12px] font-medium text-muted-foreground/70 tabular-nums" style={{ left: `${positionFor(h)}%` }}>
              {display12}
            </span>
          )
        })}
      </div>

      {/* 5. Kept your original 24-hour labels */}
      <div className="relative h-4">
        {hours.map((h) => {
          if (h % 3 !== 0) return null
          return (
            <span key={h} className="absolute -translate-x-1/2 text-[12px] text-muted-foreground/60 tabular-nums" style={{ left: `${positionFor(h)}%` }}>
              {String(h).padStart(2, "0")}:00
            </span>
          )
        })}
      </div>
    </div>
  )
}