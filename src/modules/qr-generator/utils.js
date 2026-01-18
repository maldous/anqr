/**
 * QR Generator Utilities Module
 * Helper functions for hashing, random generation, and contrast calculation
 */

import { canvasHashCache } from './cache.js';

// Import from canonical core module
import {
  getContrastRatio as getContrastRatioFromCore,
  createRNG,
} from '../core/index.ts';

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * Re-exported from core for backward compatibility
 */
export const getContrastRatio = getContrastRatioFromCore;

/**
 * Create a simple seeded PRNG (mulberry32)
 * Re-exported from core for backward compatibility
 */
export const createSeededRandom = createRNG;

/**
 * Simple string hash function (djb2)
 */
export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + (str.codePointAt(i) ?? 0);
    hash = hash >>> 0; // Keep as unsigned 32-bit
  }
  return hash;
}

/**
 * Hash canvas content for cache key disambiguation
 * Uses a downscaled 32x32 canvas for speed (avoids full-resolution getImageData)
 * Results are cached in a WeakMap to avoid re-hashing the same canvas
 */
export async function hashCanvasContent(canvas, createCanvasFn) {
  // Check WeakMap cache first (avoids re-hashing same canvas instance)
  const cachedHash = canvasHashCache.get(canvas);
  if (cachedHash !== undefined) {
    return cachedHash;
  }

  try {
    // Downscale to a tiny 32x32 canvas for fast hashing
    // This is 10-50x faster than hashing full resolution on large overlays
    const hashSize = 32;
    // Use DOM API directly for browser (faster, avoids async overhead)
    // Falls back to canvas factory for server-side
    const hashCanvas =
      typeof document !== 'undefined'
        ? (() => {
            const c = document.createElement('canvas');
            c.width = hashSize;
            c.height = hashSize;
            return c;
          })()
        : await createCanvasFn(hashSize, hashSize);
    const hashCtx = hashCanvas.getContext('2d');

    // Draw downscaled version
    hashCtx.drawImage(canvas, 0, 0, hashSize, hashSize);

    // Get pixel data from the small canvas
    const imageData = hashCtx.getImageData(0, 0, hashSize, hashSize);
    const data = imageData.data;

    // Hash all pixels in the small canvas (32x32 = 1024 pixels = 4096 bytes)
    let hash = 5381;
    for (let i = 0; i < data.length; i += 4) {
      // Combine RGB values into hash (skip alpha for consistency)
      hash = (hash << 5) + hash + data[i];
      hash = (hash << 5) + hash + data[i + 1];
      hash = (hash << 5) + hash + data[i + 2];
      hash = hash >>> 0;
    }

    const hashStr = hash.toString(16);

    // Cache the result in WeakMap (auto-cleanup when canvas is GC'd)
    canvasHashCache.set(canvas, hashStr);

    return hashStr;
  } catch (error_) {
    // Fallback to dimensions-only if getImageData fails
    console.warn('Canvas hashing failed:', error_);
    return `${canvas.width}x${canvas.height}`;
  }
}
