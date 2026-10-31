import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { MaterialKey, Prices } from '@/calc/boq';
import { loadPrices, savePrices } from '@/storage/prices';

interface PricesContext {
  prices: Prices;
  /** Sets one unit price; null or 0 removes it. */
  setPrice: (item: MaterialKey, price: number | null) => void;
}

const Ctx = createContext<PricesContext | null>(null);

export function PricesProvider({ children }: { children: ReactNode }) {
  const [prices, setPrices] = useState<Prices>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPrices().then((p) => {
      setPrices(p);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) savePrices(prices).catch(() => {});
  }, [prices, loaded]);

  const setPrice = useCallback((item: MaterialKey, price: number | null) => {
    setPrices((p) => {
      const next = { ...p };
      if (price && price > 0) next[item] = price;
      else delete next[item];
      return next;
    });
  }, []);

  const value = useMemo(() => ({ prices, setPrice }), [prices, setPrice]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrices(): PricesContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrices must be used inside PricesProvider');
  return ctx;
}
