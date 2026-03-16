import {
  applyPaletteColor,
  applyPerModuleColor,
  ensureContrast,
} from "../../../modules/qr-generator/color";
import type { OverlayData, QRGeneratorConfig } from "../../../modules/qr-generator/types";

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
