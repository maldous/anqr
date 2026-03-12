/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

import { createLogger } from '../../infra/logging/logger';
import type { GradientConfig } from '../core/types';
import {
  calculateOptimalVersion,
  createShiftJISEncoder,
  getCompatibleMode,
  qrcode,
  resetStringToBytes,
  setStringToBytes,
} from '../qr-encoder';
import { decodeQR } from '../qr-decoder';
import { verifyQRStructure } from '../qr-spec';
import { qrMatrixCache } from './cache';
import { type CanvasFactory, CanvasPool, defaultBrowserCanvasFactory } from '../../platform/browser/canvas/canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from '../../domain/render/generator/drawing';
import {
  applyGeometricTransforms,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  preprocessOverlay,
} from '../../domain/render/overlay/overlay';
import { getAlignmentPositionsCached } from '../../domain/render/generator/pattern-helpers';
import { curveIntensity, getScaleFactor, prepareUnifiedOverlayData } from '../../domain/render/generator/pixel-matrix';
import { renderModules } from '../../domain/render/generator/render-loop';
import { generateScaledQR } from '../../domain/render/generator/scaled-render';
import type { OverlayData, QRCodeInstance, QRGeneratorConfig, QRMatrixResult } from './types';
import { hashCanvasContent, validateColor } from './utils';

const log = createLogger('GENERATE');

// Note: stringToBytes management is now handled via qr-encoder/string-bytes.ts

/**
 * Wrapper class that provides QRCodeInstance interface for a pre-computed boolean matrix.
 * Used by renderFromMatrix() to render QR-Art matrices with the full styling pipeline.
 */
class MatrixWrapper {
  private readonly matrix: boolean[][];
  private readonly moduleCount: number;

  constructor(matrix: boolean[][]) {
    this.matrix = matrix;
    this.moduleCount = matrix.length;
  }

  // Required by QRCodeInstance interface but not used for rendering
  addData(_data: string, _mode?: string): void {
    // No-op: matrix is already computed
  }

  // Required by QRCodeInstance interface but not used for rendering
  make(_maskPattern?: number): void {
    // No-op: matrix is already computed
  }

  getModuleCount(): number {
    return this.moduleCount;
  }

  isDark(row: number, col: number): boolean {
    return this.matrix[row]?.[col] ?? false;
  }
}

/**
 * Wrapper class that exposes a packed 0/1 matrix as QRCodeInstance.
 * Used to avoid expanding worker-returned QR-Art matrices before rendering.
 */
class PackedMatrixWrapper {
  private readonly packed: Uint8Array;
  private readonly moduleCount: number;

  constructor(packed: Uint8Array, moduleCount: number) {
    this.packed = packed;
    this.moduleCount = moduleCount;
  }

  addData(_data: string, _mode?: string): void {
    // No-op: matrix is already computed
  }

  make(_maskPattern?: number): void {
    // No-op: matrix is already computed
  }

  getModuleCount(): number {
    return this.moduleCount;
  }

  isDark(row: number, col: number): boolean {
    if (row < 0 || col < 0 || row >= this.moduleCount || col >= this.moduleCount) return false;
    return this.packed[row * this.moduleCount + col] === 1;
  }
}

async function simulateScenarioDecode(
  pool: CanvasPool,
  finalRaster: HTMLCanvasElement | OffscreenCanvas,
  scenario: { blur: number; exposure: number; skewX: number; skewY: number; downscale: number },
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>
): Promise<boolean> {
  const sim = await pool.acquire(finalRaster.width, finalRaster.height);
  try {
    const simCtx = sim.getContext('2d') as CanvasRenderingContext2D | null;
    if (!simCtx) return false;

    const dsW = Math.max(1, Math.round(finalRaster.width * scenario.downscale));
    const dsH = Math.max(1, Math.round(finalRaster.height * scenario.downscale));
    const ds = await pool.acquire(dsW, dsH);
    try {
      const dsCtx = ds.getContext('2d') as CanvasRenderingContext2D | null;
      if (!dsCtx) return false;
      dsCtx.imageSmoothingEnabled = true;
      dsCtx.drawImage(finalRaster as CanvasImageSource, 0, 0, dsW, dsH);

      if ('filter' in simCtx) {
        simCtx.filter = `blur(${scenario.blur}px)`;
      }
      simCtx.setTransform(1, -scenario.skewY / sim.height, scenario.skewX / sim.width, 1, 0, 0);
      simCtx.drawImage(
        ds as CanvasImageSource,
        0,
        0,
        dsW,
        dsH,
        0,
        0,
        Math.max(1, sim.width - Math.abs(scenario.skewX)),
        Math.max(1, sim.height - Math.abs(scenario.skewY))
      );
      simCtx.setTransform(1, 0, 0, 1, 0, 0);
      if ('filter' in simCtx) {
        simCtx.filter = 'none';
      }
      if (scenario.exposure !== 0) {
        simCtx.globalCompositeOperation = 'source-atop';
        if (scenario.exposure > 0) {
          simCtx.fillStyle = `rgba(255,255,255,${Math.min(0.35, scenario.exposure)})`;
        } else {
          simCtx.fillStyle = `rgba(0,0,0,${Math.min(0.35, Math.abs(scenario.exposure))})`;
        }
        simCtx.fillRect(0, 0, sim.width, sim.height);
        simCtx.globalCompositeOperation = 'source-over';
      }

      return await runDecode(sim);
    } finally {
      pool.release(ds);
    }
  } finally {
    pool.release(sim);
  }
}

function clampN(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

async function computeOverlayComplexity(
  pool: CanvasPool,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  sampleSize: number
): Promise<number> {
  if (!overlayCanvas) return 0;
  const analysisCanvas = await pool.acquire(sampleSize, sampleSize);
  try {
    analysisCanvas.width = sampleSize;
    analysisCanvas.height = sampleSize;
    const analysisCtx =
      (analysisCanvas.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null) ??
      (analysisCanvas.getContext('2d') as CanvasRenderingContext2D | null);
    if (!analysisCtx) return 0;

    analysisCtx.imageSmoothingEnabled = true;
    analysisCtx.imageSmoothingQuality = 'high';
    analysisCtx.clearRect(0, 0, sampleSize, sampleSize);
    analysisCtx.drawImage(overlayCanvas as CanvasImageSource, 0, 0, sampleSize, sampleSize);

    const pixels = analysisCtx.getImageData(0, 0, sampleSize, sampleSize).data;
    const sampleCount = sampleSize * sampleSize;
    const luma = new Float32Array(sampleCount);

    let sum = 0;
    for (let i = 0; i < sampleCount; i++) {
      const idx = i * 4;
      const value = (0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]) / 255;
      luma[i] = value;
      sum += value;
    }
    const mean = sum / Math.max(1, sampleCount);

    let variance = 0;
    let edge = 0;
    let edgeCount = 0;
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const idx = y * sampleSize + x;
        const v = luma[idx];
        const d = v - mean;
        variance += d * d;
        if (x + 1 < sampleSize) {
          edge += Math.abs(v - luma[idx + 1]);
          edgeCount++;
        }
        if (y + 1 < sampleSize) {
          edge += Math.abs(v - luma[idx + sampleSize]);
          edgeCount++;
        }
      }
    }
    const toneStd = Math.sqrt(variance / Math.max(1, sampleCount));
    const edgeDensity = edge / Math.max(1, edgeCount);
    return clampN(toneStd * 1.8 + edgeDensity * 1.2, 0, 1);
  } catch {
    return 0;
  } finally {
    pool.release(analysisCanvas);
  }
}

function computeScanGateRasterMetrics(
  src: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  config: QRGeneratorConfig
): { edgeImprint: number; toneStd: number } | null {
  const ctx = src.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return null;
  const { width, height } = src;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const grayAt = (x: number, y: number): number => {
    const xx = Math.max(0, Math.min(width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(height - 1, Math.round(y)));
    const i = (yy * width + xx) * 4;
    return (0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]) / 255;
  };

  const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
  const marginModules = Math.max(quietZoneMin, config.margin);
  const qrPitch = width / Math.max(1, moduleCount + marginModules * 2);
  const qrSpan = moduleCount * qrPitch;
  const qrStartX = (width - qrSpan) / 2;
  const qrStartY = (height - qrSpan) / 2;

  let boundary = 0;
  let nonBoundary = 0;
  let bc = 0;
  let nc = 0;
  let sum = 0;
  let sumSq = 0;
  let cnt = 0;

  for (let yy = qrStartY + 1; yy < qrStartY + qrSpan - 1; yy += Math.max(1, qrPitch / 2)) {
    for (let xx = qrStartX + 1; xx < qrStartX + qrSpan - 1; xx += 1) {
      const g = grayAt(xx, yy);
      sum += g;
      sumSq += g * g;
      cnt++;
      const d = Math.abs(g - grayAt(xx + 1, yy));
      const rel = (xx - qrStartX + 1) / Math.max(1e-6, qrPitch);
      const frac = Math.abs(rel - Math.round(rel));
      if (frac < 0.08) {
        boundary += d;
        bc++;
      } else {
        nonBoundary += d;
        nc++;
      }
    }
  }
  const mean = sum / Math.max(1, cnt);
  const toneStd = Math.sqrt(Math.max(0, sumSq / Math.max(1, cnt) - mean * mean));
  return {
    edgeImprint: boundary / Math.max(1, bc) - nonBoundary / Math.max(1, nc),
    toneStd,
  };
}

