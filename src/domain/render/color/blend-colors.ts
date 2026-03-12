import { parseColor } from './parse-color';
import { BLACK } from './color._internal';
import { rgbaToString } from './rgba-to-string';
import { rgbToHex } from './rgb-to-hex';

/** Blend two color strings with given ratio */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const c1 = parseColor(color1) ?? BLACK;
  const c2 = parseColor(color2) ?? BLACK;

  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  const a = c1.a + (c2.a - c1.a) * ratio;

  if (a < 1) {
    return rgbaToString(r, g, b, a);
  }
  return rgbToHex(r, g, b);
}
