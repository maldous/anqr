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
 * - HIGH-CONTRAST B&W images use QR-first mode (no dithering) to guarantee scannability.
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
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
  OverlayData,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
  RGBWithMeta,
} from './types';

const log = createLogger('DITHER');

type RGBi = { r: number; g: number; b: number };

/** Ratio of original overlay color preserved when blending with dithered output (color dither mode). */
const COLOR_PRESERVE_RATIO = 0.7;

/**
 * Generate a QR-first matrix for high-contrast B&W images.
 * This mode GUARANTEES QR scannability by:
 * 1. Always setting dark modules to dark pixels, light modules to light pixels
 * 2. Using overlay brightness + blue noise to add dithering texture WITHIN safe ranges
 *
 * Brightness ranges (ensuring clear QR contrast):
 * - Dark modules: 0-80 grayscale - clearly dark for scanning with room for texture
 * - Light modules: 175-255 grayscale - clearly light for scanning with room for texture
 */
async function generateBWFirstMatrix(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  effectiveIntensity: number,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // Create scaled overlay canvas
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) return createEmptyMatrix(scaledSize, scale, effectiveIntensity);

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];

  // How much the overlay influences the shade (0 = no texture, 1 = full texture range)
  const textureAmount = Math.min(1, effectiveIntensity);

  // Generate blue noise tile for dithering texture
  const seed = config.blueNoiseSeed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const blueNoiseTile = generateBlueNoiseTile(tileSize, seed);

  // Contrast curve power - higher values increase contrast of the spiral
  const contrastPower = 1.5;

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // QR-FIRST: Matrix ALWAYS matches QR data - this guarantees scannability
      matrix[y][x] = qrIsDark;

      // Calculate overlay brightness (0 = black, 1 = white)
      let overlayBrightness = rgbToGray(r, g, b) / 255;

      // Apply contrast curve to enhance spiral visibility
      // For dark overlay regions, make them darker; for bright regions, make them brighter
      overlayBrightness = overlayBrightness ** contrastPower;

      // Sample blue noise for dithering texture (0-1)
      const noise = sampleBlueNoise(x, y, blueNoiseTile, tileSize);
      // Noise variation: adds subtle texture variation within modules
      const noiseVariation = (noise - 0.5) * 0.3; // ±15% variation

      // Calculate shade with texture from overlay + blue noise dithering
      let shade: number;

      if (qrIsDark) {
        // Dark module: shade ranges from 0 (black) to 100 (expanded for more visible texture)
        // Dark overlay areas -> DARK shade (near 0) to show the dark parts of spiral
        // Bright overlay areas -> lighter dark (up to 100) to show contrast
        const darkMin = 0;
        const darkMax = 100;
        const darkRange = darkMax - darkMin;

        // INVERTED: (1 - brightness) so dark overlay = dark shade, bright overlay = lighter shade
        // This correctly shows the spiral pattern
        let normalizedShade = (1 - overlayBrightness) * textureAmount;
        // Add blue noise dithering for texture
        normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);

        // Invert again: we want dark overlay -> low shade (dark), bright overlay -> high shade (lighter)
        // So: dark overlay (brightness=0) -> normalizedShade=1 -> shade=0 (black) ✓
        //     bright overlay (brightness=1) -> normalizedShade=0 -> shade=100 (gray) ✓
        shade = darkMin + Math.floor((1 - normalizedShade) * darkRange);
      } else {
        // Light module: shade ranges from 155 (expanded for more visible texture) to 255 (white)
        // Bright overlay areas -> BRIGHT shade (near 255) to show the bright parts
        // Dark overlay areas -> darker light (down to 155) to show contrast
        const lightMin = 155;
        const lightMax = 255;
        const lightRange = lightMax - lightMin;

        // Direct mapping: bright overlay = bright shade, dark overlay = darker shade
        let normalizedShade = overlayBrightness * textureAmount;
        // Add blue noise dithering for texture
        normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);

        shade = lightMin + Math.floor(normalizedShade * lightRange);
        // If no texture, default to white
        if (textureAmount === 0) shade = 255;
      }

      // For structural modules, use pure black/white for maximum clarity
      if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
        shade = qrIsDark ? 0 : 255;
      }

      colors[y][x] = config.colorMode !== 'bw' ? ({ r: shade, g: shade, b: shade } as RGBi) : null;
    }
  }

  log.debug('QR-first B&W matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    textureAmount,
    contrastPower,
    mode: 'bw-first',
  });

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}

