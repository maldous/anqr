import { alignmentCache } from './alignment-cache';
import { overlayDataCache } from './overlay-data-cache';
import { qrMatrixCache } from './qr-matrix-cache';
import { _registeredCleanups } from './cache._internal';
import { canvasHashCache } from './canvas-hash-cache';

export function clearQRCaches(): void {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  for (const fn of _registeredCleanups) fn();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
