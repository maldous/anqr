import { applyBrightnessCurve } from './apply-brightness-curve';
import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';

export function applyHalftoneMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, brightness, effectiveIntensity, config } = context;
  if (!isDark) return;
  // Use halftone params if available
  if (config.halftoneCell || config.halftoneDotShape || config.brightnessCurve) {
    // Store brightness for halftone rendering - will be handled specially below
    result.useHalftoneRendering = true;
    const transformedBrightness = applyBrightnessCurve(brightness, config.brightnessCurve);
    result.halftoneBrightness = 0.5 + (transformedBrightness - 0.5) * effectiveIntensity;
    return;
  }

  // Legacy halftone behavior with improved size mapping
  const intensity = effectiveIntensity; // 0..1
  // Min size scales with intensity: higher intensity allows smaller dots for more detail
  // At intensity 0: 0.25 (visible base size), at intensity 1: 0.15 (finer detail)
  const minSize = 0.15 + 0.1 * (1 - intensity);
  const maxSize = 1;
  const sizeRange = maxSize - minSize;
  const darknessInfluence = (1 - brightness) * intensity;
  const baseSize = minSize + sizeRange * (1 - intensity) * 0.5;
  result.moduleSizeModifier = baseSize + darknessInfluence * (maxSize - baseSize);
}