async function resolveImageSource(
  src: HTMLCanvasElement
): Promise<{ source: CanvasImageSource; bitmap: ImageBitmap | null } | null> {
  if (typeof createImageBitmap === 'function' && typeof src.toBlob === 'function') {
    const blob = await new Promise<Blob | null>((resolve) => {
      src.toBlob((nextBlob) => resolve(nextBlob), 'image/png');
    });
    if (!blob) throw new Error('final-raster blob encode failed');
    const bitmap = await createImageBitmap(blob);
    return { source: bitmap, bitmap };
  }
  if (typeof Image !== 'undefined' && typeof src.toDataURL === 'function') {
    const pngDataUrl = src.toDataURL('image/png');
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('final-raster roundtrip failed'));
      el.src = pngDataUrl;
    });
    return { source: img, bitmap: null };
  }
  return null;
}

async function roundtripToFinalRaster(
  pool: CanvasPool,
  src: HTMLCanvasElement | OffscreenCanvas
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (
    typeof document === 'undefined' ||
    typeof HTMLCanvasElement === 'undefined' ||
    !(src instanceof HTMLCanvasElement) ||
    (typeof src.toBlob !== 'function' && typeof src.toDataURL !== 'function')
  ) {
    return src;
  }
  let out: HTMLCanvasElement | OffscreenCanvas | null = null;
  let bitmap: ImageBitmap | null = null;
  try {
    const resolved = await resolveImageSource(src);
    if (!resolved) return src;
    bitmap = resolved.bitmap;

    out = await pool.acquire(src.width, src.height);
    out.width = src.width;
    out.height = src.height;
    const outCtx = out.getContext('2d');
    if (!outCtx) {
      pool.release(out);
      return src;
    }
    outCtx.imageSmoothingEnabled = false;
    outCtx.drawImage(resolved.source, 0, 0, out.width, out.height);
    if (bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }
    return out;
  } catch {
    if (out) {
      pool.release(out);
    }
    if (bitmap && typeof bitmap.close === 'function') {
      bitmap.close();
    }
    return src;
  }
}

function configureStringEncoding(encoding: string): void {
  if (encoding === 'utf8') {
    setStringToBytes((s: string) => {
      const encoder = new TextEncoder();
      return Array.from(encoder.encode(s));
    });
  } else if (encoding === 'shift-jis') {
    setStringToBytes(createShiftJISEncoder());
  } else {
    resetStringToBytes();
  }
}

type DitherAttemptPatch = {
  darkMinOccupancy?: number;
  lightMaxOccupancy?: number;
  optimizeIterations?: number;
  overlayIntensity?: number;
  qrBitBiasStrength?: number;
  qrFirstMode?: boolean;
  preserveFinders?: boolean;
};

type DitherPatchCacheEntry = {
  patch: DitherAttemptPatch;
  updatedAt: number;
};

type OverlayComplexityCacheEntry = {
  complexity: number;
  updatedAt: number;
};

interface ScanGateCtx {
  effectiveConfig: QRGeneratorConfig;
  overlayComplexity: number;
  requestedOverlayIntensity: number;
  isPreviewScanGate: boolean;
  isScanGateDisabled: boolean;
  skipScanGateEscalation: boolean;
}

function resolveScanGateIntensity(
  ctx: ScanGateCtx,
  rawDrop: number,
  options?: { minIntensity?: number; maxDrop?: number }
): number {
  const { overlayComplexity, requestedOverlayIntensity, isPreviewScanGate } = ctx;
  const complexityScale = overlayComplexity >= 0.65 ? 0.75 : 1;
  const scaledDrop = Math.round(rawDrop * complexityScale);
  const defaultMaxDrop = isPreviewScanGate
    ? clampN(22 - overlayComplexity * 6, 14, 22)
    : clampN(36 - overlayComplexity * 10, 22, 36);
  const maxDrop = options?.maxDrop ?? defaultMaxDrop;
  const upperBound = requestedOverlayIntensity;
  const minIntensityRaw = options?.minIntensity ?? (isPreviewScanGate ? 16 : 12);
  const minIntensity = Math.min(minIntensityRaw, upperBound);
  const boundedDrop = Math.min(scaledDrop, maxDrop);
  return clampN(requestedOverlayIntensity - boundedDrop, minIntensity, upperBound);
}

function isAggressiveScanPatch(
  ctx: ScanGateCtx,
  patch: DitherAttemptPatch,
  cacheIntensityFloor: number
): boolean {
  const { effectiveConfig, requestedOverlayIntensity, overlayComplexity } = ctx;
  if (effectiveConfig.preserveFinders === false && patch.preserveFinders === true) return true;
  const patchIntensity = patch.overlayIntensity ?? requestedOverlayIntensity;
  if (patchIntensity < cacheIntensityFloor) return true;
  const patchBias = patch.qrBitBiasStrength ?? effectiveConfig.qrBitBiasStrength ?? 0.04;
  if (patchBias > 0.34 + overlayComplexity * 0.02) return true;
  if ((patch.darkMinOccupancy ?? 0) > 0.64) return true;
  if ((patch.lightMaxOccupancy ?? 1) < 0.36) return true;
  return false;
}

function buildScanGateBaseAttempts(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const {
    effectiveConfig,
    overlayComplexity,
    skipScanGateEscalation,
    isScanGateDisabled,
    isPreviewScanGate,
  } = ctx;
  const useFinderRelaxedAttempts = skipScanGateEscalation && !isScanGateDisabled;

  if (useFinderRelaxedAttempts) {
    return [
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.46, 0.4, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.54, 0.44, 0.6),
        optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 8, { minIntensity: 18, maxDrop: 24 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
          0,
          0.24
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.5, 0.46, 0.58),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.42, 0.54),
        optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 16, { minIntensity: 16, maxDrop: 26 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.05 + overlayComplexity * 0.015,
          0,
          0.24
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.54, 0.5, 0.6),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.46, 0.4, 0.5),
        optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 24, { minIntensity: 14, maxDrop: 30 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.02,
          0,
          0.24
        ),
      },
    ];
  }

  if (isPreviewScanGate) {
    return [
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
        optimizeIterations: Math.max(2, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 0, { minIntensity: 24, maxDrop: 0 }),
        qrBitBiasStrength: clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.48, 0.44, 0.56),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.52, 0.44, 0.56),
        optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 10, { minIntensity: 20, maxDrop: 14 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.04 + overlayComplexity * 0.01,
          0,
          0.28
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.52, 0.48, 0.58),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.48, 0.42, 0.52),
        optimizeIterations: Math.max(5, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 16, { minIntensity: 16, maxDrop: 18 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.015,
          0,
          0.28
        ),
      },
      {
        darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.55, 0.5, 0.6),
        lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.4, 0.5),
        optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
        overlayIntensity: resolveScanGateIntensity(ctx, 22, { minIntensity: 12, maxDrop: 22 }),
        qrBitBiasStrength: clampN(
          (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.1 + overlayComplexity * 0.02,
          0,
          0.3
        ),
      },
    ];
  }

  return [
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
      optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 0, { minIntensity: 20, maxDrop: 0 }),
      qrBitBiasStrength: clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.5, 0.5, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.44, 0.5),
      optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 18, { minIntensity: 16, maxDrop: 26 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.53, 0.51, 0.56),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.47, 0.44, 0.49),
      optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 26, { minIntensity: 14, maxDrop: 30 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.06 + overlayComplexity * 0.015,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.55, 0.53, 0.58),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.42, 0.47),
      optimizeIterations: Math.max(8, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 34, { minIntensity: 12, maxDrop: 32 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.09 + overlayComplexity * 0.02,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.57, 0.55, 0.6),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.43, 0.4, 0.45),
      optimizeIterations: Math.max(9, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 42, { minIntensity: 10, maxDrop: 34 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.12 + overlayComplexity * 0.025,
        0,
        0.24
      ),
    },
    {
      darkMinOccupancy: clampN(effectiveConfig.darkMinOccupancy ?? 0.58, 0.56, 0.62),
      lightMaxOccupancy: clampN(effectiveConfig.lightMaxOccupancy ?? 0.42, 0.38, 0.44),
      optimizeIterations: Math.max(10, effectiveConfig.optimizeIterations ?? 6),
      overlayIntensity: resolveScanGateIntensity(ctx, 50, { minIntensity: 8, maxDrop: 36 }),
      qrBitBiasStrength: clampN(
        (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.16 + overlayComplexity * 0.03,
        0,
        0.28
      ),
    },
  ];
}

