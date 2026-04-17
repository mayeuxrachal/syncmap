/**
 * FlagCDN – flag image URLs from https://flagcdn.com (ISO 3166-1 alpha-2 country codes).
 */
const BASE = "https://flagcdn.com"

export const FlagCDN = {
  /** Returns the URL for a flag image (e.g. "US" → https://flagcdn.com/w80/us.png). */
  url: (countryCode: string, size: "w20" | "w40" | "w80" | "w160" = "w80"): string =>
    `${BASE}/${size}/${countryCode.toLowerCase()}.png`,
}
