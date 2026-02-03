/**
 * QR Generator Dithered Pixel Matrix
 * Dithered and blue-noise pixel matrix generation.
 *
 * Goals
 * - Make the overlay image part of the QR (not just behind it).
 * - Support full-color overlays.
 * - Keep the QR scannable.
 *
 * Scannability constraints
 * - Structural modules are fully locked using qr-spec pattern locking.
 * - The CENTER sub-pixel of every non-structural module is forced to the true QR bit.
 * - Per-module dark-pixel ratio is bounded (data modules only).
 */

import { createLogger } from '../../lib/logger';
import { generateBlueNoiseTile, sampleBlueNoise } from '../dither-algorithms';
import { DIFFUSION_KERNELS, type DiffusionKernelDef } from '../dither-algorithms/kernels';
import type { DiffusionKernel } from '../dither-algorithms/types';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../qr-spec/qr-patterns';
import type { CanvasFactory } from './canvas-factory';
import type {
  CreateCanvasFn,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
  RGBWithMeta,
} from './types';

const log = createLogger('DITHER');

type RGBi = { r: number; g: number; b: number };

function luma01(r: number, g: number, b: number): number {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Distribute error to neighboring pixels using the specified kernel.
 * Supports serpentine scanning by mirroring x-offsets when scanning right-to-left.
 */
function distributeError(
  errors: number[][],
  x: number,
  y: number,
  error: number,
  kernel: DiffusionKernelDef,
  scaledSize: number,
  leftToRight: boolean
): void {
  const { matrix, divisor, offset } = kernel;
  for (let ky = 0; ky < matrix.length; ky++) {
    for (let kx = 0; kx < matrix[ky].length; kx++) {
      const weight = matrix[ky][kx];
      if (weight === 0) continue;

      // Calculate offset from current position
      let offsetX = kx - offset;
      // Mirror x-offset for right-to-left scanning
      if (!leftToRight) offsetX = -offsetX;

      const nx = x + offsetX;
      const ny = y + ky;

      if (nx >= 0 && nx < scaledSize && ny < scaledSize) {
        errors[ny][nx] += (error * weight) / divisor;
      }
    }
  }
}

/**
 * Distribute RGB errors to neighboring pixels using the specified kernel.
 * Supports serpentine scanning and per-channel color dithering.
 */
function distributeColorError(
  errorsR: number[][],
  errorsG: number[][],
  errorsB: number[][],
  x: number,
  y: number,
  errorR: number,
  errorG: number,
  errorB: number,
  kernel: DiffusionKernelDef,
  scaledSize: number,
  leftToRight: boolean
): void {
  const { matrix, divisor, offset } = kernel;
  for (let ky = 0; ky < matrix.length; ky++) {
    for (let kx = 0; kx < matrix[ky].length; kx++) {
      const weight = matrix[ky][kx];
      if (weight === 0) continue;

      let offsetX = kx - offset;
      if (!leftToRight) offsetX = -offsetX;

      const nx = x + offsetX;
      const ny = y + ky;

      if (nx >= 0 && nx < scaledSize && ny < scaledSize) {
        const factor = weight / divisor;
        errorsR[ny][nx] += errorR * factor;
        errorsG[ny][nx] += errorG * factor;
        errorsB[ny][nx] += errorB * factor;
      }
    }
  }
}

function createEmptyMatrix(
  size: number,
  scale: number,
  effectiveIntensity: number
): PixelDecisionMatrix {
  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    colors[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y][x] = false;
      colors[y][x] = null;
    }
  }
  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}

/**
 * Check if a module should be locked based on config preserve/protect settings.
 * This allows users to include structural modules in the overlay rendering when desired.
 * The fixed dark module at (moduleCount-8, 8) is ALWAYS locked (scan critical).
 */
