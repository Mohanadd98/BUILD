import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, TextInput } from 'react-native';

import { SavedLines } from '@/components/saved-lines';
import { AppText, BigButton, Card, Screen } from '@/components/ui';
import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { useProjects } from '@/state/projects';
import type { SaveTarget } from '@/storage/projects';
import { sizes } from '@/theme/colors';

export default function SaveScreen() {
  const { t, colors, isRTL } = usePrefs();
  const { projects, pending, setPending, save } = useProjects();
  const [name, setName] = useState('');

  if (!pending) {
    return (
      <Screen>
        <AppText variant="muted">{t('save.nothing')}</AppText>
      </Screen>
    );
  }

  const finish = (target: SaveTarget, projectName: string) => {
    save(target, pending);
    setPending(null);
    router.back();
    if (Platform.OS !== 'web') Alert.alert(t('save.done'), projectName);
  };

  return (
    <Screen>
      <Card>
        <AppText variant="label" style={{ fontWeight: '700' }}>{t(`${pending.tool}.title` as TKey)}</AppText>
        <SavedLines lines={pending.results} />
      </Card>

      <AppText variant="label">{t('save.newProject')}</AppText>
      <TextInput
        value={name}
        onChangeText={setName}
        maxLength={80}
        placeholder={t('save.namePlaceholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('save.newProject')}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      />
      <BigButton
        label={t('save.createAndSave')}
        disabled={!name.trim()}
        onPress={() => finish({ newName: name }, name.trim())}
      />

      {projects.length > 0 ? (
        <>
          <AppText variant="label">{t('save.existing')}</AppText>
          {projects.map((p) => (
            <BigButton
              key={p.id}
              variant="secondary"
              label={p.name}
              hint={`${p.calcs.length} ${t('projects.calcCount')}`}
              onPress={() => finish({ projectId: p.id }, p.name)}
            />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: sizes.touch,
    borderRadius: sizes.radius,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '600',
  },
});
