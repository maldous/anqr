import type { ApplyOverlayModeOptions } from "../../../modules/qr-generator/types";
import type { OverlayModeResult } from "./render-modes.types";
import { applyArtworkMode } from "./apply-artwork-mode";
import { applyBlendMode } from "./apply-blend-mode";
import { applyBrightnessMode } from "./apply-brightness-mode";
import { applyDitherOrExtremeMode } from "./apply-dither-or-extreme-mode";
import { applyDuotoneMode } from "./apply-duotone-mode";
import { applyGapfillMode } from "./apply-gapfill-mode";
import { applyHalftoneDitheredMode } from "./apply-halftone-dithered-mode";
import { applyHalftoneMode } from "./apply-halftone-mode";
import { applyMosaicMode } from "./apply-mosaic-mode";
import { applyOutlineMode } from "./apply-outline-mode";
import { applyPixelateMode } from "./apply-pixelate-mode";
import { applyWaveMode } from "./apply-wave-mode";
import type { OverlayModeContext } from "./overlay-mode-context";

/**
 * Apply overlay mode effects to a module
 * Returns modified rendering parameters based on overlay mode and brightness
 */
export function applyQROverlayMode(options: ApplyOverlayModeOptions): OverlayModeResult {
  const {
    overlayMode,
    isDark,
    brightness,
    overlayData,
    row,
    col,
    moduleCount,
    effectiveIntensity,
    config,
    isFunctionalPattern = false,
  } = options;
  const context: OverlayModeContext = {
    overlayMode,
    isDark,
    brightness,
    overlayData,
    row,
    col,
    moduleCount,
    effectiveIntensity,
    config,
    isFunctionalPattern,
  };
  const result: OverlayModeResult = {
    moduleColor: isDark ? config.fgColor : config.bgColor,
    moduleSizeModifier: 1,
    moduleOpacity: 1,
    waveOffsetX: 0,
    waveOffsetY: 0,
    drawOutlineOnly: false,
    useHalftoneRendering: false,
    halftoneBrightness: 0.5,
    shouldDrawCell: isDark,
  };

  switch (overlayMode) {
    case "halftone":
      applyHalftoneMode(context, result);
      break;

    case "halftone-dithered":
      applyHalftoneDitheredMode(context, result);
      break;

    case "blend":
      applyBlendMode(context, result);
      break;

    case "brightness":
      applyBrightnessMode(context, result);
      break;

    case "gapfill":
      applyGapfillMode(context, result);
      break;

    case "pixelate":
      applyPixelateMode(context, result);
      break;

    case "duotone":
      applyDuotoneMode(context, result);
      break;

    case "outline":
      applyOutlineMode(context, result);
      break;

    case "wave":
      applyWaveMode(context, result);
      break;

    case "mosaic":
      applyMosaicMode(context, result);
      break;

    case "dither":
    case "extreme":
      applyDitherOrExtremeMode(context, result);
      break;

    case "artwork":
      applyArtworkMode(context, result);
      break;
  }

  return result;
}
