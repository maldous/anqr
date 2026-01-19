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

import { generateBlueNoiseTile, sampleBlueNoise } from '../dither-algorithms';
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

type RGBi = { r: number; g: number; b: number };

function isFinderSeparator(row: number, col: number, moduleCount: number): boolean {
  const sepSize = 8;
  // top-left
  if ((row === sepSize || col === sepSize) && row <= sepSize && col <= sepSize) return true;
  // top-right
  if (
    (row === sepSize || col === moduleCount - sepSize - 1) &&
    row <= sepSize &&
    col >= moduleCount - sepSize - 1
  )
    return true;
  // bottom-left
  if (
    (row === moduleCount - sepSize - 1 || col === sepSize) &&
    row >= moduleCount - sepSize - 1 &&
    col <= sepSize
  )
    return true;
  return false;
}

function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  // Always lock format/version if protection is enabled.
  if (config.protectFormatInfo && isFormatInfo(row, col, moduleCount)) return true;
  if (config.protectVersionInfo && isVersionInfo(row, col, moduleCount, version)) return true;

  // Finder + separators (scan critical). Respect toggle.
  if (
    config.preserveFinders &&
    (isFinderPattern(row, col, moduleCount) || isFinderSeparator(row, col, moduleCount))
  ) {
    return true;
  }

  // Timing patterns. Respect toggle.
  if (config.preserveTiming && isTimingPattern(row, col, moduleCount)) return true;

  // Alignment patterns. Respect toggle.
  if (config.preserveAlignment && isAlignmentPattern(row, col, moduleCount, version)) return true;

  return false;
}

function luma01(r: number, g: number, b: number): number {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
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

function enforceModuleConstraints(
  qr: QRCodeInstance,
  matrix: boolean[][],
  desire: number[][],
  moduleCount: number,
  scale: number,
  version: number,
  config: QRGeneratorConfig
): void {
  // Bounds chosen to preserve sampling robustness (center pixel correct) while still allowing texture.
  const DARK_MIN = 0.65; // dark modules keep majority dark
  const DARK_MAX = 0.97;
  const LIGHT_MAX = 0.35; // light modules keep majority light

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
  const intensity = effectiveIntensity; // already 0..1
  const ditherStrength = (config.ditherStrength ?? 50) / 100;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) return createEmptyMatrix(scaledSize, scale, effectiveIntensity);

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  const errors: number[][] = [];
  const desire: number[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];
    errors[y] = new Array(scaledSize).fill(0);
    desire[y] = new Array(scaledSize).fill(0.5);
  }

  const mix = clamp01(intensity * ditherStrength);

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // Structural modules are exact.
      if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
        matrix[y][x] = qrIsDark;
        colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
        desire[y][x] = qrIsDark ? 1 : 0;
        continue;
      }

      // Desired darkness from overlay (dark parts => higher), blended toward QR bit.
      const overlayDark = 1 - luma01(r, g, b);
      let d = lerp(qrIsDark ? 1 : 0, overlayDark, mix);

      // Soft clamp keeps values within a sane range, while still allowing crossing.
      // The center pixel and per-module ratio enforcement will guarantee scannability.
      if (qrIsDark) {
        d = clamp01(lerp(0.15, 0.95, d));
      } else {
        d = clamp01(lerp(0.05, 0.85, d));
      }

      desire[y][x] = d;

      // Error diffusion over desired darkness.
      const adjusted = d + errors[y][x];
      const isDark = adjusted >= 0.5;
      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;

      const err = adjusted - (isDark ? 1 : 0);
      // Floyd-Steinberg
      if (x + 1 < scaledSize) errors[y][x + 1] += (err * 7) / 16;
      if (y + 1 < scaledSize) {
        if (x > 0) errors[y + 1][x - 1] += (err * 3) / 16;
        errors[y + 1][x] += (err * 5) / 16;
        if (x + 1 < scaledSize) errors[y + 1][x + 1] += (err * 1) / 16;
      }
    }
  }

  // Post-pass: enforce per-module constraints (center pixel correctness + ratio bounds)
  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);

  if (config.debugOverlayDither) {
    // One small log with key stats.
    const center = Math.floor(scale / 2);
    const sampleMr = Math.min(10, moduleCount - 1);
    const sampleMc = Math.min(10, moduleCount - 1);
    const sy = sampleMr * scale + center;
    const sx = sampleMc * scale + center;
    console.log('[OverlayDither] dithered-matrix', {
      scaledSize,
      moduleCount,
      scale,
      mix,
      sample: {
        module: { row: sampleMr, col: sampleMc, qrIsDark: qr.isDark(sampleMr, sampleMc) },
        centerPixel: { y: sy, x: sx, isDark: matrix[sy]?.[sx], desire: desire[sy]?.[sx] },
      },
    });
  }

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
      if (qrIsDark) {
        d = clamp01(lerp(0.15, 0.95, d));
      } else {
        d = clamp01(lerp(0.05, 0.85, d));
      }
      desire[y][x] = d;

      const n = sampleBlueNoise(x, y, tile, tileSize);
      const isDark = n < d;

      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
    }
  }

  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);

  if (config.debugOverlayDither) {
    console.log('[OverlayDither] blue-noise-matrix', {
      scaledSize,
      moduleCount,
      scale,
      tileSize,
      seed,
    });
  }

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}
