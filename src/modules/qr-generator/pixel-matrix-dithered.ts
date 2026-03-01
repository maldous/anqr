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
 * - Data-module occupancy is corrected after art-first dithering.
 * - HIGH-CONTRAST B&W images use QR-first mode (no dithering) to guarantee scannability.
 */

import { createLogger } from '../../lib/logger';
import { rgbToGray } from '../core';
import {
  createRNG,
  generateBlueNoiseTile,
  getOrderedMatrix,
  sampleBlueNoise,
} from '../dither-algorithms';
import { DIFFUSION_KERNELS, type DiffusionKernelDef } from '../dither-algorithms/kernels';
import type { DiffusionKernel, OrderedMatrix } from '../dither-algorithms/types';
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
type DitherThresholdPattern =
  | 'blue_noise'
  | 'white_noise'
  | 'gaussian_noise'
  | 'triangular_noise'
  | 'ordered'
  | 'screened_blue_noise'
  | 'temporal_blue_noise'
  | 'adaptive_threshold';

function resolveDitherKind(config: QRGeneratorConfig): string {
  if (typeof config.ditherKind === 'string' && config.ditherKind.length > 0)
    return config.ditherKind;
  if (config.ditherMode === 'blue_noise') return 'blue_noise';
  return 'error_diffusion';
}

function resolveDiffusionKernel(
  configuredKernel: string | undefined,
  ditherKind: string
): DiffusionKernel {
  if (configuredKernel && configuredKernel in DIFFUSION_KERNELS) {
    return configuredKernel as DiffusionKernel;
  }
  const kindKernelMap: Record<string, DiffusionKernel> = {
    floyd_steinberg: 'floyd_steinberg',
    atkinson: 'atkinson',
    stucki: 'stucki',
    burkes: 'burkes',
    sierra: 'sierra',
  };
  return kindKernelMap[ditherKind] ?? 'floyd_steinberg';
}

function resolveOrderedMatrixName(
  ditherKind: string,
  configured: string | undefined
): OrderedMatrix {
  if (ditherKind === 'ordered_clustered') return 'clustered_dot';
  if (ditherKind === 'ordered_void_cluster') return 'void_cluster';
  if (configured === 'bayer2' || configured === 'bayer4' || configured === 'bayer8')
    return configured;
  if (configured === 'clustered_dot' || configured === 'void_cluster') return configured;
  return 'bayer4';
}

function resolveThresholdPattern(ditherKind: string): DitherThresholdPattern {
  switch (ditherKind) {
    case 'white_noise':
      return 'white_noise';
    case 'gaussian_noise':
      return 'gaussian_noise';
    case 'triangular_noise':
      return 'triangular_noise';
    case 'ordered_bayer':
    case 'ordered_clustered':
    case 'ordered_void_cluster':
    case 'true_dither':
      return 'ordered';
    case 'screened_blue_noise':
      return 'screened_blue_noise';
    case 'temporal_blue_noise':
      return 'temporal_blue_noise';
    case 'adaptive_threshold':
      return 'adaptive_threshold';
    default:
      return 'blue_noise';
  }
}

function isThresholdOnlyDitherKind(ditherKind: string): boolean {
  switch (ditherKind) {
    case 'blue_noise':
    case 'blue_noise_threshold':
    case 'white_noise':
    case 'gaussian_noise':
    case 'triangular_noise':
    case 'ordered_bayer':
    case 'ordered_clustered':
    case 'ordered_void_cluster':
    case 'true_dither':
    case 'temporal_blue_noise':
    case 'adaptive_threshold':
      return true;
    default:
      return false;
  }
}

const COLOR_PACKED_FLAG = 0x01000000;

function pixelIndex(x: number, y: number, stride: number): number {
  return y * stride + x;
}

function packColor(r: number, g: number, b: number): number {
  return COLOR_PACKED_FLAG | (r << 16) | (g << 8) | b;
}