function buildScanGateDecodeRescuePatches(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const { effectiveConfig, overlayComplexity, requestedOverlayIntensity, isPreviewScanGate } = ctx;
  const baseDark = clampN(effectiveConfig.darkMinOccupancy ?? 0.56, 0.5, 0.62);
  const baseLight = clampN(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.38, 0.5);
  const baseBias = clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
  const previewMinIntensity = Math.max(8, Math.round(requestedOverlayIntensity * 0.42));
  const previewMaxDrop = Math.max(0, requestedOverlayIntensity - previewMinIntensity);
  const previewDropCap = clampN(
    Math.round(requestedOverlayIntensity * (0.58 - overlayComplexity * 0.12)),
    18,
    58
  );
  const rescueStep = overlayComplexity >= 0.65 ? 4 : 5;
  const rescueMaxDrop = isPreviewScanGate
    ? Math.min(previewMaxDrop, previewDropCap)
    : clampN(46 - overlayComplexity * 10, 24, 46);
  const intensities: number[] = [];
  for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
    const intensity = resolveScanGateIntensity(ctx, drop, {
      minIntensity: isPreviewScanGate ? previewMinIntensity : 10,
      maxDrop: rescueMaxDrop,
    });
    if (intensity < requestedOverlayIntensity && !intensities.includes(intensity)) {
      intensities.push(intensity);
    }
  }
  return intensities.map((overlayIntensity, idx) => ({
    darkMinOccupancy: clampN(baseDark + idx * 0.01, 0.5, 0.64),
    lightMaxOccupancy: clampN(baseLight - idx * 0.01, 0.36, 0.5),
    optimizeIterations: Math.max(4 + idx, effectiveConfig.optimizeIterations ?? 6),
    overlayIntensity,
    qrBitBiasStrength: clampN(baseBias + 0.1 + idx * 0.03 + overlayComplexity * 0.02, 0, 0.34),
  }));
}

function buildScanGateFinderRescuePatches(ctx: ScanGateCtx): DitherAttemptPatch[] {
  const {
    effectiveConfig,
    overlayComplexity,
    requestedOverlayIntensity,
    isPreviewScanGate,
    isScanGateDisabled,
  } = ctx;
  if (effectiveConfig.preserveFinders !== false || isScanGateDisabled) return [];
  const baseDark = clampN(effectiveConfig.darkMinOccupancy ?? 0.56, 0.52, 0.66);
  const baseLight = clampN(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.34, 0.48);
  const baseBias = clampN(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
  const previewMinIntensity = Math.max(6, Math.round(requestedOverlayIntensity * 0.32));
  const previewMaxDrop = Math.max(0, requestedOverlayIntensity - previewMinIntensity);
  const previewDropCap = clampN(
    Math.round(requestedOverlayIntensity * (0.66 - overlayComplexity * 0.12)),
    22,
    64
  );
  const rescueStep = overlayComplexity >= 0.65 ? 4 : 5;
  const rescueMaxDrop = isPreviewScanGate
    ? Math.min(previewMaxDrop, previewDropCap)
    : clampN(52 - overlayComplexity * 12, 26, 52);
  const intensities: number[] = [];
  for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
    const intensity = resolveScanGateIntensity(ctx, drop, {
      minIntensity: isPreviewScanGate ? previewMinIntensity : 8,
      maxDrop: rescueMaxDrop,
    });
    if (intensity < requestedOverlayIntensity && !intensities.includes(intensity)) {
      intensities.push(intensity);
    }
  }
  return intensities.map((overlayIntensity, idx) => ({
    preserveFinders: true,
    darkMinOccupancy: clampN(baseDark + idx * 0.01, 0.52, 0.7),
    lightMaxOccupancy: clampN(baseLight - idx * 0.01, 0.3, 0.48),
    optimizeIterations: Math.max(6 + idx, effectiveConfig.optimizeIterations ?? 6),
    overlayIntensity,
    qrBitBiasStrength: clampN(baseBias + 0.12 + idx * 0.03 + overlayComplexity * 0.025, 0, 0.36),
  }));
}

async function runRobustnessScenarios(
  pool: CanvasPool,
  finalRaster: HTMLCanvasElement | OffscreenCanvas,
  scenarios: Array<{
    blur: number;
    exposure: number;
    skewX: number;
    skewY: number;
    downscale: number;
  }>,
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>
): Promise<boolean> {
  for (const s of scenarios) {
    if (!(await simulateScenarioDecode(pool, finalRaster, s, runDecode))) {
      return false;
    }
  }
  return true;
}

