import type { RGB } from "@/domain/share";

// ============================================
// COLOR BLENDING
// ============================================

/** Blend RGB values with ratio (0 = c1, 1 = c2) */
export function blendRgb(c1: RGB, c2: RGB, ratio: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * ratio),
    g: Math.round(c1.g + (c2.g - c1.g) * ratio),
    b: Math.round(c1.b + (c2.b - c1.b) * ratio),
  };
}
