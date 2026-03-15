import { hslToRgb, parseColor, rgbToHsl } from './color';

export function getRelatedHues(color: string, hueOffsets: [number, number]): [string, string] {
  const rgb = parseColor(color);
  if (!rgb) return [color, color];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const [offset1, offset2] = hueOffsets;
  const hue1 = (hsl.h + offset1 + 360) % 360;
  const hue2 = (hsl.h + offset2 + 360) % 360;
  const c1 = hslToRgb(hue1, hsl.s, hsl.l);
  const c2 = hslToRgb(hue2, hsl.s, hsl.l);
  return [`rgb(${c1.r}, ${c1.g}, ${c1.b})`, `rgb(${c2.r}, ${c2.g}, ${c2.b})`];
}
