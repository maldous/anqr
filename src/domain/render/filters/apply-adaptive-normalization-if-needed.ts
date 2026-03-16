import type { QRGeneratorConfig } from "../../../modules/qr-generator/types";
import { log } from "./log";
import { computeOverlayToneStats } from "./compute-overlay-tone-stats";
import { applyAdaptiveColorNormalization } from "./apply-adaptive-color-normalization";
import { shouldAutoNormalizeColor } from "./should-auto-normalize-color";
import { computeNormalizationStrength } from "./compute-normalization-strength";

export function applyAdaptiveNormalizationIfNeeded(
  imageData: ImageData,
  config: QRGeneratorConfig,
  debug: boolean,
): ImageData {
  if (!shouldAutoNormalizeColor(config)) return imageData;

  const stats = computeOverlayToneStats(imageData);
  const overlayIntensity = Math.max(0, Math.min(100, config.overlayIntensity ?? 100)) / 100;
  const normalizationStrength = computeNormalizationStrength(stats, overlayIntensity);

  if (normalizationStrength > 0.08) {
    if (debug) {
      log.debug("preprocessImageData - adaptive color normalization", {
        strength: normalizationStrength.toFixed(3),
        lumaStd: stats.lumaStd.toFixed(3),
        saturationMean: stats.saturationMean.toFixed(3),
        clippedDarkRatio: stats.clippedDarkRatio.toFixed(3),
        clippedLightRatio: stats.clippedLightRatio.toFixed(3),
        overlayIntensity: (overlayIntensity * 100).toFixed(1),
      });
    }
    return applyAdaptiveColorNormalization(imageData, stats, normalizationStrength);
  }

  if (debug) {
    log.debug("preprocessImageData - adaptive normalization skipped (low risk)", {
      lumaStd: stats.lumaStd.toFixed(3),
      saturationMean: stats.saturationMean.toFixed(3),
      clippedDarkRatio: stats.clippedDarkRatio.toFixed(3),
      clippedLightRatio: stats.clippedLightRatio.toFixed(3),
    });
  }
  return imageData;
}
