import type { RGB } from "@/domain/share";
import { parseColor } from "./parse-color";
import { BLACK } from "./black";
import { rgbToLumaLinear } from "./rgb-to-luma-linear";

// ============================================
// CONTRAST & ACCESSIBILITY
// ============================================

/** Calculate relative luminance for WCAG contrast */
export function getRelativeLuminance(color: RGB | string): number {
  const c = typeof color === "string" ? (parseColor(color) ?? BLACK) : color;
  return rgbToLumaLinear(c.r, c.g, c.b);
}
