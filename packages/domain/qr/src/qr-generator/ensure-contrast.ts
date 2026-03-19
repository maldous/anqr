import { getRelativeLuminance, parseColor } from "@/domain/render/color";
import { getContrastRatio } from "./utils";
import { log } from "./log";

/**
 * Ensure module color has sufficient contrast with background
 * Lightens on dark backgrounds, darkens on light backgrounds
 */
export function ensureContrast(moduleColor: string, bgColor: string, minRatio: number): string {
  try {
    const ratio = getContrastRatio(moduleColor, bgColor);
    if (ratio >= minRatio) {
      return moduleColor;
    }

    const parsed = parseColor(moduleColor);
    if (!parsed) return moduleColor;

    // Determine if background is dark (luminance < 0.179 threshold from WCAG)
    const bgLuminance = getRelativeLuminance(bgColor);
    const bgIsDark = bgLuminance < 0.179;

    let newColor = moduleColor;

    if (bgIsDark) {
      // Background is dark: lighten the foreground to increase contrast
      let factor = 0.1; // Start with 10% lightening
      for (let i = 0; i < 10; i++) {
        const r = Math.round(parsed.r + (255 - parsed.r) * factor);
        const g = Math.round(parsed.g + (255 - parsed.g) * factor);
        const b = Math.round(parsed.b + (255 - parsed.b) * factor);
        newColor = `rgb(${r},${g},${b})`;

        const newRatio = getContrastRatio(newColor, bgColor);
        if (newRatio >= minRatio) {
          return newColor;
        }
        factor = Math.min(1, factor + 0.1); // Increase lightening
      }
      // Fallback to white for dark backgrounds
      return "#ffffff";
    } else {
      // Background is light: darken the foreground to increase contrast
      let factor = 0.9;
      for (let i = 0; i < 10; i++) {
        const r = Math.round(parsed.r * factor);
        const g = Math.round(parsed.g * factor);
        const b = Math.round(parsed.b * factor);
        newColor = `rgb(${r},${g},${b})`;

        const newRatio = getContrastRatio(newColor, bgColor);
        if (newRatio >= minRatio) {
          return newColor;
        }
        factor *= 0.85;
      }
      // Fallback to black for light backgrounds
      return "#000000";
    }
  } catch (error) {
    log.warn("Contrast check failed", { error });
    return moduleColor;
  }
}
