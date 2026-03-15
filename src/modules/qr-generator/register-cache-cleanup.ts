import { _registeredCleanups } from './registered-cleanups';

/**
 * Register an additional cache-clearing callback.
 * Called by modules that own private caches (render-loop, pixel-matrix-utils)
 * to participate in clearQRCaches() without creating circular imports.
 */
export function registerCacheCleanup(fn: () => void): void {
  _registeredCleanups.push(fn);
}
