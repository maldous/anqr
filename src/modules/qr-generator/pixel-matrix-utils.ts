/**
 * QR Generator Pixel Matrix Utilities
 * Helper functions for pixel matrix generation
 */

import type { QRCodeObject } from './cache';
import type { QRGeneratorConfig, RGBWithMeta } from './types';

/**
 * Get scale factor based on overlay mode
 */
export function getScaleFactor(overlayMode: string | undefined, config: QRGeneratorConfig): number {
  switch (overlayMode) {
    case 'dithered':
      return 4;
    case 'blue-noise':
      return 4;
    case 'subpixel':
    case 'subpixel-size':
      return config.subpixelGrid ?? 3;
    default:
      return 1;
  }
}

/**
 * Get effective intensity based on ECC level limits
 */
export function getEffectiveIntensity(config: QRGeneratorConfig): {
  effectiveIntensity: number;
  effectiveConfig: QRGeneratorConfig;
} {
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Apply ECC-based intensity limits
  const eccLimits: Record<string, number> = {
    L: 0.3,
    M: 0.5,
    Q: 0.7,
    H: 0.85,
  };

  const maxIntensity = eccLimits[config.errorCorrection] ?? 0.5;
  const effectiveIntensity = Math.min(intensity, maxIntensity);

  return {
    effectiveIntensity,
    effectiveConfig: { ...config, overlayIntensity: effectiveIntensity * 100 },
  };
}

/**
 * Generate base QR matrix at specified scale
 */
export function generateBaseMatrix(
  qr: QRCodeObject,
  scaledSize: number,
  scale: number
): { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } {
  const _moduleCount = scaledSize / scale;
  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);

      matrix[y][x] = qr.isDark(moduleRow, moduleCol);
      colors[y][x] = null;
    }
  }

  return { matrix, colors };
}
