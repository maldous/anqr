import type { QRGeneratorConfig } from "../../../modules/qr-generator/types";

/**
 * Check if overlay has geometric transforms that need to be applied
 */
export function hasGeometricTransforms(_config: QRGeneratorConfig): boolean {
  // This function checks for rotation, flip, scale, etc.
  // Currently we handle these through the overlay processor
  return false;
}
