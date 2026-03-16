import { getOverlayColorPacked } from "../overlay/overlay-data-packed";
import type { OverlayModeContext } from "./overlay-mode-context";
import type { OverlayModeResult } from "./render-modes.types";
import { computeDarkFactor } from "./compute-dark-factor";
import { computeLightBlend } from "./compute-light-blend";

export function applyMosaicMode(context: OverlayModeContext, result: OverlayModeResult): void {
  const { overlayData, row, col, effectiveIntensity, isDark } = context;
  // Mosaic fills every cell with image colors.
  // Keep a strict dark/light luminance split so module boundaries stay scannable.
  result.shouldDrawCell = true;
  const mosaicColor = getOverlayColorPacked(overlayData, row, col);
  if (!mosaicColor) return;
  const mosaicR = (mosaicColor >> 16) & 0xff;
  const mosaicG = (mosaicColor >> 8) & 0xff;
  const mosaicB = mosaicColor & 0xff;
  const mosaicIntensity = effectiveIntensity; // 0..1
  if (isDark) {
    // High floor contrast for dark modules:
    // at full intensity, dark rails stay near-black instead of midtones.
    const darkFactor = computeDarkFactor(mosaicIntensity, 0.08);
    result.moduleColor = `rgb(${Math.round(mosaicR * darkFactor)},${Math.round(mosaicG * darkFactor)},${Math.round(mosaicB * darkFactor)})`;
    return;
  }

  // Light modules stay close to paper-white so the scanner sees clear separation.
  const blendToWhite = 0.72 + computeLightBlend(mosaicIntensity, 0.24);
  const lightR = Math.round(mosaicR + (255 - mosaicR) * blendToWhite);
  const lightG = Math.round(mosaicG + (255 - mosaicG) * blendToWhite);
  const lightB = Math.round(mosaicB + (255 - mosaicB) * blendToWhite);
  result.moduleColor = `rgb(${lightR},${lightG},${lightB})`;
}
