"use client"

import { useMemo } from "react"
import { X } from "lucide-react"
import { type CityData, getLiveOffset, getCityTime, formatTime, isWorkHour } from "@/lib/timezone-data"
import { FlagCDN } from "@/lib/flag-cdn"

interface CityCardProps {
  city: CityData
  utcHour: number
  onRemove: (id: string) => void
}


export function CityCard({ city, utcHour, onRemove }: CityCardProps) {
  // 1. Get the dynamic hour and offset from our library
  const localHour = getCityTime(city, utcHour); 
  const liveOffset = getLiveOffset(city.timezone); 

  // 2. Extract parts for formatting
  const hour24 = Math.floor(localHour);
  const totalMinutes = Math.round((localHour % 1) * 60);

  // 3. Handle the 60-minute rollover
  const finalHour = totalMinutes === 60 ? (hour24 + 1) % 24 : hour24;
  const finalMinute = totalMinutes === 60 ? 0 : totalMinutes;

  // 4. Formatting variables for your JSX
  const isWorking = isWorkHour(finalHour);
  const period = finalHour >= 12 ? "PM" : "AM";
  const hour12 = finalHour % 12 || 12;
  const timeValue = `${hour12}:${finalMinute.toString().padStart(2, "0")}`;

  // 5. Time of Day for the background/UI logic
  const timeOfDay = useMemo(() => {
    if (localHour >= 6 && localHour < 12) return "morning"
    if (localHour >= 12 && localHour < 17) return "afternoon"
    if (localHour >= 17 && localHour < 21) return "evening"
    return "night"
  }, [localHour])

  // 6. Status Label
  const statusLabel = useMemo(() => {
    if (isWorking) return "Working hours"
    if (localHour >= 6 && localHour < 9) return "Early morning"
    if (localHour >= 17 && localHour < 21) return "After hours"
    return "Off hours"
  }, [isWorking, localHour])

  // 7. Calculate UTC offset display (Dynamic)
  const offsetStr = useMemo(() => {
    const sign = liveOffset >= 0 ? "+" : "-"
    const h = Math.floor(Math.abs(liveOffset))
    const m = Math.round((Math.abs(liveOffset) - h) * 60)
    return `UTC${sign}${h}${m > 0 ? `:${String(m).padStart(2, "0")}` : ""}`
  }, [liveOffset])
 
  return (
    <div className="group relative rounded-xl border border-glass-border bg-glass backdrop-blur-xl p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_30px_rgba(120,200,150,0.04)]">
      {/* Remove button */}
      <button
        onClick={() => onRemove(city.id)}
        className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-md text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${city.name}`}
      >
        <X className="size-3.5" />
      </button>

      {/* City info */}
      <div className="mb-4 flex items-center gap-2.5">
        <img src={FlagCDN.url(city.flag)} alt="" className="w-5 h-auto rounded-sm shadow-sm" role="img" aria-label={`Flag of ${city.country}`} />
        <span className="text-sm font-semibold text-foreground">{city.name}</span>
        <span className="text-xs text-muted-foreground">{offsetStr}</span>
      </div>

      {/* Large time */}
      <div className="mb-4 flex items-baseline gap-1.5">
        <span className="text-4xl font-light tracking-tight text-foreground tabular-nums">
          {timeValue}
        </span>
        <span className="text-sm font-medium text-muted-foreground">{period}</span>
      </div>

      {/* Status */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${
            isWorking ? "bg-primary" : timeOfDay === "night" ? "bg-muted-foreground/30" : "bg-gold/60"
          }`}
        />
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
      </div>

      {/* 24-hour bar */}
      <WorkHoursBar localHour={localHour} />
    </div>
  )
}

function WorkHoursBar({ localHour }: { localHour: number }) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])

  return (
    <div className="flex gap-[2px] rounded-md overflow-hidden" role="img" aria-label="24-hour work schedule bar">
      {hours.map((h) => {
        const working = isWorkHour(h)
        const isCurrent = Math.floor(localHour) === h
        return (
          <div
            key={h}
            className={`h-2 flex-1 rounded-[1px] transition-all duration-300 ${
              isCurrent
                ? "bg-foreground"
                : working
                  ? "bg-primary/30"
                  : "bg-muted/50"
            }`}
          />
        )
      })}
    </div>
  )
}