function luma01(r: number, g: number, b: number): number {
  return rgbToGray(r, g, b) / 255;
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
  const preserveFunctional = config.preserveFunctionalPatterns !== false;

  // Fixed dark module is ALWAYS locked (scan critical per ISO/IEC 18004)
  if (row === moduleCount - 8 && col === 8) return true;

  // Check finder patterns - lock if preserveFinders is true (default) or not set
  if (isFinderPattern(row, col, moduleCount)) {
    return preserveFunctional || config.preserveFinders !== false;
  }

  // Check timing patterns - lock if preserveTiming is true
  if (isTimingPattern(row, col, moduleCount)) {
    return preserveFunctional || config.preserveTiming === true;
  }

  // Check alignment patterns - lock if preserveAlignment is true
  if (isAlignmentPattern(row, col, moduleCount, version)) {
    return preserveFunctional || config.preserveAlignment === true;
  }

  // Check format info - lock if protectFormatInfo is true
  if (isFormatInfo(row, col, moduleCount)) {
    return preserveFunctional || config.protectFormatInfo === true;
  }

  // Check version info - lock if protectVersionInfo is true
  if (isVersionInfo(row, col, moduleCount, version)) {
    return preserveFunctional || config.protectVersionInfo === true;
  }

  // Quiet zone separators around finders - lock with finders
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) {
    return preserveFunctional || config.preserveFinders !== false;
  }
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) {
    return preserveFunctional || config.preserveFinders !== false;
  }
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) {
    return preserveFunctional || config.preserveFinders !== false;
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
  const baseDarkMin = clamp01(config.darkMinOccupancy ?? 0.56);
  const DARK_MAX = 1.0;
  const baseLightMax = clamp01(config.lightMaxOccupancy ?? 0.44);
  if (baseDarkMin <= 0.001 && baseLightMax >= 0.999) return;

  const half = Math.floor(scale / 2);
  const total = scale * scale;
  const maxIters = Math.max(1, Math.min(12, config.optimizeIterations ?? 6));
  const occupancies: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(0)
  );
  const darkMinMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseDarkMin)
  );
  const lightMaxMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseLightMax)
  );
  const locked: boolean[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(false)
  );

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      locked[mr][mc] = shouldLockModule(mr, mc, moduleCount, version, config);
    }
  }

  const recomputeModuleStats = (): void => {
    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        const y0 = mr * scale;
        const x0 = mc * scale;
        let darkCount = 0;
        let desireSum = 0;
        let desireSq = 0;
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            if (matrix[y0 + y][x0 + x]) darkCount++;
            const d = desire[y0 + y][x0 + x];
            desireSum += d;
            desireSq += d * d;
          }
        }
        occupancies[mr][mc] = darkCount / total;
        const mean = desireSum / total;
        const variance = Math.max(0, desireSq / total - mean * mean);
        const contrast = clamp01(Math.sqrt(variance) * 3.2);
        darkMinMap[mr][mc] = clamp01(baseDarkMin - contrast * 0.08);
        lightMaxMap[mr][mc] = clamp01(baseLightMax + contrast * 0.08);
      }
    }
  };

  recomputeModuleStats();

  for (let iter = 0; iter < maxIters; iter++) {
    type Candidate = { y: number; x: number; score: number; toDark: boolean; mr: number; mc: number };
    const candidates: Candidate[] = [];
    let violationCount = 0;
    let totalNeeded = 0;

    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        if (locked[mr][mc]) continue;
        const qrIsDark = qr.isDark(mr, mc);
        const occ = occupancies[mr][mc];
        const darkMin = darkMinMap[mr][mc];
        const lightMax = lightMaxMap[mr][mc];

        let targetNeed = 0;
        let toDark = false;
        if (qrIsDark && occ < darkMin) {
          targetNeed = Math.ceil((darkMin - occ) * total);
          toDark = true;
        } else if (!qrIsDark && occ > lightMax) {
          targetNeed = Math.ceil((occ - lightMax) * total);
          toDark = false;
        } else {
          continue;
        }
        violationCount++;
        totalNeeded += targetNeed;

        const y0 = mr * scale;
        const x0 = mc * scale;
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const yy = y0 + y;
            const xx = x0 + x;
            const current = matrix[yy][xx];
            if ((toDark && current) || (!toDark && !current)) continue;
            if (
              config.forceCenterLock === true &&
              yy === y0 + half &&
              xx === x0 + half
            ) {
              continue;
            }

            // Global energy: preserve art + avoid module-edge imprint + reduce scan violation.
            const d = desire[yy][xx];
            const beforeErr = Math.abs((current ? 1 : 0) - d);
            const afterErr = Math.abs((toDark ? 1 : 0) - d);
            const artPenalty = afterErr - beforeErr;
            const edgePenalty = x === 0 || y === 0 || x === scale - 1 || y === scale - 1 ? 0.28 : 0;
            const severity = Math.abs((toDark ? darkMin - occ : occ - lightMax));
            const score = severity * 2.3 - artPenalty * 1.4 - edgePenalty + d * 0.15;
            candidates.push({ y: yy, x: xx, score, toDark, mr, mc });
          }
        }

        // Keep module-local budget by embedding targetNeed as repeated severity weight.
        if (targetNeed > 0) {
          darkMinMap[mr][mc] = darkMin;
          lightMaxMap[mr][mc] = lightMax;
        }
      }
    }

    if (violationCount === 0) break;
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.score - a.score);

    // Apply top global candidates; global list avoids per-module block surgery patterns.
    const maxFlips = Math.max(1, Math.min(candidates.length, totalNeeded));
    let applied = 0;
    for (let i = 0; i < candidates.length && applied < maxFlips; i++) {
      const c = candidates[i];
      const current = matrix[c.y][c.x];
      if (c.toDark === current) continue;
      matrix[c.y][c.x] = c.toDark;
      applied++;
    }

    if (applied === 0) break;
    recomputeModuleStats();
  }

  if (config.forceCenterLock === true) {
    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        if (locked[mr][mc]) continue;
        const y0 = mr * scale;
        const x0 = mc * scale;
        const cy = y0 + half;
        const cx = x0 + half;
        if (matrix[cy] && typeof matrix[cy][cx] === 'boolean') {
          matrix[cy][cx] = qr.isDark(mr, mc);
        }
      }
    }
  }
}

