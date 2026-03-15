import { hslToRgb } from './hsl-to-rgb';

/**
 * Convert HSL to RGB tuple [r, g, b] (0-255)
 * Variant that returns tuple format for use in animation patterns
 */
export function hslToRgbTuple(h: number, s: number, l: number): [number, number, number] {
  const rgb = hslToRgb(h, s, l);
  return [rgb.r, rgb.g, rgb.b];
}
