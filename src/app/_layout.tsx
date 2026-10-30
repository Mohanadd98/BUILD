import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { PreferencesProvider, usePrefs } from '@/state/preferences';

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
        <Stack.Screen name="settings" options={{ title: t('settings.title') }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <AppStack />
    </PreferencesProvider>
  );
}