async function evaluateDecodeScenarios(
  ctx: ScanGateCtx,
  pool: CanvasPool,
  moduleCount: number,
  canvas: HTMLCanvasElement | OffscreenCanvas,
  prevEdgeImprint: number | null,
  thresholds: { edge: number; toneStd: number; edgeWorsen: number },
  scenarioSeed: number,
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>
): Promise<{
  ok: boolean;
  baseDecodeOk: boolean;
  metrics: { edgeImprint: number; toneStd: number } | null;
  evaluatedCanvas: HTMLCanvasElement | OffscreenCanvas;
}> {
  const { effectiveConfig, isPreviewScanGate, isScanGateDisabled, skipScanGateEscalation } = ctx;

  if (isScanGateDisabled) {
    return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: canvas };
  }

  const finalRaster = isPreviewScanGate ? canvas : await roundtripToFinalRaster(pool, canvas);
  if (!(await runDecode(finalRaster))) {
    return { ok: false, baseDecodeOk: false, metrics: null, evaluatedCanvas: finalRaster };
  }

  if (skipScanGateEscalation) {
    const baseMetrics = isPreviewScanGate
      ? null
      : computeScanGateRasterMetrics(finalRaster, moduleCount, effectiveConfig);
    return { ok: true, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
  }

  if (isPreviewScanGate) {
    return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: finalRaster };
  }

  const baseMetrics = computeScanGateRasterMetrics(finalRaster, moduleCount, effectiveConfig);
  if (baseMetrics) {
    if (baseMetrics.edgeImprint > thresholds.edge || baseMetrics.toneStd < thresholds.toneStd) {
      return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
    }
    if (
      prevEdgeImprint !== null &&
      baseMetrics.edgeImprint > prevEdgeImprint + thresholds.edgeWorsen
    ) {
      return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
    }
  }

  const seeded01 = (salt: number): number => {
    const n = Math.sin((scenarioSeed + salt) * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  };
  const scenarios = [
    {
      blur: 0.8 + seeded01(11) * 0.4,
      exposure: -0.24 + seeded01(13) * 0.08,
      skewX: finalRaster.width * 0.02,
      skewY: finalRaster.height * 0.012,
      downscale: 0.9,
    },
    {
      blur: 1 + seeded01(17) * 0.5,
      exposure: 0.18 + seeded01(19) * 0.12,
      skewX: finalRaster.width * 0.028,
      skewY: finalRaster.height * 0.018,
      downscale: 0.82,
    },
  ];

  const allScenariosPass = await runRobustnessScenarios(pool, finalRaster, scenarios, runDecode);
  if (!allScenariosPass) {
    return { ok: false, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
  }

  return { ok: true, baseDecodeOk: true, metrics: baseMetrics, evaluatedCanvas: finalRaster };
}

interface ScanGateCallbacks {
  buildAttemptConfig: (patch: DitherAttemptPatch) => QRGeneratorConfig;
  renderScaled: (cfg: QRGeneratorConfig) => Promise<HTMLCanvasElement | OffscreenCanvas>;
  runDecode: (src: HTMLCanvasElement | OffscreenCanvas) => Promise<boolean>;
  rememberPatch: (patch: DitherAttemptPatch) => void;
}

function buildDitherAttemptList(
  baseAttempts: DitherAttemptPatch[],
  cachedPatch: DitherAttemptPatch | null,
  isAnimatedFrame: boolean,
  isFirstAnimatedFrame: boolean,
  isAnimatedPreviewFrame: boolean,
  patchSignature: (patch: DitherAttemptPatch) => string
): DitherAttemptPatch[] {
  let attempts: DitherAttemptPatch[] = [];
  const seenAttemptSignatures = new Set<string>();
  const pushUniqueAttempt = (patch: DitherAttemptPatch): void => {
    const sig = patchSignature(patch);
    if (seenAttemptSignatures.has(sig)) return;
    seenAttemptSignatures.add(sig);
    attempts.push(patch);
  };
  if (baseAttempts.length > 0) {
    pushUniqueAttempt(baseAttempts[0]);
    for (const patch of baseAttempts.slice(1)) pushUniqueAttempt(patch);
  }
  if (cachedPatch) {
    if (isAnimatedFrame && !isFirstAnimatedFrame) {
      // Prioritize cached patch for animation frames after the first so they
      // reuse frame 0's validated result instead of the base config.
      const sig = patchSignature(cachedPatch);
      if (!seenAttemptSignatures.has(sig)) {
        seenAttemptSignatures.add(sig);
        attempts.unshift(cachedPatch);
      }
    } else {
      pushUniqueAttempt(cachedPatch);
    }
  }
  if (isAnimatedPreviewFrame) {
    // Animated preview fast path: keep a compact attempt ladder so each frame
    // still validates/recovers decode, but avoids running the full fallback stack.
    const compact: DitherAttemptPatch[] = [];
    const compactSeen = new Set<string>();
    const pushCompact = (patch: DitherAttemptPatch | undefined): void => {
      if (!patch) return;
      const sig = patchSignature(patch);
      if (compactSeen.has(sig)) return;
      compactSeen.add(sig);
      compact.push(patch);
    };
    pushCompact(cachedPatch ?? undefined);
    pushCompact(baseAttempts[0]);
    pushCompact(baseAttempts[1]);
    pushCompact(baseAttempts[2]);
    if (compact.length === 0 && attempts[0]) {
      pushCompact(attempts[0]);
    }
    attempts = compact;
  }
  return attempts;
}

interface ScanGateMainLoopResult {
  earlyReturn: HTMLCanvasElement | OffscreenCanvas | null;
  lastCanvas: HTMLCanvasElement | OffscreenCanvas | null;
}

interface ScanGateLoopState {
  bestBaseDecodable: HTMLCanvasElement | OffscreenCanvas | null;
  bestBaseDecodablePatch: DitherAttemptPatch | null;
  prevEdgeImprint: number | null;
}

function processEvaluatedAttempt(
  evaluated: {
    ok: boolean;
    baseDecodeOk: boolean;
    metrics: { edgeImprint: number; toneStd: number } | null;
    evaluatedCanvas: HTMLCanvasElement | OffscreenCanvas;
  },
  patch: DitherAttemptPatch,
  state: ScanGateLoopState,
  skipScanGateEscalation: boolean,
  cb: ScanGateCallbacks
): ScanGateMainLoopResult | null {
  if (evaluated.baseDecodeOk && !state.bestBaseDecodable) {
    state.bestBaseDecodable = evaluated.evaluatedCanvas;
    state.bestBaseDecodablePatch = patch;
  }
  if (
    evaluated.metrics &&
    (state.prevEdgeImprint === null || evaluated.metrics.edgeImprint < state.prevEdgeImprint)
  ) {
    state.prevEdgeImprint = evaluated.metrics.edgeImprint;
  }
  if (evaluated.ok) {
    cb.rememberPatch(patch);
    return { earlyReturn: evaluated.evaluatedCanvas, lastCanvas: null };
  }
  if (skipScanGateEscalation && evaluated.baseDecodeOk) {
    cb.rememberPatch(patch);
    return { earlyReturn: evaluated.evaluatedCanvas, lastCanvas: null };
  }
  return null;
}

async function runScanGateMainLoop(
  pool: CanvasPool,
  sgctx: ScanGateCtx,
  moduleCount: number,
  attempts: DitherAttemptPatch[],
  thresholds: { edge: number; toneStd: number; edgeWorsen: number },
  scenarioSeed: number,
  skipScanGateEscalation: boolean,
  cb: ScanGateCallbacks
): Promise<ScanGateMainLoopResult> {
  let lastCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  const state: ScanGateLoopState = {
    bestBaseDecodable: null,
    bestBaseDecodablePatch: null,
    prevEdgeImprint: null,
  };
  for (const patch of attempts) {
    if (lastCanvas && lastCanvas !== state.bestBaseDecodable) {
      pool.release(lastCanvas);
      lastCanvas = null;
    }
    const attemptCanvas = await cb.renderScaled(cb.buildAttemptConfig(patch));
    try {
      const evaluated = await evaluateDecodeScenarios(
        sgctx,
        pool,
        moduleCount,
        attemptCanvas,
        state.prevEdgeImprint,
        thresholds,
        scenarioSeed,
        cb.runDecode
      );
      lastCanvas = evaluated.evaluatedCanvas;
      const result = processEvaluatedAttempt(evaluated, patch, state, skipScanGateEscalation, cb);
      if (result) return result;
    } catch {
      lastCanvas = attemptCanvas;
    }
  }
  if (state.bestBaseDecodable) {
    if (state.bestBaseDecodablePatch) cb.rememberPatch(state.bestBaseDecodablePatch);
    return { earlyReturn: state.bestBaseDecodable, lastCanvas: null };
  }
  return { earlyReturn: null, lastCanvas };
}

async function runScanGateRescueLoop(
  pool: CanvasPool,
  patches: DitherAttemptPatch[],
  isPreviewScanGate: boolean,
  cb: ScanGateCallbacks,
  lastCanvas: HTMLCanvasElement | OffscreenCanvas | null
): Promise<{
  found: HTMLCanvasElement | OffscreenCanvas | null;
  lastCanvas: HTMLCanvasElement | OffscreenCanvas | null;
}> {
  let tracking = lastCanvas;
  for (const patch of patches) {
    if (tracking) {
      pool.release(tracking);
      tracking = null;
    }
    const rescueCanvas = await cb.renderScaled(cb.buildAttemptConfig(patch));
    const rescueRaster = isPreviewScanGate
      ? rescueCanvas
      : await roundtripToFinalRaster(pool, rescueCanvas);
    if (await cb.runDecode(rescueRaster)) {
      cb.rememberPatch(patch);
      return { found: rescueRaster, lastCanvas: tracking };
    }
    tracking = rescueRaster;
  }
  return { found: null, lastCanvas: tracking };
}

async function runScanGateQRFirstFallback(
  pool: CanvasPool,
  sgctx: ScanGateCtx,
  isPreviewScanGate: boolean,
  requestedOverlayIntensity: number,
  effectiveConfig: QRGeneratorConfig,
  lastPatch: DitherAttemptPatch,
  cb: ScanGateCallbacks
): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const qrFirstDrops = isPreviewScanGate ? [10, 16, 22, 28, 34] : [8, 14, 20, 26, 32, 38, 44];
  const qrFirstIntensities = qrFirstDrops
    .map((drop) => resolveScanGateIntensity(sgctx, drop, { minIntensity: 6, maxDrop: 46 }))
    .filter(
      (intensity, idx, values) =>
        intensity < requestedOverlayIntensity && values.indexOf(intensity) === idx
    );
  let qrFirstLast: HTMLCanvasElement | OffscreenCanvas | null = null;
  for (const intensity of qrFirstIntensities) {
    if (qrFirstLast) {
      pool.release(qrFirstLast);
      qrFirstLast = null;
    }
    const qrFirstFallback = await cb.renderScaled({
      ...cb.buildAttemptConfig(lastPatch),
      qrFirstMode: true,
      overlayIntensity: Math.min(intensity, effectiveConfig.overlayIntensity ?? 100),
    });
    const fallbackRaster = isPreviewScanGate
      ? qrFirstFallback
      : await roundtripToFinalRaster(pool, qrFirstFallback);
    qrFirstLast = fallbackRaster;
    if (await cb.runDecode(fallbackRaster)) {
      if (effectiveConfig.qrFirstMode === true) {
        cb.rememberPatch({
          ...lastPatch,
          qrFirstMode: true,
          overlayIntensity: intensity,
        });
      }
      return fallbackRaster;
    }
  }
  return qrFirstLast;
}

function buildFixedVisualPolicy(config: QRGeneratorConfig): Partial<QRGeneratorConfig> {
  return {
    overlayMode: config.overlayMode,
    colorMode: config.colorMode,
    renderScalePerModule: config.renderScalePerModule,
    ditherKind: config.ditherKind,
    ditherMode: config.ditherMode,
    ditherStrength: config.ditherStrength,
    finderDitherStrength: config.finderDitherStrength,
    blendPreservations: config.blendPreservations,
    blendPreservationMode: config.blendPreservationMode,
    ditherScale: config.ditherScale,
    ditherSerpentine: config.ditherSerpentine,
    diffusionKernel: config.diffusionKernel,
    orderedMatrix: config.orderedMatrix,
    blueNoiseTileSize: config.blueNoiseTileSize,
    blueNoiseSeed: config.blueNoiseSeed,
    colorDither: config.colorDither,
    dotMinRadiusPx: config.dotMinRadiusPx,
    dotMaxRadiusPx: config.dotMaxRadiusPx,
    seed: config.seed,
  };
}

async function computeOverlaySignature(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  isAnimatedFrame: boolean,
  overlayFamilyKey: string,
  createCanvas: (w: number, h: number) => Promise<HTMLCanvasElement | OffscreenCanvas>
): Promise<string> {
  if (!overlayCanvas) return 'overlay:none';
  if (isAnimatedFrame) return `anim-family:${overlayFamilyKey}`;
  const hash = await hashCanvasContent(overlayCanvas, createCanvas);
  return `${overlayCanvas.width}x${overlayCanvas.height}:${hash}`;
}

function buildScanCacheKey(
  config: QRGeneratorConfig,
  moduleCount: number,
  scanGateProfile: string,
  preserveFindersValue: boolean,
  overlayToken: string
): string {
  return [
    config.content,
    config.errorCorrection,
    moduleCount,
    config.overlayMode,
    config.colorMode,
    scanGateProfile,
    Math.round(config.overlayIntensity ?? 100),
    Math.round(config.ditherStrength ?? 50),
    Math.round(config.finderDitherStrength ?? 65),
    config.blendPreservations === true ? 1 : 0,
    config.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
    config.ditherKind ?? 'none',
    config.ditherMode ?? 'none',
    Math.round(config.ditherScale ?? 1),
    config.ditherSerpentine === false ? 0 : 1,
    config.diffusionKernel ?? 'floyd_steinberg',
    config.orderedMatrix ?? 'bayer4',
    Math.round(config.blueNoiseTileSize ?? 64),
    config.blueNoiseSeed ?? 'noise-seed:auto',
    config.colorDither ?? 'none',
    Math.round(config.renderScalePerModule ?? 18),
    preserveFindersValue ? 1 : 0,
    overlayToken,
    config.preserveTiming === true ? 1 : 0,
    config.preserveAlignment === true ? 1 : 0,
    config.protectFormatInfo === true ? 1 : 0,
    config.protectVersionInfo === true ? 1 : 0,
    config.qrFirstMode === true ? 1 : 0,
    config.seed ?? 'seed:auto',
  ].join('|');
}