function removeIsolatedSpeckles(
  qr: QRCodeInstance,
  matrix: boolean[][],
  moduleCount: number,
  scale: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const size = matrix.length;
  const copy = matrix.map((row) => row.slice());
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const mr = Math.floor(y / scale);
      const mc = Math.floor(x / scale);
      if (
        mr < 0 ||
        mc < 0 ||
        mr >= moduleCount ||
        mc >= moduleCount ||
        shouldLockModule(mr, mc, moduleCount, version, config)
      ) {
        continue;
      }
      const current = copy[y][x];
      let sameNeighbors = 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue;
          if (copy[y + oy][x + ox] === current) sameNeighbors++;
        }
      }
      if (sameNeighbors <= 1) {
        matrix[y][x] = qr.isDark(mr, mc);
      }
    }
  }
}

function computeQualityMetrics(
  matrix: boolean[][],
  desire: number[][],
  scale: number
): { artCorrelation: number; edgeImprint: number } {
  const h = matrix.length;
  const w = matrix[0]?.length ?? 0;
  if (h === 0 || w === 0) return { artCorrelation: 0, edgeImprint: 0 };

  let mae = 0;
  let count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      mae += Math.abs((matrix[y][x] ? 1 : 0) - desire[y][x]);
      count++;
    }
  }
  const artCorrelation = 1 - mae / Math.max(1, count);

  let boundaryDiff = 0;
  let nonBoundaryDiff = 0;
  let boundaryCount = 0;
  let nonBoundaryCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w - 1; x++) {
      const d = Math.abs((matrix[y][x] ? 1 : 0) - (matrix[y][x + 1] ? 1 : 0));
      if ((x + 1) % scale === 0) {
        boundaryDiff += d;
        boundaryCount++;
      } else {
        nonBoundaryDiff += d;
        nonBoundaryCount++;
      }
    }
  }
  const b = boundaryDiff / Math.max(1, boundaryCount);
  const n = nonBoundaryDiff / Math.max(1, nonBoundaryCount);
  return { artCorrelation: clamp01(artCorrelation), edgeImprint: b - n };
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

  // =========================================
  // QR-FIRST MODE (manual toggle or auto-detect)
  // =========================================
  // For high-contrast B&W images (like spirals), use QR-first mode
  // which GUARANTEES scannability by always preserving QR data.
  // Standard dithering fails on B&W images because error diffusion
  // accumulates errors that flip modules incorrectly.

  // Check for manual QR-first mode toggle
  if (config.qrFirstMode) {
    log.debug('QR-first mode enabled via config - using QR-first matrix');
    return generateBWFirstMatrix(
      qr,
      config,
      overlayCanvas,
      moduleCount,
      scale,
      effectiveIntensity,
      createCanvasFn
    );
  }

  const intensity = effectiveIntensity; // 0..1
  const rawStrength = config.ditherStrength ?? 0.85;
  const ditherStrength = rawStrength > 1 ? rawStrength / 100 : rawStrength;
  const ditherScale = Math.max(0, config.ditherScale ?? 1);
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // Get configurable dither settings
  const serpentine = config.ditherSerpentine ?? true;
  const colorDitherMode = config.colorDither ?? 'none';
  const useColorDither = colorDitherMode !== 'none';
  const kernelName = (config.diffusionKernel ?? 'floyd_steinberg') as DiffusionKernel;
  const kernel = DIFFUSION_KERNELS[kernelName] ?? DIFFUSION_KERNELS.floyd_steinberg;
  const ditherMode = config.ditherMode ?? 'error_diffusion';
  const seed = config.seed ?? config.blueNoiseSeed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const noiseTile = generateBlueNoiseTile(tileSize, seed);

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) return createEmptyMatrix(scaledSize, scale, effectiveIntensity);

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const matrix: boolean[][] = [];
  const colors: (RGBWithMeta | null)[][] = [];
  const desire: number[][] = [];

  const errors: number[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colors[y] = [];
    desire[y] = new Array(scaledSize).fill(0.5);
    errors[y] = new Array(scaledSize).fill(0);
  }

  const mix = clamp01(intensity * ditherStrength * ditherScale);

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

      // ART-FIRST: generate a global halftone candidate from artwork only.
      // QR bits are applied later in the projection/correction stage.
      const overlayDark = 1 - luma01(r, g, b);
      const n = sampleBlueNoise(x, y, noiseTile, tileSize);
      const threshold = clamp01(0.5 + mix * (n - 0.5));

      let isDark: boolean;
      if (ditherMode === 'blue_noise' && !useColorDither) {
        isDark = overlayDark > threshold;
      } else {
        // Global error diffusion over artwork luminance, perturbed by blue-noise threshold
        const adjusted = overlayDark + errors[y][x];
        isDark = adjusted > threshold;
        const err = (overlayDark - (isDark ? 1 : 0)) * mix;
        distributeError(errors, x, y, err, kernel, scaledSize, leftToRight);
      }

      matrix[y][x] = isDark;
      // Desire is artwork-driven and used later for minimal-cost correction ranking.
      desire[y][x] = overlayDark;
      colors[y][x] =
        config.colorMode !== 'bw'
          ? ({
              r,
              g,
              b,
            } as RGBi)
          : null;
    }
  }

  // Post-pass: enforce per-module constraints (center pixel correctness + ratio bounds)
  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrix, moduleCount, scale, version, config);
  }

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
    quality: computeQualityMetrics(matrix, desire, scale),
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

  // =========================================
  // QR-FIRST MODE (manual toggle or auto-detect)
  // =========================================
  // For high-contrast B&W images (like spirals), use QR-first mode

  // Check for manual QR-first mode toggle
  if (config.qrFirstMode) {
    log.debug('QR-first mode enabled via config in blue-noise mode - using QR-first matrix');
    return generateBWFirstMatrix(
      qr,
      config,
      overlayCanvas,
      moduleCount,
      scale,
      effectiveIntensity,
      createCanvasFn
    );
  }

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

  const seed = config.seed ?? config.blueNoiseSeed ?? 1337;
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
      // ART-FIRST: base decision solely on artwork luminance + global noise field.
      const d = clamp01(overlayDark * (0.75 + intensity * 0.5));
      desire[y][x] = overlayDark;

      const n = sampleBlueNoise(x, y, tile, tileSize);
      const isDark = n < d;

      matrix[y][x] = isDark;
      colors[y][x] = config.colorMode !== 'bw' ? ({ r, g, b } as RGBi) : null;
    }
  }

  enforceModuleConstraints(qr, matrix, desire, moduleCount, scale, version, config);
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrix, moduleCount, scale, version, config);
  }

  log.debug('blue-noise-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    tileSize,
    seed,
  });

  return { matrix, colors, scale, overlayData: null, effectiveIntensity };
}

