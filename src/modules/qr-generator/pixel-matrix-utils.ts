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
  const minScale = config.renderScaleMinimum ?? 12;
  const renderScale = Math.max(
    minScale,
    Math.min(24, Math.round(config.renderScalePerModule ?? 18))
  );
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
      return config.forceScaledOverlay ? renderScale : 1;
  }
}

/**
 * Default per-ECC intensity limits (0-100).
 *
 * Keep these neutral by default so overlay intensity is only capped when an
 * explicit policy is provided (for example safety-mode caps from the store or
 * API query params).
 */
const DEFAULT_ECC_LIMITS: Record<string, number> = {
  L: 100,
  M: 100,
  Q: 100,
  H: 100,
};

/**
 * Get effective intensity based on ECC level limits.
 * Uses config.maxOverlayIntensityByEcc when provided (from store),
 * falling back to neutral built-in defaults (no implicit cap).
 */
export function getEffectiveIntensity(config: QRGeneratorConfig): {
  effectiveIntensity: number;
  effectiveConfig: QRGeneratorConfig;
} {
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Use config-provided ECC limits (0-100 scale) or a neutral fallback.
  const eccLimits = config.maxOverlayIntensityByEcc ?? DEFAULT_ECC_LIMITS;
  const maxIntensityPct = eccLimits[config.errorCorrection] ?? 100;
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
