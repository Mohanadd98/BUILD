import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Reads a stored value. If it is missing but an older key from before the
 * app was renamed to BUILD has data, that data is moved to the new key.
 */
export async function getItemMigrating(key: string, legacyKey: string): Promise<string | null> {
  const value = await AsyncStorage.getItem(key);
  if (value !== null) return value;
  const legacy = await AsyncStorage.getItem(legacyKey);
  if (legacy === null) return null;
  await AsyncStorage.setItem(key, legacy);
  await AsyncStorage.removeItem(legacyKey);
  return legacy;
}
