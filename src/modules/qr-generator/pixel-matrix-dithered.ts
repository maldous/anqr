/**
 * QR Generator Dithered Pixel Matrix
 * Dithered and blue-noise pixel matrix generation
 */

import type { QRGeneratorConfig, PixelDecisionMatrix, RGBWithMeta, CreateCanvasFn } from './types';
import type { CanvasFactory } from './canvas-factory';
import { generateBlueNoiseTile, sampleBlueNoise } from '../dither-algorithms';

/**
 * Generate dithered pixel matrix
 */
export async function generateDitheredMatrix(
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  scale: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  // Implementation for dithered mode
  const moduleCount = Math.floor(overlayCanvas.width / scale) || 21;
  const scaledSize = moduleCount * scale;

  // Scale overlay
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) {
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  // Apply error diffusion dithering
  const errors: number[][] = [];
  for (let y = 0; y < scaledSize; y++) {
    errors[y] = new Array(scaledSize).fill(0);
  }

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const adjusted = brightness + (errors[y][x] || 0);

      const isDark = adjusted < 0.5;
      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? { r, g, b } : null;

      // Distribute error (Floyd-Steinberg)
      const error = adjusted - (isDark ? 0 : 1);
      if (x + 1 < scaledSize) errors[y][x + 1] += error * 7 / 16;
      if (y + 1 < scaledSize) {
        if (x > 0) errors[y + 1][x - 1] += error * 3 / 16;
        errors[y + 1][x] += error * 5 / 16;
        if (x + 1 < scaledSize) errors[y + 1][x + 1] += error * 1 / 16;
      }
    }
  }

  return {
    matrix,
    colors,
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}

/**
 * Generate blue noise pixel matrix
 */
export async function generateBlueNoiseMatrix(
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  scale: number,
  effectiveIntensity: number,
  canvasFactory: CanvasFactory,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const moduleCount = Math.floor(overlayCanvas.width / scale) || 21;
  const scaledSize = moduleCount * scale;

  // Scale overlay
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) {
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  // Generate blue noise pattern using canonical source from dither-algorithms
  const seed = config.blueNoiseSeed ?? 42;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const blueNoiseTile = generateBlueNoiseTile(tileSize, seed);

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Sample blue noise using canonical sampleBlueNoise from dither-algorithms
      const threshold = sampleBlueNoise(x, y, blueNoiseTile, tileSize);

      const isDark = brightness < threshold;
      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? { r, g, b } : null;
    }
  }

  return {
    matrix,
    colors,
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}

function createEmptyMatrix(
  size: number,
  scale: number,
  effectiveIntensity: number
): PixelDecisionMatrix {
  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  for (let y = 0; y < size; y++) {
    matrix[y] = new Array(size).fill(false);
    colors[y] = new Array(size).fill(null);
  }

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}

// generateBlueNoiseTile removed - using canonical source from dither-algorithms
