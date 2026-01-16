/**
 * QR Generator Cache Module
 * LRU-style caching for expensive QR generation computations
 */

/**
 * LRU-style cache with max size limit
 * Used for memoizing expensive computations
 */
export class MemoCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    // Delete if exists to update order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// Global caches for expensive operations
export const alignmentCache = new MemoCache(50); // For getAlignmentPositions
export const overlayDataCache = new MemoCache(20); // For overlay data
export const qrMatrixCache = new MemoCache(30); // For QR matrix (content+ecc+version+encodingMode)

// WeakMap for canvas hash caching (avoids re-hashing same canvas)
export const canvasHashCache = new WeakMap();

/**
 * Clear all QR generator caches
 * Useful for testing or memory management
 */
export function clearQRCaches() {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
