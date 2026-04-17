export interface CityData {
  id: string
  name: string
  country: string
  timezone: string
  utcOffset: number // in hours
  flag: string
}

// These IDs must match the 'id' fields in your data/cities.json
export const DEFAULT_CITY_IDS = ["nyc", "ldn", "sf"]

export function getLiveOffset(timezone: string): number {
  try {
    const now = new Date();
    // Create two strings for the same instant: one in UTC, one in the target timezone
    const utcStr = now.toLocaleString("en-US", { timeZone: "UTC" });
    const tzStr = now.toLocaleString("en-US", { timeZone: timezone });

    const utcDate = new Date(utcStr);
    const tzDate = new Date(tzStr);

    // Calculate the difference in hours
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch (e) {
    return 0; // Fallback
  }
}

export function getCityTime(city: CityData, baseUtcHour: number): number {
  const liveOffset = getLiveOffset(city.timezone) // Dynamic calculation
  return (baseUtcHour + liveOffset + 24) % 24
}

export function isWorkHour(hour: number): boolean {
  return hour >= 9 && hour < 18
}

export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return m > 0 ? `${displayHour}:${m.toString().padStart(2, "0")} ${period}` : `${displayHour} ${period}`
}

export function formatTime(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  const period = h >= 12 ? "PM" : "AM"
  const displayHour = h % 12 === 0 ? 12 : h % 12
  return m > 0
    ? `${displayHour}:${m.toString().padStart(2, "0")} ${period}`
    : `${displayHour}:00 ${period}`
}

export function getOverlapHours(cities: CityData[], baseUtcHour: number): number {
  if (cities.length < 2) return 0
  let count = 0
  for (let h = 0; h < 24; h++) {
    const utcHour = (baseUtcHour + h) % 24
    const allWorking = cities.every((city) => {
      const localHour = getCityTime(city, utcHour)
      return isWorkHour(localHour)
    })
    if (allWorking) count++
  }
  return count
}

export function getCurrentUtcHour(): number {
  const now = new Date()
  return now.getUTCHours() + now.getUTCMinutes() / 60
}

export const REGIONAL_KEYWORDS: Record<string, string[]> = {
  // North America
  eastern: ["new_york", "toronto", "miami", "detroit", "indiana", "kentucky", "montreal", "havana"],
  central: ["chicago", "mexico_city", "winnipeg", "dallas", "houston", "monterrey", "guatemala"],
  mountain: ["denver", "phoenix", "edmonton", "calgary", "chihuahua", "boise"],
  pacific: ["los_angeles", "vancouver", "seattle", "tijuana", "las_vegas", "san_francisco"],
  atlantic: ["halifax", "bermuda", "puerto_rico", "thule"],
  arizona: ["phoenix"],

  // Europe & UK
  western_european: ["london", "lisbon", "dublin", "canary", "madeira"],
  western_europe: ["london", "lisbon", "dublin", "canary", "madeira"],
  central_european: ["paris", "berlin", "madrid", "rome", "amsterdam", "zurich", "vienna", "warsaw", "brussels"],
  central_europe: ["paris", "berlin", "madrid", "rome", "amsterdam", "zurich", "vienna", "warsaw", "brussels"],
  eastern_european: ["athens", "helsinki", "riga", "tallinn", "vilnius", "bucharest", "kyiv", "sofia"],
  eastern_europe: ["athens", "helsinki", "riga", "tallinn", "vilnius", "bucharest", "kyiv", "sofia"],

  // South America
  south_america: ["sao_paulo", "buenos_aires", "santiago", "bogota", "lima", "caracas", "la_paz", "montevideo", "asuncion"],
  latin_america: ["mexico_city", "sao_paulo", "buenos_aires", "bogota", "lima", "santiago", "panama"],
  amazon: ["manaus", "belem", "porto_velho", "rio_branco"],
  andean: ["bogota", "lima", "la_paz", "quito"],

  // Southeast Asia & Oceania
  southeast_asia: ["bangkok", "jakarta", "hanoi", "singapore", "manila", "kuala_lumpur", "ho_chi_minh"],
  indochina: ["bangkok", "hanoi", "phnom_penh", "vientiane"],
  australian_eastern: ["sydney", "melbourne", "brisbane", "canberra", "hobart"],
  australian_central: ["adelaide", "darwin"],
  australian_western: ["perth"],

  // Middle East & Gulf
  middle_east: ["dubai", "riyadh", "tehran", "baghdad", "jerusalem", "beirut", "amman", "kuwait", "muscat"],
  gulf: ["dubai", "riyadh", "kuwait", "muscat", "doha", "abu_dhabi"],
  levant: ["beirut", "amman", "damascus", "jerusalem"],

  // Africa
  west_africa: ["lagos", "accra", "abidjan", "dakar", "casablanca"],
  central_africa: ["algiers", "tunis", "kinshasa", "luanda"],
  east_africa: ["nairobi", "addis_ababa", "dar_es_salaam", "khartoum", "kampala"],
  south_africa: ["johannesburg", "cape_town", "harare", "gaborone"],
  sub_saharan: ["lagos", "nairobi", "johannesburg", "accra", "addis_ababa"],

  // Central & East Asia
  east_asia: ["beijing", "shanghai", "hong_kong", "taipei", "seoul", "tokyo", "ulaanbaatar"],
  central_asia: ["almaty", "tashkent", "bishkek", "dushanbe", "ashgabat"],
  
  // Russia (Divided by region for better UX)
  russia: ["moscow", "st_petersburg", "novosibirsk", "ekaterinburg", "vladivostok", "anadyr", "kaliningrad"],
  siberia: ["novosibirsk", "krasnoyarsk", "irkutsk", "yakutsk"],
  russian_far_east: ["vladivostok", "magadan", "sakhalin", "anadyr"],

  // China Specific
  china: ["beijing", "shanghai", "urumqi", "chongqing", "harbin"],
 
};