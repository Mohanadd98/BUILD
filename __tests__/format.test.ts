import { fmt, parseNumber } from '@/calc/format';

describe('parseNumber', () => {
  it.each([
    ['12', 12],
    ['0.15', 0.15],
    ['0,15', 0.15],
    ['.5', 0.5],
    ['3.', 3],
    ['  7 ', 7],
    ['١٢٫٥', 12.5], // Arabic-Indic digits with Arabic decimal mark
    ['۱۵', 15], // Persian digits
  ])('reads %p as %p', (text, expected) => {
    expect(parseNumber(text)).toBe(expected);
  });

  it.each(['', 'abc', '1.2.3', '-4', '1e5', '.'])('rejects %p', (text) => {
    expect(parseNumber(text)).toBeNull();
  });
});

describe('fmt', () => {
  it('drops trailing zeros and rounds', () => {
    expect(fmt(3.1)).toBe('3.1');
    expect(fmt(3)).toBe('3');
    expect(fmt(1.23456, 3)).toBe('1.235');
  });
});
