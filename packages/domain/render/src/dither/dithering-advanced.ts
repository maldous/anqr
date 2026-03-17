/**
 * QR Generator Advanced Dithering
 * Advanced dithering algorithms with blue noise support
 */

import { createLogger } from "../../../../observability/logging/src";
import { generateBlueNoiseTile, sampleBlueNoise } from "@/modules/dither-algorithms";
import type { QRCodeObject } from "@/modules/qr-generator/cache";
import { getOverlayBrightness } from "../overlay/overlay-data-packed";
import { curveIntensity } from "../generator/pixel-matrix-utils";
import type { CreateCanvasFn, OverlayData, QRGeneratorConfig } from "@/modules/qr-generator/types";

const _log = createLogger("GENERATE");

/**
 * Apply advanced dithering with blue noise
 */
export async function applyAdvancedDither(
  qr: QRCodeObject,
  moduleCount: number,
  overlayData: OverlayData,
  config: QRGeneratorConfig,
  _createCanvasFn: CreateCanvasFn,
): Promise<boolean[][]> {
  const seed = config.blueNoiseSeed ?? 42;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const strength = (config.ditherStrength ?? 50) / 100;
  const intensity = curveIntensity(config.overlayIntensity ?? 100);

  // Generate blue noise tile using canonical source from dither-algorithms
  const blueNoiseTile = generateBlueNoiseTile(tileSize, seed);

  // Initialize result matrix
  const result: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const brightness = getOverlayBrightness(overlayData, row, col);
      const originalValue = qr.isDark(row, col);

      // Sample blue noise using canonical sampleBlueNoise from dither-algorithms
      const noiseValue = sampleBlueNoise(col, row, blueNoiseTile, tileSize);

      // Calculate threshold with blue noise
      const threshold = 0.5 + (noiseValue - 0.5) * strength;
      const targetValue = originalValue ? 1 - brightness * intensity : brightness * intensity;

      result[row][col] = targetValue > threshold;
    }
  }

  return result;
}

// generateBlueNoiseTile removed - using canonical source from dither-algorithms
