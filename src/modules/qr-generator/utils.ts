/**
 * QR Generator Utilities Module
 * Helper functions for hashing, random generation, and contrast calculation
 */

import { createLogger } from '../../lib/logger';
import { canvasHashCache } from './cache';

const log = createLogger('GENERATE');
const HASH_CANVAS_SIZE = 32;
let sharedHashCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
let sharedHashCanvasInUse = false;

async function createHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = HASH_CANVAS_SIZE;
    canvas.height = HASH_CANVAS_SIZE;
    return canvas;
  }
  return await createCanvasFn(HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
}

async function acquireHashCanvas(
  createCanvasFn: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<{ canvas: HTMLCanvasElement | OffscreenCanvas; release: () => void }> {
  if (!sharedHashCanvas) {
    sharedHashCanvas = await createHashCanvas(createCanvasFn);
  }

  if (!sharedHashCanvasInUse) {
    sharedHashCanvasInUse = true;
    return {
      canvas: sharedHashCanvas,
      release: () => {
        sharedHashCanvasInUse = false;
      },
    };
  }

  const fallbackCanvas = await createHashCanvas(createCanvasFn);
  return { canvas: fallbackCanvas, release: () => {} };
}

/**
 * Validate and normalize a color string.
 * Returns the color if valid, otherwise returns the fallback.
 * This prevents issues where invalid color strings (empty, malformed) cause
 * canvas fillStyle to default to black.
 */
export function validateColor(color: unknown, fallback: string): string {
  if (typeof color !== 'string' || !color) {
    return fallback;
  }
  // Must be at least '#000' (4 chars) or 'rgb(' format
  const trimmed = color.trim();
  if (trimmed.length < 4) {
    return fallback;
  }
  // Check for valid hex color (#RGB, #RRGGBB, #RRGGBBAA)
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) {
      return fallback;
    }
    return trimmed;
  }
  // Check for rgb/rgba format
  if (trimmed.startsWith('rgb')) {
    return trimmed;
  }
  // Check for hsl/hsla format
  if (trimmed.startsWith('hsl')) {
    return trimmed;
  }
  // Check for named colors (basic validation - just ensure it's alphanumeric)
  if (/^[a-zA-Z]+$/.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * Re-exported from core for backward compatibility
 */
export { getContrastRatio } from '../core';

/**
 * Create a simple seeded PRNG (mulberry32)
 * Re-exported from core for backward compatibility
 */
export { createRNG as createSeededRandom } from '../core';

/**
 * Simple string hash function (djb2)
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.codePointAt(i)!;
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

  const { canvas: hashCanvas, release } = await acquireHashCanvas(createCanvasFn);
  try {
    // Downscale to a tiny 32x32 canvas for fast hashing
    if (hashCanvas.width !== HASH_CANVAS_SIZE || hashCanvas.height !== HASH_CANVAS_SIZE) {
      hashCanvas.width = HASH_CANVAS_SIZE;
      hashCanvas.height = HASH_CANVAS_SIZE;
    }
    const hashCtx =
      (hashCanvas.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings) as
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D
        | null) ??
      (hashCanvas.getContext('2d') as
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D
        | null);
    if (!hashCtx) {
      return `${canvas.width}x${canvas.height}`;
    }

    // Draw downscaled version
    // Cast to CanvasImageSource for compatibility with both HTMLCanvasElement and OffscreenCanvas
    hashCtx.clearRect(0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
    hashCtx.drawImage(canvas as CanvasImageSource, 0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);

    // Get pixel data from the small canvas
    const imageData = hashCtx.getImageData(0, 0, HASH_CANVAS_SIZE, HASH_CANVAS_SIZE);
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
    log.warn('Canvas hashing failed', { error });
    return `${canvas.width}x${canvas.height}`;
  } finally {
    release();
  }
}
