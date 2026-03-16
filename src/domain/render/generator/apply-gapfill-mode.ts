import { blendColors } from "../core";
import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";
import { computeLightBlend } from "./compute-light-blend";

export function applyGapfillMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, overlayData, row, col, effectiveIntensity, config } = context;
  // Fill white spaces with faded image colors - creates ghosted image effect
  if (isDark) {
    result.moduleColor = config.fgColor;
    return;
  }
  const gapColor = getOverlayColorPacked(overlayData, row, col);
  if (!gapColor) return;
  const gapR = (gapColor >> 16) & 0xff;
  const gapG = (gapColor >> 8) & 0xff;
  const gapB = gapColor & 0xff;
  // Fade amount derived from intensity (already ECC-capped)
  const fadeAmount = computeLightBlend(effectiveIntensity, 0.75);
  const colorStr = `rgb(${gapR},${gapG},${gapB})`;
  result.moduleColor = blendColors(config.bgColor, colorStr, fadeAmount);
  result.shouldDrawCell = true;
}
