import { CITIES, type CityKey } from '@/config/cities';
import { AppText, Choice, Screen } from '@/components/ui';
import { usePrefs, type Lang, type ThemePref } from '@/state/preferences';

export default function Settings() {
  const { t, lang, setLang, themePref, setThemePref, weatherCity, setWeatherCity } = usePrefs();
  return (
    <Screen>
      <Choice<Lang>
        label={t('settings.language')}
        value={lang}
        onChange={setLang}
        options={[
          { value: 'ar', label: 'العربية' },
          { value: 'en', label: 'English' },
        ]}
      />
      <AppText variant="muted">{t('settings.languageNote')}</AppText>
      <Choice<ThemePref>
        label={t('settings.theme')}
        value={themePref}
        onChange={setThemePref}
        options={[
          { value: 'system', label: t('settings.theme.system') },
          { value: 'light', label: t('settings.theme.light') },
          { value: 'dark', label: t('settings.theme.dark') },
        ]}
      />
      <Choice<CityKey | 'off'>
        label={t('settings.weatherCity')}
        value={weatherCity}
        onChange={setWeatherCity}
        options={[
          { value: 'off', label: t('settings.weatherOff') },
          ...(Object.keys(CITIES) as CityKey[]).map((c) => ({ value: c, label: t(`city.${c}`) })),
        ]}
      />
      <AppText variant="muted">{t('settings.weatherNote')}</AppText>
    </Screen>
  );
}
