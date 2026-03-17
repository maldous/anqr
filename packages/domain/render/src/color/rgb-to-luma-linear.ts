import { srgbToLinear01 } from "./srgb-to-linear01";

/** Convert sRGB RGB to linear-light relative luminance in 0..1 */
export function rgbToLumaLinear(r: number, g: number, b: number): number {
  const lr = srgbToLinear01(r);
  const lg = srgbToLinear01(g);
  const lb = srgbToLinear01(b);
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}
