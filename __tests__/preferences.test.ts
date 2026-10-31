import { cleanPrefs } from '@/state/preferences';

jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));
jest.mock('expo-updates', () => ({}));

describe('cleanPrefs', () => {
  it('keeps valid settings', () => {
    expect(cleanPrefs({ lang: 'ar', themePref: 'dark' })).toEqual({ lang: 'ar', themePref: 'dark' });
  });

  it('ignores damaged or unknown values', () => {
    expect(cleanPrefs({ lang: 'fr', themePref: 7, extra: 'x' })).toEqual({});
    expect(cleanPrefs(null)).toEqual({});
    expect(cleanPrefs('text')).toEqual({});
  });
});
