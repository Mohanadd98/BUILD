import { assessHeat, parseForecast } from '@/calc/heat';
import { isCityKey } from '@/config/cities';
import { clearForecastCache, fetchForecast, forecastUrl } from '@/storage/weather';

const api = (temps: unknown[]) => ({ daily: { time: ['2026-11-01', '2026-11-02', '2026-11-03'], temperature_2m_max: temps } });

describe('parseForecast', () => {
  it('reads valid days and skips broken ones', () => {
    expect(parseForecast(api([31.2, null, 36]))).toEqual([
      { date: '2026-11-01', maxC: 31.2 },
      { date: '2026-11-03', maxC: 36 },
    ]);
    expect(parseForecast(null)).toEqual([]);
    expect(parseForecast({ daily: { time: 'x' } })).toEqual([]);
  });
});

describe('assessHeat', () => {
  it('warns at or above the 35 °C code limit (ECP 203-2025 cl. 2-3-1-6)', () => {
    const r = assessHeat(parseForecast(api([33, 35, 34])));
    expect(r.level).toBe('warning');
    expect(r.hottest).toEqual({ date: '2026-11-02', maxC: 35 });
  });

  it('cautions from 30 °C and is quiet below', () => {
    expect(assessHeat(parseForecast(api([29, 30, 28]))).level).toBe('caution');
    expect(assessHeat(parseForecast(api([25, 29.9, 22]))).level).toBe('ok');
    expect(assessHeat([])).toEqual({ level: 'ok', hottest: null });
  });
});

describe('fetchForecast', () => {
  beforeEach(() => clearForecastCache());

  it('sends only the chosen city coordinates', () => {
    expect(forecastUrl('cairo')).toBe(
      'https://api.open-meteo.com/v1/forecast?latitude=30.04&longitude=31.24&daily=temperature_2m_max&timezone=auto&forecast_days=3',
    );
    expect(isCityKey('cairo')).toBe(true);
    expect(isCityKey('toString')).toBe(false);
  });

  it('returns the forecast and caches it for an hour', async () => {
    const fetchMock = jest.fn(async () => ({ ok: true, json: async () => api([36, 34, 33]) }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    expect((await fetchForecast('riyadh', 0))?.[0]).toEqual({ date: '2026-11-01', maxC: 36 });
    await fetchForecast('riyadh', 30 * 60 * 1000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await fetchForecast('riyadh', 61 * 60 * 1000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns null when offline or the service fails, without throwing', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    expect(await fetchForecast('cairo')).toBeNull();
    globalThis.fetch = jest.fn(async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch;
    expect(await fetchForecast('giza')).toBeNull();
  });
});
