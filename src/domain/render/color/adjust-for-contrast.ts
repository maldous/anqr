import {
  getContrastRatio,
  hslToRgb,
  parseColor,
  rgbToHsl,
} from './color';

/**
 * Adjust foreground color to meet minimum contrast ratio
 */
export function adjustForContrast(fg: string, bg: string, minRatio = 4.5): string {
  const fgRgb = parseColor(fg);
  const bgRgb = parseColor(bg);
  if (!(fgRgb && bgRgb)) return fg;

  const currentRatio = getContrastRatio(fgRgb, bgRgb);
  if (currentRatio >= minRatio) return fg;

  // Darken or lighten foreground to meet contrast
  const fgHsl = rgbToHsl(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
  const bgIsDark = bgHsl.l < 50;

  // Adjust lightness
  let newL = fgHsl.l;
  const step = bgIsDark ? 5 : -5;

  for (let i = 0; i < 20; i++) {
    newL = Math.max(0, Math.min(100, newL + step));
    const newRgb = hslToRgb(fgHsl.h, fgHsl.s, newL);
    const newRatio = getContrastRatio(newRgb, bgRgb);
    if (newRatio >= minRatio) {
      return `hsl(${fgHsl.h}, ${fgHsl.s}%, ${newL}%)`;
    }
  }

  return fg;
}
