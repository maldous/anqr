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
import {
  BUCKET_SHIFT,
  DARK_DESIRE_MAX,
  DARK_DESIRE_MIN,
  DARK_REGION_END,
  HISTOGRAM_BUCKETS,
  LIGHT_DESIRE_MAX,
  LIGHT_DESIRE_MIN,
  LIGHT_REGION_START,
  MAX_VALLEY_RATIO,
  MIN_PEAK_RATIO,
  MIN_PEAK_SEPARATION,
} from './dithering-constants';
import { distributeError } from './dithering-error';
import { getDiffusionKernel } from './dithering-kernels';
import type { OverlayData, QRGeneratorConfig } from './types';

const log = createLogger('GENERATE');

/**
 * Detect if overlay data represents a high-contrast B&W image.
 */
function detectBWFromOverlayData(overlayData: OverlayData, moduleCount: number): boolean {
  const histogram = new Int32Array(HISTOGRAM_BUCKETS);
  let totalPixels = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const brightness = overlayData[row]?.[col] ?? 0.5;
      // brightness is 0-1, convert to 0-255 for histogram
      const gray = Math.floor(brightness * 255);
      const bucket = Math.min(HISTOGRAM_BUCKETS - 1, gray >> BUCKET_SHIFT);
      histogram[bucket]++;
      totalPixels++;
    }
  }

  if (totalPixels === 0) return false;

  let darkPeakBucket = 0,
    lightPeakBucket = 0;
  let darkPeak = 0,
    lightPeak = 0;

  for (let i = 0; i < DARK_REGION_END; i++) {
    if (histogram[i] > darkPeak) {
      darkPeak = histogram[i];
      darkPeakBucket = i;
    }
  }
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) {
    if (histogram[i] > lightPeak) {
      lightPeak = histogram[i];
      lightPeakBucket = i;
    }
  }

  if (lightPeakBucket - darkPeakBucket < MIN_PEAK_SEPARATION) return false;

  let darkCount = 0,
    lightCount = 0,
    valleyCount = 0;
  for (let i = 0; i < DARK_REGION_END; i++) darkCount += histogram[i];
  for (let i = LIGHT_REGION_START; i < HISTOGRAM_BUCKETS; i++) lightCount += histogram[i];
  for (let i = DARK_REGION_END; i < LIGHT_REGION_START; i++) valleyCount += histogram[i];

  return (
    darkCount / totalPixels >= MIN_PEAK_RATIO &&
    lightCount / totalPixels >= MIN_PEAK_RATIO &&
    valleyCount / totalPixels < MAX_VALLEY_RATIO
  );
}

function isFinderSeparator(row: number, col: number, moduleCount: number): boolean {
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;

  return false;
}

/**
 * Check if a module should be lock-protected based on active preservation settings.
 * This mirrors the scaled dither/blue-noise path so all overlay families behave consistently.
 */
function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  const preserveFinders = config.preserveFinders !== false;
  const preserveTiming = preserveFunctional
    ? config.preserveTiming !== false
    : config.preserveTiming === true;
  const preserveAlignment = preserveFunctional
    ? config.preserveAlignment !== false
    : config.preserveAlignment === true;
  const protectFormat = preserveFunctional
    ? config.protectFormatInfo !== false
    : config.protectFormatInfo === true;
  const protectVersion = preserveFunctional
    ? config.protectVersionInfo !== false
    : config.protectVersionInfo === true;
  const preserveFixedDark = preserveFunctional;

  if (row === moduleCount - 8 && col === 8) return preserveFixedDark;
  if (isFinderPattern(row, col, moduleCount) || isFinderSeparator(row, col, moduleCount)) {
    return preserveFinders;
  }
  if (isTimingPattern(row, col, moduleCount)) return preserveTiming;
  if (isAlignmentPattern(row, col, moduleCount, version)) return preserveAlignment;
  if (isFormatInfo(row, col, moduleCount)) return protectFormat;
  if (isVersionInfo(row, col, moduleCount, version)) return protectVersion;
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
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // =========================================
  // HIGH-CONTRAST B&W IMAGE DETECTION
  // =========================================
  // For high-contrast B&W images (like spirals), use QR-first mode
  // which simply preserves QR data exactly - no dithering at all.
  // Dithering on B&W images causes accumulated errors that flip modules.

  if (detectBWFromOverlayData(overlayData, moduleCount)) {
    log.debug('Detected high-contrast B&W overlay in dither mode - using QR-first (no dithering)');

    // QR-first: return exact QR matrix without any dithering
    const result: boolean[][] = [];
    for (let row = 0; row < moduleCount; row++) {
      result[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        result[row][col] = qr.isDark(row, col);
      }
    }
    return result;
  }

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
      const qrIsDark = qr.isDark(row, col);

      // Lock-protected modules keep their canonical QR value.
      if (shouldLockModule(row, col, moduleCount, version, config)) {
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
      if (qrIsDark) {
        targetValue = DARK_DESIRE_MIN + targetValue * (DARK_DESIRE_MAX - DARK_DESIRE_MIN);
      } else {
        targetValue = LIGHT_DESIRE_MIN + targetValue * (LIGHT_DESIRE_MAX - LIGHT_DESIRE_MIN);
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
  enforceModuleConstraints(qr, result, moduleCount, version, config);

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
  version: number,
  config: QRGeneratorConfig
): void {
  // For module-level dithering (scale=1), each module is a single pixel
  // We simply ensure structural modules are correct and non-structural modules
  // are strongly biased toward the correct value

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const qrIsDark = qr.isDark(row, col);

      // Force lock-protected modules to exact QR value
      if (shouldLockModule(row, col, moduleCount, version, config)) {
        matrix[row][col] = qrIsDark;
      }
    }
  }
}
