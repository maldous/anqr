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

import { createLogger } from '../../../infra/logging/logger';
import {
  createRNG,
  generateBlueNoiseTile,
  getOrderedMatrix,
  sampleBlueNoise,
} from '../dither';
import { DIFFUSION_KERNELS, type DiffusionKernelDef } from '../dither/kernels';
import type { DiffusionKernel, OrderedMatrix } from '../dither/types';
import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../../qr/spec/qr-patterns';
import type { CanvasFactory } from '../../../platform/browser/canvas/canvas-factory';
import type {
  CreateCanvasFn,
  OverlayData,
  PixelDecisionMatrix,
  QRCodeInstance,
  QRGeneratorConfig,
  RGBWithMeta,
} from './types';

export const log = createLogger('DITHER');

export function rgbToLumaSrgb(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export type RGBi = { r: number; g: number; b: number };
export type DitherThresholdPattern =
  | 'blue_noise'
  | 'white_noise'
  | 'gaussian_noise'
  | 'triangular_noise'
  | 'ordered'
  | 'screened_blue_noise'
  | 'temporal_blue_noise'
  | 'adaptive_threshold';

export function resolveDitherKind(config: QRGeneratorConfig): string {
  if (typeof config.ditherKind === 'string' && config.ditherKind.length > 0)
    return config.ditherKind;
  if (config.ditherMode === 'blue_noise') return 'blue_noise';
  return 'error_diffusion';
}

export function resolveDiffusionKernel(
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

export function resolveOrderedMatrixName(
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

export function resolveThresholdPattern(ditherKind: string): DitherThresholdPattern {
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

export function isThresholdOnlyDitherKind(ditherKind: string): boolean {
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

export const COLOR_PACKED_FLAG = 0x01000000;

export function pixelIndex(x: number, y: number, stride: number): number {
  return y * stride + x;
}

export function packColor(r: number, g: number, b: number): number {
  return COLOR_PACKED_FLAG | (r << 16) | (g << 8) | b;
}

export function unpackColor(value: number): RGBWithMeta | null {
  if ((value & COLOR_PACKED_FLAG) === 0) return null;
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
}

export function bitsToMatrix(bits: Uint8Array, size: number): boolean[][] {
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

export function packedColorsToMatrix(colors: Uint32Array, size: number): (RGBWithMeta | null)[][] {
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

export type ReadbackCtx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type SharedReadbackEntry = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: ReadbackCtx;
  createCanvasFn: CreateCanvasFn;
  inUse: boolean;
  lastUsedAt: number;
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
};

export type SharedReadbackLease = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: ReadbackCtx;
  release: () => void;
};

export const MAX_SHARED_READBACK_CANVASES = 4;
export const sharedReadbackCache = new Map<number, SharedReadbackEntry>();

export type DitherStaticState = {
  key: string;
  kernelName: DiffusionKernel;
  kernel: DiffusionKernelDef;
  noiseTile: ReturnType<typeof generateBlueNoiseTile>;
  orderedMatrix: number[][];
  orderedH: number;
  orderedW: number;
  orderedDivisor: number;
  whiteNoiseField: Float32Array;
  gaussianNoiseField: Float32Array;
  triangularNoiseField: Float32Array;
};

export const MAX_DITHER_STATIC_STATES = 24;
export const ditherStaticStateCache = new Map<string, DitherStaticState>();
export const blueNoiseTileCache = new Map<string, ReturnType<typeof generateBlueNoiseTile>>();

export function get2DContext(canvas: HTMLCanvasElement | OffscreenCanvas): ReadbackCtx | null {
  return (
    (canvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as ReadbackCtx | null) ??
    (canvas.getContext('2d') as ReadbackCtx | null)
  );
}

export function trimSharedReadbackCache(): void {
  if (sharedReadbackCache.size <= MAX_SHARED_READBACK_CANVASES) return;
  const entries = [...sharedReadbackCache.entries()]
    .filter(([, entry]) => !entry.inUse)
    .sort((a, b) => a[1].lastUsedAt - b[1].lastUsedAt);
  while (sharedReadbackCache.size > MAX_SHARED_READBACK_CANVASES && entries.length > 0) {
    const [size, entry] = entries.shift()!;
    sharedReadbackCache.delete(size);
    entry.releaseCanvasFn?.(entry.canvas);
  }
}

export async function acquireSharedReadbackCanvas(
  scaledSize: number,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<SharedReadbackLease | null> {
  const existing = sharedReadbackCache.get(scaledSize);
  const canReuseExisting =
    !!existing &&
    existing.createCanvasFn === createCanvasFn &&
    existing.releaseCanvasFn === releaseCanvasFn;
  if (canReuseExisting && existing && !existing.inUse) {
    existing.inUse = true;
    existing.lastUsedAt = Date.now();
    return {
      canvas: existing.canvas,
      ctx: existing.ctx,
      release: () => {
        existing.inUse = false;
        existing.lastUsedAt = Date.now();
      },
    };
  }
  if (existing && !canReuseExisting && !existing.inUse) {
    sharedReadbackCache.delete(scaledSize);
    existing.releaseCanvasFn?.(existing.canvas);
  }

  const canvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = get2DContext(canvas);
  if (!ctx) {
    releaseCanvasFn?.(canvas);
    return null;
  }

  if (!existing?.inUse) {
    const entry: SharedReadbackEntry = {
      canvas,
      ctx,
      createCanvasFn,
      inUse: true,
      lastUsedAt: Date.now(),
      releaseCanvasFn,
    };
    sharedReadbackCache.set(scaledSize, entry);
    trimSharedReadbackCache();
    return {
      canvas: entry.canvas,
      ctx: entry.ctx,
      release: () => {
        entry.inUse = false;
        entry.lastUsedAt = Date.now();
      },
    };
  }

  // Shared canvas for this size is busy; use a temporary canvas.
  return {
    canvas,
    ctx,
    release: () => {
      releaseCanvasFn?.(canvas);
    },
  };
}

export async function readOverlayPixelsAtSize(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  scaledSize: number,
  createCanvasFn: CreateCanvasFn,
  releaseCanvasFn?: (canvas: HTMLCanvasElement | OffscreenCanvas) => void
): Promise<Uint8ClampedArray | null> {
  if (overlayCanvas.width === scaledSize && overlayCanvas.height === scaledSize) {
    const directCtx = get2DContext(overlayCanvas);
    if (directCtx) {
      return directCtx.getImageData(0, 0, scaledSize, scaledSize).data;
    }
  }

  const lease = await acquireSharedReadbackCanvas(scaledSize, createCanvasFn, releaseCanvasFn);
  if (!lease) return null;
  try {
    lease.ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);
    return lease.ctx.getImageData(0, 0, scaledSize, scaledSize).data;
  } finally {
    lease.release();
  }
}

export function getBlueNoiseTileCached(
  tileSize: number,
  seed: number
): ReturnType<typeof generateBlueNoiseTile> {
  const key = `${tileSize}:${seed}`;
  const existing = blueNoiseTileCache.get(key);
  if (existing) return existing;
  const tile = generateBlueNoiseTile(tileSize, seed);
  blueNoiseTileCache.set(key, tile);
  if (blueNoiseTileCache.size > MAX_DITHER_STATIC_STATES) {
    const oldestKey = blueNoiseTileCache.keys().next().value;
    if (oldestKey) blueNoiseTileCache.delete(oldestKey);
  }
  return tile;
}

export function buildDitherStaticStateKey(args: {
  ditherKind: string;
  tileSize: number;
  seed: number;
  orderedMatrixName: OrderedMatrix;
  kernelName: DiffusionKernel;
  colorDitherMode: string;
  scaledSize: number;
}): string {
  return [
    args.ditherKind,
    args.tileSize,
    args.seed,
    args.orderedMatrixName,
    args.kernelName,
    args.colorDitherMode,
    args.scaledSize,
  ].join('|');
}

export function getDitherStaticState(args: {
  ditherKind: string;
  tileSize: number;
  seed: number;
  orderedMatrixName: OrderedMatrix;
  kernelName: DiffusionKernel;
  colorDitherMode: string;
  scaledSize: number;
}): DitherStaticState {
  const key = buildDitherStaticStateKey(args);
  const existing = ditherStaticStateCache.get(key);
  if (existing) return existing;

  const kernel = DIFFUSION_KERNELS[args.kernelName] ?? DIFFUSION_KERNELS.floyd_steinberg;
  const noiseTile = getBlueNoiseTileCached(args.tileSize, args.seed);
  const orderedMatrix = getOrderedMatrix(args.orderedMatrixName);
  const orderedH = orderedMatrix.length;
  const orderedW = orderedMatrix[0]?.length ?? orderedH;
  const orderedDivisor = Math.max(1, orderedH * orderedW);

  const pixelCount = args.scaledSize * args.scaledSize;
  const whiteNoiseField = new Float32Array(pixelCount);
  const gaussianNoiseField = new Float32Array(pixelCount);
  const triangularNoiseField = new Float32Array(pixelCount);
  const whiteNoiseRng = createRNG((args.seed ^ 0x9e3779b9) >>> 0);
  const gaussianNoiseRng = createRNG((args.seed ^ 0x7f4a7c15) >>> 0);
  const triangularNoiseRng = createRNG((args.seed ^ 0x94d049bb) >>> 0);
  for (let i = 0; i < pixelCount; i++) {
    whiteNoiseField[i] = whiteNoiseRng();
    const u1 = Math.max(1e-6, gaussianNoiseRng());
    const u2 = gaussianNoiseRng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    gaussianNoiseField[i] = clamp01(0.5 + z * 0.18);
    triangularNoiseField[i] = (triangularNoiseRng() + triangularNoiseRng()) * 0.5;
  }

  const created: DitherStaticState = {
    key,
    kernelName: args.kernelName,
    kernel,
    noiseTile,
    orderedMatrix,
    orderedH,
    orderedW,
    orderedDivisor,
    whiteNoiseField,
    gaussianNoiseField,
    triangularNoiseField,
  };
  ditherStaticStateCache.set(key, created);
  if (ditherStaticStateCache.size > MAX_DITHER_STATIC_STATES) {
    const oldestKey = ditherStaticStateCache.keys().next().value;
    if (oldestKey) ditherStaticStateCache.delete(oldestKey);
  }
  return created;
}

export function computeBWFirstShade(
  overlayBrightness: number,
  textureAmount: number,
  noiseVariation: number,
  qrIsDark: boolean
): number {
  if (qrIsDark) {
    const darkRange = 100;
    let normalizedShade = (1 - overlayBrightness) * textureAmount;
    normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);
    return Math.floor((1 - normalizedShade) * darkRange);
  }
  const lightMin = 155;
  const lightRange = 100;
  let normalizedShade = overlayBrightness * textureAmount;
  normalizedShade = clamp01(normalizedShade + noiseVariation * textureAmount);
  if (textureAmount === 0) return 255;
  return lightMin + Math.floor(normalizedShade * lightRange);
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
export function computeFinalShade(
  overlayBrightness: number,
  textureAmount: number,
  noiseVariation: number,
  qrIsDark: boolean,
  moduleRow: number,
  moduleCol: number,
  moduleCount: number,
  version: number,
  config: QRGeneratorConfig
): number {
  const shade = computeBWFirstShade(overlayBrightness, textureAmount, noiseVariation, qrIsDark);
  if (shouldLockModule(moduleRow, moduleCol, moduleCount, version, config)) {
    return qrIsDark ? 0 : 255;
  }
  return shade;
}

export async function generateBWFirstMatrix(
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

  const data = await readOverlayPixelsAtSize(
    overlayCanvas,
    scaledSize,
    createCanvasFn,
    releaseCanvasFn
  );
  if (!data) {
    return createEmptyMatrix(scaledSize, scale, effectiveIntensity);
  }

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
    const currentShade = rgbToLumaSrgb(clampByte(rOut), clampByte(gOut), clampByte(bOut)) * 255;
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
  const blueNoiseTile = getBlueNoiseTileCached(tileSize, seed);

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

      matrixBits[sampleIdx] = qrIsDark ? 1 : 0;

      let overlayBrightness = rgbToLumaSrgb(r, g, b);
      overlayBrightness = overlayBrightness ** contrastPower;

      const noise = sampleBlueNoise(x, y, blueNoiseTile, tileSize);
      const noiseVariation = (noise - 0.5) * 0.3;

      const shade = computeFinalShade(
        overlayBrightness,
        textureAmount,
        noiseVariation,
        qrIsDark,
        moduleRow,
        moduleCol,
        moduleCount,
        version,
        config
      );

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

export function luma01(r: number, g: number, b: number): number {
  return rgbToLumaSrgb(r, g, b);
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function shapeOverlayDarkness(overlayDark: number): number {
  const t = clamp01(overlayDark);
  // Preserve shadow anchor while lifting mids so subject structure survives dithering.
  const gammaLift = t ** 0.9;
  const smooth = t * t * (3 - 2 * t);
  const midBoost = gammaLift + 0.14 * (1 - Math.abs(2 * smooth - 1));
  return clamp01(0.58 * gammaLift + 0.42 * midBoost);
}

export function moduleCenterWeight(x: number, y: number, scale: number): number {
  const fx = ((x % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const fy = ((y % scale) + 0.5) / Math.max(1, scale) - 0.5;
  const r2 = fx * fx + fy * fy;
  const radial = Math.max(0, 1 - r2 * 3.8);
  return radial * radial;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Distribute error to neighboring pixels using the specified kernel.
 * Supports serpentine scanning by mirroring x-offsets when scanning right-to-left.
 */
export function distributeError(
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

export function createEmptyMatrix(
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
export function shouldLockModule(
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

export function isFinderModuleOrSeparator(
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

export function isFixedDarkModule(row: number, col: number, moduleCount: number): boolean {
  return row === moduleCount - 8 && col === 8;
}

export function isFunctionalPatternModule(
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

export type ConstraintCandidate = {
  y: number;
  x: number;
  score: number;
  toDark: boolean;
  scanGain: number;
};

export interface ConstraintCtx {
  qr: QRCodeInstance;
  matrixBits: Uint8Array;
  desire: Float32Array;
  moduleCount: number;
  scale: number;
  scaledSize: number;
  version: number;
  config: QRGeneratorConfig;
  total: number;
  centerRadius: number;
  centerArea: number;
  moduleCenter: number;
  baseDarkMin: number;
  baseLightMax: number;
  strictScanGate: boolean;
  finderBlendGuidance: boolean;
  occViolationWeight: number;
  centerViolationWeight: number;
  scanScoreWeight: number;
  artPenaltyWeight: number;
  edgeBandPenalty: number;
  centerPixelBonus: number;
  occupancies: number[][];
  centerOcc: number[][];
  darkMinMap: number[][];
  lightMaxMap: number[][];
  darkCenterMinMap: number[][];
  lightCenterMaxMap: number[][];
  locked: boolean[][];
}

export function computeModuleOccupancy(
  ctx: ConstraintCtx,
  mr: number,
  mc: number
): { darkCount: number; centerDarkCount: number; desireSum: number; desireSq: number } {
  const y0 = mr * ctx.scale;
  const x0 = mc * ctx.scale;
  let darkCount = 0;
  let centerDarkCount = 0;
  let desireSum = 0;
  let desireSq = 0;
  for (let y = 0; y < ctx.scale; y++) {
    for (let x = 0; x < ctx.scale; x++) {
      const yy = y0 + y;
      const xx = x0 + x;
      const dark = ctx.matrixBits[pixelIndex(xx, yy, ctx.scaledSize)] === 1;
      if (dark) darkCount++;
      if (
        dark &&
        Math.abs(y - ctx.moduleCenter) <= ctx.centerRadius &&
        Math.abs(x - ctx.moduleCenter) <= ctx.centerRadius
      ) {
        centerDarkCount++;
      }
      const d = ctx.desire[pixelIndex(x0 + x, y0 + y, ctx.scaledSize)];
      desireSum += d;
      desireSq += d * d;
    }
  }
  return { darkCount, centerDarkCount, desireSum, desireSq };
}

export function updateSingleModuleStats(ctx: ConstraintCtx, mr: number, mc: number): void {
  const { darkCount, centerDarkCount, desireSum, desireSq } = computeModuleOccupancy(ctx, mr, mc);
  ctx.occupancies[mr][mc] = darkCount / ctx.total;
  ctx.centerOcc[mr][mc] = centerDarkCount / Math.max(1, ctx.centerArea);
  const mean = desireSum / ctx.total;
  const variance = Math.max(0, desireSq / ctx.total - mean * mean);
  const contrast = clamp01(Math.sqrt(variance) * 3.2);
  ctx.darkMinMap[mr][mc] = clamp01(
    Math.max(0.34, Math.min(0.5, ctx.baseDarkMin - contrast * 0.02))
  );
  ctx.lightMaxMap[mr][mc] = clamp01(
    Math.max(0.5, Math.min(0.66, ctx.baseLightMax + contrast * 0.02))
  );
  if (ctx.strictScanGate) {
    ctx.darkCenterMinMap[mr][mc] = clamp01(
      Math.max(
        ctx.darkMinMap[mr][mc] + 0.12,
        Math.min(0.68, ctx.darkMinMap[mr][mc] + 0.2 - contrast * 0.04)
      )
    );
    ctx.lightCenterMaxMap[mr][mc] = clamp01(
      Math.min(
        ctx.lightMaxMap[mr][mc] - 0.12,
        Math.max(0.34, ctx.lightMaxMap[mr][mc] - 0.2 + contrast * 0.04)
      )
    );
  } else {
    ctx.darkCenterMinMap[mr][mc] = clamp01(
      Math.max(
        ctx.darkMinMap[mr][mc] + 0.06,
        Math.min(0.56, ctx.darkMinMap[mr][mc] + 0.12 - contrast * 0.03)
      )
    );
    ctx.lightCenterMaxMap[mr][mc] = clamp01(
      Math.min(
        ctx.lightMaxMap[mr][mc] - 0.06,
        Math.max(0.44, ctx.lightMaxMap[mr][mc] - 0.12 + contrast * 0.03)
      )
    );
  }
  if (ctx.finderBlendGuidance && isFunctionalPatternModule(mr, mc, ctx.moduleCount, ctx.version)) {
    if (ctx.qr.isDark(mr, mc)) {
      ctx.darkMinMap[mr][mc] = Math.max(ctx.darkMinMap[mr][mc], 0.58);
      ctx.darkCenterMinMap[mr][mc] = Math.max(ctx.darkCenterMinMap[mr][mc], 0.74);
    } else {
      ctx.lightMaxMap[mr][mc] = Math.min(ctx.lightMaxMap[mr][mc], 0.26);
      ctx.lightCenterMaxMap[mr][mc] = Math.min(ctx.lightCenterMaxMap[mr][mc], 0.14);
    }
  }
}

export function recomputeConstraintStats(ctx: ConstraintCtx): void {
  for (let mr = 0; mr < ctx.moduleCount; mr++) {
    for (let mc = 0; mc < ctx.moduleCount; mc++) {
      updateSingleModuleStats(ctx, mr, mc);
    }
  }
}

export interface ModuleViolation {
  occViolation: number;
  centerViolation: number;
  toDark: boolean;
}

export function computeModuleViolation(
  qrIsDark: boolean,
  occ: number,
  cOcc: number,
  darkMin: number,
  lightMax: number,
  darkCenterMin: number,
  lightCenterMax: number
): ModuleViolation | null {
  let occViolation = 0;
  let centerViolation = 0;
  let toDark = false;
  if (qrIsDark && occ < darkMin) {
    occViolation = darkMin - occ;
    toDark = true;
  } else if (!qrIsDark && occ > lightMax) {
    occViolation = occ - lightMax;
  }
  if (qrIsDark && cOcc < darkCenterMin) {
    centerViolation = darkCenterMin - cOcc;
    toDark = true;
  } else if (!qrIsDark && cOcc > lightCenterMax) {
    centerViolation = cOcc - lightCenterMax;
    toDark = false;
  }
  if (occViolation <= 0 && centerViolation <= 0) return null;
  return { occViolation, centerViolation, toDark };
}

export function scorePixelCandidate(
  current: boolean,
  toDark: boolean,
  inCenter: boolean,
  d: number,
  edgeBand: boolean,
  occViolation: number,
  centerViolation: number,
  total: number,
  centerArea: number,
  occViolationWeight: number,
  centerViolationWeight: number,
  scanScoreWeight: number,
  artPenaltyWeight: number,
  edgeBandPenalty: number,
  centerPixelBonus: number
): { score: number; scanGain: number } | null {
  if (toDark === current) return null;
  const occGain = occViolation > 0 ? Math.min(occViolation, 1 / total) * occViolationWeight : 0;
  const centerGain =
    inCenter && centerViolation > 0
      ? Math.min(centerViolation, 1 / centerArea) * centerViolationWeight
      : 0;
  const scanGain = occGain + centerGain;
  if (scanGain <= 0) return null;

  const beforeErr = Math.abs((current ? 1 : 0) - d);
  const afterErr = Math.abs((toDark ? 1 : 0) - d);
  const artPenalty = afterErr - beforeErr;
  const edgePen = edgeBand ? edgeBandPenalty : 0;
  const centerBonus = inCenter ? centerPixelBonus : 0;
  const score = scanGain * scanScoreWeight - artPenalty * artPenaltyWeight - edgePen + centerBonus;
  return { score, scanGain };
}

export function scoreModulePixels(
  ctx: ConstraintCtx,
  mr: number,
  mc: number,
  occViolation: number,
  centerViolation: number,
  toDark: boolean,
  out: ConstraintCandidate[]
): void {
  const {
    matrixBits,
    desire,
    scale,
    scaledSize,
    total,
    centerRadius,
    centerArea,
    moduleCenter,
    occViolationWeight,
    centerViolationWeight,
    scanScoreWeight,
    artPenaltyWeight,
    edgeBandPenalty,
    centerPixelBonus,
  } = ctx;

  const y0 = mr * scale;
  const x0 = mc * scale;
  for (let y = 0; y < scale; y++) {
    for (let x = 0; x < scale; x++) {
      const yy = y0 + y;
      const xx = x0 + x;
      const current = matrixBits[pixelIndex(xx, yy, scaledSize)] === 1;
      const inCenter =
        Math.abs(y - moduleCenter) <= centerRadius && Math.abs(x - moduleCenter) <= centerRadius;
      const edgeBand = x <= 1 || y <= 1 || x >= scale - 2 || y >= scale - 2;
      const d = desire[pixelIndex(xx, yy, scaledSize)];

      const result = scorePixelCandidate(
        current,
        toDark,
        inCenter,
        d,
        edgeBand,
        occViolation,
        centerViolation,
        total,
        centerArea,
        occViolationWeight,
        centerViolationWeight,
        scanScoreWeight,
        artPenaltyWeight,
        edgeBandPenalty,
        centerPixelBonus
      );
      if (result) {
        out.push({ y: yy, x: xx, score: result.score, toDark, scanGain: result.scanGain });
      }
    }
  }
}

export function buildConstraintCandidates(ctx: ConstraintCtx): {
  candidates: ConstraintCandidate[];
  totalViolationEnergy: number;
} {
  const {
    qr,
    moduleCount,
    occupancies,
    centerOcc,
    darkMinMap,
    lightMaxMap,
    darkCenterMinMap,
    lightCenterMaxMap,
    locked,
    occViolationWeight,
    centerViolationWeight,
  } = ctx;
  const candidates: ConstraintCandidate[] = [];
  let totalViolationEnergy = 0;

  for (let mr = 0; mr < moduleCount; mr++) {
    for (let mc = 0; mc < moduleCount; mc++) {
      if (locked[mr][mc]) continue;
      if (isFixedDarkModule(mr, mc, moduleCount)) continue;
      const violation = computeModuleViolation(
        qr.isDark(mr, mc),
        occupancies[mr][mc],
        centerOcc[mr][mc],
        darkMinMap[mr][mc],
        lightMaxMap[mr][mc],
        darkCenterMinMap[mr][mc],
        lightCenterMaxMap[mr][mc]
      );
      if (!violation) continue;
      totalViolationEnergy +=
        violation.occViolation * occViolationWeight +
        violation.centerViolation * centerViolationWeight;
      scoreModulePixels(
        ctx,
        mr,
        mc,
        violation.occViolation,
        violation.centerViolation,
        violation.toDark,
        candidates
      );
    }
  }
  return { candidates, totalViolationEnergy };
}

export function computeConstraintViolationEnergy(ctx: ConstraintCtx): number {
  let energy = 0;
  for (let mr = 0; mr < ctx.moduleCount; mr++) {
    for (let mc = 0; mc < ctx.moduleCount; mc++) {
      if (ctx.locked[mr][mc]) continue;
      if (isFixedDarkModule(mr, mc, ctx.moduleCount)) continue;
      const qrIsDark = ctx.qr.isDark(mr, mc);
      if (qrIsDark) {
        const occViolation = Math.max(0, ctx.darkMinMap[mr][mc] - ctx.occupancies[mr][mc]);
        const centerViolation = Math.max(0, ctx.darkCenterMinMap[mr][mc] - ctx.centerOcc[mr][mc]);
        energy +=
          occViolation * ctx.occViolationWeight + centerViolation * ctx.centerViolationWeight;
      } else {
        const occViolation = Math.max(0, ctx.occupancies[mr][mc] - ctx.lightMaxMap[mr][mc]);
        const centerViolation = Math.max(0, ctx.centerOcc[mr][mc] - ctx.lightCenterMaxMap[mr][mc]);
        energy +=
          occViolation * ctx.occViolationWeight + centerViolation * ctx.centerViolationWeight;
      }
    }
  }
  return energy;
}

export function initConstraintContext(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  desire: Float32Array,
  moduleCount: number,
  scale: number,
  scaledSize: number,
  version: number,
  config: QRGeneratorConfig
): { cctx: ConstraintCtx; maxIters: number } | null {
  const scanGateProfile = config.scanGateProfile ?? 'full';
  const strictScanGate = scanGateProfile === 'full';
  const baseDarkMin = clamp01(config.darkMinOccupancy ?? 0.38);
  const baseLightMax = clamp01(config.lightMaxOccupancy ?? 0.62);
  if (baseDarkMin <= 0.001 && baseLightMax >= 0.999) return null;

  const total = scale * scale;
  const maxIters = Math.max(1, Math.min(16, config.optimizeIterations ?? 8));
  const centerRadius = Math.max(1, Math.floor(scale * (strictScanGate ? 0.18 : 0.1)));
  const centerArea = (centerRadius * 2 + 1) * (centerRadius * 2 + 1);
  const moduleCenter = (scale - 1) / 2;
  const occViolationWeight = strictScanGate ? 0.35 : 0.55;
  const centerViolationWeight = strictScanGate ? 1.8 : 0.9;
  const scanScoreWeight = strictScanGate ? 12.5 : 8.8;
  const artPenaltyWeight = strictScanGate ? 1.7 : 2.4;
  const edgeBandPenalty = strictScanGate ? 0.44 : 0.14;
  const centerPixelBonus = strictScanGate ? 0.07 : 0.01;
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

  return {
    cctx: {
      qr,
      matrixBits,
      desire,
      moduleCount,
      scale,
      scaledSize,
      version,
      config,
      total,
      centerRadius,
      centerArea,
      moduleCenter,
      baseDarkMin,
      baseLightMax,
      strictScanGate,
      finderBlendGuidance,
      occViolationWeight,
      centerViolationWeight,
      scanScoreWeight,
      artPenaltyWeight,
      edgeBandPenalty,
      centerPixelBonus,
      occupancies,
      centerOcc,
      darkMinMap,
      lightMaxMap,
      darkCenterMinMap,
      lightCenterMaxMap,
      locked,
    },
    maxIters,
  };
}

export function applyRankedCandidates(
  matrixBits: Uint8Array,
  scaledSize: number,
  candidates: ConstraintCandidate[],
  totalViolationEnergy: number,
  total: number
): number {
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
  return applied;
}

export function enforceModuleConstraints(
  qr: QRCodeInstance,
  matrixBits: Uint8Array,
  desire: Float32Array,
  moduleCount: number,
  scale: number,
  scaledSize: number,
  version: number,
  config: QRGeneratorConfig
): void {
  const init = initConstraintContext(
    qr,
    matrixBits,
    desire,
    moduleCount,
    scale,
    scaledSize,
    version,
    config
  );
  if (!init) return;
  const { cctx, maxIters } = init;
  const total = scale * scale;

  recomputeConstraintStats(cctx);
  let prevViolationEnergy = computeConstraintViolationEnergy(cctx);

  for (let iter = 0; iter < maxIters; iter++) {
    const { candidates, totalViolationEnergy } = buildConstraintCandidates(cctx);

    if (totalViolationEnergy <= 1e-5) break;
    if (candidates.length === 0) break;

    candidates.sort((a, b) => b.score - a.score);

    const applied = applyRankedCandidates(
      matrixBits,
      scaledSize,
      candidates,
      totalViolationEnergy,
      total
    );

    if (applied === 0) break;
    recomputeConstraintStats(cctx);
    const newViolationEnergy = computeConstraintViolationEnergy(cctx);
    if (prevViolationEnergy - newViolationEnergy < 1e-4) break;
    prevViolationEnergy = newViolationEnergy;
  }

  // Do not add a post-center-lock pass; it re-imprints module structure.
}

export function countSameNeighbors(
  copy: Uint8Array,
  x: number,
  y: number,
  scaledSize: number,
  current: number
): number {
  let count = 0;
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue;
      if (copy[pixelIndex(x + ox, y + oy, scaledSize)] === current) count++;
    }
  }
  return count;
}

export function removeIsolatedSpeckles(
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
      if (countSameNeighbors(copy, x, y, scaledSize, current) <= 1) {
        matrixBits[currentIdx] = qr.isDark(mr, mc) ? 1 : 0;
      }
    }
  }
}

export function computeQualityMetrics(
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

export function computeDitherThreshold(
  x: number,
  y: number,
  sampleIdx: number,
  overlayDark: number,
  mix: number,
  thresholdPattern: DitherThresholdPattern,
  staticState: DitherStaticState,
  noiseTile: ReturnType<typeof generateBlueNoiseTile>,
  tileSize: number,
  temporalOffsetX: number,
  temporalOffsetY: number
): number {
  const centered = (value01: number): number => clamp01(0.5 + (value01 - 0.5) * mix);
  switch (thresholdPattern) {
    case 'white_noise':
      return centered(staticState.whiteNoiseField[sampleIdx]);
    case 'gaussian_noise':
      return centered(staticState.gaussianNoiseField[sampleIdx]);
    case 'triangular_noise':
      return centered(staticState.triangularNoiseField[sampleIdx]);
    case 'ordered': {
      const rank =
        staticState.orderedMatrix[y % staticState.orderedH]?.[x % staticState.orderedW] ?? 0;
      return centered((rank + 0.5) / staticState.orderedDivisor);
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
}

export interface DitherResolvedConfig {
  intensity: number;
  version: number;
  serpentine: boolean;
  colorDitherMode: string;
  useColorDither: boolean;
  ditherKind: string;
  thresholdPattern: DitherThresholdPattern;
  thresholdOnly: boolean;
  kernelName: DiffusionKernel;
  tileSize: number;
  staticState: DitherStaticState;
  noiseTile: ReturnType<typeof generateBlueNoiseTile>;
  temporalOffsetX: number;
  temporalOffsetY: number;
  mix: number;
  qrBitBiasStrength: number;
}

export function buildDitherResolvedConfig(
  config: QRGeneratorConfig,
  moduleCount: number,
  effectiveIntensity: number,
  scaledSize: number
): DitherResolvedConfig {
  const rawIntensity = effectiveIntensity;
  const intensity = clamp01(rawIntensity);
  const rawStrength = config.ditherStrength ?? 0.85;
  const ditherStrength = rawStrength > 1 ? rawStrength / 100 : rawStrength;
  const ditherScale = Math.max(0, config.ditherScale ?? 1);
  const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

  const serpentine = config.ditherSerpentine ?? true;
  const colorDitherMode = config.colorDither ?? 'none';
  const useColorDither = colorDitherMode !== 'none';
  const ditherKind = resolveDitherKind(config);
  const thresholdPattern = resolveThresholdPattern(ditherKind);
  const thresholdOnly = isThresholdOnlyDitherKind(ditherKind);
  const kernelName = resolveDiffusionKernel(config.diffusionKernel, ditherKind);
  const seed = config.blueNoiseSeed ?? config.seed ?? 1337;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const orderedMatrixName = resolveOrderedMatrixName(ditherKind, config.orderedMatrix);
  const staticState = getDitherStaticState({
    ditherKind,
    tileSize,
    seed,
    orderedMatrixName,
    kernelName,
    colorDitherMode,
    scaledSize,
  });
  const noiseTile = staticState.noiseTile;
  const frameIndex = config.frameIndex ?? 0;
  const temporalOffsetX = (frameIndex * 17) % tileSize;
  const temporalOffsetY = (frameIndex * 29) % tileSize;
  const mix = clamp01(intensity * ditherStrength * ditherScale);
  const qrBitBiasStrength = clamp01(config.qrBitBiasStrength ?? 0);

  return {
    intensity,
    version,
    serpentine,
    colorDitherMode,
    useColorDither,
    ditherKind,
    thresholdPattern,
    thresholdOnly,
    kernelName,
    tileSize,
    staticState,
    noiseTile,
    temporalOffsetX,
    temporalOffsetY,
    mix,
    qrBitBiasStrength,
  };
}

export function serpentineRowParams(
  y: number,
  scaledSize: number,
  serpentine: boolean
): { leftToRight: boolean; startX: number; endX: number; deltaX: number } {
  const leftToRight = serpentine ? y % 2 === 0 : true;
  const startX = leftToRight ? 0 : scaledSize - 1;
  const endX = leftToRight ? scaledSize : -1;
  const deltaX = leftToRight ? 1 : -1;
  return { leftToRight, startX, endX, deltaX };
}

export interface ErrorDiffusionPixelCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  data: Uint8ClampedArray;
  scaledSize: number;
  scale: number;
  version: number;
  moduleCount: number;
  mix: number;
  thresholdOnly: boolean;
  useColorDither: boolean;
  qrBitBiasStrength: number;
  kernel: DiffusionKernelDef;
  sampleThreshold: (x: number, y: number, sampleIdx: number, overlayDark: number) => number;
}

export function computeBiasedDarkness(
  overlayDark: number,
  x: number,
  y: number,
  ctx: ErrorDiffusionPixelCtx,
  qrIsDark: boolean,
  fixedDarkUnlocked: boolean
): number {
  const centerW = moduleCenterWeight(x, y, ctx.scale);
  const qrBias = fixedDarkUnlocked
    ? 0
    : (qrIsDark ? 1 : -1) * ctx.qrBitBiasStrength * centerW * (0.45 + ctx.mix * 0.8);
  return clamp01(overlayDark + qrBias);
}

export function resolveDarkCandidate(
  ctx: ErrorDiffusionPixelCtx,
  biasedOverlayDark: number,
  threshold: number,
  sampleIdx: number,
  x: number,
  y: number,
  errors: Float32Array,
  leftToRight: boolean
): boolean {
  if (ctx.thresholdOnly && !ctx.useColorDither) {
    return biasedOverlayDark > threshold;
  }
  const adjusted = biasedOverlayDark + errors[sampleIdx];
  const isDark = adjusted > threshold;
  const err = (biasedOverlayDark - (isDark ? 1 : 0)) * ctx.mix;
  distributeError(errors, x, y, err, ctx.kernel, ctx.scaledSize, leftToRight);
  return isDark;
}

export function processErrorDiffusionPixel(
  ctx: ErrorDiffusionPixelCtx,
  x: number,
  y: number,
  leftToRight: boolean,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array,
  errors: Float32Array
): void {
  const sampleIdx = pixelIndex(x, y, ctx.scaledSize);
  const idx = sampleIdx * 4;
  const r = ctx.data[idx];
  const g = ctx.data[idx + 1];
  const b = ctx.data[idx + 2];

  const moduleRow = Math.floor(y / ctx.scale);
  const moduleCol = Math.floor(x / ctx.scale);
  const qrIsDark = ctx.qr.isDark(moduleRow, moduleCol);
  const moduleLocked = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config
  );
  const fixedDarkUnlocked =
    !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, ctx.moduleCount);

  const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
  const biasedOverlayDark = computeBiasedDarkness(
    overlayDark,
    x,
    y,
    ctx,
    qrIsDark,
    fixedDarkUnlocked
  );
  const threshold = ctx.sampleThreshold(x, y, sampleIdx, overlayDark);

  const isDarkCandidate = resolveDarkCandidate(
    ctx,
    biasedOverlayDark,
    threshold,
    sampleIdx,
    x,
    y,
    errors,
    leftToRight
  );

  // Apply structural lock at the final write stage only.
  // This keeps diffusion state consistent so toggling locks doesn't re-shape the entire texture.
  matrixBits[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : isDarkCandidate ? 1 : 0;
  // Desire is artwork-driven and used later for minimal-cost correction ranking.
  desire[sampleIdx] = moduleLocked ? (qrIsDark ? 1 : 0) : overlayDark;
  if (ctx.config.colorMode !== 'bw') {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}

export interface BlueNoisePixelCtx {
  qr: QRCodeInstance;
  config: QRGeneratorConfig;
  data: Uint8ClampedArray;
  scaledSize: number;
  scale: number;
  version: number;
  moduleCount: number;
  intensity: number;
  effectiveBitBias: number;
  scanGateActive: boolean;
  tile: ReturnType<typeof generateBlueNoiseTile>;
  tileSize: number;
}

export function writeLockedModulePixel(
  ctx: BlueNoisePixelCtx,
  sampleIdx: number,
  qrIsDark: boolean,
  r: number,
  g: number,
  b: number,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array
): void {
  matrixBits[sampleIdx] = qrIsDark ? 1 : 0;
  if (ctx.config.colorMode !== 'bw') {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
  desire[sampleIdx] = qrIsDark ? 1 : 0;
}

export function processBlueNoisePixel(
  ctx: BlueNoisePixelCtx,
  x: number,
  y: number,
  matrixBits: Uint8Array,
  packedColors: Uint32Array,
  desire: Float32Array
): void {
  const sampleIdx = pixelIndex(x, y, ctx.scaledSize);
  const idx = sampleIdx * 4;
  const r = ctx.data[idx];
  const g = ctx.data[idx + 1];
  const b = ctx.data[idx + 2];

  const moduleRow = Math.floor(y / ctx.scale);
  const moduleCol = Math.floor(x / ctx.scale);
  const qrIsDark = ctx.qr.isDark(moduleRow, moduleCol);
  const moduleLocked = shouldLockModule(
    moduleRow,
    moduleCol,
    ctx.moduleCount,
    ctx.version,
    ctx.config
  );
  const fixedDarkUnlocked =
    !moduleLocked && isFixedDarkModule(moduleRow, moduleCol, ctx.moduleCount);

  if (moduleLocked) {
    writeLockedModulePixel(ctx, sampleIdx, qrIsDark, r, g, b, matrixBits, packedColors, desire);
    return;
  }

  const overlayDark = shapeOverlayDarkness(1 - luma01(r, g, b));
  // ART-FIRST: base decision solely on artwork luminance + global noise field.
  const centerW = moduleCenterWeight(x, y, ctx.scale);
  const polarityBoost = ctx.scanGateActive ? 1.18 : 1;
  const polarityBias =
    (qrIsDark ? 1 : -1) * (0.14 + ctx.intensity * 0.18) * (0.4 + centerW * 0.6) * polarityBoost;
  const qrBias = fixedDarkUnlocked
    ? 0
    : (qrIsDark ? 1 : -1) * ctx.effectiveBitBias * centerW * (0.45 + ctx.intensity * 0.8);
  const decisionGain = (0.64 + ctx.intensity * 0.44) * (ctx.scanGateActive ? 1.04 : 1);
  const d = clamp01((overlayDark + qrBias + polarityBias) * decisionGain);
  desire[sampleIdx] = clamp01(overlayDark + (qrIsDark ? 0.12 : -0.12));

  const n = sampleBlueNoise(x, y, ctx.tile, ctx.tileSize);
  const isDark = n < d;

  matrixBits[sampleIdx] = isDark ? 1 : 0;
  if (ctx.config.colorMode !== 'bw') {
    packedColors[sampleIdx] = packColor(r, g, b);
  }
}

export function buildStrictConstraintConfig(
  config: QRGeneratorConfig,
  scanGateActive: boolean,
  intensity: number
): QRGeneratorConfig {
  return {
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
}

export function aggregateModuleHalftoneData(
  ditheredResult: PixelDecisionMatrix,
  moduleData: Uint8ClampedArray | null,
  mr: number,
  mc: number,
  scale: number,
  moduleCount: number,
  effectiveIntensity: number,
  densityInfluence: number,
  overlayBrightness: Float32Array,
  overlayColorsPacked: Uint32Array
): void {
  const total = scale * scale;
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
