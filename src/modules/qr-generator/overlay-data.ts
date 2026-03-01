/**
 * QR Generator Overlay Data
 * Overlay data extraction and processing
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
import { overlayDataCache } from './cache';
import { packOverlayColor } from './overlay-data-packed';
import type { CreateCanvasFn, OverlayData, QRGeneratorConfig } from './types';
import { hashCanvasContent } from './utils';

const _log = createLogger('GENERATE');

/**
 * Get overlay data (brightness and colors) from canvas
 */
export async function getOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  moduleCount: number,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<OverlayData> {
  const emptyData: OverlayData = { size: 0, brightness: new Float32Array(0) } as OverlayData;
  if (!overlayCanvas) {
    return emptyData;
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
  const ctx =
    (scaledCanvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null) ??
    (scaledCanvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null);
  if (!ctx) {
    return emptyData;
  }

  const readCtx = ctx as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  readCtx.imageSmoothingEnabled = true;
  readCtx.imageSmoothingQuality = 'high';
  // Cast to CanvasImageSource for drawImage compatibility with both HTMLCanvasElement and OffscreenCanvas
  readCtx.drawImage(overlayCanvas as CanvasImageSource, 0, 0, moduleCount, moduleCount);

  const imageData = readCtx.getImageData(0, 0, moduleCount, moduleCount);
  const data = imageData.data;

  const pixelCount = moduleCount * moduleCount;
  const brightness = new Float32Array(pixelCount);
  const includeColors = config.colorMode !== 'bw';
  const colorsPacked = includeColors ? new Uint32Array(pixelCount) : undefined;
  for (let i = 0, src = 0; i < pixelCount; i++, src += 4) {
    const r = data[src];
    const g = data[src + 1];
    const b = data[src + 2];
    brightness[i] = rgbToGray(r, g, b) / 255;
    if (colorsPacked) {
      colorsPacked[i] = packOverlayColor(r, g, b);
    }
  }

  const result: OverlayData = {
    size: moduleCount,
    brightness,
    colorsPacked,
  } as OverlayData;

  // Cache result
  overlayDataCache.set(cacheKey, result);

  return result;
}

/**
 * Load image data as RGB array
 */
export function loadImageDataRGB(imageData: ImageData): { r: number; g: number; b: number }[][] {
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
