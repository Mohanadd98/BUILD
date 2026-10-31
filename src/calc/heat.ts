import { MATERIALS, type MaterialSettings } from '@/config/materials';

export interface DayForecast {
  /** Local date, YYYY-MM-DD. */
  date: string;
  maxC: number;
}

export type HeatLevel = 'ok' | 'caution' | 'warning';

export interface HeatAssessment {
  level: HeatLevel;
  /** The hottest forecast day, or null when there is no forecast. */
  hottest: DayForecast | null;
}

/** Reads an Open-Meteo daily forecast, keeping only well-formed days. */
export function parseForecast(data: unknown): DayForecast[] {
  const daily = (data as { daily?: { time?: unknown; temperature_2m_max?: unknown } } | null)?.daily;
  if (!daily || !Array.isArray(daily.time) || !Array.isArray(daily.temperature_2m_max)) return [];
  const temps = daily.temperature_2m_max;
  return daily.time
    .map((date, i) => ({ date, maxC: temps[i] }))
    .filter((d): d is DayForecast => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && typeof d.maxC === 'number' && Number.isFinite(d.maxC));
}

/** Warning at or above the code limit, caution at or above the practice threshold. */
export function assessHeat(days: DayForecast[], settings: MaterialSettings = MATERIALS): HeatAssessment {
  if (days.length === 0) return { level: 'ok', hottest: null };
  const hottest = days.reduce((a, b) => (b.maxC > a.maxC ? b : a));
  const { limitC, cautionC } = settings.concrete.hotWeather;
  const level: HeatLevel = hottest.maxC >= limitC ? 'warning' : hottest.maxC >= cautionC ? 'caution' : 'ok';
  return { level, hottest };
}
