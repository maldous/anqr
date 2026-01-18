/**
 * QR Generator Utilities Module
 * Helper functions for hashing, random generation, and contrast calculation
 */

import { canvasHashCache } from './cache';
import { getContrastRatio as getContrastRatioFromCore, createRNG } from '../core';

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
export function hashString(str: string): number {
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
export async function hashCanvasContent(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<string> {
  // Check WeakMap cache first (avoids re-hashing same canvas instance)
  // Only HTMLCanvasElement can be cached in WeakMap (OffscreenCanvas not supported)
  const cachedHash = canvas instanceof HTMLCanvasElement ? canvasHashCache.get(canvas) : undefined;
  if (cachedHash !== undefined) {
    return cachedHash;
  }

  try {
    // Downscale to a tiny 32x32 canvas for fast hashing
    const hashSize = 32;
    // Use DOM API directly for browser (faster, avoids async overhead)
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
    if (!hashCtx) {
      return `${canvas.width}x${canvas.height}`;
    }

    // Draw downscaled version
    // Cast to CanvasImageSource for compatibility with both HTMLCanvasElement and OffscreenCanvas
    hashCtx.drawImage(canvas as CanvasImageSource, 0, 0, hashSize, hashSize);

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
    // Only cache HTMLCanvasElement (OffscreenCanvas not supported in WeakMap)
    if (canvas instanceof HTMLCanvasElement) {
      canvasHashCache.set(canvas, hashStr);
    }

    return hashStr;
  } catch (error) {
    // Fallback to dimensions-only if getImageData fails
    console.warn('Canvas hashing failed:', error);
    return `${canvas.width}x${canvas.height}`;
  }
}
