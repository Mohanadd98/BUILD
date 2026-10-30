/** One line of the "how this was calculated" box. */
export interface Step {
  /** Translation key for the step's name, e.g. "concrete.step.volume". */
  labelKey: string;
  /** The formula with the real numbers filled in. Always left to right. */
  expr: string;
}

/** Rounds to at most `maxDecimals` and drops trailing zeros: 3.10 -> "3.1". */
export function fmt(n: number, maxDecimals = 2): string {
  return String(Number(n.toFixed(maxDecimals)));
}

/**
 * Keeps a number with its unit in left-to-right order inside Arabic text,
 * so "5 mm" is not shown as "mm 5". Uses Unicode isolate marks.
 */
export function ltr(text: string): string {
  return `\u2066${text}\u2069`;
}

/**
 * Reads what the user typed into a number box.
 * Accepts Arabic-Indic digits (٠١٢), Persian digits (۰۱۲), and a comma or the
 * Arabic decimal mark (٫) as the decimal separator.
 * Returns null when the text is not a usable number.
 */
export function parseNumber(text: string): number | null {
  const normalised = text
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫,]/g, '.');
  if (!/^\d*\.?\d+$|^\d+\.$/.test(normalised)) return null;
  const n = Number(normalised);
  return Number.isFinite(n) ? n : null;
}
