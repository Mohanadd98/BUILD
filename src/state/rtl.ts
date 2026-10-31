import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { DevSettings, I18nManager, Platform } from 'react-native';

/**
 * Native right-to-left layout (header, back button, swipe-back gesture) can
 * only change when the app restarts. This module flips the native direction
 * to match the chosen language and restarts once.
 */

const GUARD_KEY = 'build.rtlReload.v1';

export type RTLAction = 'none' | 'reload' | 'giveUp';

/**
 * What to do at startup or after a language change.
 * `lastAttempt` is the direction we already restarted for, if any; asking for
 * the same direction again means the restart did not take effect, so we stop
 * instead of restarting forever.
 */
export function decideRTLAction(isRTLNow: boolean, wantRTL: boolean, lastAttempt: string | null): RTLAction {
  if (isRTLNow === wantRTL) return 'none';
  return lastAttempt === String(wantRTL) ? 'giveUp' : 'reload';
}

/** Call once before the first screen draws. */
export function initRTL() {
  if (Platform.OS === 'web') return;
  // Keep textAlign 'left' / 'right' literal; the components choose the side themselves.
  I18nManager.swapLeftAndRightInRTL(false);
}

/** Makes the native direction match the language, restarting the app if needed. */
export async function applyDirection(wantRTL: boolean, beforeReload: () => Promise<void>): Promise<void> {
  if (Platform.OS === 'web') return;
  const lastAttempt = await AsyncStorage.getItem(GUARD_KEY).catch(() => null);
  const action = decideRTLAction(I18nManager.isRTL, wantRTL, lastAttempt);
  if (action === 'none') {
    if (lastAttempt !== null) await AsyncStorage.removeItem(GUARD_KEY).catch(() => {});
    return;
  }
  if (action === 'giveUp') return;

  await AsyncStorage.setItem(GUARD_KEY, String(wantRTL)).catch(() => {});
  await beforeReload();
  I18nManager.allowRTL(wantRTL);
  I18nManager.forceRTL(wantRTL);
  try {
    // Works in installed builds; throws inside Expo Go and development builds.
    await Updates.reloadAsync();
  } catch {
    DevSettings.reload();
  }
}
