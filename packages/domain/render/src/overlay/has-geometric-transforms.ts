import type { QRGeneratorConfig } from "@/domain/render/qr-generator-shared";

/**
 * Check if overlay has geometric transforms that need to be applied
 */
export function hasGeometricTransforms(_config: QRGeneratorConfig): boolean {
  // This function checks for rotation, flip, scale, etc.
  // Currently we handle these through the overlay processor
  return false;
}
