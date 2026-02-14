/**
 * QR Generator Subpixel Overlay
 * Subpixel rendering for high-quality overlay integration
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec/qr-patterns';
import type { QRCodeObject } from './cache';
import type { CreateCanvasFn, PixelDecisionMatrix, QRGeneratorConfig, RGBWithMeta } from './types';

const log = createLogger('GENERATE');

/**
 * Parse subpixelGridSize string to get scale factor
 * '2x2' -> 2, '3x3' -> 3, '4x4' -> 4
 */
function parseGridSize(gridSize: string | undefined): number {
  if (!gridSize) return 3; // default
  const match = gridSize.match(/^(\d+)x\d+$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 3; // default fallback
}

/**
 * Parse hex color to RGB
 */
function parseHexColor(hex: string | undefined): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  const match = hex.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (match) {
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16),
    };
  }
  return null;
}

function isFinderSeparator(row: number, col: number, moduleCount: number): boolean {
  return (
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8)
  );
}

/**
 * Check if a module should remain lock-protected based on preservation settings.
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
 * Generate subpixel matrix for overlay modes
 */
export async function getSubpixelOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  _config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<{ brightness: number[][]; colors: { r: number; g: number; b: number }[][] }> {
  const scaledSize = moduleCount * scale;

  // Scale overlay to subpixel size
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) {
    return { brightness: [], colors: [] };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);

  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const brightness: number[][] = [];
  const colors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    brightness[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      brightness[y][x] = rgbToGray(r, g, b) / 255;
      colors[y][x] = { r, g, b };
    }
  }

  return { brightness, colors };
}

/**
 * Generate subpixel matrix
 */
export async function generateSubpixelMatrix(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  useHalftoneCenter: boolean,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  // Parse subpixel options from config
  const gridScale = parseGridSize(config.subpixelGridSize) || scale;
  const actualScale = gridScale; // Use parsed grid size as scale
  const scaledSize = moduleCount * actualScale;
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Get subpixel overlay data with the actual scale
  const { brightness, colors } = await getSubpixelOverlayData(
    overlayCanvas,
    moduleCount,
    actualScale,
    config,
    createCanvasFn
  );

  const matrix: boolean[][] = [];
  const colorMatrix: (RGBWithMeta | null)[][] = [];

  // Use parsed grid size for center calculation
  const centerIdx = Math.floor(actualScale / 2);

  // Parse neutral color for use when no overlay data
  const neutralColor = parseHexColor(config.subpixelNeutralColor);

  // Get center rule: 'strict' means exact QR value, 'halftone_center' allows halftone sizing
  const centerRule = config.subpixelCenterRule || 'strict';
  const useHalftone = centerRule === 'halftone_center' || useHalftoneCenter;

  // Get finder override: 'solid' means draw finders as solid, 'stylized' allows subpixel effects
  const finderOverride = config.subpixelFinderOverride || 'solid';

  // Calculate version for structural pattern detection
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  log.debug('Subpixel matrix generation', {
    gridScale,
    actualScale,
    scaledSize,
    intensity,
    centerRule,
    finderOverride,
    hasNeutralColor: !!neutralColor,
  });

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colorMatrix[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      // Determine which module this subpixel belongs to
      const moduleRow = Math.floor(y / actualScale);
      const moduleCol = Math.floor(x / actualScale);
      const subX = x % actualScale;
      const subY = y % actualScale;

      // Check if this is the center subpixel
      const isCenter = subX === centerIdx && subY === centerIdx;

      const qrValue = qr.isDark(moduleRow, moduleCol);
      const overlayBrightness = brightness[y]?.[x] ?? 0.5;
      const overlayColor = colors[y]?.[x];

      const lockModule = shouldLockModule(moduleRow, moduleCol, moduleCount, version, config);
      const isFinderModule =
        isFinderPattern(moduleRow, moduleCol, moduleCount) ||
        isFinderSeparator(moduleRow, moduleCol, moduleCount);
      const forceSolidFinder = finderOverride === 'solid' && isFinderModule && lockModule;

      // Locked modules must preserve canonical QR values.
      // Finder override is a finder-only stylistic control on top of preserve flags.
      if (lockModule || forceSolidFinder) {
        matrix[y][x] = qrValue;
        colorMatrix[y][x] = null; // No overlay color for solid structural patterns
        continue;
      }

      if (isCenter) {
        // Center pixel preserves QR data
        matrix[y][x] = qrValue;

        if (useHalftone && qrValue) {
          // Use halftone sizing based on brightness
          colorMatrix[y][x] = overlayColor
            ? {
                ...overlayColor,
                halftone: true,
                sizeRatio: 0.5 + overlayBrightness * 0.5,
              }
            : neutralColor
              ? { ...neutralColor, halftone: true, sizeRatio: 0.5 + overlayBrightness * 0.5 }
              : null;
        } else {
          colorMatrix[y][x] = overlayColor
            ? { ...overlayColor }
            : neutralColor
              ? { ...neutralColor }
              : null;
        }
      } else {
        // Surrounding pixels show overlay
        const threshold = 0.5 - intensity * 0.3;
        matrix[y][x] = overlayBrightness < threshold;
        colorMatrix[y][x] = overlayColor
          ? { ...overlayColor }
          : neutralColor
            ? { ...neutralColor }
            : null;
      }
    }
  }

  return {
    matrix,
    colors: colorMatrix,
    scale: actualScale,
    overlayData: null,
    effectiveIntensity: intensity * 100, // Return as percentage (0-100) for consistency
  };
}
