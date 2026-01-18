/**
 * QR Generator Dither Matrix
 * Matrix-based dithering for QR modules
 */

import { getDiffusionKernel } from './dithering-kernels';
import { distributeError } from './dithering-error';
import type { QRGeneratorConfig, OverlayData } from './types';
import type { QRCodeObject } from './cache';

/**
 * Apply dithering to create a modified QR matrix
 */
export function applyDitherToMatrix(
  qr: QRCodeObject,
  moduleCount: number,
  overlayData: OverlayData,
  config: QRGeneratorConfig
): boolean[][] {
  const kernel = getDiffusionKernel(config.ditherKind || 'floyd_steinberg');
  const strength = (config.ditherStrength ?? 50) / 100;
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Initialize result matrix with original QR values
  const result: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      result[row][col] = qr.isDark(row, col);
    }
  }

  // Initialize error matrix
  const errors: number[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    errors[row] = new Array(moduleCount).fill(0);
  }

  // Apply dithering with error diffusion
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const brightness = overlayData[row]?.[col] ?? 0.5;
      const originalValue = qr.isDark(row, col) ? 1 : 0;
      const error = errors[row][col] || 0;

      // Calculate desired value based on overlay brightness
      const targetValue = originalValue * (1 - intensity * strength) + brightness * intensity * strength;
      const adjustedValue = targetValue + error;

      // Quantize to black or white
      const newValue = adjustedValue > 0.5;
      result[row][col] = newValue;

      // Calculate and distribute error
      const quantError = adjustedValue - (newValue ? 1 : 0);
      distributeError(errors, col, row, quantError, kernel, moduleCount, moduleCount);
    }
  }

  return result;
}