function unpackColor(value: number): RGBWithMeta | null {
  if ((value & COLOR_PACKED_FLAG) === 0) return null;
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

function bitsToMatrix(bits: Uint8Array, size: number): boolean[][] {
  const matrix: boolean[][] = new Array(size);
  for (let y = 0; y < size; y++) {
    const row: boolean[] = new Array(size);
    const base = y * size;
    for (let x = 0; x < size; x++) {
      row[x] = bits[base + x] === 1;
    }
    matrix[y] = row;
  }
  return matrix;
}

function packedColorsToMatrix(colors: Uint32Array, size: number): (RGBWithMeta | null)[][] {
  const matrix: (RGBWithMeta | null)[][] = new Array(size);
  for (let y = 0; y < size; y++) {
    const row: (RGBWithMeta | null)[] = new Array(size);
    const base = y * size;
    for (let x = 0; x < size; x++) {
      row[x] = unpackColor(colors[base + x]);
    }
    matrix[y] = row;
  }
  return matrix;
}

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
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  // Create scaled overlay canvas
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d', {
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;
  if (!ctx) {
    if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;
  if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);

  const pixelCount = scaledSize * scaledSize;
  const matrixBits = new Uint8Array(pixelCount);
  const packedColors = new Uint32Array(pixelCount);
  const clampByte = (v: number): number => Math.max(0, Math.min(255, Math.round(v)));
  const mapShadeWithSourceColor = (
    srcR: number,
    srcG: number,
    srcB: number,
    shade: number,
    qrDark: boolean
  ): RGBi => {
    const gray = (srcR + srcG + srcB) / 3;
    const chromaScale = qrDark ? 0.9 : 0.58;
    let rOut = gray + (srcR - gray) * chromaScale;
    let gOut = gray + (srcG - gray) * chromaScale;
    let bOut = gray + (srcB - gray) * chromaScale;
    const currentShade = rgbToGray(clampByte(rOut), clampByte(gOut), clampByte(bOut));
    const delta = shade - currentShade;
    rOut += delta;
    gOut += delta;
    bOut += delta;
    return { r: clampByte(rOut), g: clampByte(gOut), b: clampByte(bOut) };
  };

  // How much the overlay influences the shade (0 = no texture, 1 = full texture range)
  const textureAmount = Math.min(1, effectiveIntensity);

  // Generate blue noise tile for dithering texture
  const seed = config.blueNoiseSeed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const blueNoiseTile = generateBlueNoiseTile(tileSize, seed);

  // Contrast curve power - higher values increase contrast of the spiral
  const contrastPower = 1.5;

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const sampleIdx = pixelIndex(x, y, scaledSize);
      const idx = sampleIdx * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);

      // QR-FIRST: Matrix ALWAYS matches QR data - this guarantees scannability
      matrixBits[sampleIdx] = qrIsDark ? 1 : 0;

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

      if (config.colorMode !== 'bw') {
        const mapped = mapShadeWithSourceColor(r, g, b, shade, qrIsDark);
        packedColors[sampleIdx] = packColor(mapped.r, mapped.g, mapped.b);
      }
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

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
}

