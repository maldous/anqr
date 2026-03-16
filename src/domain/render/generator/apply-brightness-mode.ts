import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";

export function applyBrightnessMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { isDark, brightness, effectiveIntensity } = context;
  if (!isDark) return;
  const threshold = 1 - effectiveIntensity; // effectiveIntensity is 0..1
  if (brightness > threshold) {
    result.moduleOpacity = 0;
  }
}
