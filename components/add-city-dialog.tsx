"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import allCities from "@/data/cities.json"
import { type CityData, REGIONAL_KEYWORDS } from "@/lib/timezone-data"

interface AddCityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCity: (city: CityData) => void
  existingCityIds: Set<string>
}

const SUGGESTED_CITY_IDS = ["london", "new-york", "tokyo", "dubai", "singapore", "los-angeles", "denver", "chicago", "berlin"]

export function AddCityDialog({ open, onOpenChange, onAddCity, existingCityIds }: AddCityDialogProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Reset everything when opening or typing
  useEffect(() => {
    if (open) {
      setCityQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0);
  }, [cityQuery]);

  useEffect(() => {
    const activeItem = scrollContainerRef.current?.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({
        block: "nearest",
        behavior: "smooth" // Use "auto" for instant snapping
      });
    }
  }, [selectedIndex]);

  // 2. The Filter Logic
  const filteredCityOptions = useMemo(() => {
    const query = cityQuery.trim().toLowerCase();
    
    if (!query) return (allCities as CityData[]).filter(c => !existingCityIds.has(c.id));

    return (allCities as CityData[]).filter((city) => {
      if (existingCityIds.has(city.id)) return false;

      const basicMatch = 
        city.name.toLowerCase().includes(query) || 
        city.country.toLowerCase().includes(query);

      const tzMatch = city.timezone.toLowerCase().includes(query.replace(/\s/g, "_"));

      const regionMatch = Object.entries(REGIONAL_KEYWORDS).some(([region, citiesInRegion]) => {
        const normalizedRegion = region.replace("_", " ");
        return query.includes(normalizedRegion) && 
               citiesInRegion.some(name => city.timezone.toLowerCase().includes(name));
      });

      const offsetStr = city.utcOffset >= 0 ? `+${city.utcOffset}` : `${city.utcOffset}`;
      const numericQuery = query.replace(/utc|gmt|[+]/g, "");
      const offsetMatch = numericQuery !== "" && offsetStr.includes(numericQuery);

      return basicMatch || tzMatch || regionMatch || offsetMatch;
    });
  }, [cityQuery, existingCityIds]);

  const suggestedCities = useMemo(() => {
    return (allCities as any[]).filter(
      (city) => SUGGESTED_CITY_IDS.includes(city.id) && !existingCityIds.has(city.id)
    )
  }, [existingCityIds])

  // 3. KEYBOARD HANDLER (Only one instance, placed AFTER the lists exist)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const list = filteredCityOptions.length > 0 ? filteredCityOptions : suggestedCities;
    if (list.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selectedCity = list[selectedIndex];
      if (selectedCity) {
        onAddCity(selectedCity);
        setCityQuery("");
        onOpenChange(false);
      }
    }
  };

  const renderCityRow = (city: any, index: number) => {
    const localTime = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: city.timezone,
    }).format(new Date());
  
    return (
      <button
        key={city.id}
        type="button"
        onClick={() => {
          onAddCity(city)
          setCityQuery("")
          onOpenChange(false)
        }}
        // The conditional class below applies the highlight when navigating via keyboard
        className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors group ${
          index === selectedIndex ? "bg-emerald-500/20 text-foreground" : "hover:bg-emerald-500/10"
        }`}
      >
        <div className="flex items-center overflow-hidden flex-1">
          <img
            src={`https://flagcdn.com/w80/${city.flag.toLowerCase()}.png`}
            alt=""
            className="mr-2 w-4 h-auto rounded-sm shrink-0 shadow-sm"
          />
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-baseline">
              <span className="font-bold">{city.name}</span>
              <span className="ml-2 text-[10px] text-muted-foreground truncate">
                {city.country}
              </span>
            </div>
            <span className="text-[10px] text-emerald-500/60 font-medium">
              Currently: {localTime}
            </span>
          </div>
        </div>
        <span className="font-bold text-xs ml-4 shrink-0 text-muted-foreground group-hover:text-foreground">
          UTC{city.utcOffset >= 0 ? `+${city.utcOffset}` : city.utcOffset}
        </span>
      </button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-glass-border bg-background/95 backdrop-blur-md p-4 shadow-2xl overflow-hidden">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-sm font-medium">Add City</DialogTitle>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            className="w-full bg-muted/50 border border-input rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Search city..."
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div 
          ref={scrollContainerRef}
          className="max-h-80 space-y-1 overflow-y-auto pr-1"
        >
          {filteredCityOptions.length > 0 ? (
            filteredCityOptions.map((city, i) => renderCityRow(city, i))
          ) : (
            <div className="py-2">
              <div className="flex items-center gap-2 px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3" />
                No results found. Suggestions:
              </div>
              {suggestedCities.map((city, i) => renderCityRow(city, i))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}