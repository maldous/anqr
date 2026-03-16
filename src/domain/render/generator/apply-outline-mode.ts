import { blendColors } from "../core";
import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";
import { computeDarkFactor } from "./compute-dark-factor";

export function applyOutlineMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, overlayData, row, col, effectiveIntensity, config } = context;
  if (!isDark) return;
  result.drawOutlineOnly = true;
  const outlineColor = getOverlayColorPacked(overlayData, row, col);
  if (!outlineColor) return;
  const outR = (outlineColor >> 16) & 0xff;
  const outG = (outlineColor >> 8) & 0xff;
  const outB = outlineColor & 0xff;
  const outlineBlend = effectiveIntensity;
  const darkFactor = computeDarkFactor(outlineBlend, 0.75);
  const darkR = Math.round(outR * darkFactor);
  const darkG = Math.round(outG * darkFactor);
  const darkB = Math.round(outB * darkFactor);
  const colorStr = `rgb(${darkR},${darkG},${darkB})`;
  result.moduleColor = blendColors(config.fgColor, colorStr, outlineBlend);
}
