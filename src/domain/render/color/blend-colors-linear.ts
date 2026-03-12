import { parseColor } from './parse-color';
import { BLACK } from './black';
import { blendRgbLinear } from './blend-rgb-linear';
import { rgbaToString } from './rgba-to-string';
import { rgbToHex } from './rgb-to-hex';

/** Blend two color strings in linear-light space with given ratio */
export function blendColorsLinear(color1: string, color2: string, ratio: number): string {
  const c1 = parseColor(color1) ?? BLACK;
  const c2 = parseColor(color2) ?? BLACK;
  const t = Math.max(0, Math.min(1, ratio));
  const rgb = blendRgbLinear(c1, c2, t);
  const a = c1.a + (c2.a - c1.a) * t;
  if (a < 1) {
    return rgbaToString(rgb.r, rgb.g, rgb.b, a);
  }
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}
