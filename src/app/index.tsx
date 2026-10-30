import { router } from 'expo-router';

import { AppText, BigButton, Screen } from '@/components/ui';
import { usePrefs } from '@/state/preferences';

export default function Home() {
  const { t } = usePrefs();
  return (
    <Screen>
      <AppText variant="muted">{t('home.subtitle')}</AppText>
      <BigButton label={t('home.concrete')} hint={t('home.concrete.hint')} onPress={() => router.push('/concrete')} />
      <BigButton label={t('home.blocks')} hint={t('home.blocks.hint')} onPress={() => router.push('/blocks')} />
      <BigButton label={t('home.plaster')} hint={t('home.plaster.hint')} onPress={() => router.push('/plaster')} />
      <BigButton label={t('home.tiles')} hint={t('home.tiles.hint')} onPress={() => router.push('/tiles')} />
      <BigButton label={t('home.paint')} hint={t('home.soon')} disabled />
      <BigButton label={t('home.settings')} variant="secondary" onPress={() => router.push('/settings')} />
    </Screen>
  );
}