function ditherPatchSignature(patch: DitherAttemptPatch): string {
  return JSON.stringify({
    d: patch.darkMinOccupancy ?? null,
    l: patch.lightMaxOccupancy ?? null,
    i: patch.optimizeIterations ?? null,
    o: patch.overlayIntensity ?? null,
    b: patch.qrBitBiasStrength ?? null,
    q: patch.qrFirstMode ?? null,
    f: patch.preserveFinders ?? null,
  });
}

async function decodeCanvasData(
  c: HTMLCanvasElement | OffscreenCanvas
): Promise<{ success: boolean; data: string | null } | null> {
  const ctx = c.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return null;
  const imageData = ctx.getImageData(0, 0, c.width, c.height);
  return decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
}

function clearQuietZone(
  ctx: CanvasRenderingContext2D,
  config: QRGeneratorConfig,
  bgColor: string,
  size: number,
  margin: number,
  moduleCount: number,
  moduleSize: number
): void {
  const qrStart = margin * moduleSize;
  const qrSpan = moduleCount * moduleSize;
  const qrEnd = qrStart + qrSpan;
  if (config.transparentBg) {
    ctx.clearRect(0, 0, size, qrStart);
    ctx.clearRect(0, qrStart, qrStart, qrSpan);
    ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
    ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, qrStart);
    ctx.fillRect(0, qrStart, qrStart, qrSpan);
    ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
    ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
  }
}

function buildOverlayFamilyKey(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
  config: QRGeneratorConfig
): string {
  if (!overlayCanvas) return 'overlay:none';
  return [
    overlayCanvas.width,
    overlayCanvas.height,
    config.overlayMode ?? 'none',
    config.colorMode ?? 'color',
    Math.round(config.overlayIntensity ?? 100),
    Math.round(config.ditherStrength ?? 50),
    Math.round(config.finderDitherStrength ?? 65),
    config.ditherKind ?? 'none',
    config.ditherMode ?? 'none',
    Math.round(config.renderScalePerModule ?? 18),
    config.blendPreservations === true ? 1 : 0,
    config.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
  ].join('|');
}

export class QRGenerator {
  private readonly qrcode: typeof qrcode;
  private readonly canvasFactory: CanvasFactory;
  private readonly _canvasPool: CanvasPool;
  private _lastMatrix: boolean[][] | null = null;
  private _lastModuleCount: number = 0;
  private readonly _ditherPatchCache: Map<string, DitherPatchCacheEntry> = new Map();
  private readonly _overlayComplexityCache: Map<string, OverlayComplexityCacheEntry> = new Map();
  private static readonly DITHER_PATCH_CACHE_MAX_ENTRIES = 64;
  private static readonly DITHER_PATCH_CACHE_TTL_MS = 5 * 60 * 1000;
  private static readonly OVERLAY_COMPLEXITY_CACHE_MAX_ENTRIES = 96;
  private static readonly OVERLAY_COMPLEXITY_CACHE_TTL_MS = 2 * 60 * 1000;

