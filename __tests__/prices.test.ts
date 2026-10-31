import { cleanPrices } from '@/storage/prices';

jest.mock('@react-native-async-storage/async-storage', () => ({}));

describe('cleanPrices', () => {
  it('keeps known materials with positive prices only', () => {
    expect(cleanPrices({ cement: 250, sand: 0, gravel: -5, gold: 99, paint: Infinity, putty: '30' })).toEqual({ cement: 250 });
    expect(cleanPrices(null)).toEqual({});
  });
});
