/**
 * QR Generator Pixel Matrix Utilities
 * Helper functions for pixel matrix generation
 */

import { createLogger } from '../../../infra/logging/logger';
import { registerCacheCleanup } from '../../../modules/qr-generator/cache';
import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import type { QRGeneratorConfig, RGBWithMeta } from '../../../modules/qr-generator/types';

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

function detectDeviceRenderScaleCap(): number {
  if (typeof navigator === 'undefined') return 24;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memoryGb = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined;
  const cores =
    typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 0;

  // Unified device-class cap (not platform-specific): lower density on constrained devices.
  if ((typeof memoryGb === 'number' && memoryGb <= 4) || (cores > 0 && cores <= 4)) {
    return 16;
  }
  if ((typeof memoryGb === 'number' && memoryGb <= 8) || (cores > 0 && cores <= 6)) {
    return 20;
  }
  return 24;
}

const DEVICE_RENDER_SCALE_CAP = detectDeviceRenderScaleCap();

/**
 * Get scale factor based on overlay mode
 */
export function getScaleFactor(overlayMode: string | undefined, config: QRGeneratorConfig): number {
  const isFastPreview = config.fastPreview === true;
  const configuredMinScale = config.renderScaleMinimum ?? 12;
  const configuredRenderScale = Math.round(config.renderScalePerModule ?? 18);

  // Adaptive preview quality: during interactive fast-preview, reduce scaled render density
  // significantly, then allow full-quality density once config settles.
  const requestedMinScale = isFastPreview ? Math.min(configuredMinScale, 8) : configuredMinScale;
  const requestedMaxScale = isFastPreview ? 12 : 24;
  const deviceMaxScale = isFastPreview
    ? Math.min(DEVICE_RENDER_SCALE_CAP, requestedMaxScale)
    : DEVICE_RENDER_SCALE_CAP;
  const maxScale = Math.max(1, Math.min(requestedMaxScale, deviceMaxScale));
  const minScale = Math.max(1, Math.min(requestedMinScale, maxScale));
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
 * Apply a power-curve to the overlay intensity slider (0-100) so that
 * the midpoint (50%) maps to a moderate effective intensity (~0.06).
 * This keeps the usable range of the slider in a scan-safe zone.
 */
export function curveIntensity(pct: number): number {
  const t = Math.max(0, Math.min(1, (pct ?? 100) / 100));
  return t * t * t * t;
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
  const rawPct = config.overlayIntensity ?? 100;

  // Use config-provided ECC limits (0-100 scale) or a neutral fallback.
  const eccLimits = config.maxOverlayIntensityByEcc ?? DEFAULT_ECC_LIMITS;
  const maxIntensityPct = eccLimits[config.errorCorrection] ?? 100;
  const cappedPct = Math.min(rawPct, maxIntensityPct);
  const effectiveIntensity = curveIntensity(cappedPct);

  return {
    effectiveIntensity,
    effectiveConfig: { ...config, overlayIntensity: cappedPct },
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
