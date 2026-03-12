import { getOverlayColorPacked } from '../overlay/overlay-data-packed';
import { applyBrightnessCurve } from './apply-brightness-curve';
import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';
import { computeDarkFactor } from './compute-dark-factor';
import { computeLightBlend } from './compute-light-blend';

export function applyHalftoneDitheredMode(
  context: OverlayModeContext,
  result: OverlayModeResult
): void {
  const { overlayData, row, col, brightness, config, effectiveIntensity, isDark } = context;
  result.useHalftoneRendering = true;
  result.shouldDrawCell = true;
  const htdColor = getOverlayColorPacked(overlayData, row, col);
  const htdTransformed = applyBrightnessCurve(brightness, config.brightnessCurve);

  if (isDark) {
    result.halftoneBrightness = 0.5 + (htdTransformed - 0.5) * effectiveIntensity;
    if (htdColor) {
      const htdR = (htdColor >> 16) & 0xff;
      const htdG = (htdColor >> 8) & 0xff;
      const htdB = htdColor & 0xff;
      // Keep dark-module dots clearly dark for scanner contrast.
      const dkF = computeDarkFactor(effectiveIntensity, 0.35);
      result.moduleColor = `rgb(${Math.round(htdR * dkF)},${Math.round(htdG * dkF)},${Math.round(htdB * dkF)})`;
    }
    return;
  }

  // Keep light-module dots small/subtle so background image remains visible.
  result.halftoneBrightness = Math.max(0.68, 0.5 + (htdTransformed - 0.5) * effectiveIntensity);
  if (!htdColor) return;
  const htdR = (htdColor >> 16) & 0xff;
  const htdG = (htdColor >> 8) & 0xff;
  const htdB = htdColor & 0xff;
  const ltBlend = computeLightBlend(effectiveIntensity, 0.72);
  const lightR = Math.round(htdR + (255 - htdR) * ltBlend);
  const lightG = Math.round(htdG + (255 - htdG) * ltBlend);
  const lightB = Math.round(htdB + (255 - htdB) * ltBlend);
  result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
}
