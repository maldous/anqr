/**
 * QR Generator Dither Matrix
 * Matrix-based dithering for QR modules with QR scannability protection
 */

import { createLogger } from "@/domain/logging";
import { buildQRFirstMatrix } from "./build-qr-first-matrix";
import { computeDitheredModuleValue } from "./compute-dithered-module-value";
import { detectBWFromOverlayData } from "./detect-bw-from-overlay-data";
import { distributeError } from "./dithering-error";
import { enforceModuleConstraints } from "./enforce-module-constraints-matrix";
import { initErrorMatrix } from "./init-error-matrix";
import { getDiffusionKernel } from "./dithering-kernels";
import { getOverlayBrightness } from "../overlay/overlay-data-packed";
import { shouldLockModule } from "../overlay/should-lock-module";
import { curveIntensity } from "../generator/pixel-matrix-utils";
import type { OverlayData, QRCodeObject, QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

const log = createLogger("GENERATE");

/**
 * Apply dithering to create a modified QR matrix
 * Now includes QR scannability protection for high-contrast B&W overlays
 */
export function applyDitherToMatrix(
  qr: QRCodeObject,
  moduleCount: number,
  overlayData: OverlayData,
  config: QRGeneratorConfig,
): boolean[][] {
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  if (detectBWFromOverlayData(overlayData, moduleCount)) {
    log.debug("Detected high-contrast B&W overlay in dither mode - using QR-first (no dithering)");
    return buildQRFirstMatrix(qr, moduleCount);
  }

  const kernel = getDiffusionKernel(config.ditherKind || "floyd_steinberg");
  const strength = (config.ditherStrength ?? 50) / 100;
  const intensity = curveIntensity(config.overlayIntensity ?? 100);
  const mix = intensity * strength;
  const result = buildQRFirstMatrix(qr, moduleCount);
  const errors = initErrorMatrix(moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const qrIsDark = qr.isDark(row, col);
      if (shouldLockModule(row, col, moduleCount, version, config)) {
        result[row][col] = qrIsDark;
        continue;
      }

      const brightness = getOverlayBrightness(overlayData, row, col);
      const { newValue, quantError } = computeDitheredModuleValue(
        qrIsDark,
        brightness,
        errors[row][col] || 0,
        mix,
      );
      result[row][col] = newValue;
      distributeError(errors, col, row, quantError, kernel, moduleCount, moduleCount);
    }
  }

  enforceModuleConstraints(qr, result, moduleCount, version, config);

  log.debug("dither-matrix applied with QR protection", {
    moduleCount,
    strength,
    intensity,
    version,
  });

  return result;
}
