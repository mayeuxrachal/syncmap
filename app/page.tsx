"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { TimeSlider } from "@/components/time-slider"
import { GoldenHour } from "@/components/golden-hour"
import { CityCard } from "@/components/city-card"
import allCities from "@/data/cities.json" // Path to your master JSON
import { DEFAULT_CITY_IDS, getCurrentUtcHour, type CityData } from "@/lib/timezone-data"
import { AddCityDialog } from "@/components/add-city-dialog"
import { Search } from "lucide-react"
import { AdSpace } from "@/components/ad-space"
import { SiteFooter } from "@/components/site-footer"

const STORAGE_KEYS = {
  cities: "syncmap:cities",
  utcHour: "syncmap:utcHour",
}

export default function Page() {
  // 1. Set the Hardcoded Defaults immediately
  const [cities, setCities] = useState<CityData[]>(() => {
  return (allCities as CityData[]).filter(city => 
    DEFAULT_CITY_IDS.includes(city.id)
  )
  })
  const [utcHour, setUtcHour] = useState(new Date().getUTCHours() + new Date().getUTCMinutes() / 60)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLive, setIsLive] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Keyboard shortcut for Search (Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setDialogOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // 2. The Critical "Mount" Check
  useEffect(() => {
    try {
      // 1. Keep the city loading logic (this is good)
      const storedCities = window.localStorage.getItem(STORAGE_KEYS.cities)
      if (storedCities) {
        try {
          const parsed = JSON.parse(storedCities) as CityData[]
        // Only override if the user actually has saved data
          if (Array.isArray(parsed) && parsed.length > 0) {
          setCities(parsed)
          }
        } catch (e) {
        console.error("Storage parse error", e)
        }
      }
      // 2. IGNORE the stored hour and force Live Mode
      setUtcHour(getCurrentUtcHour())
      setIsLive(true)
  
    } catch {
      setUtcHour(getCurrentUtcHour())
      setIsLive(true)
    }
  
    setMounted(true)
  }, [])

  // Auto-update when live

  useEffect(() => {
    if (!isLive) return;
    
    // Update immediately on mount/isLive change
    setUtcHour(getCurrentUtcHour());
  
    const interval = setInterval(() => {
      setUtcHour(getCurrentUtcHour());
    }, 1000); // Change 60000 to 1000 for a real-time "Live" feel
    
    return () => clearInterval(interval);
  }, [isLive]);

  const handleSliderChange = useCallback((hour: number) => {
    setIsLive(false)
    setUtcHour(hour)
  }, [])

  const handleResetToLive = useCallback(() => {
    setIsLive(true)
    setUtcHour(Math.floor(getCurrentUtcHour()))
  }, [])

  // 3. The Guarded Persistence
  useEffect(() => {
    // If we haven't mounted yet, don't write to storage
    // This prevents the "Default" state from overwriting 
    // existing user data before the load is finished.
    if (!mounted) return
  
    window.localStorage.setItem(STORAGE_KEYS.cities, JSON.stringify(cities))
  }, [cities, mounted])

  // Persist slider position when it changes
  useEffect(() => {
    if (!mounted) return
    try {
      window.localStorage.setItem(STORAGE_KEYS.utcHour, String(utcHour))
    } catch {
      // ignore storage failures
    }
  }, [utcHour, mounted])

  const handleAddCity = useCallback((city: CityData) => {
    setCities((prev) => [...prev, city])
    setDialogOpen(false) // This closes the new dialog
  }, [])

  const handleRemoveCity = useCallback((id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const existingCityIds = useMemo(
    () => new Set(cities.map((c: any) => c.id)),
    [cities],
  )

    if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="pb-12">
          <section className="mt-2">
            <div className="w-full px-6 lg:px-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                  UTC Timeline
                </span>
              </div>
              <div className="h-14 animate-pulse rounded-xl border border-glass-border bg-glass" />
            </div>
          </section>
          <section className="mt-8 px-6 lg:px-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl border border-glass-border bg-glass"
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SECTION: TOP AD (Step 3) */}
      <AdSpace position="top" />

      <DashboardHeader />

      <main className="pb-20">
        {/* Section 1: Timeline - Increased top margin (mt-12) */}
        <section className="mt-12">
          <TimeSlider
            utcHour={utcHour}
            onUtcHourChange={handleSliderChange}
            cities={cities}
          />

          {/* Section 2: Live Toggle - Centered with vertical padding */}
          <div className="flex justify-center py-10">
            <button
              onClick={() => {
                setUtcHour(getCurrentUtcHour());
                setIsLive(true);
              }}
              className={`group flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 ${
                isLive 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                  : "bg-glass border-glass-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50"
              }`}
            >
              <span className="relative flex size-2">
                {isLive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full size-2 ${isLive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </span>
              <span className="text-sm font-medium tracking-wide uppercase">
                {isLive ? "Live" : "Return to live"}
              </span>
            </button>
          </div>
        </section>

        {/* Section 3: Golden Hour Banner */}
        <section className="mt-4">
          <GoldenHour utcHour={utcHour} cities={cities} />
        </section>

        {/* Section 4: Search Bar - Moved below Golden Hour with high spacing */}
        <section className="mt-16 mb-12 flex justify-center px-6 lg:px-10">
          <button 
            onClick={() => setDialogOpen(true)}
            className="max-w-md w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-glass-border bg-glass hover:border-emerald-500/50 transition-all group"
          >
            <Search className="size-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            <span className="text-sm text-muted-foreground">Search for a city...</span>
          </button>
        </section>

        {/* Section 5: City Cards */}
        <section className="px-6 lg:px-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Team Locations
            </h2>
            <span className="text-xs text-muted-foreground">
              {cities.length} {cities.length === 1 ? "city" : "cities"}
            </span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                utcHour={utcHour}
                onRemove={handleRemoveCity}
              />
            ))}
          </div>
        </section>

        {/* SECTION: BOTTOM AD (Step 3) */}
        <section className="mt-16">
          <AdSpace position="bottom" />
        </section>
      </main>

      <SiteFooter /> {/* Added here */}

      <AddCityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddCity={handleAddCity}
        existingCityIds={new Set(cities.map((c) => c.id))}
      />
    </div>
  )
}