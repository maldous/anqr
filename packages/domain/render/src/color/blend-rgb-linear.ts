import type { RGB } from "@/contracts/generator";
import { srgbToLinear01 } from "./srgb-to-linear01";
import { linearToSrgb8 } from "./linear-to-srgb8";

/** Blend RGB values in linear-light space with ratio (0 = c1, 1 = c2) */
export function blendRgbLinear(c1: RGB, c2: RGB, ratio: number): RGB {
  const t = Math.max(0, Math.min(1, ratio));
  const l1r = srgbToLinear01(c1.r);
  const l1g = srgbToLinear01(c1.g);
  const l1b = srgbToLinear01(c1.b);
  const l2r = srgbToLinear01(c2.r);
  const l2g = srgbToLinear01(c2.g);
  const l2b = srgbToLinear01(c2.b);

  return {
    r: linearToSrgb8(l1r + (l2r - l1r) * t),
    g: linearToSrgb8(l1g + (l2g - l1g) * t),
    b: linearToSrgb8(l1b + (l2b - l1b) * t),
  };
}