function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  // Fixed dark module is ALWAYS locked (scan critical per ISO/IEC 18004)
  if (row === moduleCount - 8 && col === 8) return true;

  // Check finder patterns - lock if preserveFinders is true (default) or not set
  if (isFinderPattern(row, col, moduleCount)) {
    return config.preserveFinders !== false;
  }

  // Check timing patterns - lock if preserveTiming is true
  if (isTimingPattern(row, col, moduleCount)) {
    return config.preserveTiming === true;
  }

  // Check alignment patterns - lock if preserveAlignment is true
  if (isAlignmentPattern(row, col, moduleCount, version)) {
    return config.preserveAlignment === true;
  }

  // Check format info - lock if protectFormatInfo is true
  if (isFormatInfo(row, col, moduleCount)) {
    return config.protectFormatInfo === true;
  }

  // Check version info - lock if protectVersionInfo is true
  if (isVersionInfo(row, col, moduleCount, version)) {
    return config.protectVersionInfo === true;
  }

  // Quiet zone separators around finders - lock with finders
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) {
    return config.preserveFinders !== false;
  }
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) {
    return config.preserveFinders !== false;
  }
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) {
    return config.preserveFinders !== false;
  }

  return false;
}

function enforceModuleConstraints(
  qr: QRCodeInstance,
  matrix: boolean[][],
  desire: number[][],
  moduleCount: number,
  scale: number,
  version: number,
  config: QRGeneratorConfig
): void {
  // Bounds chosen to preserve QR scannability while allowing some texture.
  // Increased from 0.65/0.35 to 0.75/0.25 for better scannability with high-contrast overlays.
  const DARK_MIN = 0.75; // dark modules must be at least 75% dark
  const DARK_MAX = 0.97;
  const LIGHT_MAX = 0.25; // light modules must be at most 25% dark

  const half = Math.floor(scale / 2);

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      if (shouldLockModule(mr, mc, moduleCount, version, config)) continue;

      const qrIsDark = qr.isDark(mr, mc);
      const y0 = mr * scale;
      const x0 = mc * scale;

      // Force center sub-pixel to the true module value.
      const cy = y0 + half;
      const cx = x0 + half;
      if (matrix[cy] && typeof matrix[cy][cx] === 'boolean') {
        matrix[cy][cx] = qrIsDark;
      }

      // Count dark pixels in this module block.
      let darkCount = 0;
      const total = scale * scale;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          if (matrix[y0 + y][x0 + x]) darkCount++;
        }
      }

      const ratio = darkCount / total;

      if (qrIsDark) {
        // If too light, flip some light pixels with highest "desire" to dark.
        if (ratio < DARK_MIN) {
          const need = Math.ceil(DARK_MIN * total - darkCount);
          if (need > 0) {
            const candidates: { y: number; x: number; score: number }[] = [];
            for (let y = 0; y < scale; y++) {
              for (let x = 0; x < scale; x++) {
                const yy = y0 + y;
                const xx = x0 + x;
                if (!matrix[yy][xx]) candidates.push({ y: yy, x: xx, score: desire[yy][xx] });
              }
            }
            candidates.sort((a, b) => b.score - a.score);
            for (let i = 0; i < need && i < candidates.length; i++) {
              matrix[candidates[i].y][candidates[i].x] = true;
            }
          }
        }

        // If too dark, flip some dark pixels with lowest desire to light.
        if (ratio > DARK_MAX) {
          const excess = Math.ceil(darkCount - DARK_MAX * total);
          if (excess > 0) {
            const candidates: { y: number; x: number; score: number }[] = [];
            for (let y = 0; y < scale; y++) {
              for (let x = 0; x < scale; x++) {
                const yy = y0 + y;
                const xx = x0 + x;
                if (matrix[yy][xx]) candidates.push({ y: yy, x: xx, score: desire[yy][xx] });
              }
            }
            candidates.sort((a, b) => a.score - b.score);
            for (let i = 0; i < excess && i < candidates.length; i++) {
              // Don't flip the center pixel we just forced.
              if (candidates[i].y === cy && candidates[i].x === cx) continue;
              matrix[candidates[i].y][candidates[i].x] = false;
            }
          }
        }
      } else {
        // Light modules: if too dark, flip some dark pixels with lowest desire to light.
        if (ratio > LIGHT_MAX) {
          const excess = Math.ceil(darkCount - LIGHT_MAX * total);
          if (excess > 0) {
            const candidates: { y: number; x: number; score: number }[] = [];
            for (let y = 0; y < scale; y++) {
              for (let x = 0; x < scale; x++) {
                const yy = y0 + y;
                const xx = x0 + x;
                if (matrix[yy][xx]) candidates.push({ y: yy, x: xx, score: desire[yy][xx] });
              }
            }
            candidates.sort((a, b) => a.score - b.score);
            for (let i = 0; i < excess && i < candidates.length; i++) {
              if (candidates[i].y === cy && candidates[i].x === cx) continue;
              matrix[candidates[i].y][candidates[i].x] = false;
            }
          }
        }
      }
    }
  }
}