/**
 * Generate halftone-dithered overlay data.
 * Runs error diffusion at sub-pixel level (scale=4), then aggregates per-module
 * dark-pixel density and average overlay color into module-level OverlayData.
 * The density drives halftone dot sizing in the render loop.
 */
export async function generateHalftoneDitheredOverlayData(
  qr: QRCodeInstance,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  effectiveIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<{ overlayData: OverlayData; effectiveIntensity: number }> {
  const scale = 4;

  const ditheredResult = await generateDitheredMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    scale,
    effectiveIntensity,
    effectiveConfig,
    createCanvasFn
  );

  // Also sample the original overlay at module resolution so halftone dot sizing
  // preserves the actual image luminance instead of only QR-constrained density.
  const moduleCanvas = await createCanvasFn(moduleCount, moduleCount);
  const moduleCtx = moduleCanvas.getContext('2d');
  let moduleData: Uint8ClampedArray | null = null;
  if (moduleCtx) {
    moduleCtx.imageSmoothingEnabled = true;
    moduleCtx.imageSmoothingQuality = 'high';
    moduleCtx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);
    moduleData = moduleCtx.getImageData(0, 0, moduleCount, moduleCount).data;
  }

  const overlayData: OverlayData = {};
  overlayData.colors = {};
  const total = scale * scale;
  // 0 => pure original overlay luminance, 1 => pure dither density.
  // Keep original image dominant so backdrop remains clearly visible.
  const densityInfluence = clamp01(0.15 + effectiveIntensity * 0.15);

  for (let mr = 0; mr < moduleCount; mr++) {
    overlayData[mr] = {};
    overlayData.colors[mr] = {};

    for (let mc = 0; mc < moduleCount; mc++) {
      let darkCount = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let colorCount = 0;
      let srcR = 127;
      let srcG = 127;
      let srcB = 127;
      let srcBrightness = 0.5;

      if (moduleData) {
        const srcIdx = (mr * moduleCount + mc) * 4;
        srcR = moduleData[srcIdx];
        srcG = moduleData[srcIdx + 1];
        srcB = moduleData[srcIdx + 2];
        srcBrightness = luma01(srcR, srcG, srcB);
      }

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const y = mr * scale + sy;
          const x = mc * scale + sx;
          if (ditheredResult.matrix[y]?.[x]) darkCount++;
          const c = ditheredResult.colors[y]?.[x];
          if (c) {
            sumR += c.r;
            sumG += c.g;
            sumB += c.b;
            colorCount++;
          }
        }
      }

      const density = darkCount / total;
      const densityBrightness = 1 - density;
      overlayData[mr][mc] = clamp01(
        lerp(srcBrightness, densityBrightness, densityInfluence)
      );

      if (colorCount > 0) {
        // Blend true source color with dither-aggregated color so the backdrop
        // reads as the actual image while retaining dither texture character.
        const ditherR = Math.round(sumR / colorCount);
        const ditherG = Math.round(sumG / colorCount);
        const ditherB = Math.round(sumB / colorCount);
        const colorMix = clamp01(0.2 + effectiveIntensity * 0.25);
        overlayData.colors[mr][mc] = {
          r: Math.round(lerp(srcR, ditherR, colorMix)),
          g: Math.round(lerp(srcG, ditherG, colorMix)),
          b: Math.round(lerp(srcB, ditherB, colorMix)),
        };
      } else {
        overlayData.colors[mr][mc] = { r: srcR, g: srcG, b: srcB };
      }
    }
  }

  log.debug('halftone-dithered overlay data generated', {
    moduleCount,
    scale,
    effectiveIntensity,
  });

  return { overlayData, effectiveIntensity };
}
