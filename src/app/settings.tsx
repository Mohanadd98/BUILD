import { Choice, Screen } from '@/components/ui';
import { usePrefs, type Lang, type ThemePref } from '@/state/preferences';

export default function Settings() {
  const { t, lang, setLang, themePref, setThemePref } = usePrefs();
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
    </Screen>
  );
}
