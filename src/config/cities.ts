/**
 * Cities offered for the site weather forecast. Only these public city
 * coordinates are ever sent to the weather service, never the phone's location.
 * Coordinates are city centres, rounded to 2 decimals.
 */
export const CITIES = {
  cairo: { lat: 30.04, lon: 31.24 },
  giza: { lat: 30.01, lon: 31.21 },
  newCapital: { lat: 30.02, lon: 31.76 },
  alexandria: { lat: 31.2, lon: 29.92 },
  portSaid: { lat: 31.26, lon: 32.3 },
  suez: { lat: 29.97, lon: 32.53 },
  mansoura: { lat: 31.04, lon: 31.38 },
  tanta: { lat: 30.79, lon: 31.0 },
  asyut: { lat: 27.18, lon: 31.18 },
  luxor: { lat: 25.69, lon: 32.64 },
  aswan: { lat: 24.09, lon: 32.9 },
  hurghada: { lat: 27.26, lon: 33.81 },
  sharm: { lat: 27.91, lon: 34.33 },
  riyadh: { lat: 24.71, lon: 46.68 },
  jeddah: { lat: 21.49, lon: 39.19 },
  dammam: { lat: 26.43, lon: 50.1 },
} as const;

export type CityKey = keyof typeof CITIES;

export function isCityKey(v: unknown): v is CityKey {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(CITIES, v);
}
