import { hslToRgb, parseColor, rgbToHsl } from './color';

/**
 * Get complementary color (opposite on color wheel)
 */
export function getComplementary(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return color;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const compHue = (hsl.h + 180) % 360;
  const comp = hslToRgb(compHue, hsl.s, hsl.l);
  return `rgb(${comp.r}, ${comp.g}, ${comp.b})`;
}
