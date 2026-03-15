import type { ContrastReport } from './telemetry-contrast.types';
import { relativeLuminance } from './relative-luminance';

export function calculateContrastStats(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): ContrastReport {
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  const toHex = (rgb: { r: number; g: number; b: number }) =>
    `#${[rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

  return {
    ratio,
    lighterColor: fgLum > bgLum ? toHex(fg) : toHex(bg),
    darkerColor: fgLum > bgLum ? toHex(bg) : toHex(fg),
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    meetsAALarge: ratio >= 3,
  };
}
