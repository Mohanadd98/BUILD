import { getItemMigrating } from '@/storage/keys';

const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItem: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  removeItem: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

describe('getItemMigrating', () => {
  beforeEach(() => mockStore.clear());

  it('moves data saved under the old BinaaHub key to the new BUILD key', async () => {
    mockStore.set('binaahub.projects.v1', '[1]');
    expect(await getItemMigrating('build.projects.v1', 'binaahub.projects.v1')).toBe('[1]');
    expect(mockStore.get('build.projects.v1')).toBe('[1]');
    expect(mockStore.has('binaahub.projects.v1')).toBe(false);
  });

  it('prefers the new key when both exist', async () => {
    mockStore.set('build.projects.v1', '[2]');
    mockStore.set('binaahub.projects.v1', '[1]');
    expect(await getItemMigrating('build.projects.v1', 'binaahub.projects.v1')).toBe('[2]');
  });

  it('returns null when nothing is stored', async () => {
    expect(await getItemMigrating('build.projects.v1', 'binaahub.projects.v1')).toBeNull();
  });
});