function luma01(r: number, g: number, b: number): number {
  return rgbToGray(r, g, b) / 255;
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function shapeOverlayDarkness(overlayDark: number): number {
  const t = clamp01(overlayDark);
  // Preserve shadow anchor while lifting mids so subject structure survives dithering.
  const gammaLift = t ** 0.9;
  const smooth = t * t * (3 - 2 * t);
  const midBoost = gammaLift + 0.14 * (1 - Math.abs(2 * smooth - 1));
  return clamp01(0.58 * gammaLift + 0.42 * midBoost);
}

function moduleCenterWeight(x: number, y: number, scale: number): number {
  const fx = ((x % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const fy = ((y % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const r2 = fx * fx + fy * fy;
  const radial = Math.max(0, 1 - r2 * 3.8);
  return radial * radial;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Distribute error to neighboring pixels using the specified kernel.
 * Supports serpentine scanning by mirroring x-offsets when scanning right-to-left.
 */
function distributeError(
  errors: Float32Array,
  x: number,
  y: number,
  error: number,
  kernel: DiffusionKernelDef,
  scaledSize: number,
  leftToRight: boolean
): void {
  const prepared = kernel.prepared;
  if (!prepared) return;

  const xOffsets = leftToRight ? prepared.xOffsetsLtr : prepared.xOffsetsRtl;
  const yOffsets = prepared.yOffsets;
  const normalizedWeights = prepared.normalizedWeights;
  for (let i = 0; i < xOffsets.length; i++) {
    const nx = x + xOffsets[i];
    const ny = y + yOffsets[i];
    if (nx >= 0 && nx < scaledSize && ny < scaledSize) {
      errors[pixelIndex(nx, ny, scaledSize)] += error * normalizedWeights[i];
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
 * The fixed dark module follows preserveFunctionalPatterns (so artistic dithering can remove it).
 */
function shouldLockModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): boolean {
  const preserveFunctional = config.preserveFunctionalPatterns === true;
  const preserveFinders = config.preserveFinders !== false;
  const preserveTiming = preserveFunctional
    ? config.preserveTiming !== false
    : config.preserveTiming === true;
  const preserveAlignment = preserveFunctional
    ? config.preserveAlignment !== false
    : config.preserveAlignment === true;
  const protectFormat = preserveFunctional
    ? config.protectFormatInfo !== false
    : config.protectFormatInfo === true;
  const protectVersion = preserveFunctional
    ? config.protectVersionInfo !== false
    : config.protectVersionInfo === true;
  const preserveFixedDark = preserveFunctional;
  const isFinderSeparator = isFinderModuleOrSeparator(row, col, moduleCount, true);

  // Fixed dark module follows global preserve/protect policy.
  // When all preserve/protect options are disabled, allow dithering here too.
  if (row === moduleCount - 8 && col === 8) return preserveFixedDark;

  // Finder modules and separators respect preserveFinders explicitly.
  if (isFinderPattern(row, col, moduleCount)) {
    return preserveFinders;
  }

  if (isFinderSeparator) {
    return preserveFinders;
  }

  // Check timing patterns - lock if preserveTiming is true
  if (isTimingPattern(row, col, moduleCount)) {
    return preserveTiming;
  }

  // Check alignment patterns - lock if preserveAlignment is true
  if (isAlignmentPattern(row, col, moduleCount, version)) {
    return preserveAlignment;
  }

  // Check format info - lock if protectFormatInfo is true
  if (isFormatInfo(row, col, moduleCount)) {
    return protectFormat;
  }

  // Check version info - lock if protectVersionInfo is true
  if (isVersionInfo(row, col, moduleCount, version)) {
    return protectVersion;
  }

  return false;
}

function isFinderModuleOrSeparator(
  row: number,
  col: number,
  moduleCount: number,
  separatorsOnly: boolean = false
): boolean {
  const isFinderSeparator =
    (row === 7 && col <= 7) ||
    (col === 7 && row <= 7) ||
    (row === 7 && col >= moduleCount - 8) ||
    (col === moduleCount - 8 && row <= 7) ||
    (row === moduleCount - 8 && col <= 7) ||
    (col === 7 && row >= moduleCount - 8);
  if (separatorsOnly) return isFinderSeparator;
  return isFinderPattern(row, col, moduleCount) || isFinderSeparator;
}

function isFixedDarkModule(row: number, col: number, moduleCount: number): boolean {
  return row === moduleCount - 8 && col === 8;
}

function isFunctionalPatternModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  return (
    isFixedDarkModule(row, col, moduleCount) ||
    isFinderModuleOrSeparator(row, col, moduleCount) ||
    isTimingPattern(row, col, moduleCount) ||
    isAlignmentPattern(row, col, moduleCount, version) ||
    isFormatInfo(row, col, moduleCount) ||
    isVersionInfo(row, col, moduleCount, version)
  );
}

function enforceModuleConstraints(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  desire: Float32Array,
  moduleCount: number,
  scale: number,
  scaledSize: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const baseDarkMin = clamp01(config.darkMinOccupancy ?? 0.38);
  const baseLightMax = clamp01(config.lightMaxOccupancy ?? 0.62);
  if (baseDarkMin <= 0.001 && baseLightMax >= 0.999) return;

  const total = scale * scale;
  const maxIters = Math.max(1, Math.min(16, config.optimizeIterations ?? 8));
  const centerRadius = Math.max(1, Math.floor(scale * 0.18));
  const centerArea = (centerRadius * 2 + 1) * (centerRadius * 2 + 1);
  const moduleCenter = (scale - 1) / 2;
  const occupancies: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(0)
  );
  const centerOcc: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(0)
  );
  const darkMinMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseDarkMin)
  );
  const lightMaxMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(baseLightMax)
  );
  const darkCenterMinMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(Math.min(0.64, baseDarkMin + 0.18))
  );
  const lightCenterMaxMap: number[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(Math.max(0.36, baseLightMax - 0.18))
  );
  const locked: boolean[][] = Array.from({ length: moduleCount }, () =>
    new Array(moduleCount).fill(false)
  );
  const decoupleFinderOptimization =
    config.preserveFinders === false && config.blendPreservations !== true;
  const finderBlendGuidance =
    config.preserveFinders === false && config.blendPreservations === true;

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      locked[mr][mc] =
        shouldLockModule(mr, mc, moduleCount, version, config) ||
        (decoupleFinderOptimization && isFinderModuleOrSeparator(mr, mc, moduleCount));
    }
  }

  const recomputeModuleStats = (): void => {
    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        const y0 = mr * scale;
        const x0 = mc * scale;
        let darkCount = 0;
        let centerDarkCount = 0;
        let desireSum = 0;
        let desireSq = 0;
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const yy = y0 + y;
            const xx = x0 + x;
            const dark = matrixBits[pixelIndex(xx, yy, scaledSize)] === 1;
            if (dark) darkCount++;
            if (
              dark &&
              Math.abs(y - moduleCenter) <= centerRadius &&
              Math.abs(x - moduleCenter) <= centerRadius
            ) {
              centerDarkCount++;
            }
            const d = desire[pixelIndex(x0 + x, y0 + y, scaledSize)];
            desireSum += d;
            desireSq += d * d;
          }
        }
        occupancies[mr][mc] = darkCount / total;
        centerOcc[mr][mc] = centerDarkCount / Math.max(1, centerArea);
        const mean = desireSum / total;
        const variance = Math.max(0, desireSq / total - mean * mean);
        const contrast = clamp01(Math.sqrt(variance) * 3.2);
        // Keep module-wide occupancy loose; center-zone carries most decode pressure.
        darkMinMap[mr][mc] = clamp01(Math.max(0.34, Math.min(0.5, baseDarkMin - contrast * 0.02)));
        lightMaxMap[mr][mc] = clamp01(
          Math.max(0.5, Math.min(0.66, baseLightMax + contrast * 0.02))
        );
        darkCenterMinMap[mr][mc] = clamp01(
          Math.max(
            darkMinMap[mr][mc] + 0.12,
            Math.min(0.68, darkMinMap[mr][mc] + 0.2 - contrast * 0.04)
          )
        );
        lightCenterMaxMap[mr][mc] = clamp01(
          Math.min(
            lightMaxMap[mr][mc] - 0.12,
            Math.max(0.34, lightMaxMap[mr][mc] - 0.2 + contrast * 0.04)
          )
        );
        if (finderBlendGuidance && isFunctionalPatternModule(mr, mc, moduleCount, version)) {
          if (qr.isDark(mr, mc)) {
            darkMinMap[mr][mc] = Math.max(darkMinMap[mr][mc], 0.58);
            darkCenterMinMap[mr][mc] = Math.max(darkCenterMinMap[mr][mc], 0.74);
          } else {
            lightMaxMap[mr][mc] = Math.min(lightMaxMap[mr][mc], 0.26);
            lightCenterMaxMap[mr][mc] = Math.min(lightCenterMaxMap[mr][mc], 0.14);
          }
        }
      }
    }
  };

  const computeViolationEnergy = (): number => {
    let energy = 0;
    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        if (locked[mr][mc]) continue;
        if (isFixedDarkModule(mr, mc, moduleCount)) continue;
        const qrIsDark = qr.isDark(mr, mc);
        if (qrIsDark) {
          const occViolation = Math.max(0, darkMinMap[mr][mc] - occupancies[mr][mc]);
          const centerViolation = Math.max(0, darkCenterMinMap[mr][mc] - centerOcc[mr][mc]);
          energy += occViolation * 0.35 + centerViolation * 1.8;
        } else {
          const occViolation = Math.max(0, occupancies[mr][mc] - lightMaxMap[mr][mc]);
          const centerViolation = Math.max(0, centerOcc[mr][mc] - lightCenterMaxMap[mr][mc]);
          energy += occViolation * 0.35 + centerViolation * 1.8;
        }
      }
    }
    return energy;
  };

  recomputeModuleStats();
  let prevViolationEnergy = computeViolationEnergy();

  for (let iter = 0; iter < maxIters; iter++) {
    type Candidate = { y: number; x: number; score: number; toDark: boolean; scanGain: number };
    const candidates: Candidate[] = [];
    let totalViolationEnergy = 0;

    for (let mr = 0; mr < moduleCount; mr++) {
      for (let mc = 0; mc < moduleCount; mc++) {
        if (locked[mr][mc]) continue;
        if (isFixedDarkModule(mr, mc, moduleCount)) continue;
        const qrIsDark = qr.isDark(mr, mc);
        const occ = occupancies[mr][mc];
        const cOcc = centerOcc[mr][mc];
        const darkMin = darkMinMap[mr][mc];
        const lightMax = lightMaxMap[mr][mc];
        const darkCenterMin = darkCenterMinMap[mr][mc];
        const lightCenterMax = lightCenterMaxMap[mr][mc];

        let occViolation = 0;
        let centerViolation = 0;
        let toDark = false;
        if (qrIsDark && occ < darkMin) {
          occViolation = darkMin - occ;
          toDark = true;
        } else if (!qrIsDark && occ > lightMax) {
          occViolation = occ - lightMax;
          toDark = false;
        }
        if (qrIsDark && cOcc < darkCenterMin) {
          centerViolation = darkCenterMin - cOcc;
          toDark = true;
        } else if (!qrIsDark && cOcc > lightCenterMax) {
          centerViolation = cOcc - lightCenterMax;
          toDark = false;
        }
        if (occViolation <= 0 && centerViolation <= 0) continue;
        totalViolationEnergy += occViolation * 0.35 + centerViolation * 1.8;

        const y0 = mr * scale;
        const x0 = mc * scale;
        for (let y = 0; y < scale; y++) {
          for (let x = 0; x < scale; x++) {
            const yy = y0 + y;
            const xx = x0 + x;
            const current = matrixBits[pixelIndex(xx, yy, scaledSize)] === 1;
            if ((toDark && current) || !(toDark || current)) continue;
            const inCenter =
              Math.abs(y - moduleCenter) <= centerRadius &&
              Math.abs(x - moduleCenter) <= centerRadius;
            const occGain = occViolation > 0 ? Math.min(occViolation, 1 / total) * 0.35 : 0;
            const centerGain =
              inCenter && centerViolation > 0 ? Math.min(centerViolation, 1 / centerArea) * 1.8 : 0;
            const scanGain = occGain + centerGain;
            if (scanGain <= 0) continue;

            // Global energy: preserve art + avoid module-edge imprint + prioritize scan recovery.
            const d = desire[pixelIndex(xx, yy, scaledSize)];
            const beforeErr = Math.abs((current ? 1 : 0) - d);
            const afterErr = Math.abs((toDark ? 1 : 0) - d);
            const artPenalty = afterErr - beforeErr;
            const edgeBand = x <= 1 || y <= 1 || x >= scale - 2 || y >= scale - 2;
            const edgePenalty = edgeBand ? 0.44 : 0;
            const centerBonus = inCenter ? 0.07 : 0;
            const score = scanGain * 12.5 - artPenalty * 1.7 - edgePenalty + centerBonus;
            candidates.push({ y: yy, x: xx, score, toDark, scanGain });
          }
        }
      }
    }

    if (totalViolationEnergy <= 1e-5) break;
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.score - a.score);

    // Apply globally ranked candidates only until violation energy is reduced.
    const targetGain = totalViolationEnergy * 0.9;
    const maxFlips = Math.max(
      1,
      Math.min(candidates.length, Math.ceil(totalViolationEnergy * total * 0.9))
    );
    let applied = 0;
    let gained = 0;
    for (let i = 0; i < candidates.length && applied < maxFlips && gained < targetGain; i++) {
      const c = candidates[i];
      if (c.score < -0.2 && gained > targetGain * 0.6) break;
      const idx = pixelIndex(c.x, c.y, scaledSize);
      const current = matrixBits[idx] === 1;
      if (c.toDark === current) continue;
      matrixBits[idx] = c.toDark ? 1 : 0;
      applied++;
      gained += c.scanGain;
    }

    if (applied === 0) break;
    recomputeModuleStats();
    const newViolationEnergy = computeViolationEnergy();
    if (prevViolationEnergy - newViolationEnergy < 1e-4) break;
    prevViolationEnergy = newViolationEnergy;
  }

  // Do not add a post-center-lock pass; it re-imprints module structure.
}

