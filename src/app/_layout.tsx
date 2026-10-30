import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PreferencesProvider, usePrefs } from '@/state/preferences';
import { ProjectsProvider } from '@/state/projects';
import { initRTL } from '@/state/rtl';

initRTL();

function AppStack() {
  const { t, colors, isDark } = usePrefs();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: t('app.name') }} />
        <Stack.Screen name="concrete" options={{ title: t('concrete.title') }} />
        <Stack.Screen name="blocks" options={{ title: t('blocks.title') }} />
        <Stack.Screen name="plaster" options={{ title: t('plaster.title') }} />
        <Stack.Screen name="tiles" options={{ title: t('tiles.title') }} />
        <Stack.Screen name="paint" options={{ title: t('paint.title') }} />
        <Stack.Screen name="save" options={{ title: t('save.title'), presentation: 'modal' }} />
        <Stack.Screen name="projects" options={{ title: t('projects.title') }} />
        <Stack.Screen name="project/[id]" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <ProjectsProvider>
        <AppStack />
      </ProjectsProvider>
    </PreferencesProvider>
  );
}
