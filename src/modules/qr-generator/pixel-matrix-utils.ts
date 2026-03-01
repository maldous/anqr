/**
 * QR Generator Pixel Matrix Utilities
 * Helper functions for pixel matrix generation
 */

import { createLogger } from '../../lib/logger';
import { registerCacheCleanup } from './cache';
import type { QRCodeObject } from './cache';
import type { QRGeneratorConfig, RGBWithMeta } from './types';

const _log = createLogger('GENERATE');

// Last-value cache for the base QR matrix at a given scale.
// During animation the QR content and scale stay constant across frames,
// so this avoids re-allocating and re-filling large 2D arrays every frame.
let _bmCachedQr: QRCodeObject | null = null;
let _bmCachedScaledSize = 0;
let _bmCachedScale = 0;
let _bmCachedResult: { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } | null = null;

export function clearBaseMatrixCache(): void {
  _bmCachedQr = null;
  _bmCachedScaledSize = 0;
  _bmCachedScale = 0;
  _bmCachedResult = null;
}

// Register with central cache clearer (avoids circular import from cache.ts)
registerCacheCleanup(clearBaseMatrixCache);

/**
 * Get scale factor based on overlay mode
 */
export function getScaleFactor(overlayMode: string | undefined, config: QRGeneratorConfig): number {
  const isFastPreview = config.fastPreview === true;
  const configuredMinScale = config.renderScaleMinimum ?? 12;
  const configuredRenderScale = Math.round(config.renderScalePerModule ?? 18);

  // Adaptive preview quality: during interactive fast-preview, reduce scaled render density
  // significantly, then allow full-quality density once config settles.
  const minScale = isFastPreview ? Math.min(configuredMinScale, 8) : configuredMinScale;
  const maxScale = isFastPreview ? 12 : 24;
  const targetScale = isFastPreview
    ? Math.round((configuredRenderScale + minScale) * 0.58)
    : configuredRenderScale;
  const renderScale = Math.max(minScale, Math.min(maxScale, targetScale));
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
 * Generate base QR matrix at specified scale.
 * Result is cached across calls with the same QR object and scale
 * (avoids re-allocating large 2D arrays on every animation frame).
 */
export function generateBaseMatrix(
  qr: QRCodeObject,
  scaledSize: number,
  scale: number
): { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } {
  if (
    _bmCachedResult !== null &&
    qr === _bmCachedQr &&
    scaledSize === _bmCachedScaledSize &&
    scale === _bmCachedScale
  ) {
    return _bmCachedResult;
  }

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

  const result = { matrix, colors };
  _bmCachedQr = qr;
  _bmCachedScaledSize = scaledSize;
  _bmCachedScale = scale;
  _bmCachedResult = result;
  return result;
}
