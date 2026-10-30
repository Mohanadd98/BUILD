import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { ar } from '@/i18n/ar';
import { en, type TKey } from '@/i18n/en';
import { palette, type Colors } from '@/theme/colors';

export type Lang = 'en' | 'ar';
export type ThemePref = 'system' | 'light' | 'dark';

interface Prefs {
  lang: Lang;
  themePref: ThemePref;
}

interface PrefsContext extends Prefs {
  setLang: (lang: Lang) => void;
  setThemePref: (pref: ThemePref) => void;
  t: (key: TKey) => string;
  isRTL: boolean;
  isDark: boolean;
  colors: Colors;
}

const STORAGE_KEY = 'binaahub.prefs.v1';
const dictionaries = { en, ar } as const;

function deviceLang(): Lang {
  return getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
}

const Ctx = createContext<PrefsContext | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => ({ lang: deviceLang(), themePref: 'system' }));
  const [loaded, setLoaded] = useState(false);
  const scheme = useColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPrefs((p) => ({ ...p, ...(JSON.parse(raw) as Partial<Prefs>) }));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs, loaded]);

  const value = useMemo<PrefsContext>(() => {
    const isDark = prefs.themePref === 'system' ? scheme === 'dark' : prefs.themePref === 'dark';
    const dict = dictionaries[prefs.lang];
    return {
      ...prefs,
      setLang: (lang) => setPrefs((p) => ({ ...p, lang })),
      setThemePref: (themePref) => setPrefs((p) => ({ ...p, themePref })),
      t: (key) => dict[key] ?? en[key],
      isRTL: prefs.lang === 'ar',
      isDark,
      colors: isDark ? palette.dark : palette.light,
    };
  }, [prefs, scheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): PrefsContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrefs must be used inside PreferencesProvider');
  return ctx;
}
