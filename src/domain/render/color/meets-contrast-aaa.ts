import { getContrastRatio, parseColor } from './color';

/**
 * Check if foreground/background meet WCAG AAA contrast (7:1)
 */
export function meetsContrastAAA(fg: string, bg: string): boolean {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!(fgRgb && bgRgb)) return false;
  const ratio = getContrastRatio(fgRgb, bgRgb);
  return ratio >= 7;
}
