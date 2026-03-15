import { rgbToHsl } from './rgb-to-hsl';

/**
 * Convert RGB to HSL tuple [h, s, l]
 */
export function rgbToHslTuple(r: number, g: number, b: number): [number, number, number] {
  const hsl = rgbToHsl(r, g, b);
  return [hsl.h, hsl.s, hsl.l];
}