  private readOverlayComplexityCache(key: string): number | null {
    const entry = this._overlayComplexityCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.updatedAt > QRGenerator.OVERLAY_COMPLEXITY_CACHE_TTL_MS) {
      this._overlayComplexityCache.delete(key);
      return null;
    }
    return entry.complexity;
  }

  private writeOverlayComplexityCache(key: string, complexity: number): void {
    this._overlayComplexityCache.set(key, { complexity, updatedAt: Date.now() });
    if (this._overlayComplexityCache.size <= QRGenerator.OVERLAY_COMPLEXITY_CACHE_MAX_ENTRIES) {
      return;
    }
    let oldestKey: string | null = null;
    let oldestAt = Number.POSITIVE_INFINITY;
    for (const [k, v] of this._overlayComplexityCache.entries()) {
      if (v.updatedAt < oldestAt) {
        oldestAt = v.updatedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) this._overlayComplexityCache.delete(oldestKey);
  }

  private async resolveOverlayComplexity(
    pool: CanvasPool,
    overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
    isAnimatedFrame: boolean,
    overlaySignature: string
  ): Promise<number> {
    const cacheKey = `${isAnimatedFrame ? 'anim' : 'static'}:${overlaySignature}`;
    const cached = this.readOverlayComplexityCache(cacheKey);
    if (cached !== null) return cached;
    const complexity = await computeOverlayComplexity(pool, overlayCanvas, 48);
    this.writeOverlayComplexityCache(cacheKey, complexity);
    return complexity;
  }

  /**
   * Create a QR generator instance
   * @param canvasFactory - Optional canvas factory for non-browser environments
   */
  constructor(canvasFactory: CanvasFactory | null = null) {
    this.qrcode = qrcode;
    this.canvasFactory = canvasFactory || defaultBrowserCanvasFactory;
    this._canvasPool = new CanvasPool(this.canvasFactory);
  }

  /**
   * Release all canvases held in the internal pool.
   * Call between independent generation runs (e.g. between test jobs or
   * animated scenarios) so native canvas memory can be reclaimed by GC.
   */
  clearCanvasPool(): void {
    this._canvasPool.clear();
  }

  /**
   * Get the QR matrix from the last generate() call
   * Returns a 2D boolean array where true = dark module, false = light module
   */
  getLastMatrix(): QRMatrixResult | null {
    if (!this._lastMatrix) return null;
    return {
      matrix: this._lastMatrix,
      moduleCount: this._lastModuleCount,
    };
  }

  /**
   * Store the QR matrix for vector SVG export
   * Reusable helper to avoid code duplication across render methods
   */
  storeMatrix(qr: QRCodeInstance, moduleCount: number): void {
    const matrix: boolean[][] = [];
    for (let row = 0; row < moduleCount; row++) {
      matrix[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        matrix[row][col] = qr.isDark(row, col);
      }
    }
    this._lastMatrix = matrix;
    this._lastModuleCount = moduleCount;
  }

  /**
   * Store a pre-computed matrix directly (without iterating through QRCodeInstance)
   */
  private storeMatrixDirect(matrix: boolean[][], moduleCount: number): void {
    this._lastMatrix = matrix;
    this._lastModuleCount = moduleCount;
  }

  /**
   * Create a canvas using the configured factory
   */
  async createCanvas(width: number, height: number): Promise<HTMLCanvasElement | OffscreenCanvas> {
    return this.canvasFactory.createCanvas(width, height);
  }

  async loadLibrary(): Promise<void> {
    // Library is imported synchronously via ES module
    // This method is kept for backwards compatibility
  }

  /**
   * Build QR matrix with caching
   */
  private buildQRMatrix(
    config: QRGeneratorConfig,
    typeNumber: number,
    encodingMode: string,
    maskPatternConfig: number | undefined,
    characterEncodingConfig: string
  ): { qr: QRCodeInstance; moduleCount: number } {
    const qrCacheKey = `${config.content}:${config.errorCorrection}:${typeNumber}:${encodingMode}:${maskPatternConfig}:${characterEncodingConfig}`;

    // Check cache for existing QR matrix
    const cachedQr = qrMatrixCache.get(qrCacheKey);
    if (cachedQr) {
      return { qr: cachedQr.qr as QRCodeInstance, moduleCount: cachedQr.moduleCount };
    }

    // Build new QR matrix
    const qr = this.qrcode(typeNumber, config.errorCorrection);

    configureStringEncoding(characterEncodingConfig);

    // Map encoding mode to qrcode-generator mode parameter
    const modeMap: Record<string, string | undefined> = {
      numeric: 'Numeric',
      alphanumeric: 'Alphanumeric',
      byte: 'Byte',
      kanji: 'Kanji',
      auto: undefined,
    };
    const libraryMode = modeMap[encodingMode] || undefined;

    qr.addData(config.content, libraryMode);

    // Get mask pattern from config (handle 'auto' by converting to undefined)
    const maskPattern =
      typeof maskPatternConfig === 'number' && maskPatternConfig >= 0 && maskPatternConfig <= 7
        ? maskPatternConfig
        : undefined;

    (qr as { make(pattern?: number): void }).make(maskPattern);
    const moduleCount = qr.getModuleCount();

    // Restore stringToBytes to default
    resetStringToBytes();

    // Cache the result
    qrMatrixCache.set(qrCacheKey, { qr, moduleCount });

    return { qr: qr as QRCodeInstance, moduleCount };
  }

  private async preprocessOverlayCanvas(
    overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
    config: QRGeneratorConfig
  ): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
    let processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas | null = overlayCanvas;
    if (overlayCanvas && hasGeometricTransforms(config)) {
      processedOverlayCanvas = await applyGeometricTransforms(
        overlayCanvas,
        config,
        this.createCanvas.bind(this)
      );
    }

    const needsPreprocessing = hasPreprocessingOptions(config);
    log.trace('Preprocessing check', {
      hasOverlay: !!processedOverlayCanvas,
      needsPreprocessing,
      overlayMode: config.overlayMode,
      colorMode: config.colorMode,
      filterGrayscale: config.filterGrayscale,
      filterBrightness: config.filterBrightness,
      filterContrast: config.filterContrast,
    });

    if (processedOverlayCanvas && needsPreprocessing && !config.fastPreview) {
      log.trace('Preprocessing overlay', {
        overlayMode: config.overlayMode,
        colorMode: config.colorMode,
        filterBrightness: config.filterBrightness,
        filterContrast: config.filterContrast,
        filterGamma: config.filterGamma,
        filterSaturation: config.filterSaturation,
        filterHue: config.filterHue,
        filterBlur: config.filterBlur,
        filterSharpen: config.filterSharpen,
        filterPosterize: config.filterPosterize,
        filterThreshold: config.filterThreshold,
        filterEdgeDetect: config.filterEdgeDetect,
        filterInvert: config.filterInvert,
        filterGrayscale: config.filterGrayscale,
      });

      processedOverlayCanvas = await preprocessOverlay(
        processedOverlayCanvas,
        config,
        this.createCanvas.bind(this)
      );

      log.trace('Preprocessing complete', {
        width: processedOverlayCanvas.width,
        height: processedOverlayCanvas.height,
      });
    } else if (processedOverlayCanvas) {
      log.trace('Skipping preprocessing - no filters to apply');
    }

    return processedOverlayCanvas;
  }

  private buildEffectiveConfig(
    config: QRGeneratorConfig,
    typeNumber: number,
    processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas | null
  ): QRGeneratorConfig {
    const overlayModeWithDefault =
      processedOverlayCanvas && !config.overlayMode ? 'dithered' : config.overlayMode;
    const blendPreservationMode: 'overlay' | 'dither' =
      config.blendPreservationMode === 'dither' ? 'dither' : 'overlay';

    return {
      ...config,
      typeNumber,
      overlayMode: overlayModeWithDefault,
      blendPreservationMode,
    };
  }

  private drawFinderPatternsToMask(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: QRGeneratorConfig,
    moduleCount: number,
    moduleSize: number,
    margin: number,
    skipMask: Uint8Array
  ): void {
    const finderPositions = [
      { row: 0, col: 0 },
      { row: 0, col: moduleCount - 7 },
      { row: moduleCount - 7, col: 0 },
    ];
    for (const pos of finderPositions) {
      const x = (pos.col + margin) * moduleSize;
      const y = (pos.row + margin) * moduleSize;
      drawFinderPatternComplete(ctx as CanvasRenderingContext2D, x, y, moduleSize, config);
      for (let r = pos.row; r < pos.row + 7; r++) {
        for (let c = pos.col; c < pos.col + 7; c++) {
          skipMask[r * moduleCount + c] = 1;
        }
      }
    }
  }

  private drawAlignmentPatternsToMask(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: QRGeneratorConfig,
    moduleCount: number,
    moduleSize: number,
    margin: number,
    version: number,
    skipMask: Uint8Array
  ): void {
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    const alignPositions = getAlignmentPositionsCached(version, moduleCount);
    for (const pos of alignPositions) {
      const centerX = (pos.col + margin) * moduleSize + moduleSize / 2;
      const centerY = (pos.row + margin) * moduleSize + moduleSize / 2;
      drawAlignmentPattern(
        ctx as CanvasRenderingContext2D,
        centerX,
        centerY,
        moduleSize,
        alignmentStyle,
        config
      );
      for (let r = pos.row - 2; r <= pos.row + 2; r++) {
        for (let c = pos.col - 2; c <= pos.col + 2; c++) {
          skipMask[r * moduleCount + c] = 1;
        }
      }
    }
  }

  private drawStructuralPatterns(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: QRGeneratorConfig,
    moduleCount: number,
    moduleSize: number,
    margin: number,
    overlayData: unknown,
    version: number
  ): Uint8Array {
    const skipMask = new Uint8Array(moduleCount * moduleCount);

    const shouldDrawFindersFirst = config.preserveFinders !== false || !overlayData;
    if (shouldDrawFindersFirst) {
      this.drawFinderPatternsToMask(ctx, config, moduleCount, moduleSize, margin, skipMask);
    }

    const shouldDrawAlignmentFirst = config.preserveAlignment !== false || !overlayData;
    if (version >= 2 && shouldDrawAlignmentFirst) {
      this.drawAlignmentPatternsToMask(
        ctx,
        config,
        moduleCount,
        moduleSize,
        margin,
        version,
        skipMask
      );
    }

    return skipMask;
  }

  private async tryScaledRenderPath(
    qr: QRCodeInstance,
    effectiveConfig: QRGeneratorConfig,
    processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas | null,
    moduleCount: number,
    scale: number
  ): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
    if (scale <= 1 || !processedOverlayCanvas) return null;

    const pool = this._canvasPool;
    const renderScaled = async (cfg: QRGeneratorConfig) =>
      await generateScaledQR(
        qr,
        cfg,
        processedOverlayCanvas,
        moduleCount,
        scale,
        pool.acquire.bind(pool),
        this.canvasFactory,
        this.storeMatrix.bind(this) as (
          qr: { isDark(row: number, col: number): boolean; getModuleCount(): number },
          moduleCount: number
        ) => void,
        pool.release.bind(pool)
      );

    if (effectiveConfig.fastPreview) {
      return await renderScaled(effectiveConfig);
    }

    if (effectiveConfig.overlayMode === 'dithered' || effectiveConfig.forceScaledOverlay === true) {
      return await this.runDitheredScanGate(
        effectiveConfig,
        processedOverlayCanvas,
        moduleCount,
        renderScaled
      );
    }

    return await renderScaled(effectiveConfig);
  }

  async generate(
    config: QRGeneratorConfig,
    overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null = null
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    if (!this.qrcode) {
      await this.loadLibrary();
    }

    // Get encoding mode early (needed for version calculation)
    let encodingMode = config.encodingMode || 'auto';
    const content = config.content || '';

    // Use getCompatibleMode which handles both auto-detection AND validation
    encodingMode = getCompatibleMode(content, encodingMode);

    // Auto-detect best version if set to 0
    let typeNumber = config.typeNumber;
    if (typeNumber === 0) {
      typeNumber = calculateOptimalVersion(config.content, config.errorCorrection);
    }

    // Apply geometric transforms and preprocessing to the overlay
    const processedOverlayCanvas = await this.preprocessOverlayCanvas(overlayCanvas, config);

    // =======================================================================
    // STAGE 1: QR MATRIX GENERATION
    // =======================================================================
    const maskPatternConfig =
      typeof config.maskPattern === 'number' ? config.maskPattern : undefined;
    const characterEncodingConfig = config.characterEncoding || 'default';

    const { qr, moduleCount } = this.buildQRMatrix(
      config,
      typeNumber,
      encodingMode,
      maskPatternConfig,
      characterEncodingConfig
    );

    // Lightweight structural verification
    const vr = verifyQRStructure(qr, typeNumber || undefined);
    if (!vr.ok) {
      log.warn('QR structural check failed', {
        moduleCount,
        version: vr.version,
        issues: vr.issues,
      });
    }

    const effectiveConfig = this.buildEffectiveConfig(config, typeNumber, processedOverlayCanvas);

    // =======================================================================
    // UNIFIED SCALED RENDERING (dithered, blue-noise, subpixel modes)
    // =======================================================================
    const scale = getScaleFactor(effectiveConfig.overlayMode, effectiveConfig);

    log.debug('Overlay mode resolution', {
      hasOverlay: !!processedOverlayCanvas,
      configOverlayMode: config.overlayMode,
      effectiveOverlayMode: effectiveConfig.overlayMode,
      scale,
      willUseScaledPath: scale > 1 && !!processedOverlayCanvas,
      colorMode: config.colorMode,
      overlayIntensity: config.overlayIntensity,
    });

    const scaledResult = await this.tryScaledRenderPath(
      qr,
      effectiveConfig,
      processedOverlayCanvas,
      moduleCount,
      scale
    );
    if (scaledResult) return scaledResult;

    // =======================================================================
    // STAGE 2: OVERLAY PROCESSING (for non-scaled modes like blend, halftone, etc.)
    // =======================================================================
    // SKIP overlay data preparation for center mode - we don't need brightness/color
    // data since we just draw the logo on top without modifying QR modules.
    let ditherPattern: boolean[][] | null = null;
    let overlayData: OverlayData | null = null;
    let effectiveIntensity = 0;

    if (effectiveConfig.overlayMode !== 'center') {
      const overlayResult = await prepareUnifiedOverlayData(
        qr,
        effectiveConfig,
        processedOverlayCanvas as HTMLCanvasElement | OffscreenCanvas | null,
        moduleCount,
        this.createCanvas.bind(this)
      );
      ditherPattern = overlayResult.ditherPattern;
      overlayData = overlayResult.overlayData;
      effectiveIntensity = overlayResult.effectiveIntensity;
    }

    // =======================================================================
    // STAGE 3: CANVAS SETUP
    // =======================================================================
    const moduleSize = config.moduleSize;
    const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
    const baseMargin = Math.max(config.margin, quietZoneMin);
    // Keep QR centered when frame text/border reserves extra canvas space.
    const frameOffsetModules = config.frameStyle && config.frameStyle !== 'none' ? 2 : 0;
    const margin = baseMargin + frameOffsetModules;
    const size = moduleCount * moduleSize + margin * 2 * moduleSize;

    const canvas = await this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;

    // IMPORTANT: Validate colors - invalid fillStyle values cause canvas to use black
    const effectiveBgColor = validateColor(config.bgColor, '#ffffff');

    // Draw background
    if (!config.transparentBg) {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw frame background
    drawFrameBackground(ctx, size, moduleSize, margin, config);

    // Get version for pattern detection
    const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

    // Create gradient fill if configured (skipped in fast preview for performance)
    const gradientFill = config.fastPreview ? null : createGradientFill(ctx, config, size);
    const useGradient = !config.fastPreview && config.gradient && config.gradient.type !== 'none';

    // =======================================================================
    // STAGE 4: DRAW STRUCTURAL PATTERNS
    // =======================================================================

    const skipMask = this.drawStructuralPatterns(
      ctx,
      config,
      moduleCount,
      moduleSize,
      margin,
      overlayData,
      version
    );

    // =======================================================================
    // STAGE 5: RENDER MODULES
    // =======================================================================
    renderModules({
      ctx,
      qr,
      config: effectiveConfig,
      moduleCount,
      moduleSize,
      margin,
      overlayData,
      ditherPattern,
      effectiveIntensity,
      skipMask,
      version,
      gradientFill,
      useGradient: useGradient ?? false,
    });

    // Enforce a clean quiet zone in the final composition.
    clearQuietZone(ctx, config, effectiveBgColor, size, margin, moduleCount, moduleSize);

    // =======================================================================
    // STAGE 6: FINAL TOUCHES
    // =======================================================================
    // Draw center logo if in center mode
    if (processedOverlayCanvas && config.overlayMode === 'center') {
      log.debug('Drawing center logo', {
        canvasSize: size,
        logoSize: config.logoSize,
        overlayWidth: processedOverlayCanvas.width,
        overlayHeight: processedOverlayCanvas.height,
        colorMode: config.colorMode,
      });
      drawCenterLogo(ctx, processedOverlayCanvas, size, config.logoSize);
    }

    // Draw frame if configured
    drawFrame(ctx, size, moduleSize, margin, config);

    // Store the QR matrix for vector SVG export
    this.storeMatrix(qr, moduleCount);

    return canvas;
  }
  private getCachedDitherPatch(
    sgctx: ScanGateCtx,
    scanCacheKey: string,
    scanCacheFallbackKey: string,
    cacheIntensityFloor: number
  ): DitherAttemptPatch | null {
    const keyCandidates =
      scanCacheFallbackKey === scanCacheKey ? [scanCacheKey] : [scanCacheKey, scanCacheFallbackKey];
    for (const resolvedKey of keyCandidates) {
      const entry = this._ditherPatchCache.get(resolvedKey);
      if (!entry) continue;
      if (Date.now() - entry.updatedAt > QRGenerator.DITHER_PATCH_CACHE_TTL_MS) {
        this._ditherPatchCache.delete(resolvedKey);
        continue;
      }
      if (isAggressiveScanPatch(sgctx, entry.patch, cacheIntensityFloor)) {
        this._ditherPatchCache.delete(resolvedKey);
        continue;
      }
      return { ...entry.patch };
    }
    return null;
  }

  private rememberDitherPatch(
    sgctx: ScanGateCtx,
    patch: DitherAttemptPatch,
    scanCacheKey: string,
    scanCacheFallbackKey: string,
    cacheIntensityFloor: number
  ): void {
    if (isAggressiveScanPatch(sgctx, patch, cacheIntensityFloor)) return;
    const now = Date.now();
    const keys =
      scanCacheFallbackKey === scanCacheKey ? [scanCacheKey] : [scanCacheKey, scanCacheFallbackKey];
    for (const key of keys) {
      this._ditherPatchCache.set(key, {
        patch: { ...patch },
        updatedAt: now,
      });
    }
    if (this._ditherPatchCache.size <= QRGenerator.DITHER_PATCH_CACHE_MAX_ENTRIES) return;
    let oldestKey: string | null = null;
    let oldestAt = Number.POSITIVE_INFINITY;
    for (const [k, v] of this._ditherPatchCache.entries()) {
      if (v.updatedAt < oldestAt) {
        oldestAt = v.updatedAt;
        oldestKey = k;
      }
    }
    if (oldestKey) this._ditherPatchCache.delete(oldestKey);
  }

  /**
   * Dithered scan-gate retry loop.
   * Extracted from generate() to reduce cognitive complexity.
   */
  private async runDitheredScanGate(
    effectiveConfig: QRGeneratorConfig,
    processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas,
    moduleCount: number,
    renderScaled: (cfg: QRGeneratorConfig) => Promise<HTMLCanvasElement | OffscreenCanvas>
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    const pool = this._canvasPool;

    const scanGateProfile = effectiveConfig.scanGateProfile ?? 'full';
    const isPreviewScanGate = scanGateProfile === 'preview';
    const isScanGateDisabled = scanGateProfile === 'off';
    const skipScanGateEscalation =
      effectiveConfig.preserveFinders === false && effectiveConfig.blendPreservations !== true;
    const edgeImprintThreshold = clampN(effectiveConfig.edgeImprintThreshold ?? 0.2, 0.05, 0.5);
    const toneStdThreshold = clampN(effectiveConfig.toneStdThreshold ?? 0.12, 0.05, 0.3);
    const edgeWorsenLimit = clampN(effectiveConfig.edgeImprintWorsenLimit ?? 0.015, 0, 0.2);

    const fixedVisualPolicy: Partial<QRGeneratorConfig> = buildFixedVisualPolicy(effectiveConfig);

    const requestedOverlayIntensity = clampN(effectiveConfig.overlayIntensity ?? 100, 0, 100);
    const isAnimatedFrame =
      typeof effectiveConfig.frameIndex === 'number' && Number.isFinite(effectiveConfig.frameIndex);
    const isFirstAnimatedFrame = isAnimatedFrame && effectiveConfig.frameIndex === 0;
    const isAnimatedPreviewFrame = isPreviewScanGate && isAnimatedFrame && !isFirstAnimatedFrame;
    const overlayFamilyKey = buildOverlayFamilyKey(processedOverlayCanvas, effectiveConfig);
    const overlaySignature = await computeOverlaySignature(
      processedOverlayCanvas,
      isAnimatedFrame,
      overlayFamilyKey,
      this.createCanvas.bind(this)
    );
    const overlayComplexity = await this.resolveOverlayComplexity(
      pool,
      processedOverlayCanvas,
      isAnimatedFrame,
      overlaySignature
    );
    const sgctx: ScanGateCtx = {
      effectiveConfig,
      overlayComplexity,
      requestedOverlayIntensity,
      isPreviewScanGate,
      isScanGateDisabled,
      skipScanGateEscalation,
    };
    const adaptiveEdgeImprintThreshold = clampN(
      edgeImprintThreshold +
        overlayComplexity * 0.08 +
        curveIntensity(requestedOverlayIntensity) * 0.03,
      0.05,
      0.6
    );
    const adaptiveToneStdThreshold = clampN(
      toneStdThreshold - overlayComplexity * 0.035,
      0.04,
      0.3
    );
    const adaptiveEdgeWorsenLimit = clampN(edgeWorsenLimit + overlayComplexity * 0.02, 0, 0.24);

    const scanCacheKey = buildScanCacheKey(
      effectiveConfig,
      moduleCount,
      scanGateProfile,
      effectiveConfig.preserveFinders !== false,
      overlaySignature
    );
    const scanCacheFallbackKey = buildScanCacheKey(
      effectiveConfig,
      moduleCount,
      scanGateProfile,
      effectiveConfig.preserveFinders !== false,
      `overlay-family:${Math.round(overlayComplexity * 10)}`
    );
    const cacheIntensityFloor = clampN(
      requestedOverlayIntensity - Math.round(28 + overlayComplexity * 18),
      8,
      requestedOverlayIntensity
    );

    const baseAttempts = buildScanGateBaseAttempts(sgctx);
    const cachedPatch = this.getCachedDitherPatch(
      sgctx,
      scanCacheKey,
      scanCacheFallbackKey,
      cacheIntensityFloor
    );
    const attempts = buildDitherAttemptList(
      baseAttempts,
      cachedPatch,
      isAnimatedFrame,
      isFirstAnimatedFrame,
      isAnimatedPreviewFrame,
      ditherPatchSignature
    );

    const buildAttemptConfig = (patch: DitherAttemptPatch): QRGeneratorConfig => ({
      ...effectiveConfig,
      ...fixedVisualPolicy,
      preserveFunctionalPatterns: effectiveConfig.preserveFunctionalPatterns,
      preserveFinders: patch.preserveFinders ?? effectiveConfig.preserveFinders,
      forceCenterLock: false,
      cleanupSpeckle: false,
      darkMinOccupancy: patch.darkMinOccupancy,
      lightMaxOccupancy: patch.lightMaxOccupancy,
      optimizeIterations: patch.optimizeIterations,
      overlayIntensity: patch.overlayIntensity ?? effectiveConfig.overlayIntensity,
      qrBitBiasStrength: patch.qrBitBiasStrength ?? effectiveConfig.qrBitBiasStrength,
      qrFirstMode: patch.qrFirstMode ?? effectiveConfig.qrFirstMode ?? false,
    });

    const runDecode = async (src: HTMLCanvasElement | OffscreenCanvas): Promise<boolean> => {
      const decoded = await decodeCanvasData(src);
      return decoded?.success === true && decoded?.data === effectiveConfig.content;
    };

    const rememberPatch = (patch: DitherAttemptPatch): void => {
      this.rememberDitherPatch(
        sgctx,
        patch,
        scanCacheKey,
        scanCacheFallbackKey,
        cacheIntensityFloor
      );
    };

    const cb: ScanGateCallbacks = { buildAttemptConfig, renderScaled, runDecode, rememberPatch };

    const scenarioSeed = effectiveConfig.seed ?? 1337;
    const thresholds = {
      edge: adaptiveEdgeImprintThreshold,
      toneStd: adaptiveToneStdThreshold,
      edgeWorsen: adaptiveEdgeWorsenLimit,
    };

    const mainResult = await runScanGateMainLoop(
      pool,
      sgctx,
      moduleCount,
      attempts,
      thresholds,
      scenarioSeed,
      skipScanGateEscalation,
      cb
    );
    if (mainResult.earlyReturn) return mainResult.earlyReturn;
    const lastCanvas = mainResult.lastCanvas;

    return this.runDitheredScanGateFallback(
      sgctx,
      effectiveConfig,
      lastCanvas,
      attempts,
      isPreviewScanGate,
      isFirstAnimatedFrame,
      isAnimatedPreviewFrame,
      isScanGateDisabled,
      skipScanGateEscalation,
      requestedOverlayIntensity,
      cb,
      renderScaled,
      buildAttemptConfig,
      rememberPatch
    );
  }

  private async runDitheredScanGateFallback(
    sgctx: ScanGateCtx,
    effectiveConfig: QRGeneratorConfig,
    lastCanvas: HTMLCanvasElement | OffscreenCanvas | null,
    attempts: DitherAttemptPatch[],
    isPreviewScanGate: boolean,
    isFirstAnimatedFrame: boolean,
    isAnimatedPreviewFrame: boolean,
    isScanGateDisabled: boolean,
    skipScanGateEscalation: boolean,
    requestedOverlayIntensity: number,
    cb: ScanGateCallbacks,
    renderScaled: (cfg: QRGeneratorConfig) => Promise<HTMLCanvasElement | OffscreenCanvas>,
    buildAttemptConfig: (patch: DitherAttemptPatch) => QRGeneratorConfig,
    rememberPatch: (patch: DitherAttemptPatch) => void
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    const pool = this._canvasPool;
    const lastPatch = attempts[attempts.length - 1] || {};

    if (skipScanGateEscalation) {
      const finderRescuePatches = buildScanGateFinderRescuePatches(sgctx);
      const rescue = await runScanGateRescueLoop(
        pool,
        finderRescuePatches,
        isPreviewScanGate,
        cb,
        lastCanvas
      );
      if (rescue.found) return rescue.found;
      lastCanvas = rescue.lastCanvas;
      const fallback = lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
      if (Object.keys(lastPatch).length > 0) rememberPatch(lastPatch);
      return fallback;
    }

    let rescuePatches = [
      ...buildScanGateDecodeRescuePatches(sgctx),
      ...buildScanGateFinderRescuePatches(sgctx),
    ];
    if (isAnimatedPreviewFrame) {
      rescuePatches = rescuePatches.slice(0, 4);
    }
    const rescue = await runScanGateRescueLoop(
      pool,
      rescuePatches,
      isPreviewScanGate,
      cb,
      lastCanvas
    );
    if (rescue.found) return rescue.found;
    lastCanvas = rescue.lastCanvas;

    const requireDecodableResult = !isScanGateDisabled;
    if (!requireDecodableResult && effectiveConfig.qrFirstMode !== true) {
      return lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
    }

    if (isPreviewScanGate && effectiveConfig.qrFirstMode !== true && !isFirstAnimatedFrame) {
      return lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
    }

    const qrFirstResult = await runScanGateQRFirstFallback(
      pool,
      sgctx,
      isPreviewScanGate,
      requestedOverlayIntensity,
      effectiveConfig,
      lastPatch,
      cb
    );

    return qrFirstResult ?? (lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch))));
  }

  /**
   * Shared renderer used by QR-Art matrix render methods.
   */
  private async renderFromPreparedMatrix(
    qr: QRCodeInstance,
    moduleCount: number,
    config: QRGeneratorConfig,
    storeMatrix: () => void
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    if (moduleCount === 0) {
      throw new Error('Empty matrix provided to renderFromMatrix');
    }

    // Calculate version from module count: moduleCount = version * 4 + 17
    const version = Math.ceil((moduleCount - 17) / 4);

    // Ensure config has the correct typeNumber for structural pattern rendering
    const rawMatrixRender = config.rawMatrixRender === true;
    const effectiveConfig: QRGeneratorConfig = rawMatrixRender
      ? {
          ...config,
          typeNumber: version,
          overlayMode: undefined,
          moduleStyle: 'square',
          moduleGap: 0,
          gapMode: 'none',
          cornerRadius: 0,
          finderStyle: 'square',
          eyeOuterStyle: 'square',
          eyeInnerStyle: 'square',
          alignmentStyle: 'square',
          timingStyle: 'square',
          preserveFinders: true,
          preserveTiming: true,
          preserveAlignment: true,
          gradient: { type: 'none' } as GradientConfig,
          frameStyle: 'none',
          frameText: undefined,
          frameColor: undefined,
          frameTextColor: undefined,
          fgColor: '#000000',
          bgColor: '#ffffff',
          transparentBg: false,
        }
      : {
          ...config,
          typeNumber: version,
          // Disable overlay processing - the matrix already represents the final QR
          overlayMode: undefined,
        };

    // =======================================================================
    // STAGE 3: CANVAS SETUP (same as generate())
    // =======================================================================
    const moduleSize = config.moduleSize || 10;
    const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
    const baseMargin = Math.max(config.margin || 4, quietZoneMin);
    const frameOffsetModules = config.frameStyle && config.frameStyle !== 'none' ? 2 : 0;
    const margin = baseMargin + frameOffsetModules;
    const size = moduleCount * moduleSize + margin * 2 * moduleSize;

    const canvas = await this.createCanvas(size, size);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.imageSmoothingEnabled = false;

    // Validate and apply background color
    const effectiveBgColor = validateColor(config.bgColor, '#ffffff');
    if (!config.transparentBg) {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw frame background
    drawFrameBackground(ctx, size, moduleSize, margin, effectiveConfig);

    // Create gradient fill if configured (skipped in fast preview for performance)
    const gradientFill = config.fastPreview ? null : createGradientFill(ctx, effectiveConfig, size);
    const useGradient = !config.fastPreview && config.gradient && config.gradient.type !== 'none';

    // =======================================================================
    // STAGE 4: DRAW STRUCTURAL PATTERNS
    // =======================================================================
    const skipMask = this.drawStructuralPatterns(
      ctx,
      effectiveConfig,
      moduleCount,
      moduleSize,
      margin,
      null, // No overlay data
      version
    );

    // =======================================================================
    // STAGE 5: RENDER MODULES
    // =======================================================================
    renderModules({
      ctx,
      qr,
      config: effectiveConfig,
      moduleCount,
      moduleSize,
      margin,
      overlayData: null,
      ditherPattern: null,
      effectiveIntensity: 0,
      skipMask,
      version,
      gradientFill,
      useGradient: useGradient ?? false,
    });

    // =======================================================================
    // STAGE 6: FINAL TOUCHES
    // =======================================================================
    // Draw frame if configured
    drawFrame(ctx, size, moduleSize, margin, effectiveConfig);

    // Store the matrix for vector SVG export
    storeMatrix();

    log.debug('renderFromMatrix complete', {
      moduleCount,
      version,
      canvasSize: size,
      moduleSize,
      margin,
    });

    return canvas;
  }

  /**
   * Render a pre-computed boolean matrix with full styling.
   * Used by QR-Art to render matrices that were modified via RS basis manipulation.
   *
   * This method bypasses the encoding stage and directly renders the provided matrix
   * using the same styling pipeline as generate() (structural patterns, module styles,
   * gradients, frames, etc.).
   *
   * @param matrix - Pre-computed boolean matrix (true = dark module)
   * @param config - Rendering configuration (same as generate())
   * @returns Rendered canvas with proper styling
   */
  async renderFromMatrix(
    matrix: boolean[][],
    config: QRGeneratorConfig
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    const moduleCount = matrix.length;
    const qr = new MatrixWrapper(matrix);
    return this.renderFromPreparedMatrix(qr, moduleCount, config, () => {
      this.storeMatrixDirect(matrix, moduleCount);
    });
  }

  /**
   * Render a packed 0/1 QR matrix without first expanding to boolean[][].
   */
  async renderFromPackedMatrix(
    packedMatrix: Uint8Array,
    moduleCount: number,
    config: QRGeneratorConfig
  ): Promise<HTMLCanvasElement | OffscreenCanvas> {
    if (moduleCount <= 0) {
      throw new Error('Invalid module count provided to renderFromPackedMatrix');
    }
    const expectedLength = moduleCount * moduleCount;
    if (packedMatrix.length !== expectedLength) {
      throw new Error(
        `Invalid packed matrix length ${packedMatrix.length}, expected ${expectedLength}`
      );
    }

    const qr = new PackedMatrixWrapper(packedMatrix, moduleCount);
    return this.renderFromPreparedMatrix(qr, moduleCount, config, () => {
      this.storeMatrix(qr, moduleCount);
    });
  }
}
