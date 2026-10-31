import AsyncStorage from '@react-native-async-storage/async-storage';

import { isMaterialKey, type Prices } from '@/calc/boq';

const STORAGE_KEY = 'build.prices.v1';

/** Keeps only known materials with a positive, finite price. */
export function cleanPrices(data: unknown): Prices {
  const out: Prices = {};
  if (typeof data !== 'object' || data === null) return out;
  for (const [k, v] of Object.entries(data)) {
    if (isMaterialKey(k) && typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = v;
  }
  return out;
}

export async function loadPrices(): Promise<Prices> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? cleanPrices(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}

export async function savePrices(prices: Prices): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleanPrices(prices)));
}
