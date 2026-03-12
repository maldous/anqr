import { canvasHashCache } from './cache';
import { acquireHashCanvas, HASH_CANVAS_SIZE, log } from './utils._internal';

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
