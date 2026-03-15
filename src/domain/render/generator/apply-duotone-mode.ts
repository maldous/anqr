import { blendColors, parseColor } from '../core';
import { DUOTONE_MAX_LIGHTEN } from './duotone-max-lighten';
import type { OverlayModeContext } from './overlay-mode-context';
import type { OverlayModeResult } from './render-modes.types';

export function applyDuotoneMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, config, effectiveIntensity, brightness } = context;
  if (!isDark) return;
  // duotoneColors is an array [shadowColor, highlightColor] from the store
  const duotoneArr = config.duotoneColors || [];
  const shadowColor = duotoneArr[0] || config.fgColor;
  const highlightColor = duotoneArr[1] || null;
  const duoIntensity = effectiveIntensity;

  // Use a smoother gradient between shadow and highlight colors
  // This creates more visually appealing duotone effect
  if (highlightColor) {
    // Full duotone: blend between shadow and highlight based on brightness
    // brightness 0 -> full shadow, brightness 1 -> full highlight
    const shadowParsed = parseColor(shadowColor) ?? { r: 0, g: 0, b: 0, a: 1 };
    const highlightParsed = parseColor(highlightColor) ?? { r: 0, g: 0, b: 0, a: 1 };

    // Apply intensity to control how much duotone effect is applied
    const duoR = Math.round(shadowParsed.r + (highlightParsed.r - shadowParsed.r) * brightness);
    const duoG = Math.round(shadowParsed.g + (highlightParsed.g - shadowParsed.g) * brightness);
    const duoB = Math.round(shadowParsed.b + (highlightParsed.b - shadowParsed.b) * brightness);
    const duoColor = `rgb(${duoR},${duoG},${duoB})`;

    // Blend from fgColor to duotone color based on intensity
    result.moduleColor = blendColors(config.fgColor, duoColor, duoIntensity);
    return;
  }

  if (brightness > 0.5) {
    // Fallback: lighten the shadow color for bright areas
    const shadowParsed = parseColor(shadowColor) ?? { r: 0, g: 0, b: 0, a: 1 };
    const lightenAmt = (brightness - 0.5) * 2 * duoIntensity;
    const lightR = Math.min(
      255,
      Math.round(shadowParsed.r + (255 - shadowParsed.r) * lightenAmt * DUOTONE_MAX_LIGHTEN)
    );
    const lightG = Math.min(
      255,
      Math.round(shadowParsed.g + (255 - shadowParsed.g) * lightenAmt * DUOTONE_MAX_LIGHTEN)
    );
    const lightB = Math.min(
      255,
      Math.round(shadowParsed.b + (255 - shadowParsed.b) * lightenAmt * DUOTONE_MAX_LIGHTEN)
    );
    result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
    return;
  }

  // Dark areas get shadow color blended with fg
  result.moduleColor = blendColors(
    config.fgColor,
    shadowColor,
    duoIntensity * (0.5 - brightness) * 2
  );
}
