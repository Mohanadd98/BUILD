import { cleanPrefs } from '@/state/preferences';

jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'en' }] }));
jest.mock('expo-updates', () => ({}));

describe('cleanPrefs', () => {
  it('keeps valid settings', () => {
    expect(cleanPrefs({ lang: 'ar', themePref: 'dark', weatherCity: 'aswan' })).toEqual({ lang: 'ar', themePref: 'dark', weatherCity: 'aswan' });
    expect(cleanPrefs({ weatherCity: 'off' })).toEqual({ weatherCity: 'off' });
  });

  it('ignores damaged or unknown values', () => {
    expect(cleanPrefs({ lang: 'fr', themePref: 7, extra: 'x', weatherCity: 'atlantis' })).toEqual({});
    expect(cleanPrefs(null)).toEqual({});
    expect(cleanPrefs('text')).toEqual({});
  });
});
