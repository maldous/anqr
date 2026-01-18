/**
 * Contrast Analysis Telemetry
 */

export interface ContrastReport {
  ratio: number;
  lighterColor: string;
  darkerColor: string;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALarge: boolean;
}

export function calculateContrastStats(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): ContrastReport {
  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
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

export function checkContrastCompliance(ratio: number): {
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
  passes: boolean;
} {
  if (ratio >= 7) return { level: 'AAA', passes: true };
  if (ratio >= 4.5) return { level: 'AA', passes: true };
  if (ratio >= 3) return { level: 'AA-Large', passes: true };
  return { level: 'Fail', passes: false };
}
