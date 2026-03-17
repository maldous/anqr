import type { QRGeneratorConfig } from "./types";
import { computeBWFirstShade } from "./compute-bw-first-shade";
import { shouldLockModule } from "./should-lock-module";

/**
 * Generate a QR-first matrix for high-contrast B&W images.
 * This mode GUARANTEES QR scannability by:
 * 1. Always setting dark modules to dark pixels, light modules to light pixels
 * 2. Using overlay brightness + blue noise to add dithering texture WITHIN safe ranges
 *
 * Brightness ranges (ensuring clear QR contrast):
 * - Dark modules: 0-80 grayscale - clearly dark for scanning with room for texture
 * - Light modules: 175-255 grayscale - clearly light for scanning with room for texture
 */
export function computeFinalShade(
  overlayBrightness: number,
  textureAmount: number,
  noiseVariation: number,
  qrIsDark: boolean,
  moduleRow: number,
  moduleCol: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig,
): number {
  const shade = computeBWFirstShade(overlayBrightness, textureAmount, noiseVariation, qrIsDark);
  if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
    return qrIsDark ? 0 : 255;
  }
  return shade;
}
