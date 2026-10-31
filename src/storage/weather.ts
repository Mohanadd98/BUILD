import { parseForecast, type DayForecast } from '@/calc/heat';
import { CITIES, type CityKey } from '@/config/cities';

const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 8000;
const cache = new Map<CityKey, { at: number; days: DayForecast[] }>();

export function forecastUrl(city: CityKey): string {
  const { lat, lon } = CITIES[city];
  return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&timezone=auto&forecast_days=3`;
}

/**
 * 3-day maximum temperature forecast for a city. Returns null when offline or
 * when the service fails, so the app keeps working without it. Cached 1 hour.
 */
export async function fetchForecast(city: CityKey, now: number = Date.now()): Promise<DayForecast[] | null> {
  const hit = cache.get(city);
  if (hit && now - hit.at < CACHE_MS) return hit.days;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(forecastUrl(city), { signal: controller.signal });
    if (!res.ok) return null;
    const days = parseForecast(await res.json());
    if (days.length === 0) return null;
    cache.set(city, { at: now, days });
    return days;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** For tests only. */
export function clearForecastCache() {
  cache.clear();
}
