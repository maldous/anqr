/**
 * QR Generator Matrix Dithering Module
 * Applies dithering to QR matrix with overlay
 */

import { isData, isLocked } from '../qr-core.ts';
import { createSeededRandom } from './utils.js';
import { getDiffusionKernel } from './dithering-kernels.js';
import { distributeError } from './dithering-error.js';

/**
 * Apply dithering to QR matrix - async version using canvas factory
 * Supports multiple diffusion kernels, serpentine scanning, and dither strength.
 */
export async function applyDitherToMatrix(
  baseMatrix,
  scaledSize,
  scale,
  overlayCanvas,
  overlayIntensity,
  colorMode,
  serpentine,
  config,
  createCanvasFn,
  loadImageDataRGBFn
) {
  // Initialize output
  const matrix = baseMatrix.map((row) => [...row]);
  const colors = baseMatrix.map((row) =>
    row.map((isDark) => (isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }))
  );

  if (!overlayCanvas) {
    return { matrix, colors };
  }

  // Get dither settings from config
  const ditherStrength = (config.ditherStrength ?? 100) / 100; // 0-1 scale
  const diffusionKernel = config.diffusionKernel || 'floyd_steinberg';
  const fsKernel = getDiffusionKernel(diffusionKernel);

  // Load overlay image data with preprocessing
  const imageData = await loadImageDataRGBFn(overlayCanvas, scaledSize, config);
  const intensity = overlayIntensity / 100;

  // Convert to grayscale if needed
  if (colorMode === 'grayscale' || colorMode === 'bw') {
    for (let y = 0; y < scaledSize; y++) {
      for (let x = 0; x < scaledSize; x++) {
        const { r, g, b } = imageData[y][x];
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        imageData[y][x] = { r: gray, g: gray, b: gray };
      }
    }
  }

  // Apply Floyd-Steinberg error diffusion to free points
  // With optional serpentine scanning (alternating row direction)
  for (let y = 0; y < scaledSize; y++) {
    const leftToRight = !serpentine || y % 2 === 0;
    const xStart = leftToRight ? 0 : scaledSize - 1;
    const xEnd = leftToRight ? scaledSize : -1;
    const xStep = leftToRight ? 1 : -1;

    for (let x = xStart; leftToRight ? x < xEnd : x > xEnd; x += xStep) {
      // Skip locked areas and data points
      if (isLocked(scaledSize, x, y, scale)) continue;
      if (isData(x, y, scale)) continue;

      const pixel = imageData[y][x];

      if (colorMode === 'bw') {
        const gray = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
        const newVal = gray > 0.5 ? 1 : 0;
        const error = gray - newVal;

        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          error,
          error,
          error,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      } else if (colorMode === 'grayscale') {
        const gray = pixel.r;
        const levels = 4;
        const newVal = Math.round(gray * (levels - 1)) / (levels - 1);
        const error = gray - newVal;

        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          error,
          error,
          error,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      } else {
        const levels = 4;
        const newR = Math.round(pixel.r * (levels - 1)) / (levels - 1);
        const newG = Math.round(pixel.g * (levels - 1)) / (levels - 1);
        const newB = Math.round(pixel.b * (levels - 1)) / (levels - 1);

        const errorR = pixel.r - newR;
        const errorG = pixel.g - newG;
        const errorB = pixel.b - newB;

        imageData[y][x] = { r: newR, g: newG, b: newB };
        distributeError(
          imageData,
          x,
          y,
          scaledSize,
          scale,
          errorR,
          errorG,
          errorB,
          leftToRight,
          fsKernel,
          ditherStrength
        );
      }
    }
  }

  // Merge dithered image with QR matrix
  // Use seeded PRNG for deterministic output (same settings = same output)
  // Seed based on scale to ensure reproducibility
  const seededRandom = createSeededRandom(scale * 12345);

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      if (isLocked(scaledSize, x, y, scale)) continue;
      if (isData(x, y, scale)) continue;

      const pixel = imageData[y][x];
      const brightness = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
      // Use seeded PRNG instead of Math.random() for deterministic output
      const useImage = seededRandom() < intensity;

      if (useImage) {
        matrix[y][x] = brightness < 0.5;
        colors[y][x] = {
          r: Math.round(Math.max(0, Math.min(1, pixel.r)) * 255),
          g: Math.round(Math.max(0, Math.min(1, pixel.g)) * 255),
          b: Math.round(Math.max(0, Math.min(1, pixel.b)) * 255),
        };
      }
    }
  }

  return { matrix, colors };
}
