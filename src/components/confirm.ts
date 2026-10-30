import { Alert, Platform } from 'react-native';

/** Asks "are you sure?" and runs `onConfirm` only if the user agrees. */
export function confirm(title: string, message: string, ok: string, cancel: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancel, style: 'cancel' },
    { text: ok, style: 'destructive', onPress: onConfirm },
  ]);
}
