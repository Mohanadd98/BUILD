import { decideRTLAction } from '@/state/rtl';

jest.mock('@react-native-async-storage/async-storage', () => ({}));
jest.mock('expo-updates', () => ({}));

describe('decideRTLAction', () => {
  it('does nothing when the layout already matches the language', () => {
    expect(decideRTLAction(true, true, null)).toBe('none');
    expect(decideRTLAction(false, false, 'true')).toBe('none');
  });

  it('restarts when the language needs the other direction', () => {
    expect(decideRTLAction(false, true, null)).toBe('reload');
    expect(decideRTLAction(true, false, null)).toBe('reload');
  });

  it('gives up instead of restarting forever if a restart did not take effect', () => {
    expect(decideRTLAction(false, true, 'true')).toBe('giveUp');
    expect(decideRTLAction(true, false, 'false')).toBe('giveUp');
  });

  it('tries again for the other direction after an earlier attempt', () => {
    expect(decideRTLAction(true, false, 'true')).toBe('reload');
  });
});
