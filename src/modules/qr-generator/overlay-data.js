/**
 * QR Generator Overlay Data Module
 * Handles extracting brightness and color data from overlay images
 */

import { overlayDataCache } from './cache.js';
import { preprocessImageData } from './filters.js';
import { hashCanvasContent } from './utils.js';

/**
 * Get overlay data - async version using canvas factory
 * OPTIMIZED: Preprocessing is now done at moduleCount resolution (not full res)
 * This is 10-50x faster than preprocessing at full resolution.
 */
export async function getOverlayData(
  overlayCanvas,
  moduleCount,
  colorMode,
  invertImage,
  frameIndex,
  config,
  createCanvasFn
) {
  // Create cache key based on canvas identity, content hash, and parameters
  // Include frameIndex to ensure different animation frames aren't cached together
  // Use content hash to disambiguate different images with same dimensions
  const contentHash = await hashCanvasContent(overlayCanvas, createCanvasFn);
  const canvasKey = `${overlayCanvas.width}x${overlayCanvas.height}:${contentHash}`;
  const preprocessKey = `${config.overlayBrightness || 0}:${config.overlayContrast || 0}:${config.overlayGamma || 1}:${config.overlaySaturation || 0}:${config.overlayHueRotate || 0}:${invertImage}:${config.overlayBlur || 0}:${config.overlaySharpen || 0}:${config.overlayPosterize || 0}:${config.overlayThreshold ?? 128}:${config.overlayEdgeDetect || 'off'}`;
  const cacheKey = `${canvasKey}:${moduleCount}:${colorMode}:${preprocessKey}:${frameIndex}`;

  // Check if we have this exact configuration cached
  const cached = overlayDataCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const tempCanvas = await createCanvasFn(moduleCount, moduleCount);
  const ctx = tempCanvas.getContext('2d');

  // STEP 1: Downscale to moduleCount FIRST (this is the key optimization)
  ctx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);

  // STEP 2: Apply preprocessing on the SMALL image (O(moduleCount^2) instead of O(overlay_width*height))
  const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);
  preprocessImageData(imageData, config, invertImage);
  const data = imageData.data;

  // STEP 3: Extract brightness and color maps
  const brightness = [];
  const colors = [];

  for (let row = 0; row < moduleCount; row++) {
    brightness[row] = [];
    colors[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      const i = (row * moduleCount + col) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      brightness[row][col] = gray / 255;

      if (colorMode === 'bw') {
        const bw = gray > 127 ? 255 : 0;
        colors[row][col] = `rgb(${bw},${bw},${bw})`;
      } else if (colorMode === 'grayscale') {
        colors[row][col] = `rgb(${gray},${gray},${gray})`;
      } else {
        colors[row][col] = `rgb(${r},${g},${b})`;
      }
    }
  }

  brightness.colors = colors;

  // Cache the result
  overlayDataCache.set(cacheKey, brightness);

  return brightness;
}

/**
 * Load image data from canvas as RGB values (0-1 range)
 * Now supports preprocessing via config parameter
 */
export async function loadImageDataRGB(canvas, size, config, createCanvasFn) {
  const tempCanvas = await createCanvasFn(size, size);
  const ctx = tempCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);

  // Apply preprocessing if config is provided
  preprocessImageData(imgData, config, config.invertImage);

  const output = [];
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row.push({
        r: imgData.data[i] / 255,
        g: imgData.data[i + 1] / 255,
        b: imgData.data[i + 2] / 255,
      });
    }
    output.push(row);
  }
  return output;
}
