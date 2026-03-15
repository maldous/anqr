import { registerCacheCleanup } from '../../../modules/qr-generator/cache';
import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import type { RGBWithMeta } from '../../../modules/qr-generator/types';
import { baseMatrixCacheState } from './base-matrix-cache-state';
import { buildBaseMatrix } from './build-base-matrix';
import { clearBaseMatrixCache } from './clear-base-matrix-cache';

export { clearBaseMatrixCache } from './clear-base-matrix-cache';
export { getScaleFactor } from './resolve-render-scale';
export { curveIntensity } from './curve-overlay-intensity';
export { getEffectiveIntensity } from './get-effective-overlay-intensity';

registerCacheCleanup(clearBaseMatrixCache);

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
    baseMatrixCacheState.result !== null &&
    qr === baseMatrixCacheState.qr &&
    scaledSize === baseMatrixCacheState.scaledSize &&
    scale === baseMatrixCacheState.scale
  ) {
    return baseMatrixCacheState.result;
  }
  const result = buildBaseMatrix(qr, scaledSize, scale);
  baseMatrixCacheState.qr = qr;
  baseMatrixCacheState.scaledSize = scaledSize;
  baseMatrixCacheState.scale = scale;
  baseMatrixCacheState.result = result;
  return result;
}