function removeIsolatedSpeckles(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  scaledSize: number,
  moduleCount: number,
  scale: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const copy = matrixBits.slice();
  for (let y = 1; y < scaledSize - 1; y++) {
    for (let x = 1; x < scaledSize - 1; x++) {
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
      const currentIdx = pixelIndex(x, y, scaledSize);
      const current = copy[currentIdx];
      let sameNeighbors = 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (ox === 0 && oy === 0) continue;
          if (copy[pixelIndex(x + ox, y + oy, scaledSize)] === current) sameNeighbors++;
        }
      }
      if (sameNeighbors <= 1) {
        matrixBits[currentIdx] = qr.isDark(mr, mc) ? 1 : 0;
      }
    }
  }
}

function computeQualityMetrics(
  matrixBits: Uint8Array,
  desire: Float32Array,
  size: number,
  scale: number
): { artCorrelation: number; edgeImprint: number } {
  if (size === 0) return { artCorrelation: 0, edgeImprint: 0 };

  let mae = 0;
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = pixelIndex(x, y, size);
      mae += Math.abs(matrixBits[idx] - desire[idx]);
      count++;
    }
  }
  const artCorrelation = 1 - mae / Math.max(1, count);

  let boundaryDiff = 0;
  let nonBoundaryDiff = 0;
  let boundaryCount = 0;
  let nonBoundaryCount = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) {
      const d = Math.abs(
        matrixBits[pixelIndex(x, y, size)] - matrixBits[pixelIndex(x + 1, y, size)]
      );
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
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
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
      createCanvasFn,
      releaseCanvasFn
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
  const ditherKind = resolveDitherKind(config);
  const thresholdPattern = resolveThresholdPattern(ditherKind);
  const thresholdOnly = isThresholdOnlyDitherKind(ditherKind);
  const kernelName = resolveDiffusionKernel(config.diffusionKernel, ditherKind);
  const kernel = DIFFUSION_KERNELS[kernelName] ?? DIFFUSION_KERNELS.floyd_steinberg;
  const seed = config.blueNoiseSeed ?? config.seed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const noiseTile = generateBlueNoiseTile(tileSize, seed);
  const orderedMatrixName = resolveOrderedMatrixName(ditherKind, config.orderedMatrix);
  const orderedMatrix = getOrderedMatrix(orderedMatrixName);
  const orderedH = orderedMatrix.length;
  const orderedW = orderedMatrix[0]?.length ?? orderedH;
  const orderedDivisor = Math.max(1, orderedH * orderedW);
  const whiteNoiseRng = createRNG((seed ^ 0x9e3779b9) >>> 0);
  const gaussianNoiseRng = createRNG((seed ^ 0x7f4a7c15) >>> 0);
  const triangularNoiseRng = createRNG((seed ^ 0x94d049bb) >>> 0);
  const gaussian01 = (): number => {
    const u1 = Math.max(1e-6, gaussianNoiseRng());
    const u2 = gaussianNoiseRng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return clamp01(0.5 + z * 0.18);
  };
  const triangular01 = (): number => (triangularNoiseRng() + triangularNoiseRng()) * 0.5;
  const frameIndex = config.frameIndex ?? 0;
  const temporalOffsetX = (frameIndex * 17) % tileSize;
  const temporalOffsetY = (frameIndex * 29) % tileSize;

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d', {
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;
  if (!ctx) {
    if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;
  if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);

  const pixelCount = scaledSize * scaledSize;
  const matrixBits = new Uint8Array(pixelCount);
  const packedColors = new Uint32Array(pixelCount);
  const desire = new Float32Array(pixelCount);
  const errors = new Float32Array(pixelCount);
  desire.fill(0.5);

  const mix = clamp01(intensity * ditherStrength * ditherScale);
  const qrBitBiasStrength = clamp01(config.qrBitBiasStrength ?? 0);
  const sampleThreshold = (x: number, y: number, overlayDark: number): number => {
    const centered = (value01: number): number => clamp01(0.5 + (value01 - 0.5) * mix);
    switch (thresholdPattern) {
      case 'white_noise':
        return centered(whiteNoiseRng());
      case 'gaussian_noise':
        return centered(gaussian01());
      case 'triangular_noise':
        return centered(triangular01());
      case 'ordered': {
        const rank = orderedMatrix[y % orderedH]?.[x % orderedW] ?? 0;
        return centered((rank + 0.5) / orderedDivisor);
      }
      case 'screened_blue_noise': {
        const blue = sampleBlueNoise(x, y, noiseTile, tileSize);
        const screen = clamp01(0.5 + 0.5 * Math.sin(x * 0.37 + y * 0.29));
        return centered(blue * 0.72 + screen * 0.28);
      }
      case 'temporal_blue_noise':
        return centered(
          sampleBlueNoise(x + temporalOffsetX, y + temporalOffsetY, noiseTile, tileSize)
        );
      case 'adaptive_threshold':
        return centered(clamp01(0.55 - (overlayDark - 0.5) * 0.9));
      default:
        return centered(sampleBlueNoise(x, y, noiseTile, tileSize));
    }
  };

  for (let y = 0; y < scaledSize; y++) {
    // Serpentine: alternate scan direction per row
    const leftToRight = serpentine ? y % 2 === 0 : true;
    const startX = leftToRight ? 0 : scaledSize - 1;
    const endX = leftToRight ? scaledSize : -1;
    const deltaX = leftToRight ? 1 : -1;

    for (let x = startX; leftToRight ? x < endX : x > endX; x += deltaX) {
      const sampleIdx = pixelIndex(x, y, scaledSize);
      const idx = sampleIdx * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);
      const moduleLocked = shouldLockModule(moduleRow, moduleCol, moduleCount, version, config);
      const fixedDarkUnlocked =
        !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, moduleCount);

      // ART-FIRST: generate a global halftone candidate from artwork only.
      // QR bits are applied later in the projection/correction stage.
      const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
      const centerW = moduleCenterWeight(x, y, scale);
      const qrBias = fixedDarkUnlocked
        ? 0
        : (qrIsDark ? 1 : -1) * qrBitBiasStrength * centerW * (0.45 + mix * 0.8);
      const biasedOverlayDark = clamp01(overlayDark + qrBias);
      const threshold = sampleThreshold(x, y, overlayDark);

      let isDarkCandidate: boolean;
      if (thresholdOnly && !useColorDither) {
        isDarkCandidate = biasedOverlayDark > threshold;
      } else {
        // Global error diffusion over artwork luminance, with dither-kind specific threshold fields.
        const adjusted = biasedOverlayDark + errors[sampleIdx];
        isDarkCandidate = adjusted > threshold;
        const err = (biasedOverlayDark - (isDarkCandidate ? 1 : 0)) * mix;
        distributeError(errors, x, y, err, kernel, scaledSize, leftToRight);
      }

      // Apply structural lock at the final write stage only.
      // This keeps diffusion state consistent so toggling locks doesn't re-shape the entire texture.
      matrixBits[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : isDarkCandidate ? 1 : 0;
      // Desire is artwork-driven and used later for minimal-cost correction ranking.
      desire[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : overlayDark;
      if (config.colorMode !== 'bw') {
        packedColors[sampleIdx] = packColor(r, g, b);
      }
    }
  }

  // Post-pass: enforce adaptive data-module occupancy constraints.
  enforceModuleConstraints(qr, matrixBits, desire, moduleCount, scale, scaledSize, version, config);
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrixBits, scaledSize, moduleCount, scale, version, config);
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
    ditherKind,
    thresholdPattern,
    thresholdOnly,
    colorDitherMode,
    kernelName,
    sample: {
      module: { row: sampleMr, col: sampleMc, qrIsDark: qr.isDark(sampleMr, sampleMc) },
      centerPixel: {
        y: sy,
        x: sx,
        isDark: matrixBits[pixelIndex(sx, sy, scaledSize)] === 1,
        desire: desire[pixelIndex(sx, sy, scaledSize)],
      },
    },
    quality: computeQualityMetrics(matrixBits, desire, scaledSize, scale),
  });

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
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
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
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
      createCanvasFn,
      releaseCanvasFn
    );
  }

  const intensity = effectiveIntensity; // 0..1
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d', {
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;
  if (!ctx) {
    if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;
  if (releaseCanvasFn) releaseCanvasFn(scaledCanvas);

  const pixelCount = scaledSize * scaledSize;
  const matrixBits = new Uint8Array(pixelCount);
  const packedColors = new Uint32Array(pixelCount);
  const desire = new Float32Array(pixelCount);
  desire.fill(0.5);

  const seed = config.blueNoiseSeed ?? config.seed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const tile = generateBlueNoiseTile(tileSize, seed);
  const qrBitBiasStrength = clamp01(config.qrBitBiasStrength ?? 0);
  const scanGateProfile = config.scanGateProfile ?? 'full';
  const scanGateActive = scanGateProfile !== 'off';
  const scanGateBiasBoost = scanGateActive ? 0.06 + intensity * 0.04 : 0;
  const minPolarityBias = 0.08 + intensity * 0.08;
  const effectiveBitBias = Math.max(
    qrBitBiasStrength + scanGateBiasBoost,
    minPolarityBias + scanGateBiasBoost * 0.4
  );

  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      const sampleIdx = pixelIndex(x, y, scaledSize);
      const idx = sampleIdx * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const qrIsDark = qr.isDark(moduleRow, moduleCol);
      const moduleLocked = shouldLockModule(moduleRow, moduleCol, moduleCount, version, config);
      const fixedDarkUnlocked =
        !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, moduleCount);

      if (moduleLocked) {
        matrixBits[sampleIdx] = qrIsDark ? 1 : 0;
        if (config.colorMode !== 'bw') {
          packedColors[sampleIdx] = packColor(r, g, b);
        }
        desire[sampleIdx] = qrIsDark ? 1 : 0;
        continue;
      }

      const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
      // ART-FIRST: base decision solely on artwork luminance + global noise field.
      const centerW = moduleCenterWeight(x, y, scale);
      const polarityBoost = scanGateActive ? 1.18 : 1;
      const polarityBias =
        (qrIsDark ? 1 : -1) * (0.14 + intensity * 0.18) * (0.4 + centerW * 0.6) * polarityBoost;
      const qrBias = fixedDarkUnlocked
        ? 0
        : (qrIsDark ? 1 : -1) * effectiveBitBias * centerW * (0.45 + intensity * 0.8);
      const decisionGain = (0.64 + intensity * 0.44) * (scanGateActive ? 1.04 : 1);
      const d = clamp01((overlayDark + qrBias + polarityBias) * decisionGain);
      desire[sampleIdx] = clamp01(overlayDark + (qrIsDark ? 0.12 : -0.12));

      const n = sampleBlueNoise(x, y, tile, tileSize);
      const isDark = n < d;

      matrixBits[sampleIdx] = isDark ? 1 : 0;
      if (config.colorMode !== 'bw') {
        packedColors[sampleIdx] = packColor(r, g, b);
      }
    }
  }

  const strictConstraintConfig: QRGeneratorConfig = {
    ...config,
    darkMinOccupancy: Math.max(
      config.darkMinOccupancy ?? 0,
      (scanGateActive ? 0.56 : 0.52) + intensity * 0.08
    ),
    lightMaxOccupancy: Math.min(
      config.lightMaxOccupancy ?? 1,
      (scanGateActive ? 0.44 : 0.48) - intensity * 0.08
    ),
    optimizeIterations: Math.max(config.optimizeIterations ?? 0, scanGateActive ? 10 : 8),
  };
  enforceModuleConstraints(
    qr,
    matrixBits,
    desire,
    moduleCount,
    scale,
    scaledSize,
    version,
    strictConstraintConfig
  );
  if (config.cleanupSpeckle === true) {
    removeIsolatedSpeckles(qr, matrixBits, scaledSize, moduleCount, scale, version, config);
  }

  log.debug('blue-noise-matrix generated', {
    scaledSize,
    moduleCount,
    scale,
    tileSize,
    seed,
  });

  return {
    matrix: bitsToMatrix(matrixBits, scaledSize),
    colors: packedColorsToMatrix(packedColors, scaledSize),
    scale,
    overlayData: null,
    effectiveIntensity,
  };
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
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
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
    createCanvasFn,
    releaseCanvasFn
  );

  // Also sample the original overlay at module resolution so halftone dot sizing
  // preserves the actual image luminance instead of only QR-constrained density.
  const moduleCanvas = await createCanvasFn(moduleCount, moduleCount);
  const moduleCtx = moduleCanvas.getContext('2d', {
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null;
  let moduleData: Uint8ClampedArray | null = null;
  if (moduleCtx) {
    moduleCtx.imageSmoothingEnabled = true;
    moduleCtx.imageSmoothingQuality = 'high';
    moduleCtx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);
    moduleData = moduleCtx.getImageData(0, 0, moduleCount, moduleCount).data;
  }
  if (releaseCanvasFn) releaseCanvasFn(moduleCanvas);

  const overlayBrightness = new Float32Array(moduleCount * moduleCount);
  const overlayColorsPacked = new Uint32Array(moduleCount * moduleCount);
  const total = scale * scale;
  // 0 => pure original overlay luminance, 1 => pure dither density.
  // Keep original image dominant so backdrop remains clearly visible.
  const densityInfluence = clamp01(0.15 + effectiveIntensity * 0.15);

  for (let mr = 0; mr < moduleCount; mr++) {
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
      const overlayIndex = mr * moduleCount + mc;
      overlayBrightness[overlayIndex] = clamp01(
        lerp(srcBrightness, densityBrightness, densityInfluence)
      );

      if (colorCount > 0) {
        // Blend true source color with dither-aggregated color so the backdrop
        // reads as the actual image while retaining dither texture character.
        const ditherR = Math.round(sumR / colorCount);
        const ditherG = Math.round(sumG / colorCount);
        const ditherB = Math.round(sumB / colorCount);
        const colorMix = clamp01(0.2 + effectiveIntensity * 0.25);
        overlayColorsPacked[overlayIndex] = packColor(
          Math.round(lerp(srcR, ditherR, colorMix)),
          Math.round(lerp(srcG, ditherG, colorMix)),
          Math.round(lerp(srcB, ditherB, colorMix))
        );
      } else {
        overlayColorsPacked[overlayIndex] = packColor(srcR, srcG, srcB);
      }
    }
  }

  log.debug('halftone-dithered overlay data generated', {
    moduleCount,
    scale,
    effectiveIntensity,
  });

  return {
    overlayData: {
      size: moduleCount,
      brightness: overlayBrightness,
      colorsPacked: overlayColorsPacked,
    } as OverlayData,
    effectiveIntensity,
  };
}
