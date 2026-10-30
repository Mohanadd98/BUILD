import { router } from 'expo-router';

import { AppText, BigButton, Screen } from '@/components/ui';
import { usePrefs } from '@/state/preferences';
import { useProjects } from '@/state/projects';

export default function ProjectsScreen() {
  const { t, lang } = usePrefs();
  const { projects } = useProjects();

  if (projects.length === 0) {
    return (
      <Screen>
        <AppText variant="muted">{t('projects.empty')}</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      {projects.map((p) => (
        <BigButton
          key={p.id}
          variant="secondary"
          label={p.name}
          hint={`${p.calcs.length} ${t('projects.calcCount')} · ${new Date(p.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB')}`}
          onPress={() => router.push({ pathname: '/project/[id]', params: { id: p.id } })}
        />
      ))}
    </Screen>
  );
}
