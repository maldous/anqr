/**
 * QR Generator Dithered Pixel Matrix
 * Dithered and blue-noise pixel matrix generation
 */

import { generateBlueNoiseTile, sampleBlueNoise } from '../dither-algorithms';
import { isLocked } from '../qr-spec/qr-patterns';
import type { CanvasFactory } from './canvas-factory';
import type { CreateCanvasFn, PixelDecisionMatrix, QRCodeInstance, QRGeneratorConfig, RGBWithMeta } from './types';

/**
 * Generate dithered pixel matrix
 * Combines QR code data with overlay image using error diffusion dithering
 * IMPORTANT: Constrains dithering to preserve QR scannability:
 * - Dark modules stay dark (value 0-0.35)
 * - Light modules stay light (value 0.65-1)
 * - Structural patterns (finder, timing, alignment) are protected completely
 */
export async function generateDitheredMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  _effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;
  // effectiveIntensity is already in 0-1 range from getEffectiveIntensity()
  const intensity = effectiveIntensity;
  const ditherStrength = (config.ditherStrength ?? 50) / 100;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // TRACE: Log dithered matrix generation
  console.log('[DitheredMatrix] TRACE: Generating dithered matrix', {
    scaledSize,
    intensity,
    ditherStrength,
    colorMode: config.colorMode,
    overlayCanvasSize: `${overlayCanvas.width}x${overlayCanvas.height}`,
  });

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

  // Apply error diffusion dithering with QR code integration
  const errors: number[][] = [];
  for (let y = 0; y < scaledSize; y++) {
    errors[y] = new Array(scaledSize).fill(0);
  }

  // Maximum range for dithering within a module (0.35 means dark can go up to 0.35, light down to 0.65)
  const maxDitherRange = 0.35;

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Get overlay brightness (0 = black, 1 = white)
      const overlayBrightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

      // Get the QR module this sub-pixel belongs to
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // Check if this is a structural module (finder, timing, alignment, etc.)
      const isStructural = isLocked(moduleRow, moduleCol, moduleCount, version);

      let targetValue: number;
      let isDark: boolean;

      if (isStructural) {
        // Structural patterns: use pure QR value, no blending
        isDark = qrIsDark;
        matrix[y][x] = isDark;
        colors[y][x] = config.colorMode !== 'bw' ? { r, g, b } : null;
        continue; // Skip error diffusion for structural modules
      }

      // Data modules: constrain dithering within QR module's dark/light range
      const blendFactor = intensity * ditherStrength;
      const effectiveRange = maxDitherRange * blendFactor;

      if (qrIsDark) {
        // Dark module: target value ranges from 0 to effectiveRange (stays dark, < 0.5)
        targetValue = overlayBrightness * effectiveRange;
      } else {
        // Light module: target value ranges from (1-effectiveRange) to 1 (stays light, >= 0.5)
        targetValue = (1 - effectiveRange) + overlayBrightness * effectiveRange;
      }

      // Add accumulated error
      const adjusted = targetValue + (errors[y][x] || 0);

      // CRITICAL: Clamp adjusted value to preserve QR module integrity
      // Dark modules MUST stay dark (< 0.5), light modules MUST stay light (>= 0.5)
      const clampedAdjusted = qrIsDark
        ? Math.min(adjusted, 0.499) // Force dark modules to stay dark
        : Math.max(adjusted, 0.501); // Force light modules to stay light

      // Quantize to black or white
      isDark = clampedAdjusted < 0.5;
      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? { r, g, b } : null;

      // TRACE: Log first few color assignments
      if (y === 5 && x < 3) {
        console.log(`[DitheredMatrix] TRACE: colors[${y}][${x}] =`, colors[y][x], 'isDark:', isDark);
      }

      // Distribute error (Floyd-Steinberg)
      const error = adjusted - (isDark ? 0 : 1);
      if (x + 1 < scaledSize) errors[y][x + 1] += (error * 7) / 16;
      if (y + 1 < scaledSize) {
        if (x > 0) errors[y + 1][x - 1] += (error * 3) / 16;
        errors[y + 1][x] += (error * 5) / 16;
        if (x + 1 < scaledSize) errors[y + 1][x + 1] += (error * 1) / 16;
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
 * Combines QR code data with overlay image using blue noise thresholding
 * IMPORTANT: Constrains dithering to preserve QR scannability:
 * - Dark modules stay dark
 * - Light modules stay light
 * - Structural patterns (finder, timing, alignment) are protected completely
 */
export async function generateBlueNoiseMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  _canvasFactory: CanvasFactory,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // Scale overlay to get color data for texture
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

  // Blue noise mode: QR pattern is preserved exactly for scannability
  // Visual texture comes from the overlay colors stored in the colors array
  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Get the QR module this sub-pixel belongs to
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // CRITICAL: QR module integrity MUST be preserved for scannability
      // Dark modules ALWAYS stay dark, light modules ALWAYS stay light
      // Visual texture comes from the overlay colors, not binary matrix changes
      matrix[y][x] = qrIsDark;
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
