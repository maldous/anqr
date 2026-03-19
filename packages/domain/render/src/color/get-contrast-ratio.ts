import type { RGB } from "@/contracts/generator";
import { getRelativeLuminance } from "./get-relative-luminance";

/** Calculate WCAG contrast ratio between two colors */
export function getContrastRatio(color1: RGB | string, color2: RGB | string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}
