/**
 * QR Generator Cache Module
 * LRU-style caching for expensive QR generation computations
 */

import { createLogger } from '../../lib/logger';
import type { OverlayData } from './types';

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

export type OverlayDataMatrix = OverlayData;

// WeakMap for canvas hash caching (avoids re-hashing same canvas)
export const canvasHashCache = new WeakMap<HTMLCanvasElement, string>();

/**
 * Clear all QR generator caches
 * Useful for testing or memory management
 */
// Additional cache-clearing callbacks registered by other modules
// (avoids circular imports: render-loop → color → utils → cache → render-loop)
const _registeredCleanups: Array<() => void> = [];

/**
 * Register an additional cache-clearing callback.
 * Called by modules that own private caches (render-loop, pixel-matrix-utils)
 * to participate in clearQRCaches() without creating circular imports.
 */
export function registerCacheCleanup(fn: () => void): void {
  _registeredCleanups.push(fn);
}

export function clearQRCaches(): void {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  for (const fn of _registeredCleanups) fn();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
