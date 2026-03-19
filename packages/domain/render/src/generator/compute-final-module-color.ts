import type { OverlayData, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

import { applyPaletteColor } from "./apply-palette-color";
import { applyPerModuleColor } from "./apply-per-module-color";
import { ensureContrast } from "./ensure-contrast";

export function computeFinalModuleColor(
  baseColor: string,
  isDark: boolean,
  overlayBrightness: number,
  overlayData: OverlayData | null,
  row: number,
  col: number,
  moduleCount: number,
  config: QRGeneratorConfig,
  hasPerModuleColor: boolean,
  hasPalette: boolean,
  hasContrastGuard: boolean,
): string {
  let finalColor = baseColor;
  if (isDark && hasPerModuleColor && overlayData) {
    finalColor = applyPerModuleColor(
      config.perModuleColorMode!,
      finalColor,
      overlayData,
      row,
      col,
      moduleCount,
      config,
    );
  }
  if (isDark && hasPalette) {
    finalColor = applyPaletteColor(
      row,
      col,
      moduleCount,
      overlayBrightness,
      config.palette!,
      config,
    );
  }
  if (isDark && hasContrastGuard) {
    finalColor = ensureContrast(finalColor, config.bgColor, config.minContrastRatio!);
  }
  return finalColor;
}
