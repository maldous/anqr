import { blendColors } from "../core";
import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";
import { computeDarkFactor } from "./compute-dark-factor";

export function applyBlendMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, overlayData, row, col, effectiveIntensity, config } = context;
  if (!isDark) return;
  const blendColor = getOverlayColorPacked(overlayData, row, col);
  if (!blendColor) return;
  const blendR = (blendColor >> 16) & 0xff;
  const blendG = (blendColor >> 8) & 0xff;
  const blendB = blendColor & 0xff;
  const blendAmount = effectiveIntensity; // 0..1
  const darkFactor = computeDarkFactor(blendAmount, 0.75);
  const darkR = Math.round(blendR * darkFactor);
  const darkG = Math.round(blendG * darkFactor);
  const darkB = Math.round(blendB * darkFactor);
  result.moduleColor = blendColors(config.fgColor, `rgb(${darkR},${darkG},${darkB})`, blendAmount);
}
