import { hslToRgb, parseColor, rgbToHsl } from './color';

/**
 * Get triadic colors (evenly spaced on color wheel)
 */
export function getTriadic(color: string): [string, string] {
  const rgb = parseColor(color);
  if (!rgb) return [color, color];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hue1 = (hsl.h + 120) % 360;
  const hue2 = (hsl.h + 240) % 360;

  const c1 = hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = hslToRgb(hue2, hsl.s, hsl.l);

  return [`rgb(${c1.r}, ${c1.g}, ${c1.b})`, `rgb(${c2.r}, ${c2.g}, ${c2.b})`];
}
