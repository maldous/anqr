import { hslToRgb, parseColor, rgbToHsl } from './color';

/**
 * Get analogous colors (adjacent on color wheel)
 */
export function getAnalogous(color: string, angle = 30): [string, string] {
  const rgb = parseColor(color);
  if (!rgb) return [color, color];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const hue1 = (hsl.h + angle + 360) % 360;
  const hue2 = (hsl.h - angle + 360) % 360;

  const c1 = hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = hslToRgb(hue2, hsl.s, hsl.l);

  return [`rgb(${c1.r}, ${c1.g}, ${c1.b})`, `rgb(${c2.r}, ${c2.g}, ${c2.b})`];
}
