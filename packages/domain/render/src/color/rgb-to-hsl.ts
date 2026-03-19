import type { HSL } from "@/contracts/generator";
import { resolveHslHue } from "./resolve-hsl-hue";

/** Convert RGB to HSL */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = resolveHslHue(max, r, g, b, d);
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}