/**
 * Generate dithered pixel matrix
 * Uses error-diffusion over a "desired darkness" field.
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
  const intensity = effectiveIntensity; // 0..1
  const ditherStrength = (config.ditherStrength ?? 50) / 100;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // Get configurable dither settings
  const serpentine = config.ditherSerpentine ?? false;
  const colorDitherMode = config.colorDither ?? 'none';
  const useColorDither = colorDitherMode !== 'none';
  const kernelName = (config.diffusionKernel ?? 'floyd_steinberg') as DiffusionKernel;
  const kernel = DIFFUSION_KERNELS[kernelName] ?? DIFFUSION_KERNELS.floyd_steinberg;

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) return createEmptyMatrix(scaledSize, scale, effectiveIntensity);

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  const desire: number[][] = [];
  
  // For color dithering, we need separate R/G/B error buffers
  // For grayscale/bw, we use a single error buffer based on luminance
  const errorsR: number[][] = [];
  const errorsG: number[][] = [];
  const errorsB: number[][] = [];
  const errors: number[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];
    desire[y] = new Array(scaledSize).fill(0.5);
    if (useColorDither) {
      errorsR[y] = new Array(scaledSize).fill(0);
      errorsG[y] = new Array(scaledSize).fill(0);
      errorsB[y] = new Array(scaledSize).fill(0);
    } else {
      errors[y] = new Array(scaledSize).fill(0);
    }
  }

  const mix = clamp01(intensity * ditherStrength);

  for (let y = 0; y < scaledSize; y++) {
    // Serpentine: alternate scan direction per row
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : scaledSize - 1;
    const endX = leftToRight ? scaledSize : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; leftToRight ? x < endX : x > endX; x += deltaX) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // Structural modules are exact when locked by config.
      if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
        matrix[y][x] = qrIsDark;
        colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
        desire[y][x] = qrIsDark ? 1 : 0;
        continue;
      }

      if (useColorDither) {
        // Color dithering: process R, G, B channels separately
        // Normalize to 0..1 and apply accumulated error
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        // Apply error from previous pixels
        const rAdjusted = clamp01(rNorm + errorsR[y][x]);
        const gAdjusted = clamp01(gNorm + errorsG[y][x]);
        const bAdjusted = clamp01(bNorm + errorsB[y][x]);

        // Quantize to nearest value (0 or 1 for each channel for 2-level dithering)
        // But we want to preserve more levels for color richness
        const rNew = rAdjusted > 0.5 ? 1 : 0;
        const gNew = gAdjusted > 0.5 ? 1 : 0;
        const bNew = bAdjusted > 0.5 ? 1 : 0;

        // Calculate errors for each channel
        const errR = (rAdjusted - rNew) * mix;
        const errG = (gAdjusted - gNew) * mix;
        const errB = (bAdjusted - bNew) * mix;

        // Determine darkness from the dithered color's luminance
        const ditheredLuma = luma01(rNew * 255, gNew * 255, bNew * 255);
        
        // Blend toward QR bit for scannability
        let d = lerp(qrIsDark ? 1 : 0, 1 - ditheredLuma, mix);
        // Soft clamp keeps values within ranges that preserve QR scannability
        // The ranges are chosen to keep desire on the "correct" side of 0.5:
        // - Dark modules: 0.55-0.95 ensures majority dark pixels (avg > 55%)
        // - Light modules: 0.05-0.45 ensures majority light pixels (avg < 45%)
        // This prevents high-contrast B&W overlays from overwhelming QR data
        if (qrIsDark) {
          d = clamp01(lerp(0.55, 0.95, d));
        } else {
          d = clamp01(lerp(0.05, 0.45, d));
        }
        desire[y][x] = d;

        // Use standard 0.5 threshold - the soft-clamped ranges and enforceModuleConstraints
        // post-pass will ensure QR scannability
        const isDark = d >= 0.5;
        matrix[y][x] = isDark;
        
        // Store the dithered color (scale back to 0-255 but keep original RGB for better color)
        // Use a blend between original and dithered for richer color output
        const colorBlend = 0.7; // Keep mostly original color for visual quality
        colors[y][x] = config.colorMode !== 'bw' ? ({
          r: Math.round(r * colorBlend + rNew * 255 * (1 - colorBlend)),
          g: Math.round(g * colorBlend + gNew * 255 * (1 - colorBlend)),
          b: Math.round(b * colorBlend + bNew * 255 * (1 - colorBlend)),
        } as RGBi) : null;

        // Distribute color errors
        distributeColorError(
          errorsR, errorsG, errorsB,
          x, y, errR, errG, errB,
          kernel, scaledSize, leftToRight
        );
      } else {
        // Grayscale/BW dithering: use luminance-based error diffusion
        const overlayDark = 1 - luma01(r, g, b);
        let d = lerp(qrIsDark ? 1 : 0, overlayDark, mix);

        // Soft clamp keeps values within ranges that preserve QR scannability
        // The ranges are chosen to keep desire on the "correct" side of 0.5:
        // - Dark modules: 0.55-0.95 ensures majority dark pixels (avg > 55%)
        // - Light modules: 0.05-0.45 ensures majority light pixels (avg < 45%)
        // This prevents high-contrast B&W overlays from overwhelming QR data
        if (qrIsDark) {
          d = clamp01(lerp(0.55, 0.95, d));
        } else {
          d = clamp01(lerp(0.05, 0.45, d));
        }
        desire[y][x] = d;

        // Error diffusion over desired darkness
        const adjusted = d + errors[y][x];
        // Use standard 0.5 threshold - the soft-clamped ranges and enforceModuleConstraints
        // post-pass will ensure QR scannability
        const isDark = adjusted >= 0.5;
        matrix[y][x] = isDark;
        colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;

        // Use original adjusted (not clamped) for error calculation to preserve some texture
        const err = adjusted - (isDark ? 1 : 0);
        // Distribute error using selected kernel
        distributeError(errors, x, y, err, kernel, scaledSize, leftToRight);
      }
    }
  }

  // Post-pass: enforce per-module constraints (center pixel correctness + ratio bounds)
  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);

  // Log key stats for debugging
  const center = Math.floor(scale / 2);
  const sampleMr = Math.min(10, moduleCount - 1);
  const sampleMc = Math.min(10, moduleCount - 1);
  const sy = sampleMr * scale + center;
  const sx = sampleMc * scale + center;
  log.debug('dithered-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    mix,
    serpentine,
    colorDitherMode,
    kernelName,
    sample: {
      module: { row: sampleMr, col: sampleMc, qrIsDark: qr.isDark(sampleMr, sampleMc) },
      centerPixel: { y: sy, x: sx, isDark: matrix[sy]?.[sx], desire: desire[sy]?.[sx] },
    },
  });

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}

/**
 * Generate blue noise pixel matrix
 * Uses a blue noise threshold field over the same desired-darkness model.
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
  const intensity = effectiveIntensity; // 0..1
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) return createEmptyMatrix(scaledSize, scale, effectiveIntensity);

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  const desire: number[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];
    desire[y] = new Array(scaledSize).fill(0.5);
  }

  const seed = config.blueNoiseSeed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const tile = generateBlueNoiseTile(tileSize, seed);

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
        matrix[y][x] = qrIsDark;
        colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
        desire[y][x] = qrIsDark ? 1 : 0;
        continue;
      }

      const overlayDark = 1 - luma01(r, g, b);
      let d = lerp(qrIsDark ? 1 : 0, overlayDark, intensity);
      // Soft clamp keeps values within ranges that preserve QR scannability
      // The ranges are chosen to keep desire on the "correct" side of 0.5:
      // - Dark modules: 0.55-0.95 ensures majority dark pixels (avg > 55%)
      // - Light modules: 0.05-0.45 ensures majority light pixels (avg < 45%)
      // This prevents high-contrast B&W overlays from overwhelming QR data
      if (qrIsDark) {
        d = clamp01(lerp(0.55, 0.95, d));
      } else {
        d = clamp01(lerp(0.05, 0.45, d));
      }
      desire[y][x] = d;

      const n = sampleBlueNoise(x, y, tile, tileSize);
      // Use d directly with blue noise threshold - the soft-clamped ranges
      // and enforceModuleConstraints post-pass will ensure QR scannability
      const isDark = n < d;

      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
    }
  }

  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);

  log.debug('blue-noise-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    tileSize,
    seed,
  });

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}
