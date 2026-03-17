import { blendColors } from "../core";
import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import { computeDitherBlendFlags } from "./compute-dither-blend-flags";
import { applyDitherLightModule } from "./apply-dither-light-module";
import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";
import { computeDarkFactor } from "./compute-dark-factor";

export function applyDitherOrExtremeMode(
  context: OverlayModeContext,
  result: OverlayModeResult,
): void {
  const { overlayData, row, col, config, effectiveIntensity, isDark } = context;
  const ditherColor = getOverlayColorPacked(overlayData, row, col);
  if (!ditherColor) return;
  const ditherR = (ditherColor >> 16) & 0xff;
  const ditherG = (ditherColor >> 8) & 0xff;
  const ditherB = ditherColor & 0xff;

  const flags = computeDitherBlendFlags(context);
  let preserveBoost: number;
  if (flags.blendPresFunctionalOverlay) preserveBoost = 1.14;
  else if (flags.blendPresFunctionalDither) preserveBoost = 1.04;
  else preserveBoost = 1;
  const darkBlend = flags.isExtreme
    ? Math.min(1, effectiveIntensity * 1.18 * preserveBoost)
    : Math.min(1, effectiveIntensity * 0.82 * preserveBoost);
  // Keep extreme mode dark rail significantly darker to preserve scanner contrast.
  let darkFloor: number;
  if (flags.functionalExtremeBlend) darkFloor = 0.22;
  else if (flags.isExtreme) darkFloor = 0.44;
  else darkFloor = 0.68;
  const darkFactor = computeDarkFactor(darkBlend, darkFloor);
  const darkR = Math.round(ditherR * darkFactor);
  const darkG = Math.round(ditherG * darkFactor);
  const darkB = Math.round(ditherB * darkFactor);
  const darkColor = `rgb(${darkR},${darkG},${darkB})`;

  if (isDark) {
    result.moduleColor = blendColors(config.fgColor, darkColor, darkBlend);
    return;
  }

  applyDitherLightModule(
    result,
    flags,
    effectiveIntensity,
    ditherR,
    ditherG,
    ditherB,
    config.bgColor,
  );
}
