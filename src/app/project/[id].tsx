import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Share, View } from 'react-native';

import { defaultPhase } from '@/calc/boq';
import { BoqCard } from '@/components/boq-card';
import { confirm } from '@/components/confirm';
import { SavedLines } from '@/components/saved-lines';
import { AppText, BigButton, Card, FormulaBox, Screen } from '@/components/ui';
import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { useProjects } from '@/state/projects';
import { shareText } from '@/storage/projects';
import { sizes } from '@/theme/colors';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = usePrefs();
  const { projects, deleteCalc, deleteProject } = useProjects();
  const project = projects.find((p) => p.id === id);
  const tr = (k: string) => t(k as TKey);
  const dateOf = (ms: number) =>
    new Date(ms).toLocaleString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

  if (!project) {
    return (
      <Screen>
        <AppText variant="muted">{t('projects.notFound')}</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: project.name }} />
      {project.calcs.length === 0 ? <AppText variant="muted">{t('projects.noCalcs')}</AppText> : <BoqCard project={project} />}

      {project.calcs.map((c) => (
        <View key={c.id} style={{ gap: sizes.gap }}>
          <Card>
            <AppText variant="title" style={{ fontSize: 22 }}>{t(`${c.tool}.title` as TKey)}</AppText>
            <AppText variant="muted">{`${t(`phase.${c.phase ?? defaultPhase(c.tool)}`)} · ${dateOf(c.createdAt)}`}</AppText>
            <SavedLines lines={c.inputs} muted />
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <SavedLines lines={c.results} />
          </Card>
          <FormulaBox steps={c.steps} />
          <BigButton
            label={t('projects.share')}
            variant="secondary"
            onPress={() => Share.share({ message: shareText(project.name, c, tr, dateOf(c.createdAt)) })}
          />
          <BigButton
            label={t('projects.deleteCalc')}
            variant="secondary"
            onPress={() =>
              confirm(t('projects.deleteCalc'), t('projects.cannotUndo'), t('projects.delete'), t('projects.cancel'), () =>
                deleteCalc(project.id, c.id),
              )
            }
          />
        </View>
      ))}

      <BigButton
        label={t('projects.deleteProject')}
        variant="secondary"
        onPress={() =>
          confirm(
            `${t('projects.deleteProject')}: ${project.name}`,
            t('projects.cannotUndo'),
            t('projects.delete'),
            t('projects.cancel'),
            () => {
              deleteProject(project.id);
              router.back();
            },
          )
        }
      />
    </Screen>
  );
}
