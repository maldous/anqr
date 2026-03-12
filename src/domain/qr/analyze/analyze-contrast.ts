import { getContrastRatio, parseColor } from '../../render/color/color';
import type { ContrastReport } from './safety.types';

/**
 * Analyze contrast between foreground and background colors
 */
export function analyzeContrast(fgColor: string, bgColor: string): ContrastReport {
  const fg = parseColor(fgColor);
  const bg = parseColor(bgColor);

  if (!(fg && bg)) {
    return {
      ratio: 1,
      meetsAA: false,
      meetsAAA: false,
      fgLuminance: 0,
      bgLuminance: 0,
    };
  }

  // Calculate luminance using WCAG formula
  const calcLum = (c: { r: number; g: number; b: number }) => {
    const rsRGB = c.r / 255;
    const gsRGB = c.g / 255;
    const bsRGB = c.b / 255;
    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : ((rsRGB + 0.055) / 1.055) ** 2.4;
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : ((gsRGB + 0.055) / 1.055) ** 2.4;
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : ((bsRGB + 0.055) / 1.055) ** 2.4;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgLuminance = calcLum(fg);
  const bgLuminance = calcLum(bg);
  const ratio = getContrastRatio(fg, bg);

  return {
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    fgLuminance,
    bgLuminance,
  };
}
