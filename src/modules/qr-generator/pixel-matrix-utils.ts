/**
 * QR Generator Pixel Matrix Utilities
 * Helper functions for pixel matrix generation
 */

import { createLogger } from '../../lib/logger';
import type { QRCodeObject } from './cache';
import type { QRGeneratorConfig, RGBWithMeta } from './types';

const _log = createLogger('GENERATE');

/**
 * Get scale factor based on overlay mode
 */
export function getScaleFactor(overlayMode: string | undefined, config: QRGeneratorConfig): number {
  const renderScale = Math.max(12, Math.min(24, Math.round(config.renderScalePerModule ?? 18)));
  switch (overlayMode) {
    case 'dithered':
      return renderScale;
    case 'blue-noise':
    case 'blue_noise':
      return renderScale;
    case 'subpixel':
    case 'subpixel-size':
      return config.subpixelGrid ?? 3;
    default:
      return 1;
  }
}

/** Default ECC-based intensity limits (0-100 scale, matching store defaults) */
const DEFAULT_ECC_LIMITS: Record<string, number> = {
  L: 30,
  M: 50,
  Q: 70,
  H: 85,
};

/**
 * Get effective intensity based on ECC level limits.
 * Uses config.maxOverlayIntensityByEcc when provided (from store),
 * falling back to built-in defaults that match the store's initial values.
 */
export function getEffectiveIntensity(config: QRGeneratorConfig): {
  effectiveIntensity: number;
  effectiveConfig: QRGeneratorConfig;
} {
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Use config-provided ECC limits (0-100 scale) or fall back to defaults
  const eccLimits = config.maxOverlayIntensityByEcc ?? DEFAULT_ECC_LIMITS;
  const maxIntensityPct = eccLimits[config.errorCorrection] ?? 50;
  const maxIntensity = maxIntensityPct / 100;
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
