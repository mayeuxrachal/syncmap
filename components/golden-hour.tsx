"use client"

import { Sun, SunDim, Moon, CheckCircle2, Clock } from "lucide-react"
import { type CityData, getLiveOffset } from "@/lib/timezone-data"

interface GoldenHourProps {
  utcHour: number
  cities: CityData[]
}

export function GoldenHour({ utcHour, cities }: GoldenHourProps) {
  if (cities.length === 0) return null

  const workStart = 9
  const workEnd = 18

  const cityStatuses = cities.map(city => {
    const liveOffset = getLiveOffset(city.timezone); // Use the new helper
    const localHour = (utcHour + liveOffset + 24) % 24;
    const isWorking = localHour >= workStart && localHour < workEnd;
    let hoursToStart = (workStart - localHour + 24) % 24
    return { ...city, isWorking, hoursToStart }
  })

  const onlineCount = cityStatuses.filter(c => c.isWorking).length
  const offlineCities = cityStatuses.filter(c => !c.isWorking)
  const isFullSync = onlineCount === cities.length

  let config = {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    icon: <Sun className="size-5" />, // Sun for Golden Hour
    label: "Golden Hour Active",
    message: "All teams are currently within working hours (9-6)."
  }

  if (onlineCount === 0) {
    config = {
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      text: "text-slate-400",
      icon: <Moon className="size-5" />, // Moon for Downtime
      label: "Global Downtime",
      message: "All teams are currently offline."
    }
  } 
  else if (!isFullSync) {
    const nextToJoin = offlineCities.reduce((prev, curr) => 
      curr.hoursToStart < prev.hoursToStart ? curr : prev
    )

    config = {
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      text: "text-amber-400",
      icon: <SunDim className="size-5" />, // SunDim for Partial
      label: "Sync Pending",
      message: `Next overlap in ${Math.round(nextToJoin.hoursToStart)}h when ${nextToJoin.name} joins.`
    }
  }

  return (
    <div className={`mx-6 lg:mx-10 rounded-xl border ${config.border} ${config.bg} p-4 transition-all duration-500`}>
      <div className="flex items-center gap-3">
        <div className={config.text}>{config.icon}</div>
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-widest ${config.text}`}>
            {config.label}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  )
}