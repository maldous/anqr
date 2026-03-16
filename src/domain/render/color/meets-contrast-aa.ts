import { getContrastRatio, parseColor } from "./color";

/**
 * Check if foreground/background meet WCAG AA contrast (4.5:1)
 */
export function meetsContrastAA(fg: string, bg: string): boolean {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!(fgRgb && bgRgb)) return false;
  const ratio = getContrastRatio(fgRgb, bgRgb);
  return ratio >= 4.5;
}
