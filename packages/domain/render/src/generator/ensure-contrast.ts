import { createLogger } from "@/domain/logging";
import { getContrastRatio, getRelativeLuminance, parseColor } from "@/domain/render/color";

const log = createLogger("RENDER");

export function ensureContrast(moduleColor: string, bgColor: string, minRatio: number): string {
  try {
    const ratio = getContrastRatio(moduleColor, bgColor);
    if (ratio >= minRatio) {
      return moduleColor;
    }

    const parsed = parseColor(moduleColor);
    if (!parsed) return moduleColor;

    const bgLuminance = getRelativeLuminance(bgColor);
    const bgIsDark = bgLuminance < 0.179;

    let newColor = moduleColor;

    if (bgIsDark) {
      let factor = 0.1;
      for (let i = 0; i < 10; i++) {
        const r = Math.round(parsed.r + (255 - parsed.r) * factor);
        const g = Math.round(parsed.g + (255 - parsed.g) * factor);
        const b = Math.round(parsed.b + (255 - parsed.b) * factor);
        newColor = `rgb(${r},${g},${b})`;

        const newRatio = getContrastRatio(newColor, bgColor);
        if (newRatio >= minRatio) {
          return newColor;
        }
        factor = Math.min(1, factor + 0.1);
      }
      return "#ffffff";
    }

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

    return "#000000";
  } catch (error) {
    log.warn("Contrast check failed", { error });
    return moduleColor;
  }
}
