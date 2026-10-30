/**
 * Colour tokens. Text/background pairs meet WCAG 2.2 AA contrast (4.5:1).
 * The accent is a safety orange, darkened in light mode so white text on it
 * stays readable in sunlight.
 */
export const palette = {
  light: {
    background: '#F5F5F2',
    surface: '#FFFFFF',
    surfaceAlt: '#ECECE7',
    border: '#D2D2CB',
    text: '#141414',
    textMuted: '#55554F',
    accent: '#B45309',
    onAccent: '#FFFFFF',
    danger: '#B42318',
  },
  dark: {
    background: '#0F1012',
    surface: '#1B1D20',
    surfaceAlt: '#26292D',
    border: '#3A3E44',
    text: '#F3F3F1',
    textMuted: '#B4B4AC',
    accent: '#F59E0B',
    onAccent: '#141414',
    danger: '#F97066',
  },
} as const;

export type Colors = { [K in keyof (typeof palette)['light']]: string };

/** Sizes chosen for use with work gloves: well above Apple 44 pt / Google 48 dp minimums. */
export const sizes = {
  touch: 64,
  radius: 14,
  gutter: 16,
  gap: 12,
  fontBody: 18,
  fontLabel: 16,
  fontTitle: 26,
  fontResult: 40,
} as const;
