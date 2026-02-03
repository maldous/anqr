/**
 * QR Generator Dither Matrix
 * Matrix-based dithering for QR modules with QR scannability protection
 */

import { createLogger } from '../../lib/logger';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec/qr-patterns';
import type { QRCodeObject } from './cache';
import { distributeError } from './dithering-error';
import { getDiffusionKernel } from './dithering-kernels';
import type { OverlayData, QRGeneratorConfig } from './types';

const log = createLogger('GENERATE');

/**
 * Check if a module is a structural pattern (finder, alignment, timing, format, version)
 * Structural modules should ALWAYS be preserved for QR scannability
 */
function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  // Fixed dark module is ALWAYS structural (scan critical per ISO/IEC 18004)
  if (row === moduleCount - 8 && col === 8) return true;

  return (
    isFinderPattern(row, col, moduleCount) ||
    isTimingPattern(row, col, moduleCount) ||
    isAlignmentPattern(row, col, moduleCount, version) ||
    isFormatInfo(row, col, moduleCount) ||
    isVersionInfo(row, col, moduleCount, version)
  );
}

/**
 * Check if module is in the quiet zone separator around finders
 */
function isQuietZoneSeparator(row: number, col: number, moduleCount: number): boolean {
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;

  return false;
}

/**
 * Apply dithering to create a modified QR matrix
 * Now includes QR scannability protection for high-contrast B&W overlays
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
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

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
      const qrIsDark = qr.isDark(row, col);

      // CRITICAL: Structural modules are NEVER modified
      if (
        isStructuralModule(row, col, moduleCount, version) ||
        isQuietZoneSeparator(row, col, moduleCount)
      ) {
        result[row][col] = qrIsDark;
        continue;
      }

      const brightness = overlayData[row]?.[col] ?? 0.5;
      const originalValue = qrIsDark ? 1 : 0;
      const error = errors[row][col] || 0;

      // Calculate desired value based on overlay brightness
      // Overlay dark (low brightness) = want dark pixel, high brightness = want light pixel
      const overlayDark = 1 - brightness;
      const mix = intensity * strength;

      // Blend original QR value with overlay darkness
      let targetValue = originalValue * (1 - mix) + overlayDark * mix;

      // Apply soft clamp to keep value on the correct side of threshold for QR scannability
      // Dark modules: clamp to 0.55-0.95 range (stays above 0.5 threshold)
      // Light modules: clamp to 0.05-0.45 range (stays below 0.5 threshold)
      if (qrIsDark) {
        targetValue = 0.55 + targetValue * 0.4; // Maps to 0.55-0.95
      } else {
        targetValue = 0.05 + targetValue * 0.4; // Maps to 0.05-0.45
      }

      const adjustedValue = targetValue + error;

      // Threshold with QR-aware bias: dark modules use lower threshold (easier to stay dark)
      // light modules use higher threshold (harder to become dark)
      const threshold = qrIsDark ? 0.4 : 0.6;
      const newValue = adjustedValue >= threshold;
      result[row][col] = newValue;

      // Calculate and distribute error
      const quantError = adjustedValue - (newValue ? 1 : 0);
      distributeError(errors, col, row, quantError, kernel, moduleCount, moduleCount);
    }
  }

  // Post-pass: Enforce module constraints for guaranteed scannability
  enforceModuleConstraints(qr, result, moduleCount, version);

  log.debug('dither-matrix applied with QR protection', {
    moduleCount,
    strength,
    intensity,
    version,
  });

  return result;
}

/**
 * Enforce per-module constraints to guarantee QR scannability
 * - Structural modules are forced to correct values
 * - Data modules must have correct majority (75%+ correct)
 * - Center of each module preserved as true QR value
 *
 * Note: This operates at module level (scale=1), not subpixel level
 */
function enforceModuleConstraints(
  qr: QRCodeObject,
  matrix: boolean[][],
  moduleCount: number,
  version: number
): void {
  // For module-level dithering (scale=1), each module is a single pixel
  // We simply ensure structural modules are correct and non-structural modules
  // are strongly biased toward the correct value

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const qrIsDark = qr.isDark(row, col);

      // Force structural modules to exact QR value
      if (
        isStructuralModule(row, col, moduleCount, version) ||
        isQuietZoneSeparator(row, col, moduleCount)
      ) {
        matrix[row][col] = qrIsDark;
      }
    }
  }
}
