/**
 * QR Generator Cache Module
 * LRU-style caching for expensive QR generation computations
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('GENERATE');

/**
 * LRU-style cache with max size limit
 * Used for memoizing expensive computations
 */
export class MemoCache<T> {
  private cache: Map<string, T>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key: string, value: T): void {
    // Delete if exists to update order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

export interface QRMatrixCacheEntry {
  qr: QRCodeObject;
  moduleCount: number;
}

export interface QRCodeObject {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
}

// Global caches for expensive operations
export const alignmentCache = new MemoCache<Array<{ row: number; col: number }>>(50);
export const overlayDataCache = new MemoCache<OverlayDataMatrix>(20);
export const qrMatrixCache = new MemoCache<QRMatrixCacheEntry>(30);

export interface OverlayDataMatrix {
  [row: number]: {
    [col: number]: number;
  };
  colors?: {
    [row: number]: {
      [col: number]: { r: number; g: number; b: number };
    };
  };
}

// WeakMap for canvas hash caching (avoids re-hashing same canvas)
export const canvasHashCache = new WeakMap<HTMLCanvasElement, string>();

/**
 * Clear all QR generator caches
 * Useful for testing or memory management
 */
export function clearQRCaches(): void {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
