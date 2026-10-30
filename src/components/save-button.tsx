import { router } from 'expo-router';

import { usePrefs } from '@/state/preferences';
import { useProjects } from '@/state/projects';
import { newId, type SavedCalc } from '@/storage/projects';

import { BigButton } from './ui';

/** "Save to project": hands the calculation to the Save screen. */
export function SaveButton({ build }: { build: () => Omit<SavedCalc, 'id' | 'createdAt'> }) {
  const { t } = usePrefs();
  const { setPending } = useProjects();
  return (
    <BigButton
      label={t('save.button')}
      onPress={() => {
        setPending({ ...build(), id: newId(), createdAt: Date.now() });
        router.push('/save');
      }}
    />
  );
}
