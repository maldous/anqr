/**
 * QR Generator Overlay Data
 * Overlay data extraction and processing
 */

import type { QRGeneratorConfig, OverlayData, CreateCanvasFn } from './types';
import { overlayDataCache } from './cache';
import { hashCanvasContent } from './utils';

/**
 * Get overlay data (brightness and colors) from canvas
 */
export async function getOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<OverlayData> {
  if (!overlayCanvas) {
    return {} as OverlayData;
  }
  // Generate cache key
  const canvasHash = await hashCanvasContent(overlayCanvas, createCanvasFn);
  const cacheKey = `${canvasHash}:${moduleCount}:${config.overlayIntensity}:${config.colorMode}`;

  // Check cache
  const cached = overlayDataCache.get(cacheKey);
  if (cached) {
    return cached as OverlayData;
  }

  // Scale overlay to module count
  const scaledCanvas = await createCanvasFn(moduleCount, moduleCount);
  const ctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) {
    return {} as OverlayData;
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // Cast to CanvasImageSource for drawImage compatibility with both HTMLCanvasElement and OffscreenCanvas
  ctx.drawImage(overlayCanvas as CanvasImageSource, 0, 0, moduleCount, moduleCount);

  const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);
  const data = imageData.data;

  const result: OverlayData = {};
  const includeColors = config.colorMode !== 'bw';

  if (includeColors) {
    result.colors = {};
  }

  for (let row = 0; row < moduleCount; row++) {
    result[row] = {};
    if (includeColors) {
      if (!result.colors) result.colors = {};
      result.colors[row] = {};
    }

    for (let col = 0; col < moduleCount; col++) {
      const idx = (row * moduleCount + col) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Calculate brightness
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      result[row][col] = brightness;

      // Store color if needed
      if (includeColors && result.colors) {
        result.colors[row][col] = { r, g, b };
      }
    }
  }

  // Cache result
  overlayDataCache.set(cacheKey, result);

  return result;
}

/**
 * Load image data as RGB array
 */
export function loadImageDataRGB(
  imageData: ImageData
): { r: number; g: number; b: number }[][] {
  const { width, height, data } = imageData;
  const result: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      result[y][x] = {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
      };
    }
  }

  return result;
}
