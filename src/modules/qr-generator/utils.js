/**
 * QR Generator Utilities Module
 * Helper functions for hashing, random generation, and contrast calculation
 */

import { parseColor } from '../color-utils.ts';
import { canvasHashCache } from './cache.js';

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * @param {string} color1 - First color (hex or rgb)
 * @param {string} color2 - Second color (hex or rgb)
 * @returns {number} Contrast ratio (1 to 21)
 */
export function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const parsed = parseColor(color);
    const [r, g, b] = [parsed.r, parsed.g, parsed.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Create a simple seeded PRNG (mulberry32)
 * Returns a function that generates deterministic pseudo-random numbers [0, 1)
 */
export function createSeededRandom(seed) {
  let state = seed >>> 0; // Ensure unsigned 32-bit integer
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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
