/**
 * useQRGenerator Hook
 * Wires the QR store state to the QRGenerator module for live rendering
 * Supports animated GIF overlays
 */

import type { ReactNode } from 'react';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { createLogger } from '@/lib/logger';
import { trackEvent } from '@/lib/zaraz';
import {
  type AnimationFrame,
  type AnimationPattern,
  applyAnimationPattern,
  applyColorCycle,
  createGifCompositor,
  decimateCompositorFrames,
  type GifCompositor,
  interpolateFrames,
  parseAnimatedImage,
  resolveAnimationFrameDelay,
} from '@/modules/animation';
import {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  isTemporalDitherActive,
  type TemporalDitherMode,
} from '@/modules/dither-algorithms';
import {
  applyWatermark,
  getOverlayDitherKind,
  STORE_DEFAULT_DITHER,
  type WatermarkPosition,
} from '@/modules/overlay';
import { prepareInterstitial, showInterstitial } from '@/modules/platform';
import {
  type ValidationResult,
  terminateValidationWorker,
  validateInWorker,
} from '@/modules/qr-analyzer';
import {
  canvasHashCache,
  INTRINSICALLY_SCALED_OVERLAY_MODES,
  QRGenerator,
  type QRGeneratorConfig,
} from '@/modules/qr-generator';
import { useQRStore } from '@/store/qr-store';

// Singleton QR generator instance
const qrGenerator = new QRGenerator();

// Scoped logger for QR generation
const log = createLogger('QRGEN');

// Target FPS for preview mode (source GIFs above this will be decimated)
const _PREVIEW_TARGET_FPS = 15;

// Yield interval: yield after this many ms of processing to keep UI responsive
const YIELD_INTERVAL_MS = 16; // ~60fps frame budget
const CONFIG_DEBOUNCE_MS = 150;
const CONFIG_SETTLE_DEBOUNCE_MS = 300;
const QART_PERF_OVERLAY_ELEMENT_ID = 'anqr-qart-perf-overlay';
const ENABLE_QART_PERF_OVERLAY = false;

function getQArtSearchAttempts(iterations: number | undefined): number {
  if (typeof iterations !== 'number' || !Number.isFinite(iterations)) return 1;
  return Math.max(1, Math.min(5, Math.round(iterations / 10000)));
}

/**
 * Yield to main thread to prevent UI blocking during heavy computation
 * Uses requestIdleCallback with timeout fallback for mobile performance
 */
function yieldToMainThread(timeout = 50): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestIdleCallback === 'undefined') {
      // Fallback for browsers without requestIdleCallback
      setTimeout(resolve, 0);
    } else {
      requestIdleCallback(() => resolve(), { timeout });
    }
  });
}

/**
 * Time-based yield checker for batched operations
 * Returns true if enough time has passed that we should yield
 */
class YieldController {
  private lastYieldTime: number = 0;

  reset(): void {
    this.lastYieldTime = performance.now();
  }

  shouldYield(): boolean {
    const now = performance.now();
    if (now - this.lastYieldTime >= YIELD_INTERVAL_MS) {
      return true;
    }
    return false;
  }

  async yieldIfNeeded(): Promise<boolean> {
    if (this.shouldYield()) {
      await yieldToMainThread(8); // Short timeout for responsive yielding
      this.lastYieldTime = performance.now();
      return true;
    }
    return false;
  }
}

type QArtPerfSnapshot = {
  source: 'worker' | 'main';
  computeMs: number | null;
  renderMs: number | null;
  previewMs: number | null;
  version: number;
  maskPattern: number;
};

type GenerationProgressState = {
  stage: string;
  percent: number;
};

type QArtModule = typeof import('@/modules/qr-art');
type QArtResult = Awaited<ReturnType<QArtModule['generateFullQArtOptimal']>>;
type QArtWorkerResult = Awaited<ReturnType<QArtModule['generateQArtInWorker']>>;
type ExporterModule = typeof import('@/modules/exporter');

let qartModulePromise: Promise<QArtModule> | null = null;
let exporterModulePromise: Promise<ExporterModule> | null = null;

function loadQArtModule(): Promise<QArtModule> {
  qartModulePromise ??= import('@/modules/qr-art');
  return qartModulePromise;
}

function loadExporterModule(): Promise<ExporterModule> {
  exporterModulePromise ??= import('@/modules/exporter');
  return exporterModulePromise;
}

function terminateQArtWorkerIfLoaded(): void {
  const qartPromise = qartModulePromise;
  if (!qartPromise) return;
  void qartPromise
    .then((qartModule) => {
      qartModule.terminateQArtWorker();
    })
    .catch(() => {
      // Ignore termination errors during teardown.
    });
}

function readCanvasImageData(canvas: HTMLCanvasElement | OffscreenCanvas): ImageData {
  const ctx =
    (canvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null) ??
    (canvas.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null);
  if (!ctx) {
    throw new Error('Unable to read overlay pixels for QR-Art worker');
  }
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function expandPackedQArtMatrix(packed: Uint8Array, moduleCount: number): boolean[][] {
  const expectedLength = moduleCount * moduleCount;
  if (packed.length !== expectedLength) {
    throw new Error(
      `Invalid packed matrix length ${packed.length}, expected ${expectedLength} for ${moduleCount}x${moduleCount}`
    );
  }

  const matrix: boolean[][] = new Array(moduleCount);
  let idx = 0;
  for (let row = 0; row < moduleCount; row++) {
    const rowData = new Array<boolean>(moduleCount);
    for (let col = 0; col < moduleCount; col++) {
      rowData[col] = packed[idx++] === 1;
    }
    matrix[row] = rowData;
  }
  return matrix;
}

function clonePlainSerializable(value: unknown): unknown {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => clonePlainSerializable(entry));
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(source)) {
    const cloned = clonePlainSerializable(entry);
    if (cloned !== undefined) {
      target[key] = cloned;
    }
  }
  return target;
}

function sanitizeQArtRenderConfig(config: QRGeneratorConfig): Record<string, unknown> {
  const sanitized = clonePlainSerializable(config);
  return (sanitized && typeof sanitized === 'object' ? sanitized : {}) as Record<string, unknown>;
}

type EccLevel = QRGeneratorConfig['errorCorrection'];

interface SafetyAdjustmentResult {
  modulePx: number;
  quietZone: number;
  intensity: number;
  ecc: EccLevel;
  warnings: string[];
}

function adjustOverlayIntensity(params: {
  safetyMode: string;
  overlayEnabled: boolean;
  overlayIntensity: number;
  maxSafeIntensity: number;
  reduceIntensityUntilSafe: boolean;
  effectiveEcc: EccLevel;
}): { intensity: number; warnings: string[] } {
  const warnings: string[] = [];
  let adjusted = params.overlayIntensity;

  if (
    params.safetyMode === 'strict' &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    adjusted = params.maxSafeIntensity;
    warnings.push(
      `Overlay intensity reduced to ${params.maxSafeIntensity}% for ECC level ${params.effectiveEcc}`
    );
  } else if (
    params.safetyMode === 'balanced' &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    warnings.push(
      `Overlay intensity (${params.overlayIntensity}%) may reduce scannability with ECC ${params.effectiveEcc}`
    );
  }

  if (
    params.reduceIntensityUntilSafe &&
    params.overlayEnabled &&
    params.overlayIntensity > params.maxSafeIntensity
  ) {
    adjusted = params.maxSafeIntensity;
    warnings.push(
      `Auto-reduced overlay intensity to ${params.maxSafeIntensity}% for safe scanning`
    );
  }

  return { intensity: adjusted, warnings };
}

function computeSafetyAdjustments(params: {
  safetyMode: string;
  minModulePx: number;
  minQuietZoneModules: number;
  maxOverlayIntensityByEcc: Record<string, number>;
  modulePx: number;
  moduleGapPercent: number;
  moduleStyle: string;
  quietZoneModules: number;
  ecc: EccLevel;
  overlayEnabled: boolean;
  overlayIntensity: number;
  pickEcc: boolean;
  reduceIntensityUntilSafe: boolean;
  autoPickedEcc: EccLevel;
  effectiveEcc: EccLevel;
}): SafetyAdjustmentResult {
  const warnings: string[] = [];
  let adjustedModulePx = params.modulePx;
  let adjustedQuietZone = params.quietZoneModules;
  let adjustedIntensity = params.overlayIntensity;

  if (params.safetyMode !== 'off') {
    if (params.modulePx < params.minModulePx) {
      adjustedModulePx = params.minModulePx;
      warnings.push(`Module size increased to ${params.minModulePx}px for scannability`);
    }

    if (params.quietZoneModules < params.minQuietZoneModules) {
      adjustedQuietZone = params.minQuietZoneModules;
      warnings.push(`Quiet zone increased to ${params.minQuietZoneModules} modules`);
    }

    const maxSafeIntensity = params.maxOverlayIntensityByEcc[params.effectiveEcc] ?? 50;
    const intensityResult = adjustOverlayIntensity({
      safetyMode: params.safetyMode,
      overlayEnabled: params.overlayEnabled,
      overlayIntensity: params.overlayIntensity,
      maxSafeIntensity,
      reduceIntensityUntilSafe: params.reduceIntensityUntilSafe,
      effectiveEcc: params.effectiveEcc,
    });
    adjustedIntensity = intensityResult.intensity;
    warnings.push(...intensityResult.warnings);

    if (params.moduleGapPercent > 20) {
      warnings.push('Large module gaps may affect QR readability');
    }

    if (params.moduleStyle === 'dots' && params.moduleGapPercent > 10) {
      warnings.push('Dots with large gaps may be hard to scan');
    }
  }

  if (params.pickEcc && params.autoPickedEcc !== params.ecc) {
    warnings.push(`Auto-selected ECC level ${params.autoPickedEcc} for optimal balance`);
  }

  return {
    modulePx: adjustedModulePx,
    quietZone: adjustedQuietZone,
    intensity: adjustedIntensity,
    ecc: params.effectiveEcc,
    warnings,
  };
}

function applyCropTransform(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  cropRegion: { x: number; y: number; size: number }
): HTMLCanvasElement | null {
  const { x, y, size } = cropRegion;
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  const minEdge = Math.min(srcWidth, srcHeight);
  const cropSizePx = Math.max(1, Math.round(minEdge * size));
  const halfCrop = cropSizePx / 2;

  const centerX = x * srcWidth;
  const centerY = y * srcHeight;
  const cropX = Math.max(0, Math.min(srcWidth - cropSizePx, centerX - halfCrop));
  const cropY = Math.max(0, Math.min(srcHeight - cropSizePx, centerY - halfCrop));

  cropCanvas.width = cropSizePx;
  cropCanvas.height = cropSizePx;

  cropCtx.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropSizePx,
    cropSizePx,
    0,
    0,
    cropSizePx,
    cropSizePx
  );
  return cropCanvas;
}

function applyFitTransform(
  workingCanvas: HTMLCanvasElement,
  fitMode: string
): HTMLCanvasElement | null {
  const fitCanvas = document.createElement('canvas');
  const fitCtx = fitCanvas.getContext('2d');
  if (!fitCtx) return null;
  const srcW = workingCanvas.width;
  const srcH = workingCanvas.height;
  const targetSize = Math.max(srcW, srcH);

  fitCanvas.width = targetSize;
  fitCanvas.height = targetSize;

  let drawX = 0,
    drawY = 0,
    drawW = srcW,
    drawH = srcH;

  if (fitMode === 'cover') {
    const scale = Math.max(targetSize / srcW, targetSize / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = (targetSize - drawW) / 2;
    drawY = (targetSize - drawH) / 2;
  } else if (fitMode === 'contain') {
    const scale = Math.min(targetSize / srcW, targetSize / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = (targetSize - drawW) / 2;
    drawY = (targetSize - drawH) / 2;
    fitCtx.fillStyle = 'transparent';
    fitCtx.fillRect(0, 0, targetSize, targetSize);
  } else if (fitMode === 'stretch') {
    drawW = targetSize;
    drawH = targetSize;
  }

  fitCtx.drawImage(workingCanvas, drawX, drawY, drawW, drawH);
  return fitCanvas;
}

function applyRotateFlipTransform(
  workingCanvas: HTMLCanvasElement,
  rotateDeg: number,
  flipX: boolean,
  flipY: boolean
): HTMLCanvasElement | null {
  const processedCanvas = document.createElement('canvas');
  const ctx = processedCanvas.getContext('2d');
  if (!ctx) return null;
  const angle = (rotateDeg * Math.PI) / 180;
  const isRightAngle = rotateDeg === 90 || rotateDeg === 270;

  if (isRightAngle) {
    processedCanvas.width = workingCanvas.height;
    processedCanvas.height = workingCanvas.width;
  } else {
    processedCanvas.width = workingCanvas.width;
    processedCanvas.height = workingCanvas.height;
  }

  ctx.save();
  ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);

  if (rotateDeg !== 0) {
    ctx.rotate(angle);
  }
  if (flipX) {
    ctx.scale(-1, 1);
  }
  if (flipY) {
    ctx.scale(1, -1);
  }

  ctx.drawImage(workingCanvas, -workingCanvas.width / 2, -workingCanvas.height / 2);
  ctx.restore();
  return processedCanvas;
}

function updateCompositorToFrame(
  gifCompositor: GifCompositor,
  frameIdx: number,
  lastRendered: number
): void {
  if (lastRendered < 0 || frameIdx < lastRendered) {
    gifCompositor.reset();
    for (let i = 0; i <= frameIdx; i++) {
      if (i > 0) gifCompositor.dispose(i - 1);
      gifCompositor.apply(i);
    }
  } else if (frameIdx > lastRendered) {
    for (let i = lastRendered + 1; i <= frameIdx; i++) {
      if (i > 0) gifCompositor.dispose(i - 1);
      gifCompositor.apply(i);
    }
  }
}

function scheduleTrackEvent(
  eventName: string,
  payload?: Record<string, string | number | boolean>
): void {
  const run = () => {
    trackEvent(eventName, payload);
  };
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => run(), { timeout: 1200 });
    return;
  }
  setTimeout(run, 0);
}

function imageBitmapToCanvas(
  bitmap: ImageBitmap,
  targetCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = targetCanvas ?? document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create drawing context for worker-rendered QR-Art bitmap');
  }
  ctx.clearRect(0, 0, bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  return canvas;
}

function cloneCanvasFrame(
  source: HTMLCanvasElement | OffscreenCanvas,
  targetCanvas?: HTMLCanvasElement | null
): HTMLCanvasElement {
  const cloned = targetCanvas ?? document.createElement('canvas');
  cloned.width = source.width;
  cloned.height = source.height;
  const ctx = cloned.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to clone generated artwork frame');
  }
  ctx.clearRect(0, 0, cloned.width, cloned.height);
  ctx.drawImage(source, 0, 0);
  return cloned;
}

function drawToDisplayCanvas(
  displayCanvas: HTMLCanvasElement,
  source: HTMLCanvasElement | OffscreenCanvas
): void {
  const dpr = Math.max(1, globalThis.devicePixelRatio || 1);
  // Enforce a stable square preview surface regardless of upstream frame aspect.
  // QR output is expected to be square; if a non-square frame slips through
  // (e.g. transient worker/cache path), render it into a square viewport.
  const squareSize = Math.max(1, source.width, source.height);
  const cssWidth = squareSize;
  const cssHeight = squareSize;
  const backingWidth = Math.max(1, Math.round(cssWidth * dpr));
  const backingHeight = Math.max(1, Math.round(cssHeight * dpr));

  if (displayCanvas.width !== backingWidth) displayCanvas.width = backingWidth;
  if (displayCanvas.height !== backingHeight) displayCanvas.height = backingHeight;
  displayCanvas.style.width = `${cssWidth}px`;
  // Keep CSS scaling ratio-locked on resize (avoid independent max-width/max-height squish).
  displayCanvas.style.height = 'auto';

  const ctx = displayCanvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, backingWidth, backingHeight);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.drawImage(source as CanvasImageSource, 0, 0, cssWidth, cssHeight);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function safeMark(name: string): void {
  if (typeof performance === 'undefined') return;
  try {
    performance.mark(name);
  } catch {
    // Ignore performance API failures
  }
}

function safeMeasure(name: string, startMark: string, endMark: string): number | null {
  if (typeof performance === 'undefined') return null;
  try {
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, 'measure');
    const duration = entries[entries.length - 1]?.duration ?? null;
    performance.clearMeasures(name);
    return duration;
  } catch {
    return null;
  }
}

type ResolvedPreservationOptions = {
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormatInfo: boolean;
  protectVersionInfo: boolean;
};

export function resolveOverlayPreservationOptions(params: {
  overlayEnabled: boolean;
  overlayMode: string | undefined;
  safetyMode: string;
  safetyLockFinders: boolean;
  safetyLockTiming: boolean;
  safetyLockAlign: boolean;
  safetyLockFormat: boolean;
  safetyLockVersion: boolean;
  preserveFinders: boolean;
  preserveTiming: boolean;
  preserveAlignment: boolean;
  protectFormatInfo: boolean;
  protectVersionInfo: boolean;
}): ResolvedPreservationOptions {
  const isDitheredOverlayMode =
    params.overlayMode === 'dithered' ||
    params.overlayMode === 'blue_noise' ||
    params.overlayMode === 'blue-noise';
  const applySafetyLocks =
    params.overlayEnabled && params.safetyMode !== 'off' && !isDitheredOverlayMode;

  return {
    preserveFinders: applySafetyLocks
      ? params.safetyLockFinders || params.preserveFinders
      : params.preserveFinders,
    preserveTiming: applySafetyLocks
      ? params.safetyLockTiming || params.preserveTiming
      : params.preserveTiming,
    preserveAlignment: applySafetyLocks
      ? params.safetyLockAlign || params.preserveAlignment
      : params.preserveAlignment,
    protectFormatInfo: applySafetyLocks
      ? params.safetyLockFormat || params.protectFormatInfo
      : params.protectFormatInfo,
    protectVersionInfo: applySafetyLocks
      ? params.safetyLockVersion || params.protectVersionInfo
      : params.protectVersionInfo,
  };
}

async function applyWatermarkToCanvas<
  T extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  watermarkConfig: T
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  if (!watermarkConfig.enabled) return sourceCanvas;
  let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;
  if (
    (watermarkConfig.kind === 'image' || watermarkConfig.kind === 'pattern') &&
    watermarkConfig.image
  ) {
    watermarkImage = await loadFileAsCanvas(watermarkConfig.image);
  }
  const watermarked = await applyWatermark(
    sourceCanvas as HTMLCanvasElement,
    {
      kind: watermarkConfig.kind,
      text: watermarkConfig.text,
      image: watermarkImage ?? undefined,
      position: watermarkConfig.position as WatermarkPosition,
      opacity: watermarkConfig.opacity,
      blend: watermarkConfig.blend,
    } as Parameters<typeof applyWatermark>[1]
  );
  return watermarked.canvas;
}

function buildEccFallbackSequence(
  currentEcc: string,
  typeNumber: number
): readonly ('H' | 'Q' | 'M' | 'L')[] {
  const allEccLevels = ['H', 'Q', 'M', 'L'] as const;
  const eccIndex = allEccLevels.indexOf(currentEcc as (typeof allEccLevels)[number]);
  const startIndex = typeNumber === 0 ? Math.max(0, eccIndex + 1) : Math.max(0, eccIndex);
  const eccToTry = allEccLevels.slice(startIndex);
  if (eccToTry.length === 0) {
    return ['L'] as const;
  }
  return eccToTry;
}

async function tryEccFallbackGeneration(params: {
  effectiveConfig: Record<string, unknown>;
  eccToTry: readonly ('H' | 'Q' | 'M' | 'L')[];
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  yieldForResponsiveness: () => Promise<boolean>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  currentEcc: string;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; succeeded: boolean }> {
  let result: HTMLCanvasElement | OffscreenCanvas | null = null;
  for (const ecc of params.eccToTry) {
    const fallbackConfig = {
      ...params.effectiveConfig,
      typeNumber: 0,
      errorCorrection: ecc,
    };
    try {
      log.debug('Trying ECC level', { ecc });
      if (await params.yieldForResponsiveness()) return { result: null, succeeded: false };
      result = await params.runGeneratorWithStatus(
        fallbackConfig as QRGeneratorConfig,
        params.overlayEnabled ? params.overlayCanvas : null
      );
      log.debug('ECC fallback succeeded', { ecc });
      if (ecc === params.currentEcc) {
        log.info('QR generated with auto-version retry');
      } else {
        log.info('QR generated with fallback ECC', { ecc, previousEcc: params.currentEcc });
      }
      return { result, succeeded: true };
    } catch (error_) {
      log.debug('ECC fallback failed', {
        ecc,
        error: error_ instanceof Error ? error_.message : error_,
      });
    }
  }
  return { result: null, succeeded: false };
}

function localizeQArtProgressStage(
  stage: string,
  translateQArtStage: (s: string) => string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => string
): string {
  let localizedStage = translateQArtStage(stage);
  const maskMatch = /^Mask (\d+): (.+)$/.exec(stage);
  if (maskMatch) {
    const translatedInner = translateQArtStage(maskMatch[2]);
    localizedStage = t('preview.busy.qrArt.maskStage', {
      defaultValue: 'Mask {{mask}}: {{stage}}...',
      mask: Number(maskMatch[1]),
      stage: translatedInner.replace(/\.\.\.$/, ''),
    });
  }
  const attemptMaskMatch = /^Attempt (\d+)\/(\d+): Mask (\d+): (.+)$/.exec(stage);
  if (attemptMaskMatch) {
    const translatedInner = translateQArtStage(attemptMaskMatch[4]);
    localizedStage = t('preview.busy.qrArt.attemptMaskStage', {
      defaultValue: 'Attempt {{current}}/{{total}}: Mask {{mask}}: {{stage}}...',
      current: Number(attemptMaskMatch[1]),
      total: Number(attemptMaskMatch[2]),
      mask: Number(attemptMaskMatch[3]),
      stage: translatedInner.replace(/\.\.\.$/, ''),
    });
  } else {
    const attemptMatch = /^Attempt (\d+)\/(\d+): (.+)$/.exec(stage);
    if (attemptMatch) {
      const translatedInner = translateQArtStage(attemptMatch[3]);
      localizedStage = t('preview.busy.qrArt.attemptStage', {
        defaultValue: 'Attempt {{current}}/{{total}}: {{stage}}...',
        current: Number(attemptMatch[1]),
        total: Number(attemptMatch[2]),
        stage: translatedInner.replace(/\.\.\.$/, ''),
      });
    }
  }
  return localizedStage;
}

function createScaledExportCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  widthPx: number,
  heightPx: number,
  crispEdges: boolean
): HTMLCanvasElement {
  if (widthPx === sourceCanvas.width && heightPx === sourceCanvas.height) {
    return sourceCanvas as HTMLCanvasElement;
  }
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = widthPx;
  exportCanvas.height = heightPx;
  const exportCtx = exportCanvas.getContext('2d');
  if (exportCtx) {
    exportCtx.imageSmoothingEnabled = !crispEdges;
    exportCtx.imageSmoothingQuality = 'high';
    exportCtx.drawImage(sourceCanvas, 0, 0, widthPx, heightPx);
  }
  return exportCanvas;
}

function buildExportConfig<
  O extends {
    format: string;
    widthPx: number;
    heightPx: number;
    quality: number;
    filename: string;
    dpi: number;
    includeQuietZone: boolean;
    bgOverride: string;
    gifPaletteSize: number;
    gifQuantizer: string;
    gifDither: string;
    gifTransparentColor: string;
    gifDisposal: string;
    svgTrueVector: boolean;
    svgShapePrecision: number | string;
    svgEmbedRasterOverlay: boolean;
  },
  M extends {
    title: string;
    author: string;
    copyright: string;
    license: string;
    description: string;
    creationTime: boolean;
    customKv: Array<{ k: string; v: string }>;
  },
>(outputState: O, metadataState: M): Record<string, unknown> {
  return {
    outputFormat: outputState.format,
    outputWidth: outputState.widthPx,
    outputHeight: outputState.heightPx,
    outputQuality: outputState.quality,
    filename: outputState.filename,
    dpi: outputState.dpi,
    includeQuietZone: outputState.includeQuietZone,
    bgOverride: outputState.bgOverride,
    gifPaletteSize: outputState.gifPaletteSize,
    gifQuantizer: outputState.gifQuantizer,
    gifDither: outputState.gifDither,
    gifTransparentColor: outputState.gifTransparentColor,
    gifDisposal: outputState.gifDisposal,
    svgTrueVector: outputState.svgTrueVector,
    svgShapePrecision: outputState.svgShapePrecision,
    svgEmbedRasterOverlay: outputState.svgEmbedRasterOverlay,
    metadata: {
      title: metadataState.title || undefined,
      author: metadataState.author || undefined,
      copyright: metadataState.copyright || undefined,
      license: metadataState.license || undefined,
      description: metadataState.description || undefined,
      creationTime: metadataState.creationTime,
      customKv: metadataState.customKv.filter((kv) => kv.k && kv.v),
    },
  };
}

function buildPngMetadata(metadataState: {
  title: string;
  author: string;
  copyright: string;
  description: string;
  creationTime: boolean;
}): Record<string, string | undefined> | undefined {
  if (
    !metadataState.title &&
    !metadataState.author &&
    !metadataState.copyright &&
    !metadataState.description
  ) {
    return undefined;
  }
  return {
    title: metadataState.title || undefined,
    author: metadataState.author || undefined,
    copyright: metadataState.copyright || undefined,
    description: metadataState.description || undefined,
    creationTime: metadataState.creationTime ? new Date().toISOString() : undefined,
    software: 'ANQR - https://anqr.link',
  };
}

async function downloadSvgFormat(params: {
  exporter: ExporterModule;
  exportCanvas: HTMLCanvasElement;
  exportConfig: Record<string, unknown>;
  svgTrueVector: boolean;
  qrMatrix: boolean[][] | null;
  qrPackedMatrixRef: { packed: Uint8Array; moduleCount: number } | null;
  outputWidthPx: number;
  outputFilename: string;
  quietZoneModules: number;
  borderModulesExtra: number;
  renderState: Record<string, unknown>;
  metadataState: Record<string, unknown>;
}): Promise<void> {
  if (!params.svgTrueVector) {
    await params.exporter.downloadSvg(params.exportCanvas, params.exportConfig);
    return;
  }
  let vectorMatrix = params.qrMatrix;
  if (!vectorMatrix && params.qrPackedMatrixRef) {
    const { packed, moduleCount } = params.qrPackedMatrixRef;
    vectorMatrix = expandPackedQArtMatrix(packed, moduleCount);
  }
  if (!vectorMatrix) {
    log.warn(
      'Vector SVG export requested but QR matrix is unavailable. ' +
        'Falling back to raster SVG. This can happen with special render modes.'
    );
    await params.exporter.downloadSvg(params.exportCanvas, params.exportConfig);
    return;
  }
  const moduleCount = vectorMatrix.length;
  const totalMargin = params.quietZoneModules + params.borderModulesExtra;
  const svgModuleSize = Math.floor(params.outputWidthPx / (moduleCount + totalMargin * 2)) || 10;
  const rs = params.renderState as Record<string, unknown>;
  const ms = params.metadataState as Record<string, unknown>;
  const svgMetadata =
    ms.title || ms.author || ms.copyright || ms.description
      ? {
          title: (ms.title as string) || undefined,
          author: (ms.author as string) || undefined,
          copyright: (ms.copyright as string) || undefined,
          description: (ms.description as string) || undefined,
          creationTime: ms.creationTime as boolean,
          software: 'ANQR - https://anqr.link',
        }
      : undefined;
  params.exporter.downloadVectorSvg(vectorMatrix, {
    moduleSize: svgModuleSize,
    margin: totalMargin,
    fgColor: rs.fgColor as string,
    bgColor: (rs.bgTransparent ? 'transparent' : rs.bgColor) as string,
    filename: params.outputFilename,
    moduleStyle: rs.moduleStyle as string,
    cornerRadius: rs.cornerRadius as number,
    finderStyle: rs.finderStyle as string,
    eyeOuterStyle: rs.eyeOuterStyle as string,
    eyeInnerStyle: rs.eyeInnerStyle as string,
    alignmentStyle: rs.alignmentStyle as string,
    timingStyle: rs.timingStyle as string,
    gradient: rs.gradient,
    metadata: svgMetadata,
  } as Parameters<typeof params.exporter.downloadVectorSvg>[1]);
}

async function downloadAnimatedGifFormat(params: {
  exporter: ExporterModule;
  cachedAnimationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
  exportConfig: Record<string, unknown>;
  outputWidthPx: number;
  outputHeightPx: number;
  crispEdges: boolean;
  animationSpeedMs: number;
  animationLoop: boolean;
  effectiveFrames: AnimationFrame[];
  gifUseFrameDelays: boolean;
  gifMaxFps: number;
}): Promise<void> {
  const scaledFrames = params.cachedAnimationFrames.map((frame) => {
    const frameCanvas = frame as HTMLCanvasElement;
    if (
      frameCanvas.width === params.outputWidthPx &&
      frameCanvas.height === params.outputHeightPx
    ) {
      return frameCanvas;
    }
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = params.outputWidthPx;
    scaledCanvas.height = params.outputHeightPx;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (scaledCtx) {
      scaledCtx.imageSmoothingEnabled = !params.crispEdges;
      scaledCtx.imageSmoothingQuality = 'high';
      scaledCtx.drawImage(frameCanvas, 0, 0, params.outputWidthPx, params.outputHeightPx);
    }
    return scaledCanvas;
  });
  let frameDelays: number[] | undefined;
  if (params.gifUseFrameDelays && params.effectiveFrames.length > 0) {
    const minDelayMs = params.gifMaxFps > 0 ? Math.floor(1000 / params.gifMaxFps) : 0;
    frameDelays = params.effectiveFrames.map((f) =>
      Math.max(f.delay || params.animationSpeedMs, minDelayMs)
    );
  } else if (params.cachedAnimationFrames.length > 1 && params.effectiveFrames.length === 0) {
    frameDelays = params.cachedAnimationFrames.map(() => params.animationSpeedMs);
  }
  log.debug('download GIF: delays computed', {
    effectiveFramesLen: params.effectiveFrames.length,
    animationFramesLen: params.cachedAnimationFrames.length,
    scaledFramesLen: scaledFrames.length,
    frameDelaysLen: frameDelays?.length,
    minDelay: frameDelays ? Math.min(...frameDelays) : undefined,
    maxDelay: frameDelays ? Math.max(...frameDelays) : undefined,
    totalMs: frameDelays?.reduce((s, d) => s + d, 0),
    gifUseFrameDelays: params.gifUseFrameDelays,
    gifMaxFps: params.gifMaxFps,
    animSpeedMs: params.animationSpeedMs,
  });
  await params.exporter.downloadGif(
    scaledFrames,
    {
      ...params.exportConfig,
      animationSpeed: params.animationSpeedMs,
      loopAnimation: params.animationLoop,
    },
    frameDelays
  );
}

type PatternEffect = {
  pattern: AnimationPattern;
  seed: number;
  waveAxis: 'x' | 'y' | 'xy';
};

function buildPatternEffectLists(animationState: {
  pattern: string;
  pattern2: string;
  seed: number;
  waveAxis: 'x' | 'y' | 'xy';
  waveAxis2: 'x' | 'y' | 'xy';
  target: string;
  target2: string;
}): { modulePatternEffects: PatternEffect[]; resultPatternEffects: PatternEffect[] } {
  const modulePatternEffects: PatternEffect[] = [];
  const resultPatternEffects: PatternEffect[] = [];
  if (animationState.pattern !== 'none') {
    const primaryEffect: PatternEffect = {
      pattern: animationState.pattern as AnimationPattern,
      seed: animationState.seed,
      waveAxis: animationState.waveAxis,
    };
    if (animationState.target === 'modules' || animationState.target === 'both') {
      modulePatternEffects.push(primaryEffect);
    }
    if (animationState.target === 'result' || animationState.target === 'both') {
      resultPatternEffects.push(primaryEffect);
    }
  }
  if (animationState.pattern2 !== 'none') {
    const secondaryEffect: PatternEffect = {
      pattern: animationState.pattern2 as AnimationPattern,
      seed: animationState.seed + 911,
      waveAxis: animationState.waveAxis2,
    };
    if (animationState.target2 === 'modules' || animationState.target2 === 'both') {
      modulePatternEffects.push(secondaryEffect);
    }
    if (animationState.target2 === 'result' || animationState.target2 === 'both') {
      resultPatternEffects.push(secondaryEffect);
    }
  }
  return { modulePatternEffects, resultPatternEffects };
}

function computePatternDrivenJitterValue(
  frameIndex: number,
  totalFrames: number,
  baseJitterPx: number,
  modulePatternEffects: PatternEffect[]
): number {
  let jitter = baseJitterPx;
  for (const effect of modulePatternEffects) {
    const progress = frameIndex / Math.max(1, totalFrames - 1);
    const phase = Math.sin(progress * Math.PI * 2 + effect.seed * 0.013);
    const intensity = (phase + 1) / 2;
    switch (effect.pattern) {
      case 'pulse':
        jitter += 0.3 + intensity * 0.7;
        break;
      case 'wave':
        jitter += 0.6 + intensity * 0.65;
        break;
      case 'scanline':
        jitter += intensity * 0.8;
        break;
      case 'shimmer':
        jitter += (Math.sin((frameIndex + effect.seed * 3) * 1.6) + 1) * 0.35;
        break;
      case 'drift':
        jitter += 0.4 + intensity * 0.75;
        break;
      default:
        break;
    }
  }
  return Math.min(2.4, Math.max(0, Number(jitter.toFixed(3))));
}

function createScratchCanvasPool(): {
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
  getTemporalScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement;
} {
  let patternScratchA: HTMLCanvasElement | null = null;
  let patternScratchB: HTMLCanvasElement | null = null;
  let temporalScratchA: HTMLCanvasElement | null = null;
  let temporalScratchB: HTMLCanvasElement | null = null;

  const getScratch = (
    slot: 0 | 1,
    width: number,
    height: number,
    getA: () => HTMLCanvasElement | null,
    setA: (c: HTMLCanvasElement) => void,
    getB: () => HTMLCanvasElement | null,
    setB: (c: HTMLCanvasElement) => void
  ): HTMLCanvasElement => {
    const current = slot === 0 ? getA() : getB();
    if (!current) {
      const created = document.createElement('canvas');
      created.width = width;
      created.height = height;
      if (slot === 0) setA(created);
      else setB(created);
      return created;
    }
    if (current.width !== width) current.width = width;
    if (current.height !== height) current.height = height;
    return current;
  };

  return {
    getPatternScratch: (slot, width, height) =>
      getScratch(
        slot,
        width,
        height,
        () => patternScratchA,
        (c) => {
          patternScratchA = c;
        },
        () => patternScratchB,
        (c) => {
          patternScratchB = c;
        }
      ),
    getTemporalScratch: (slot, width, height) =>
      getScratch(
        slot,
        width,
        height,
        () => temporalScratchA,
        (c) => {
          temporalScratchA = c;
        },
        () => temporalScratchB,
        (c) => {
          temporalScratchB = c;
        }
      ),
  };
}

function cloneCanvasSimple(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  const cloned = document.createElement('canvas');
  cloned.width = sourceCanvas.width;
  cloned.height = sourceCanvas.height;
  const clonedCtx = cloned.getContext('2d');
  if (clonedCtx) {
    clonedCtx.drawImage(sourceCanvas, 0, 0);
  }
  return cloned;
}

function applyPatternStackToCanvas(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  effects: PatternEffect[],
  frameIndex: number,
  totalFrames: number,
  persistentOutput: boolean,
  getPatternScratch: (slot: 0 | 1, width: number, height: number) => HTMLCanvasElement
): HTMLCanvasElement | OffscreenCanvas {
  if (effects.length === 0) return sourceCanvas;
  let out = sourceCanvas;
  for (let effectIdx = 0; effectIdx < effects.length; effectIdx++) {
    const effect = effects[effectIdx];
    const targetCanvas = getPatternScratch((effectIdx % 2) as 0 | 1, out.width, out.height);
    out = applyAnimationPattern(
      out,
      frameIndex,
      totalFrames,
      effect.pattern,
      {
        seed: effect.seed,
        waveAxis: effect.waveAxis,
      },
      targetCanvas
    );
  }
  return persistentOutput ? cloneCanvasSimple(out) : out;
}

async function generateJitteredFrameLoop(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (frameIndex: number, totalFrames: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<(HTMLCanvasElement | OffscreenCanvas)[] | null> {
  const collected: (HTMLCanvasElement | OffscreenCanvas)[] = [];
  for (let i = 0; i < params.frameCount; i++) {
    if (params.isRunCancelled()) return null;
    if (await params.yieldCtrl.yieldIfNeeded()) {
      if (params.isRunCancelled()) return null;
    }
    const frameConfig = {
      ...params.previewScanConfigBase,
      frameIndex: i,
      moduleJitterPx: params.computeJitter(i, params.frameCount),
    };
    const qrFrame = await qrGenerator.generate(frameConfig, null);
    if (qrFrame) {
      collected.push(params.applyResultPersistent(qrFrame, i, params.frameCount));
    }
  }
  return collected;
}

function canvasListToAnimationFrames(
  canvases: (HTMLCanvasElement | OffscreenCanvas)[],
  speedMs: number
): AnimationFrame[] {
  return canvases.map((canvas) => ({ canvas, delay: speedMs, disposalType: 0 }));
}

async function generatePatternOnlyFrames(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<AnimationFrame[] | null> {
  const baseQR = await qrGenerator.generate(params.previewScanConfigBase, null);
  if (!baseQR || params.isRunCancelled()) return null;
  return Array.from({ length: params.frameCount }, (_, i) => ({
    canvas: params.applyResultPersistent(baseQR, i, params.frameCount),
    delay: params.speedMs,
    disposalType: 0,
  }));
}

async function generateStaticBaseFrames(params: {
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
}): Promise<AnimationFrame[] | null> {
  const staticBaseQR = await qrGenerator.generate(params.previewScanConfigBase, null);
  if (!staticBaseQR || params.isRunCancelled()) return null;
  return Array.from({ length: params.frameCount }, () => ({
    canvas: staticBaseQR,
    delay: params.speedMs,
    disposalType: 0,
  }));
}

async function generateBaseAnimationFrameSet(params: {
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  frameCount: number;
  speedMs: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (frameIndex: number, totalFrames: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
}): Promise<AnimationFrame[] | null> {
  if (params.hasPattern && !params.hasJitter) {
    return generatePatternOnlyFrames(params);
  }

  if (params.hasPattern && params.hasJitter) {
    const collected = await generateJitteredFrameLoop(params);
    if (!collected) return null;
    return canvasListToAnimationFrames(collected, params.speedMs);
  }

  if (params.hasJitter) {
    const collected = await generateJitteredFrameLoop(params);
    if (!collected) return null;
    return canvasListToAnimationFrames(collected, params.speedMs);
  }

  return generateStaticBaseFrames(params);
}

async function renderFrameForBaseAnimation(params: {
  hasPattern: boolean;
  hasJitter: boolean;
  frame: AnimationFrame;
  frameIdx: number;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (params.hasPattern || params.hasJitter) {
    return params.frame.canvas;
  }
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return await qrGenerator.generate(frameConfig, null);
}

async function renderFrameWithCompositor(params: {
  gifCompositor: GifCompositor;
  effectiveFrameIndices: number[];
  frameIdx: number;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  getTemporalScratch: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  previewScanConfigBase: QRGeneratorConfig;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const actualFrameIdx = params.effectiveFrameIndices[params.frameIdx];
  const prevActualFrameIdx =
    params.frameIdx > 0 ? params.effectiveFrameIndices[params.frameIdx - 1] : -1;
  for (let i = prevActualFrameIdx + 1; i <= actualFrameIdx; i++) {
    if (i > 0) params.gifCompositor.dispose(i - 1);
    params.gifCompositor.apply(i);
  }
  const processedOverlay = params.applyGeometricTransforms(params.gifCompositor.canvas);
  let overlayToUse: HTMLCanvasElement | OffscreenCanvas = processedOverlay;
  if (params.useTemporalDither) {
    const temporalOffset = calculateTemporalOffset(
      params.frameIdx,
      params.temporalMode,
      params.animationSeed
    );
    overlayToUse = applyTemporalNoiseToCanvas(
      processedOverlay,
      temporalOffset,
      0.008,
      params.getTemporalScratch(
        (params.frameIdx % 2) as 0 | 1,
        processedOverlay.width,
        processedOverlay.height
      )
    );
  }
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return params.isArtworkMode
    ? await params.generateArtworkFrame(overlayToUse, params.frameIdx)
    : await qrGenerator.generate(frameConfig, overlayToUse);
}

async function renderFrameWithLegacyPath(params: {
  frame: AnimationFrame;
  frameIdx: number;
  framesToProcessLength: number;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  getTemporalScratch: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  hasJitter: boolean;
  computeJitter: (fi: number, tf: number) => number;
  moduleJitterPx: number;
  previewScanConfigBase: QRGeneratorConfig;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let processedOverlay: HTMLCanvasElement | OffscreenCanvas = params.applyGeometricTransforms(
    params.frame.canvas
  );
  if (params.modulePatternEffects.length > 0) {
    processedOverlay = params.applyModulePatternEphemeral(
      processedOverlay,
      params.frameIdx,
      params.framesToProcessLength
    );
  }
  if (params.useTemporalDither) {
    const temporalOffset = calculateTemporalOffset(
      params.frameIdx,
      params.temporalMode,
      params.animationSeed
    );
    processedOverlay = applyTemporalNoiseToCanvas(
      processedOverlay,
      temporalOffset,
      0.008,
      params.getTemporalScratch(
        (params.frameIdx % 2) as 0 | 1,
        processedOverlay.width,
        processedOverlay.height
      )
    );
  }
  const frameConfig = {
    ...params.previewScanConfigBase,
    frameIndex: params.frameIdx,
    moduleJitterPx: params.hasJitter
      ? params.computeJitter(params.frameIdx, params.framesToProcessLength)
      : params.moduleJitterPx,
    temporalOffset: params.useTemporalDither
      ? calculateTemporalOffset(params.frameIdx, params.temporalMode, params.animationSeed)
      : 0,
  };
  return params.isArtworkMode
    ? await params.generateArtworkFrame(processedOverlay, params.frameIdx)
    : await qrGenerator.generate(frameConfig, processedOverlay);
}

async function applyFramePostProcessing<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
  result: HTMLCanvasElement | OffscreenCanvas;
  shouldGenerateBaseAnimation: boolean;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  framesToProcessLength: number;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
}): Promise<HTMLCanvasElement | OffscreenCanvas> {
  let finalResult: HTMLCanvasElement | OffscreenCanvas = params.result;
  if (!params.shouldGenerateBaseAnimation && params.resultPatternEffects.length > 0) {
    finalResult = params.applyResultEphemeral(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength
    );
  }
  if (params.hasColorCycle) {
    const colorCycleTarget = cloneCanvasSimple(finalResult);
    finalResult = applyColorCycle(
      finalResult,
      params.frameIdx,
      params.framesToProcessLength,
      colorCycleTarget
    );
  }
  let previewFrame: HTMLCanvasElement | OffscreenCanvas = finalResult;
  if (params.watermarkConfig.enabled) {
    previewFrame = await applyWatermarkToCanvas(finalResult, params.watermarkConfig);
  }
  return previewFrame;
}

async function applyInterpolationToFrames(
  frames: (HTMLCanvasElement | OffscreenCanvas)[],
  interpolateMode: string
): Promise<(HTMLCanvasElement | OffscreenCanvas)[]> {
  if (interpolateMode === 'none' || frames.length <= 1) return frames;
  const interpolatedFrames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
  const interpolationSteps = 2;
  for (let i = 0; i < frames.length - 1; i++) {
    interpolatedFrames.push(frames[i]);
    for (let step = 1; step <= interpolationSteps; step++) {
      const t = step / (interpolationSteps + 1);
      const interpolated = interpolateFrames(
        frames[i],
        frames[i + 1],
        t,
        interpolateMode as 'none' | 'crossfade' | 'morph'
      );
      interpolatedFrames.push(interpolated);
    }
  }
  interpolatedFrames.push(frames[frames.length - 1]);
  return interpolatedFrames;
}

async function ensureDecodableFirstFrameHelper(
  frames: (HTMLCanvasElement | OffscreenCanvas)[],
  expectedContent: string | undefined
): Promise<void> {
  if (frames.length <= 1) return;
  if (!expectedContent) return;
  const firstFrameValidation = await validateInWorker(frames[0], expectedContent, 1);
  if (firstFrameValidation.valid) return;
  const candidates: number[] = [];
  const pushCandidate = (index: number) => {
    if (!Number.isFinite(index)) return;
    const normalized = Math.max(1, Math.min(frames.length - 1, Math.floor(index)));
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };
  pushCandidate(Math.floor(frames.length * 0.25));
  pushCandidate(Math.floor(frames.length * 0.5));
  pushCandidate(Math.floor(frames.length * 0.75));
  pushCandidate(frames.length - 1);
  for (const frameIdx of candidates) {
    const validation = await validateInWorker(frames[frameIdx], expectedContent, 1);
    if (!validation.valid) continue;
    frames[0] = cloneCanvasFrame(frames[frameIdx], null);
    log.info('animation cache: promoted decodable start frame', {
      sourceFrame: frameIdx,
      frameCount: frames.length,
    });
    return;
  }
  log.warn('animation cache: no decodable frame found for start frame promotion', {
    frameCount: frames.length,
  });
}

function resolveArtworkMaskPattern(
  useAutoMask: boolean,
  artworkLockedMask: number,
  configMaskPattern: number
): number | undefined {
  if (useAutoMask && artworkLockedMask < 0) return undefined;
  if (artworkLockedMask >= 0) return artworkLockedMask;
  return configMaskPattern;
}

async function runArtworkMainThreadFallback(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  useAutoMask: boolean;
  artworkLockedMask: number;
  configMaskPattern: number;
}): Promise<QArtResult> {
  return params.useAutoMask && params.artworkLockedMask < 0
    ? await params.qartModule.generateFullQArtOptimal({
        ...params.qartConfig,
        targetImage: params.frameOverlayCanvas,
      } as Parameters<QArtModule['generateFullQArtOptimal']>[0])
    : await params.qartModule.generateFullQArt({
        ...params.qartConfig,
        targetImage: params.frameOverlayCanvas,
        maskPattern:
          params.artworkLockedMask >= 0 ? params.artworkLockedMask : params.configMaskPattern,
      } as Parameters<QArtModule['generateFullQArt']>[0]);
}

async function rescueOutlierArtworkFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  targetImage: ImageData;
  originalResult: QArtWorkerResult;
  searchAttempts: number;
  rescueSeed: number;
  maskPattern: number | undefined;
  signal: AbortSignal;
  isRunCancelled: () => boolean;
}): Promise<QArtWorkerResult> {
  try {
    const rescueResult = await params.qartModule.generateQArtInWorker(
      {
        ...params.qartConfig,
        targetImage: params.targetImage,
        searchAttempts: params.searchAttempts,
        searchSeed: params.rescueSeed,
        maskPattern: params.maskPattern,
        performanceProfile: 'quality',
        renderConfig: params.workerRenderConfig,
        renderInWorker: true,
      } as Parameters<QArtModule['generateQArtInWorker']>[0],
      { signal: params.signal }
    );
    if (
      rescueResult.success &&
      rescueResult.matchPercentage > params.originalResult.matchPercentage + 0.75
    ) {
      if (
        params.originalResult.bitmap &&
        typeof params.originalResult.bitmap.close === 'function'
      ) {
        params.originalResult.bitmap.close();
      }
      log.info('QR-Art frame quality rescue accepted', {
        initialMatch: params.originalResult.matchPercentage,
        rescuedMatch: rescueResult.matchPercentage,
      });
      return rescueResult;
    }
    if (rescueResult.bitmap && typeof rescueResult.bitmap.close === 'function') {
      rescueResult.bitmap.close();
    }
  } catch (error_) {
    if (params.isRunCancelled()) throw error_;
    log.warn('QR-Art frame quality rescue failed; keeping initial frame result', {
      error: error_,
    });
  }
  return params.originalResult;
}

function renderArtworkWorkerBitmap(params: {
  workerResult: QArtWorkerResult;
  getScratchCanvas: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  frameIdx: number;
}): HTMLCanvasElement | null {
  if (!params.workerResult.bitmap) return null;
  const rendered = imageBitmapToCanvas(
    params.workerResult.bitmap,
    params.getScratchCanvas(
      (params.frameIdx % 2) as 0 | 1,
      params.workerResult.bitmap.width,
      params.workerResult.bitmap.height
    )
  );
  if (typeof params.workerResult.bitmap.close === 'function') {
    params.workerResult.bitmap.close();
  }
  return rendered;
}

async function renderArtworkWorkerMatrix(params: {
  workerResult: QArtWorkerResult;
  debouncedConfig: Record<string, unknown>;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (!params.workerResult.matrix || params.workerResult.moduleCount <= 0) return null;
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: params.workerResult.version,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  return await qrGenerator.renderFromPackedMatrix(
    params.workerResult.matrix,
    params.workerResult.moduleCount,
    qrArtConfig
  );
}

async function processAnimationFrameLoopIteration(params: {
  frameIdx: number;
  frame: AnimationFrame;
  framesToProcessLength: number;
  shouldGenerateBaseAnimation: boolean;
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  useCompositor: boolean;
  gifCompositor: GifCompositor | null;
  effectiveFrameIndices: number[];
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  scratchPool: ReturnType<typeof createScratchCanvasPool>;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, tf: number) => number;
  moduleJitterPx: number;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  if (params.shouldGenerateBaseAnimation) {
    return await renderFrameForBaseAnimation({
      hasPattern: params.hasPattern,
      hasJitter: params.hasJitter,
      frame: params.frame,
      frameIdx: params.frameIdx,
      previewScanConfigBase: params.previewScanConfigBase,
      useTemporalDither: params.useTemporalDither,
      temporalMode: params.temporalMode,
      animationSeed: params.animationSeed,
    });
  }
  if (params.useCompositor && params.gifCompositor) {
    return await renderFrameWithCompositor({
      gifCompositor: params.gifCompositor,
      effectiveFrameIndices: params.effectiveFrameIndices,
      frameIdx: params.frameIdx,
      applyGeometricTransforms: params.applyGeometricTransforms,
      useTemporalDither: params.useTemporalDither,
      temporalMode: params.temporalMode,
      animationSeed: params.animationSeed,
      getTemporalScratch: params.scratchPool.getTemporalScratch,
      previewScanConfigBase: params.previewScanConfigBase,
      isArtworkMode: params.isArtworkMode,
      generateArtworkFrame: params.generateArtworkFrame,
    });
  }
  return await renderFrameWithLegacyPath({
    frame: params.frame,
    frameIdx: params.frameIdx,
    framesToProcessLength: params.framesToProcessLength,
    applyGeometricTransforms: params.applyGeometricTransforms,
    modulePatternEffects: params.modulePatternEffects,
    applyModulePatternEphemeral: params.applyModulePatternEphemeral,
    useTemporalDither: params.useTemporalDither,
    temporalMode: params.temporalMode,
    animationSeed: params.animationSeed,
    getTemporalScratch: params.scratchPool.getTemporalScratch,
    hasJitter: params.hasJitter,
    computeJitter: params.computeJitter,
    moduleJitterPx: params.moduleJitterPx,
    previewScanConfigBase: params.previewScanConfigBase,
    isArtworkMode: params.isArtworkMode,
    generateArtworkFrame: params.generateArtworkFrame,
  });
}

async function finalizeAnimationFrames(params: {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  hasInterpolation: boolean;
  interpolateMode: string;
  content: string | undefined;
  isRunCancelled: () => boolean;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<(HTMLCanvasElement | OffscreenCanvas)[]> {
  let frames = params.frames;
  if (params.hasInterpolation && frames.length > 1) {
    params.updateGenerationProgress(
      params.t('preview.busy.smoothingAnimationFrames', 'Smoothing the animation frames...'),
      92
    );
    frames = await applyInterpolationToFrames(frames, params.interpolateMode);
  }
  if (frames.length > 1 && params.content) {
    params.updateGenerationProgress(
      params.t(
        'preview.busy.finalizingFirstAnimationFrame',
        'Finalizing the first animation frame...'
      ),
      96
    );
    await ensureDecodableFirstFrameHelper(frames, params.content);
  }
  return frames;
}

function checkOverflowContentChanged(
  lastOverflowContent: string | null,
  currentContent: string | undefined
): boolean {
  return lastOverflowContent !== null && lastOverflowContent !== currentContent;
}

function clearDisplayCanvas(canvasEl: HTMLCanvasElement | null): void {
  if (!canvasEl) return;
  const ctx = canvasEl.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  }
}

function formatGenerationErrorMessage(
  err: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any
): string {
  const rawMessage =
    err instanceof Error
      ? err.message
      : t('errors.failedToGenerateQr', 'Failed to generate QR code');
  if (
    rawMessage.includes('code length overflow') ||
    rawMessage.includes('maximum QR code capacity')
  ) {
    return t(
      'errors.contentTooLongForQr',
      'Content too long for QR code. Please shorten your content or use a URL shortener.'
    );
  }
  return rawMessage;
}

function dispatchRenderCompleteEvent(success: boolean, errorMessage?: string): void {
  document.dispatchEvent(
    new CustomEvent('anqr:render-complete', {
      detail: { success, error: success ? null : (errorMessage ?? null) },
    })
  );
}

async function runQArtWorkerGeneration(params: {
  qartModule: QArtModule;
  qartConfig: {
    data: string;
    version: number;
    ecc: 'L' | 'M' | 'Q' | 'H';
    strictSuffix: boolean;
    targetControlPercent: number;
    searchAttempts: number;
    searchSeed: number;
    lockVersionToMinimum: boolean;
    performanceProfile: 'quality';
    onProgress: (stage: string, percent: number) => void;
  };
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  useAutoMask: boolean;
  qartAbortSignal: AbortSignal;
}): Promise<{
  result: QArtResult;
  source: 'worker' | 'main';
  packedMatrix: Uint8Array | null;
  bitmap: ImageBitmap | null;
}> {
  try {
    const targetImage = readCanvasImageData(params.overlayCanvas);
    const workerRenderConfig = sanitizeQArtRenderConfig({
      ...params.debouncedConfig,
      typeNumber: params.qartConfig.version,
      overlayMode: undefined,
    } as QRGeneratorConfig);
    const workerResult = await params.qartModule.generateQArtInWorker(
      {
        data: params.qartConfig.data,
        targetImage,
        version: params.qartConfig.version,
        ecc: params.qartConfig.ecc,
        strictSuffix: params.qartConfig.strictSuffix,
        targetControlPercent: params.qartConfig.targetControlPercent,
        searchAttempts: params.qartConfig.searchAttempts,
        searchSeed: params.qartConfig.searchSeed,
        lockVersionToMinimum: params.qartConfig.lockVersionToMinimum,
        maskPattern: params.useAutoMask
          ? undefined
          : (params.debouncedConfig.maskPattern as number),
        performanceProfile: params.qartConfig.performanceProfile,
        renderConfig: workerRenderConfig,
        renderInWorker: true,
      },
      {
        onProgress: params.qartConfig.onProgress,
        signal: params.qartAbortSignal,
      }
    );

    const packedMatrix =
      workerResult.success && workerResult.matrix && workerResult.moduleCount > 0
        ? workerResult.matrix
        : null;
    const bitmap = workerResult.success && workerResult.bitmap ? workerResult.bitmap : null;
    const result: QArtResult = {
      success: workerResult.success,
      error: workerResult.error,
      matrix: [],
      moduleCount: workerResult.moduleCount,
      version: workerResult.version,
      maskPattern: workerResult.maskPattern,
      matchingPixels: workerResult.matchingPixels,
      totalControllable: workerResult.totalControllable,
      matchPercentage: workerResult.matchPercentage,
      encodedData: workerResult.encodedData ?? '',
    };
    return { result, source: 'worker', packedMatrix, bitmap };
  } catch (error_) {
    if (params.qartAbortSignal.aborted) {
      throw error_;
    }
    log.warn('QArt worker failed, falling back to main thread generation', {
      error: error_,
    });
    const result = params.useAutoMask
      ? await params.qartModule.generateFullQArtOptimal({
          ...params.qartConfig,
          targetImage: params.overlayCanvas,
        })
      : await params.qartModule.generateFullQArt({
          ...params.qartConfig,
          targetImage: params.overlayCanvas,
          maskPattern: params.debouncedConfig.maskPattern as number,
        });
    return { result, source: 'main', packedMatrix: null, bitmap: null };
  }
}

async function renderQArtResultToCanvas(params: {
  fullQArtResult: QArtResult;
  workerRenderedBitmap: ImageBitmap | null;
  workerPackedMatrix: Uint8Array | null;
  debouncedConfig: Record<string, unknown>;
  bitmapCanvasRef: { current: HTMLCanvasElement | null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateGenerationProgress: (...args: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ canvas: HTMLCanvasElement | null; usedBitmapRender: boolean }> {
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: params.fullQArtResult.version,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  params.updateGenerationProgress(
    params.t('preview.busy.renderingQrPreview', 'Rendering your QR preview...'),
    86
  );
  if (params.workerRenderedBitmap) {
    const canvas = imageBitmapToCanvas(
      params.workerRenderedBitmap,
      params.bitmapCanvasRef.current ?? undefined
    );
    params.bitmapCanvasRef.current = canvas as HTMLCanvasElement;
    if (typeof params.workerRenderedBitmap.close === 'function') {
      params.workerRenderedBitmap.close();
    }
    return { canvas: canvas as HTMLCanvasElement, usedBitmapRender: true };
  }
  if (params.workerPackedMatrix && params.fullQArtResult.moduleCount > 0) {
    const canvas = (await qrGenerator.renderFromPackedMatrix(
      params.workerPackedMatrix,
      params.fullQArtResult.moduleCount,
      qrArtConfig
    )) as HTMLCanvasElement;
    return { canvas, usedBitmapRender: false };
  }
  const canvas = (await qrGenerator.renderFromMatrix(
    params.fullQArtResult.matrix,
    qrArtConfig
  )) as HTMLCanvasElement;
  return { canvas, usedBitmapRender: false };
}

function recordQArtPerfTimings(params: {
  qartRequestMarked: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  qartComputeMs: number | null;
  qartResultSource: 'worker' | 'main';
}): { renderMs: number | null; previewMs: number | null } {
  safeMark(params.qartRenderMark);
  const renderMs = params.qartRequestMarked
    ? safeMeasure(
        `${params.qartPerfMarkPrefix}:render`,
        params.qartResultMark,
        params.qartRenderMark
      )
    : null;
  const previewMs = params.qartRequestMarked
    ? safeMeasure(
        `${params.qartPerfMarkPrefix}:preview`,
        params.qartRequestMark,
        params.qartRenderMark
      )
    : null;
  log.info('QR-Art timing', {
    source: params.qartResultSource,
    computeMs: params.qartComputeMs === null ? null : Math.round(params.qartComputeMs),
    renderMs: renderMs === null ? null : Math.round(renderMs),
    previewMs: previewMs === null ? null : Math.round(previewMs),
  });
  return { renderMs, previewMs };
}

function updateQrMatrixFromResult(params: {
  usedWorkerBitmapRender: boolean;
  workerPackedMatrix: Uint8Array | null;
  qartResultSource: 'worker' | 'main';
  qartResultModuleCount: number;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
}): void {
  if (
    params.usedWorkerBitmapRender &&
    params.workerPackedMatrix &&
    params.qartResultSource === 'worker' &&
    params.qartResultModuleCount > 0
  ) {
    params.qrPackedMatrixRef.current = {
      packed: params.workerPackedMatrix,
      moduleCount: params.qartResultModuleCount,
    };
    params.setQrMatrix(null);
    return;
  }
  const matrixData = qrGenerator.getLastMatrix();
  if (matrixData) {
    params.qrPackedMatrixRef.current = null;
    params.setQrMatrix(matrixData.matrix);
  }
}

async function handleOverflowError(params: {
  effectiveConfig: Record<string, unknown>;
  debouncedConfigTypeNumber: number;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  yieldForResponsiveness: () => Promise<boolean>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; succeeded: boolean }> {
  const currentEcc = (params.effectiveConfig.errorCorrection as string) || 'H';
  const eccToTry = buildEccFallbackSequence(currentEcc, params.debouncedConfigTypeNumber);

  log.debug('Trying ECC fallback sequence', { eccToTry, currentEcc });
  const fallbackResult = await tryEccFallbackGeneration({
    effectiveConfig: params.effectiveConfig,
    eccToTry,
    runGeneratorWithStatus: params.runGeneratorWithStatus,
    yieldForResponsiveness: params.yieldForResponsiveness,
    overlayEnabled: params.overlayEnabled,
    overlayCanvas: params.overlayCanvas,
    currentEcc,
  });

  if (fallbackResult.succeeded) {
    return { result: fallbackResult.result, succeeded: true };
  }

  log.debug('All ECC levels failed', {
    contentLength: (params.effectiveConfig.content as string)?.length,
    contentPreview: (params.effectiveConfig.content as string)?.substring(0, 100),
    triedEccLevels: eccToTry,
  });
  params.lastOverflowContentRef.current = params.effectiveConfig.content as string;
  params.isOverflowBlockedRef.current = true;
  params.setHasOverflowError(true);
  params.setError(
    params.t(
      'errors.contentTooLongForQr',
      'Content too long for QR code. Please shorten your content or use a URL shortener.'
    )
  );
  params.setIsRendering(false);
  params.setIsLoading(false);
  params.clearGenerationProgress();
  return { result: null, succeeded: false };
}

function setupValidationRunner(params: {
  requestId: number;
  animationFrameCount: number;
  hasMultipleSourceFramesRef: { current: boolean };
  animationPlaying: boolean;
  setIsValidating: (v: boolean) => void;
  setValidation: (v: ValidationResult | null) => void;
  generationRequestIdRef: { current: number };
}): (
  renderedCanvas: HTMLCanvasElement | OffscreenCanvas,
  expectedContent: string | undefined
) => void {
  return (
    renderedCanvas: HTMLCanvasElement | OffscreenCanvas,
    expectedContent: string | undefined
  ): void => {
    const isCurrentlyAnimating =
      (params.animationFrameCount > 1 || params.hasMultipleSourceFramesRef.current) &&
      params.animationPlaying;
    const shouldValidate = Boolean(expectedContent) && !isCurrentlyAnimating;
    if (!shouldValidate) return;

    const validationRequestId = params.requestId;
    params.setIsValidating(true);
    const validationDelay = 120;
    setTimeout(() => {
      if (params.generationRequestIdRef.current !== validationRequestId) {
        params.setIsValidating(false);
        return;
      }
      validateInWorker(renderedCanvas, expectedContent, 2)
        .then((validationResult) => {
          if (params.generationRequestIdRef.current === validationRequestId) {
            params.setValidation(validationResult);
          }
        })
        .catch((err) => {
          log.error('Validation error', { error: err });
          if (params.generationRequestIdRef.current === validationRequestId) {
            params.setValidation(null);
          }
        })
        .finally(() => {
          params.setIsValidating(false);
        });
    }, validationDelay);
  };
}

async function executeQArtWorkerPipeline(params: {
  qartModule: QArtModule;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  qartAbortController: AbortController;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  translateQArtStage: (s: string) => string;
  qartPreviewBitmapCanvasRef: { current: HTMLCanvasElement | null };
  requestId: number;
}): Promise<{
  useFullQArt: boolean;
  fullQArtCanvas: HTMLCanvasElement | null;
  qartResultVersion: number;
  qartResultMaskPattern: number;
  qartResultModuleCount: number;
  qartResultSource: 'worker' | 'main';
  qartComputeMs: number | null;
  qartRequestMarked: boolean;
  workerPackedMatrix: Uint8Array | null;
  usedWorkerBitmapRender: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  aborted: boolean;
}> {
  let useFullQArt = false;
  let fullQArtCanvas: HTMLCanvasElement | null = null;
  let qartResultVersion = 0;
  let qartResultMaskPattern = 0;
  let qartResultModuleCount = 0;
  let qartResultSource: 'worker' | 'main' = 'main';
  let qartComputeMs: number | null = null;
  let qartRequestMarked = false;
  let workerPackedMatrix: Uint8Array | null = null;
  let workerRenderedBitmap: ImageBitmap | null = null;
  let usedWorkerBitmapRender = false;

  const qartPerfMarkPrefix = `anqr:qart:${params.requestId}`;
  const qartRequestMark = `${qartPerfMarkPrefix}:request`;
  const qartResultMark = `${qartPerfMarkPrefix}:result`;
  const qartRenderMark = `${qartPerfMarkPrefix}:render`;

  const mkResult = (aborted: boolean) => ({
    useFullQArt,
    fullQArtCanvas,
    qartResultVersion,
    qartResultMaskPattern,
    qartResultModuleCount,
    qartResultSource,
    qartComputeMs,
    qartRequestMarked,
    workerPackedMatrix,
    usedWorkerBitmapRender,
    qartPerfMarkPrefix,
    qartRequestMark,
    qartResultMark,
    qartRenderMark,
    aborted,
  });

  try {
    if (await params.yieldForResponsiveness()) return mkResult(true);
    const useAutoMask =
      typeof params.debouncedConfig.maskPattern !== 'number' ||
      (params.debouncedConfig.maskPattern as number) < 0;
    const qartConfig = {
      data: params.debouncedConfig.content as string,
      version: (params.debouncedConfig.typeNumber as number) || 0,
      ecc: ((params.debouncedConfig.errorCorrection as string) || 'M') as 'L' | 'M' | 'Q' | 'H',
      strictSuffix: true,
      targetControlPercent: 100,
      searchAttempts: getQArtSearchAttempts(params.debouncedConfig.qrartIterations as number),
      searchSeed: (params.debouncedConfig.qrartSeed as number) ?? 0,
      lockVersionToMinimum: (params.debouncedConfig.typeNumber as number) === 0,
      performanceProfile: 'quality' as const,
      onProgress: (stage: string, percent: number) => {
        const localizedStage = localizeQArtProgressStage(
          stage,
          params.translateQArtStage,
          params.t as unknown as (...args: any[]) => string
        );
        params.updateGenerationProgress(localizedStage, 18 + percent * 0.64);
        log.debug('QR-Art progress', { stage: localizedStage, percent: `${percent}%` });
      },
    };

    safeMark(qartRequestMark);
    qartRequestMarked = true;

    let fullQArtResult: QArtResult;
    try {
      const workerGenResult = await runQArtWorkerGeneration({
        qartModule: params.qartModule,
        qartConfig,
        overlayCanvas: params.overlayCanvas,
        debouncedConfig: params.debouncedConfig,
        useAutoMask,
        qartAbortSignal: params.qartAbortController.signal,
      });
      fullQArtResult = workerGenResult.result;
      qartResultSource = workerGenResult.source;
      workerPackedMatrix = workerGenResult.packedMatrix;
      workerRenderedBitmap = workerGenResult.bitmap;
    } catch (error_) {
      if (params.qartAbortController.signal.aborted || params.isStaleRequest()) {
        return mkResult(true);
      }
      throw error_;
    }

    safeMark(qartResultMark);
    if (qartRequestMarked) {
      qartComputeMs = safeMeasure(`${qartPerfMarkPrefix}:compute`, qartRequestMark, qartResultMark);
    }
    qartResultVersion = fullQArtResult.version;
    qartResultMaskPattern = fullQArtResult.maskPattern;
    qartResultModuleCount = fullQArtResult.moduleCount;

    if (fullQArtResult.success && fullQArtResult.encodedData) {
      log.info('Full QR-Art generation successful', {
        matchPercentage: `${fullQArtResult.matchPercentage.toFixed(1)}%`,
        matchingPixels: fullQArtResult.matchingPixels,
        totalControllable: fullQArtResult.totalControllable,
        version: fullQArtResult.version,
        maskPattern: fullQArtResult.maskPattern,
        encodedData: fullQArtResult.encodedData,
        source: qartResultSource,
        computeMs: qartComputeMs === null ? null : Math.round(qartComputeMs),
      });

      try {
        const renderResult = await renderQArtResultToCanvas({
          fullQArtResult,
          workerRenderedBitmap,
          workerPackedMatrix,
          debouncedConfig: params.debouncedConfig,
          bitmapCanvasRef: params.qartPreviewBitmapCanvasRef,
          updateGenerationProgress: params.updateGenerationProgress,
          t: params.t,
        });
        fullQArtCanvas = renderResult.canvas;
        usedWorkerBitmapRender = renderResult.usedBitmapRender;
        workerRenderedBitmap = null;
        useFullQArt = true;
      } catch (error_) {
        log.error('Failed to render QR-Art matrix', { error: error_ });
      }
    } else if (fullQArtResult.success) {
      log.warn('QR-Art succeeded but encodedData is missing');
    } else {
      log.warn('Full QR-Art generation failed', {
        error: fullQArtResult.error,
        source: qartResultSource,
      });
    }
  } catch (err) {
    log.warn('Full QR-Art generation threw error, falling back to fragment search', {
      error: err,
    });
  }

  return mkResult(false);
}

async function deliverQArtResult(params: {
  fullQArtCanvas: HTMLCanvasElement;
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  isStaleRequest: () => boolean;
  canvasRef: { current: HTMLCanvasElement | null };
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  qartRequestMarked: boolean;
  qartPerfMarkPrefix: string;
  qartRequestMark: string;
  qartResultMark: string;
  qartRenderMark: string;
  qartComputeMs: number | null;
  qartResultSource: 'worker' | 'main';
  qartResultVersion: number;
  qartResultMaskPattern: number;
  qartResultModuleCount: number;
  usedWorkerBitmapRender: boolean;
  workerPackedMatrix: Uint8Array | null;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  effectiveConfig: Record<string, unknown>;
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined
  ) => void;
  setQArtPerfSnapshot: (s: QArtPerfSnapshot) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
}): Promise<{ handled: boolean }> {
  if (params.isStaleRequest()) return { handled: true };
  const resultCanvas = await applyWatermarkToCanvas(params.fullQArtCanvas, params.watermark);

  if (params.isStaleRequest()) return { handled: true };
  params.setCanvas(resultCanvas);
  params.updateGenerationProgress(
    params.t('preview.busy.finalizingPreview', 'Finalizing the preview...'),
    96
  );
  if (params.canvasRef.current) {
    drawToDisplayCanvas(params.canvasRef.current, resultCanvas);
  }

  const { renderMs: qartRenderMs, previewMs: qartPreviewMs } = recordQArtPerfTimings({
    qartRequestMarked: params.qartRequestMarked,
    qartPerfMarkPrefix: params.qartPerfMarkPrefix,
    qartRequestMark: params.qartRequestMark,
    qartResultMark: params.qartResultMark,
    qartRenderMark: params.qartRenderMark,
    qartComputeMs: params.qartComputeMs,
    qartResultSource: params.qartResultSource,
  });
  params.setQArtPerfSnapshot({
    source: params.qartResultSource,
    computeMs: params.qartComputeMs,
    renderMs: qartRenderMs,
    previewMs: qartPreviewMs,
    version: params.qartResultVersion,
    maskPattern: params.qartResultMaskPattern,
  });

  updateQrMatrixFromResult({
    usedWorkerBitmapRender: params.usedWorkerBitmapRender,
    workerPackedMatrix: params.workerPackedMatrix,
    qartResultSource: params.qartResultSource,
    qartResultModuleCount: params.qartResultModuleCount,
    qrPackedMatrixRef: params.qrPackedMatrixRef,
    setQrMatrix: params.setQrMatrix,
  });

  params.runValidationIfNeeded(resultCanvas, params.effectiveConfig.content as string);
  params.setIsRendering(false);
  params.setIsLoading(false);
  params.clearGenerationProgress();
  return { handled: true };
}

async function runQArtGeneration(params: {
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  debouncedConfig: Record<string, unknown>;
  qartAbortController: AbortController;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  translateQArtStage: (s: string) => string;
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  canvasRef: { current: HTMLCanvasElement | null };
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  qartPreviewBitmapCanvasRef: { current: HTMLCanvasElement | null };
  effectiveConfig: Record<string, unknown>;
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined
  ) => void;
  setQArtPerfSnapshot: (s: QArtPerfSnapshot) => void;
  requestId: number;
}): Promise<{ handled: boolean }> {
  const qartModule = await loadQArtModule();
  if (params.isStaleRequest()) return { handled: true };
  params.updateGenerationProgress(
    params.t('preview.busy.preparingQrArtComputation', 'Preparing QR-Art computation...'),
    18
  );
  log.info('Starting QR-Art generation', {
    content: (params.debouncedConfig.content as string)?.substring(0, 50),
    version: params.debouncedConfig.typeNumber,
    ecc: params.debouncedConfig.errorCorrection,
  });

  const pipeline = await executeQArtWorkerPipeline({
    qartModule,
    overlayCanvas: params.overlayCanvas,
    debouncedConfig: params.debouncedConfig,
    qartAbortController: params.qartAbortController,
    isStaleRequest: params.isStaleRequest,
    yieldForResponsiveness: params.yieldForResponsiveness,
    updateGenerationProgress: params.updateGenerationProgress,
    t: params.t,
    translateQArtStage: params.translateQArtStage,
    qartPreviewBitmapCanvasRef: params.qartPreviewBitmapCanvasRef,
    requestId: params.requestId,
  });

  if (pipeline.aborted) return { handled: true };

  if (pipeline.useFullQArt && pipeline.fullQArtCanvas) {
    return deliverQArtResult({
      fullQArtCanvas: pipeline.fullQArtCanvas,
      watermark: params.watermark,
      isStaleRequest: params.isStaleRequest,
      canvasRef: params.canvasRef,
      setCanvas: params.setCanvas,
      updateGenerationProgress: params.updateGenerationProgress,
      t: params.t,
      qartRequestMarked: pipeline.qartRequestMarked,
      qartPerfMarkPrefix: pipeline.qartPerfMarkPrefix,
      qartRequestMark: pipeline.qartRequestMark,
      qartResultMark: pipeline.qartResultMark,
      qartRenderMark: pipeline.qartRenderMark,
      qartComputeMs: pipeline.qartComputeMs,
      qartResultSource: pipeline.qartResultSource,
      qartResultVersion: pipeline.qartResultVersion,
      qartResultMaskPattern: pipeline.qartResultMaskPattern,
      qartResultModuleCount: pipeline.qartResultModuleCount,
      usedWorkerBitmapRender: pipeline.usedWorkerBitmapRender,
      workerPackedMatrix: pipeline.workerPackedMatrix,
      qrPackedMatrixRef: params.qrPackedMatrixRef,
      setQrMatrix: params.setQrMatrix,
      effectiveConfig: params.effectiveConfig,
      runValidationIfNeeded: params.runValidationIfNeeded,
      setQArtPerfSnapshot: params.setQArtPerfSnapshot,
      setIsRendering: params.setIsRendering,
      setIsLoading: params.setIsLoading,
      clearGenerationProgress: params.clearGenerationProgress,
    });
  }

  return { handled: false };
}

async function handleGenerationError(params: {
  error: unknown;
  effectiveConfig: Record<string, unknown>;
  debouncedConfig: Record<string, unknown>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  const msg = params.error instanceof Error ? params.error.message : '';
  log.debug('Initial generation failed', {
    errorMessage: msg,
    isOverflow: msg.includes('code length overflow'),
  });
  if (!msg.includes('code length overflow')) {
    throw params.error;
  }
  const overflowResult = await handleOverflowError({
    effectiveConfig: params.effectiveConfig,
    debouncedConfigTypeNumber: params.debouncedConfig.typeNumber as number,
    runGeneratorWithStatus: params.runGeneratorWithStatus,
    yieldForResponsiveness: params.yieldForResponsiveness,
    overlayEnabled: params.overlayEnabled,
    overlayCanvas: params.overlayCanvas,
    lastOverflowContentRef: params.lastOverflowContentRef,
    isOverflowBlockedRef: params.isOverflowBlockedRef,
    setHasOverflowError: params.setHasOverflowError,
    setError: params.setError,
    setIsRendering: params.setIsRendering,
    setIsLoading: params.setIsLoading,
    clearGenerationProgress: params.clearGenerationProgress,
    t: params.t,
  });
  if (overflowResult.succeeded) {
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug('QR generated using fallback settings due to content length');
    return { result: overflowResult.result, aborted: false };
  }
  return { result: null, aborted: true };
}

async function runStandardGeneration(params: {
  effectiveConfig: Record<string, unknown>;
  debouncedConfig: Record<string, unknown>;
  overlayEnabled: boolean;
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  yieldForResponsiveness: () => Promise<boolean>;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  runGeneratorWithStatus: (
    cfg: QRGeneratorConfig,
    overlaySource: HTMLCanvasElement | OffscreenCanvas | null
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  setIsRendering: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearGenerationProgress: () => void;
}): Promise<{ result: HTMLCanvasElement | OffscreenCanvas | null; aborted: boolean }> {
  try {
    log.debug('Attempting QR generation', {
      contentLength: (params.effectiveConfig.content as string)?.length,
      typeNumber: params.effectiveConfig.typeNumber,
      errorCorrection: params.effectiveConfig.errorCorrection,
    });
    params.updateGenerationProgress(
      params.t('preview.busy.renderingQrPreview', 'Rendering your QR preview...'),
      58
    );
    if (await params.yieldForResponsiveness()) return { result: null, aborted: true };
    const result = await params.runGeneratorWithStatus(
      params.effectiveConfig as unknown as QRGeneratorConfig,
      params.overlayEnabled ? params.overlayCanvas : null
    );
    if (params.isStaleRequest()) return { result: null, aborted: true };
    log.debug('Initial generation succeeded');
    return { result, aborted: false };
  } catch (error_) {
    return handleGenerationError({
      error: error_,
      effectiveConfig: params.effectiveConfig,
      debouncedConfig: params.debouncedConfig,
      overlayEnabled: params.overlayEnabled,
      overlayCanvas: params.overlayCanvas,
      isStaleRequest: params.isStaleRequest,
      yieldForResponsiveness: params.yieldForResponsiveness,
      runGeneratorWithStatus: params.runGeneratorWithStatus,
      lastOverflowContentRef: params.lastOverflowContentRef,
      isOverflowBlockedRef: params.isOverflowBlockedRef,
      setHasOverflowError: params.setHasOverflowError,
      setError: params.setError,
      setIsRendering: params.setIsRendering,
      setIsLoading: params.setIsLoading,
      clearGenerationProgress: params.clearGenerationProgress,
      t: params.t,
    });
  }
}

async function finalizeGeneratedCanvas(params: {
  result: HTMLCanvasElement | OffscreenCanvas | null;
  watermark: {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  };
  isStaleRequest: () => boolean;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  qrPackedMatrixRef: { current: { packed: Uint8Array; moduleCount: number } | null };
  setQrMatrix: (m: boolean[][] | null) => void;
  canvasRef: { current: HTMLCanvasElement | null };
  runValidationIfNeeded: (
    c: HTMLCanvasElement | OffscreenCanvas,
    content: string | undefined
  ) => void;
  effectiveConfig: Record<string, unknown>;
}): Promise<void> {
  let result = params.result;
  if (result) {
    result = await applyWatermarkToCanvas(result, params.watermark);
  }

  if (params.isStaleRequest()) return;
  params.setCanvas(result);
  params.updateGenerationProgress(
    params.t('preview.busy.finalizingPreview', 'Finalizing the preview...'),
    92
  );

  const matrixData = qrGenerator.getLastMatrix();
  if (matrixData) {
    params.qrPackedMatrixRef.current = null;
    params.setQrMatrix(matrixData.matrix);
  }

  if (params.canvasRef.current && result) {
    drawToDisplayCanvas(params.canvasRef.current, result);
  }

  if (result) {
    params.updateGenerationProgress(
      params.t('preview.busy.checkingScanability', 'Checking that it scans properly...'),
      98
    );
    params.runValidationIfNeeded(result, params.effectiveConfig.content as string);
  }
}

async function loadWatermarkForAnimation(watermark: {
  enabled: boolean;
  kind: string;
  image: File | null;
}): Promise<HTMLImageElement | HTMLCanvasElement | null> {
  if (
    watermark.enabled &&
    (watermark.kind === 'image' || watermark.kind === 'pattern') &&
    watermark.image
  ) {
    try {
      return await loadFileAsCanvas(watermark.image);
    } catch (err) {
      log.error('Error loading watermark', { error: err });
    }
  }
  return null;
}

interface ArtworkFrameState {
  artworkLockedMask: number;
  artworkLockedVersion: number;
  lastSuccessfulArtworkFrame: HTMLCanvasElement | null;
  lastSuccessfulArtworkMatchPercentage: number;
  getArtworkBitmapScratchCanvas: (slot: 0 | 1, w: number, h: number) => HTMLCanvasElement;
  getArtworkFrameTargetImage: (c: HTMLCanvasElement | OffscreenCanvas, fi: number) => ImageData;
  artworkRenderConfigTemplate: Record<string, unknown>;
  setLockedMask: (v: number) => void;
  setLockedVersion: (v: number) => void;
  setLastSuccessfulFrame: (f: HTMLCanvasElement | null) => void;
  setLastSuccessfulMatchPercentage: (v: number) => void;
}

function createArtworkFrameState(debouncedConfig: Record<string, unknown>): ArtworkFrameState {
  const artworkFrameImageDataCache = new WeakMap<
    HTMLCanvasElement | OffscreenCanvas,
    { frameIdx: number; width: number; height: number; imageData: ImageData }
  >();
  const getArtworkFrameTargetImage = (
    sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
    frameIdx: number
  ): ImageData => {
    const cached = artworkFrameImageDataCache.get(sourceCanvas);
    if (
      cached &&
      cached.frameIdx === frameIdx &&
      cached.width === sourceCanvas.width &&
      cached.height === sourceCanvas.height &&
      cached.imageData.data.byteLength > 0
    ) {
      return cached.imageData;
    }
    const imageData = readCanvasImageData(sourceCanvas);
    artworkFrameImageDataCache.set(sourceCanvas, {
      frameIdx,
      width: sourceCanvas.width,
      height: sourceCanvas.height,
      imageData,
    });
    return imageData;
  };
  let artworkLockedMask = -1;
  let artworkLockedVersion = (debouncedConfig.typeNumber as number) || 0;
  let lastSuccessfulArtworkFrame: HTMLCanvasElement | null = null;
  let lastSuccessfulArtworkMatchPercentage = -1;
  let artworkBitmapScratchA: HTMLCanvasElement | null = null;
  let artworkBitmapScratchB: HTMLCanvasElement | null = null;
  const getArtworkBitmapScratchCanvas = (
    slot: 0 | 1,
    width: number,
    height: number
  ): HTMLCanvasElement => {
    const current = slot === 0 ? artworkBitmapScratchA : artworkBitmapScratchB;
    if (!current) {
      const created = document.createElement('canvas');
      created.width = width;
      created.height = height;
      if (slot === 0) {
        artworkBitmapScratchA = created;
      } else {
        artworkBitmapScratchB = created;
      }
      return created;
    }
    if (current.width !== width) current.width = width;
    if (current.height !== height) current.height = height;
    return current;
  };
  const artworkRenderConfigTemplate = sanitizeQArtRenderConfig({
    ...debouncedConfig,
    overlayMode: undefined,
  } as QRGeneratorConfig);

  return {
    get artworkLockedMask() {
      return artworkLockedMask;
    },
    get artworkLockedVersion() {
      return artworkLockedVersion;
    },
    get lastSuccessfulArtworkFrame() {
      return lastSuccessfulArtworkFrame;
    },
    get lastSuccessfulArtworkMatchPercentage() {
      return lastSuccessfulArtworkMatchPercentage;
    },
    getArtworkBitmapScratchCanvas,
    getArtworkFrameTargetImage,
    artworkRenderConfigTemplate,
    setLockedMask: (v: number) => {
      artworkLockedMask = v;
    },
    setLockedVersion: (v: number) => {
      artworkLockedVersion = v;
    },
    setLastSuccessfulFrame: (f: HTMLCanvasElement | null) => {
      lastSuccessfulArtworkFrame = f;
    },
    setLastSuccessfulMatchPercentage: (v: number) => {
      lastSuccessfulArtworkMatchPercentage = v;
    },
  };
}

function computeBaseAnimationFramesToProcess(params: {
  shouldGenerateBaseAnimation: boolean;
  shouldGenerateStaticOverlayAnimation: boolean;
  effectiveFrames: AnimationFrame[];
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  speedMs: number;
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  computeJitter: (fi: number, tf: number) => number;
  applyResultPersistent: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    tf: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
}): Promise<{ framesToProcess: AnimationFrame[] | null }> {
  return (async () => {
    if (params.shouldGenerateBaseAnimation) {
      const frameCount = 24;
      const baseFrameResult = await generateBaseAnimationFrameSet({
        hasPattern: params.hasPattern,
        hasJitter: params.hasJitter,
        previewScanConfigBase: params.previewScanConfigBase,
        frameCount,
        speedMs: params.speedMs,
        isRunCancelled: params.isRunCancelled,
        yieldCtrl: params.yieldCtrl,
        computeJitter: params.computeJitter,
        applyResultPersistent: params.applyResultPersistent,
      });
      if (!baseFrameResult || params.isRunCancelled()) return { framesToProcess: null };
      return { framesToProcess: baseFrameResult };
    }
    if (params.shouldGenerateStaticOverlayAnimation && params.effectiveFrames.length === 1) {
      const frameCount = 24;
      const baseCanvas = params.applyGeometricTransforms(params.effectiveFrames[0].canvas);
      return {
        framesToProcess: Array.from({ length: frameCount }, () => ({
          canvas: baseCanvas,
          delay: params.speedMs,
          disposalType: 0,
        })),
      };
    }
    return { framesToProcess: params.effectiveFrames };
  })();
}

async function handleArtworkWorkerSuccess(params: {
  workerResult: QArtWorkerResult;
  frameIdx: number;
  artworkState: ArtworkFrameState;
  debouncedConfig: Record<string, unknown>;
  isNoisyOutlierMatch: (mp: number) => boolean;
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  resolvedMask: number | undefined;
  signal: AbortSignal;
  isRunCancelled: () => boolean;
  getArtworkFrameTargetImage: (c: HTMLCanvasElement | OffscreenCanvas, fi: number) => ImageData;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let effectiveWorkerResult = params.workerResult;
  if (params.isNoisyOutlierMatch(params.workerResult.matchPercentage)) {
    const rescueAttempts = Math.min(
      8,
      Math.max((params.qartConfig.searchAttempts as number) + 2, 4)
    );
    const rescueSeed =
      (((params.qartConfig.searchSeed as number) ?? 0) ^
        Math.imul(params.frameIdx + 1, 0x85ebca6b)) >>>
      0;
    log.warn('QR-Art frame quality outlier detected; retrying frame', {
      frameIdx: params.frameIdx,
      previousMatch: params.artworkState.lastSuccessfulArtworkMatchPercentage,
      currentMatch: params.workerResult.matchPercentage,
      rescueAttempts,
    });
    try {
      effectiveWorkerResult = await rescueOutlierArtworkFrame({
        qartModule: params.qartModule,
        qartConfig: params.qartConfig,
        workerRenderConfig: params.workerRenderConfig,
        targetImage: params.getArtworkFrameTargetImage(params.frameOverlayCanvas, params.frameIdx),
        originalResult: params.workerResult,
        searchAttempts: rescueAttempts,
        rescueSeed,
        maskPattern: params.resolvedMask,
        signal: params.signal,
        isRunCancelled: params.isRunCancelled,
      });
    } catch {
      return null;
    }
  }

  if (params.frameIdx === 0) {
    params.artworkState.setLockedMask(effectiveWorkerResult.maskPattern);
    params.artworkState.setLockedVersion(effectiveWorkerResult.version);
  }

  const bitmapRendered = renderArtworkWorkerBitmap({
    workerResult: effectiveWorkerResult,
    getScratchCanvas: params.artworkState.getArtworkBitmapScratchCanvas,
    frameIdx: params.frameIdx,
  });
  if (bitmapRendered) {
    params.rememberSuccessfulFrame(bitmapRendered, effectiveWorkerResult.matchPercentage);
    return bitmapRendered;
  }

  const matrixRendered = await renderArtworkWorkerMatrix({
    workerResult: effectiveWorkerResult,
    debouncedConfig: params.debouncedConfig,
  });
  if (matrixRendered) {
    params.rememberSuccessfulFrame(matrixRendered, effectiveWorkerResult.matchPercentage);
    return matrixRendered;
  }

  return null;
}

async function handleArtworkMainThreadFallbackForFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  useAutoMask: boolean;
  artworkState: ArtworkFrameState;
  configMaskPattern: number;
  frameIdx: number;
  debouncedConfig: Record<string, unknown>;
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const qartResult = await runArtworkMainThreadFallback({
    qartModule: params.qartModule,
    qartConfig: params.qartConfig,
    frameOverlayCanvas: params.frameOverlayCanvas,
    useAutoMask: params.useAutoMask,
    artworkLockedMask: params.artworkState.artworkLockedMask,
    configMaskPattern: params.configMaskPattern,
  });

  if (!qartResult.success || !qartResult.matrix) {
    log.warn('QR-Art failed for animation frame', { frameIdx: params.frameIdx });
    return params.reuseLastSuccessfulFrame() ?? (await params.fallbackGenerate());
  }

  if (params.frameIdx === 0) {
    params.artworkState.setLockedMask(qartResult.maskPattern);
    params.artworkState.setLockedVersion(qartResult.version);
  }
  const qrArtConfig = {
    ...params.debouncedConfig,
    typeNumber: qartResult.version,
    overlayMode: undefined,
  } as QRGeneratorConfig;
  const rendered = await qrGenerator.renderFromMatrix(qartResult.matrix, qrArtConfig);
  params.rememberSuccessfulFrame(rendered, qartResult.matchPercentage);
  return rendered;
}

function isNoisyOutlierMatchCheck(
  matchPercentage: number,
  frameIdx: number,
  lastSuccessfulMatchPercentage: number
): boolean {
  const minOutlierMatchPercent = 58;
  const maxAllowedMatchDrop = 12;
  if (!Number.isFinite(matchPercentage)) return true;
  if (frameIdx === 0) return false;
  if (lastSuccessfulMatchPercentage < 0) {
    return matchPercentage < minOutlierMatchPercent;
  }
  const dynamicFloor = Math.max(
    minOutlierMatchPercent,
    lastSuccessfulMatchPercentage - maxAllowedMatchDrop
  );
  return matchPercentage < dynamicFloor;
}

function makeArtworkFrameHelpers(params: {
  artworkState: ArtworkFrameState;
  previewScanConfigBase: QRGeneratorConfig;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
}): {
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
} {
  const reuseLastSuccessfulFrame = (): HTMLCanvasElement | null =>
    params.artworkState.lastSuccessfulArtworkFrame
      ? cloneCanvasFrame(params.artworkState.lastSuccessfulArtworkFrame)
      : null;
  const rememberSuccessfulFrame = (
    frame: HTMLCanvasElement | OffscreenCanvas,
    matchPercentage: number
  ): void => {
    params.artworkState.setLastSuccessfulFrame(
      cloneCanvasFrame(frame, params.artworkState.lastSuccessfulArtworkFrame)
    );
    if (Number.isFinite(matchPercentage)) {
      params.artworkState.setLastSuccessfulMatchPercentage(matchPercentage);
    }
  };
  const fallbackGenerate = () =>
    qrGenerator.generate(
      {
        ...params.previewScanConfigBase,
        frameIndex: params.frameIdx,
        overlayMode: 'dithered',
      },
      params.frameOverlayCanvas
    );
  return { reuseLastSuccessfulFrame, rememberSuccessfulFrame, fallbackGenerate };
}

async function invokeArtworkWorkerForFrame(params: {
  qartModule: QArtModule;
  qartConfig: Record<string, unknown>;
  workerRenderConfig: Record<string, unknown>;
  resolvedMask: number | undefined;
  artworkState: ArtworkFrameState;
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  abortSignal: AbortSignal;
  isRunCancelled: () => boolean;
  debouncedConfig: Record<string, unknown>;
  useAutoMask: boolean;
  reuseLastSuccessfulFrame: () => HTMLCanvasElement | null;
  fallbackGenerate: () => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  rememberSuccessfulFrame: (f: HTMLCanvasElement | OffscreenCanvas, mp: number) => void;
}): Promise<
  | { workerResult: QArtWorkerResult }
  | { fallbackCanvas: HTMLCanvasElement | OffscreenCanvas | null }
> {
  try {
    const targetImage = params.artworkState.getArtworkFrameTargetImage(
      params.frameOverlayCanvas,
      params.frameIdx
    );
    const workerResult = await params.qartModule.generateQArtInWorker(
      {
        data: params.qartConfig.data as string,
        targetImage,
        version: params.qartConfig.version as number,
        ecc: params.qartConfig.ecc as 'L' | 'M' | 'Q' | 'H',
        strictSuffix: params.qartConfig.strictSuffix as boolean,
        targetControlPercent: params.qartConfig.targetControlPercent as number,
        searchAttempts: params.qartConfig.searchAttempts as number,
        searchSeed: params.qartConfig.searchSeed as number,
        lockVersionToMinimum: params.qartConfig.lockVersionToMinimum as boolean,
        maskPattern: params.resolvedMask,
        performanceProfile: params.qartConfig.performanceProfile as 'quality' | 'balanced',
        renderConfig: params.workerRenderConfig,
        renderInWorker: true,
      },
      { signal: params.abortSignal }
    );
    return { workerResult };
  } catch (error_) {
    if (params.isRunCancelled()) return { fallbackCanvas: null };
    log.warn('QR-Art animation frame worker failed; falling back to main thread', {
      frameIdx: params.frameIdx,
      error: error_,
    });
    const fallbackCanvas = await handleArtworkMainThreadFallbackForFrame({
      qartModule: params.qartModule,
      qartConfig: params.qartConfig,
      frameOverlayCanvas: params.frameOverlayCanvas,
      useAutoMask: params.useAutoMask,
      artworkState: params.artworkState,
      configMaskPattern: params.debouncedConfig.maskPattern as number,
      frameIdx: params.frameIdx,
      debouncedConfig: params.debouncedConfig,
      reuseLastSuccessfulFrame: params.reuseLastSuccessfulFrame,
      fallbackGenerate: params.fallbackGenerate,
      rememberSuccessfulFrame: params.rememberSuccessfulFrame,
    });
    return { fallbackCanvas };
  }
}

async function generateArtworkFrameStandalone(params: {
  frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas;
  frameIdx: number;
  artworkState: ArtworkFrameState;
  qartModule: QArtModule | null;
  debouncedConfig: Record<string, unknown>;
  previewScanConfigBase: QRGeneratorConfig;
  abortSignal: AbortSignal;
  isRunCancelled: () => boolean;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  const { reuseLastSuccessfulFrame, rememberSuccessfulFrame, fallbackGenerate } =
    makeArtworkFrameHelpers({
      artworkState: params.artworkState,
      previewScanConfigBase: params.previewScanConfigBase,
      frameOverlayCanvas: params.frameOverlayCanvas,
      frameIdx: params.frameIdx,
    });
  const isNoisyOutlierMatch = (mp: number): boolean =>
    isNoisyOutlierMatchCheck(
      mp,
      params.frameIdx,
      params.artworkState.lastSuccessfulArtworkMatchPercentage
    );

  try {
    const useAutoMask =
      typeof params.debouncedConfig.maskPattern !== 'number' ||
      (params.debouncedConfig.maskPattern as number) < 0;
    const qartConfig = {
      data: (params.debouncedConfig.content as string) ?? '',
      version: params.artworkState.artworkLockedVersion,
      ecc: ((params.debouncedConfig.errorCorrection as string) || 'M') as 'L' | 'M' | 'Q' | 'H',
      strictSuffix: true,
      targetControlPercent: 100,
      searchAttempts: getQArtSearchAttempts(params.debouncedConfig.qrartIterations as number),
      searchSeed: (params.debouncedConfig.qrartSeed as number) ?? 0,
      lockVersionToMinimum:
        (params.debouncedConfig.typeNumber as number) === 0 && params.frameIdx === 0,
      performanceProfile: 'quality' as const,
    };

    const workerRenderConfig: Record<string, unknown> = {
      ...params.artworkState.artworkRenderConfigTemplate,
      typeNumber: params.artworkState.artworkLockedVersion,
    };

    if (!params.qartModule) {
      return await fallbackGenerate();
    }

    const resolvedMask = resolveArtworkMaskPattern(
      useAutoMask,
      params.artworkState.artworkLockedMask,
      params.debouncedConfig.maskPattern as number
    );

    const workerOutcome = await invokeArtworkWorkerForFrame({
      qartModule: params.qartModule,
      qartConfig,
      workerRenderConfig,
      resolvedMask,
      artworkState: params.artworkState,
      frameOverlayCanvas: params.frameOverlayCanvas,
      frameIdx: params.frameIdx,
      abortSignal: params.abortSignal,
      isRunCancelled: params.isRunCancelled,
      debouncedConfig: params.debouncedConfig,
      useAutoMask,
      reuseLastSuccessfulFrame,
      fallbackGenerate,
      rememberSuccessfulFrame,
    });
    if ('fallbackCanvas' in workerOutcome) return workerOutcome.fallbackCanvas;

    const { workerResult } = workerOutcome;
    if (workerResult.success) {
      const successResult = await handleArtworkWorkerSuccess({
        workerResult,
        frameIdx: params.frameIdx,
        artworkState: params.artworkState,
        debouncedConfig: params.debouncedConfig,
        isNoisyOutlierMatch,
        qartModule: params.qartModule,
        qartConfig,
        workerRenderConfig,
        resolvedMask,
        signal: params.abortSignal,
        isRunCancelled: params.isRunCancelled,
        getArtworkFrameTargetImage: params.artworkState.getArtworkFrameTargetImage,
        frameOverlayCanvas: params.frameOverlayCanvas,
        rememberSuccessfulFrame,
      });
      if (successResult) return successResult;
    } else {
      log.warn('QR-Art failed for animation frame', {
        frameIdx: params.frameIdx,
        error: workerResult.error,
      });
      const preserved = reuseLastSuccessfulFrame();
      if (preserved) return preserved;
    }
  } catch (err) {
    log.warn('QR-Art frame generation failed, falling back to standard', {
      frameIdx: params.frameIdx,
      error: err,
    });
    const preserved = reuseLastSuccessfulFrame();
    if (preserved) return preserved;
  }
  return await fallbackGenerate();
}

async function runGeneratorWithSlowStatus(params: {
  cfg: QRGeneratorConfig;
  overlaySource: HTMLCanvasElement | OffscreenCanvas | null;
  isStaleRequest: () => boolean;
  updateGenerationProgress: (stage: string, percent: number) => void;
  t: (key: string, fallback: string) => string;
}): Promise<HTMLCanvasElement | OffscreenCanvas | null> {
  let slowRenderTimer: ReturnType<typeof setTimeout> | null = null;
  slowRenderTimer = setTimeout(() => {
    if (!params.isStaleRequest()) {
      params.updateGenerationProgress(
        params.t(
          'preview.busy.stillRenderingDetailedOverlay',
          'Still rendering the detailed overlay...'
        ),
        72
      );
    }
  }, 900);
  try {
    return await qrGenerator.generate(params.cfg, params.overlaySource);
  } finally {
    if (slowRenderTimer) {
      clearTimeout(slowRenderTimer);
    }
  }
}

async function processAndPostProcessFrame<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
  frameIdx: number;
  frame: AnimationFrame;
  framesToProcessLength: number;
  shouldGenerateBaseAnimation: boolean;
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  useCompositor: boolean;
  gifCompositor: GifCompositor | null;
  effectiveFrameIndices: number[];
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  scratchPool: ReturnType<typeof createScratchCanvasPool>;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    i: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, total: number) => number;
  moduleJitterPx: number;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
  isRunCancelled: () => boolean;
  persistFrameCanvas: (c: HTMLCanvasElement | OffscreenCanvas) => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getLatestFrame: () => HTMLCanvasElement | OffscreenCanvas | undefined;
}): Promise<void> {
  const result = await processAnimationFrameLoopIteration({
    frameIdx: params.frameIdx,
    frame: params.frame,
    framesToProcessLength: params.framesToProcessLength,
    shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
    hasPattern: params.hasPattern,
    hasJitter: params.hasJitter,
    previewScanConfigBase: params.previewScanConfigBase,
    useTemporalDither: params.useTemporalDither,
    temporalMode: params.temporalMode,
    animationSeed: params.animationSeed,
    useCompositor: params.useCompositor,
    gifCompositor: params.gifCompositor,
    effectiveFrameIndices: params.effectiveFrameIndices,
    applyGeometricTransforms: params.applyGeometricTransforms,
    scratchPool: params.scratchPool,
    isArtworkMode: params.isArtworkMode,
    generateArtworkFrame: params.generateArtworkFrame,
    modulePatternEffects: params.modulePatternEffects,
    applyModulePatternEphemeral: params.applyModulePatternEphemeral,
    computeJitter: params.computeJitter,
    moduleJitterPx: params.moduleJitterPx,
  });

  if (params.isRunCancelled()) return;

  if (result) {
    const previewFrame = await applyFramePostProcessing({
      result,
      shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
      resultPatternEffects: params.resultPatternEffects,
      applyResultEphemeral: params.applyResultEphemeral,
      frameIdx: params.frameIdx,
      framesToProcessLength: params.framesToProcessLength,
      hasColorCycle: params.hasColorCycle,
      watermarkConfig: params.watermarkConfig,
      watermarkImage: params.watermarkImage,
    });

    params.persistFrameCanvas(previewFrame);
    if (params.isRunCancelled()) return;

    const latestStoredFrame = params.getLatestFrame() ?? previewFrame;
    params.setCanvas(latestStoredFrame);
    if (params.canvasRef.current) {
      drawToDisplayCanvas(params.canvasRef.current, latestStoredFrame);
    }
  }
}

function handleGeneratePreChecks(params: {
  lastOverflowContentRef: { current: string | null };
  isOverflowBlockedRef: { current: boolean };
  content: string | undefined;
  setHasOverflowError: (v: boolean) => void;
  setError: (v: string | null) => void;
  clearGenerationProgress: () => void;
}): { shouldAbort: boolean } {
  if (checkOverflowContentChanged(params.lastOverflowContentRef.current, params.content)) {
    log.debug('Content changed from failed content, clearing block');
    params.lastOverflowContentRef.current = null;
    params.isOverflowBlockedRef.current = false;
    params.setHasOverflowError(false);
    params.setError(null);
  }
  if (params.isOverflowBlockedRef.current) {
    log.debug('generate BLOCKED by overflow ref');
    params.clearGenerationProgress();
    return { shouldAbort: true };
  }
  return { shouldAbort: false };
}

async function executeFrameGenerationLoop<
  W extends {
    enabled: boolean;
    kind: string;
    text: string;
    image: File | null;
    position: string;
    opacity: number;
    blend: string;
  },
>(params: {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  framesToProcess: AnimationFrame[];
  isRunCancelled: () => boolean;
  yieldCtrl: YieldController;
  gifCompositor: GifCompositor | null;
  updateGenerationProgress: (stage: string, percent: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => any;
  shouldGenerateBaseAnimation: boolean;
  hasPattern: boolean;
  hasJitter: boolean;
  previewScanConfigBase: QRGeneratorConfig;
  useTemporalDither: boolean;
  temporalMode: TemporalDitherMode;
  animationSeed: number;
  useCompositor: boolean;
  effectiveFrameIndices: number[];
  applyGeometricTransforms: (c: HTMLCanvasElement | OffscreenCanvas) => HTMLCanvasElement;
  scratchPool: ReturnType<typeof createScratchCanvasPool>;
  isArtworkMode: boolean;
  generateArtworkFrame: (
    c: HTMLCanvasElement | OffscreenCanvas,
    i: number
  ) => Promise<HTMLCanvasElement | OffscreenCanvas | null>;
  modulePatternEffects: PatternEffect[];
  applyModulePatternEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  computeJitter: (fi: number, total: number) => number;
  moduleJitterPx: number;
  resultPatternEffects: PatternEffect[];
  applyResultEphemeral: (
    c: HTMLCanvasElement | OffscreenCanvas,
    fi: number,
    total: number
  ) => HTMLCanvasElement | OffscreenCanvas;
  hasColorCycle: boolean;
  watermarkConfig: W;
  watermarkImage: HTMLImageElement | HTMLCanvasElement | null;
  persistFrameCanvas: (c: HTMLCanvasElement | OffscreenCanvas) => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  getLatestFrame: () => HTMLCanvasElement | OffscreenCanvas | undefined;
}): Promise<void> {
  for (let frameIdx = 0; frameIdx < params.framesToProcess.length; frameIdx++) {
    const frame = params.framesToProcess[frameIdx];
    params.updateGenerationProgress(
      params.t('preview.busy.renderingAnimationFrames', 'Rendering the animation frames...'),
      10 + ((frameIdx + 1) / Math.max(1, params.framesToProcess.length)) * 78
    );
    if (params.isRunCancelled()) return;

    if (params.gifCompositor?.canvas instanceof HTMLCanvasElement) {
      canvasHashCache.delete(params.gifCompositor.canvas);
    }

    if (await params.yieldCtrl.yieldIfNeeded()) {
      if (params.isRunCancelled()) return;
    }

    try {
      await processAndPostProcessFrame({
        frameIdx,
        frame,
        framesToProcessLength: params.framesToProcess.length,
        shouldGenerateBaseAnimation: params.shouldGenerateBaseAnimation,
        hasPattern: params.hasPattern,
        hasJitter: params.hasJitter,
        previewScanConfigBase: params.previewScanConfigBase,
        useTemporalDither: params.useTemporalDither,
        temporalMode: params.temporalMode,
        animationSeed: params.animationSeed,
        useCompositor: params.useCompositor,
        gifCompositor: params.gifCompositor,
        effectiveFrameIndices: params.effectiveFrameIndices,
        applyGeometricTransforms: params.applyGeometricTransforms,
        scratchPool: params.scratchPool,
        isArtworkMode: params.isArtworkMode,
        generateArtworkFrame: params.generateArtworkFrame,
        modulePatternEffects: params.modulePatternEffects,
        applyModulePatternEphemeral: params.applyModulePatternEphemeral,
        computeJitter: params.computeJitter,
        moduleJitterPx: params.moduleJitterPx,
        resultPatternEffects: params.resultPatternEffects,
        applyResultEphemeral: params.applyResultEphemeral,
        hasColorCycle: params.hasColorCycle,
        watermarkConfig: params.watermarkConfig,
        watermarkImage: params.watermarkImage,
        isRunCancelled: params.isRunCancelled,
        persistFrameCanvas: params.persistFrameCanvas,
        setCanvas: params.setCanvas,
        canvasRef: params.canvasRef,
        getLatestFrame: params.getLatestFrame,
      });
    } catch (err) {
      log.error('Error generating frame', { error: err });
    }
  }
}

function completeAnimationGeneration(params: {
  frames: (HTMLCanvasElement | OffscreenCanvas)[];
  isRunCancelled: () => boolean;
  replaceAnimationFrames: (frames: (HTMLCanvasElement | OffscreenCanvas)[]) => void;
  setIsAnimationCacheReady: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  setIsLoadingOverlay: (v: boolean) => void;
  clearGenerationProgress: () => void;
  setCanvas: (c: HTMLCanvasElement | OffscreenCanvas | null) => void;
  canvasRef: { current: HTMLCanvasElement | null };
}): void {
  if (params.isRunCancelled()) return;

  log.debug('animation cache: complete', {
    totalFrames: params.frames.length,
    firstFrameSize: params.frames[0]
      ? { w: params.frames[0].width, h: params.frames[0].height }
      : null,
  });

  params.replaceAnimationFrames(params.frames);
  params.setIsAnimationCacheReady(true);
  params.setIsLoading(false);
  params.setIsLoadingOverlay(false);
  params.clearGenerationProgress();

  if (params.frames.length > 0) {
    params.setCanvas(params.frames[0]);
    if (params.canvasRef.current) {
      drawToDisplayCanvas(params.canvasRef.current, params.frames[0]);
    }
  }
}

interface UseQRGeneratorResult {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  isLoading: boolean;
  isExporting: boolean;
  isRendering: boolean; // True when actively rendering (after debounce, during generation)
  isPending: boolean; // True when config has changed but debounce hasn't settled yet
  error: string | null;
  regenerate: () => Promise<void>;
  cancelGeneration: () => void;
  download: () => Promise<void>;
  // Animation state
  isAnimating: boolean;
  currentFrame: number;
  totalFrames: number;
  // True when we have multi-frame content but animation cache isn't ready yet
  isPreparingAnimation: boolean;
  // Safety warnings
  safetyWarnings: string[];
  // Validation
  validation: ValidationResult | null;
  isValidating: boolean;
  // Busy overlay feedback
  busyStage: string | null;
  busyProgress: number | null;
  // True when fast-preview mode is active during live interaction
  isFastPreview: boolean;
  // Animation frames for GIF export
  animationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
}

/**
 * Debounce helper
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Load a File as a canvas element
 */
async function loadFileAsCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string') {
        img.src = dataUrl;
      } else {
        reject(new Error('Invalid file data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// Expose animation state globally for external tools (e.g., gallery generator)
declare global {
  // eslint-disable-next-line no-var
  var __ANQR_STATE__:
    | {
        isLoading: boolean;
        isAnimationReady: boolean;
        animationFrameCount: number;
        currentFrame: number;
        animationFrames: (HTMLCanvasElement | OffscreenCanvas)[];
        animationSpeedMs: number;
        frameDelays: number[]; // Original frame delays from source GIF in ms
      }
    | undefined;
}

function useQRGenerator(): UseQRGeneratorResult {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | OffscreenCanvas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRendering, setIsRendering] = useState(false); // Active rendering state
  const [pendingVisible, setPendingVisible] = useState(false); // Delayed pending state to avoid immediate blur while typing
  const [error, setError] = useState<string | null>(null);
  const [overlayCanvas, setOverlayCanvas] = useState<HTMLCanvasElement | OffscreenCanvas | null>(
    null
  );

  // Animation state
  const [gifFrames, setGifFrames] = useState<AnimationFrame[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationDirection = useRef<1 | -1>(1);
  const lastFrameTime = useRef(0);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef(0);

  // Track content that caused overflow to prevent infinite retry loop
  // Using a ref because state updates are async and may not prevent immediate re-calls
  const lastOverflowContentRef = useRef<string | null>(null);

  // Additional flag to block generate() - using ref for synchronous checking
  // This is more reliable than state for preventing loops
  const isOverflowBlockedRef = useRef(false);
  // Monotonic generation id to prevent stale async renders from overwriting latest preview.
  const generationRequestIdRef = useRef(0);
  const activeQArtRequestAbortRef = useRef<AbortController | null>(null);
  const activeAnimationRequestAbortRef = useRef<AbortController | null>(null);
  const autoGenerateSuppressedRef = useRef(false);
  const currentPrimaryDebouncedConfigRef = useRef<object | null>(null);
  const cancelledPrimaryDebouncedConfigRef = useRef<object | null>(null);
  const currentOverlaySourceKeyRef = useRef<string | null>(null);
  const cancelledOverlaySourceKeyRef = useRef<string | null>(null);
  const qartPerfOverlayRef = useRef<HTMLDivElement | null>(null);

  // State to block generate() calls when we're in an overflow error state
  // This prevents the blur loop by stopping the useEffect from calling generate()
  const [hasOverflowError, setHasOverflowError] = useState(false);

  // GIF Compositor for optimal patch-only decoding (no per-frame canvas allocation)
  const [gifCompositor, setGifCompositor] = useState<GifCompositor | null>(null);
  const hasMultipleSourceFramesRef = useRef(false);

  // Store raw overlay canvas before preprocessing
  const [rawOverlayCanvas, setRawOverlayCanvas] = useState<
    HTMLCanvasElement | OffscreenCanvas | null
  >(null);

  // Track when we're loading/parsing an overlay file (prevents busy overlay flickering)
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);

  // Validation state
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgressState | null>(
    null
  );
  const [qartPerfSnapshot, setQArtPerfSnapshot] = useState<QArtPerfSnapshot | null>(null);
  const qartPreviewBitmapCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // QR matrix for vector SVG export
  const [qrMatrix, setQrMatrix] = useState<boolean[][] | null>(null);
  const qrPackedMatrixRef = useRef<{ packed: Uint8Array; moduleCount: number } | null>(null);

  // Store generated frames for GIF export/playback outside React state to avoid
  // retaining large canvas arrays in the render tree.
  const animationFramesRef = useRef<(HTMLCanvasElement | OffscreenCanvas)[]>([]);
  const [animationFrameCount, setAnimationFrameCount] = useState(0);
  const [_animationFramesRevision, setAnimationFramesRevision] = useState(0);
  const [isAnimationCacheReady, setIsAnimationCacheReady] = useState(false);

  const replaceAnimationFrames = useCallback((frames: (HTMLCanvasElement | OffscreenCanvas)[]) => {
    animationFramesRef.current = frames;
    setAnimationFrameCount(frames.length);
    setAnimationFramesRevision((rev) => rev + 1);
  }, []);

  const clearAnimationFrames = useCallback(() => {
    animationFramesRef.current = [];
    setAnimationFrameCount(0);
    setAnimationFramesRevision((rev) => rev + 1);
  }, []);

  const updateGenerationProgress = useCallback((stage: string, percent: number) => {
    const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));
    setGenerationProgress((prev) => {
      if (prev && prev.stage === stage && prev.percent === normalizedPercent) {
        return prev;
      }
      return { stage, percent: normalizedPercent };
    });
  }, []);

  const clearGenerationProgress = useCallback(() => {
    setGenerationProgress(null);
  }, []);

  const translateQArtStage = useCallback(
    (stage: string): string => {
      switch (stage) {
        case 'Encoding base data':
          return t('preview.busy.qrArt.encodingBaseData', 'Encoding the base data...');
        case 'Analyzing semantic layout':
          return t('preview.busy.qrArt.analyzingLayout', 'Analyzing the layout...');
        case 'Building RS basis':
          return t(
            'preview.busy.qrArt.buildingErrorCorrectionFoundation',
            'Building the error correction foundation...'
          );
        case 'Mapping bits to pixels':
          return t('preview.busy.qrArt.mappingBitsToPixels', 'Mapping bits to pixels...');
        case 'Processing target image':
          return t('preview.busy.qrArt.processingImage', 'Processing your image...');
        case 'Ranking pixels by importance':
          return t(
            'preview.busy.qrArt.rankingPixelsByImportance',
            'Ranking pixels by importance...'
          );
        case 'Performing Gauss-Jordan elimination':
          return t('preview.busy.qrArt.solvingMatrix', 'Solving the matrix...');
        case 'Selecting basis vectors':
          return t(
            'preview.busy.qrArt.selectingBestBasisVectors',
            'Selecting the best basis vectors...'
          );
        case 'Counting predicted matches':
          return t('preview.busy.qrArt.countingPredictedMatches', 'Counting predicted matches...');
        case 'Modifying data bytes':
          return t('preview.busy.qrArt.adjustingDataBytes', 'Adjusting data bytes...');
        case 'Re-encoding QR code':
          return t('preview.busy.qrArt.reEncodingQrCode', 'Re-encoding the QR code...');
        case 'Validating result':
          return t('preview.busy.qrArt.validatingResult', 'Validating the result...');
        case 'Complete':
          return t('preview.busy.qrArt.complete', 'Complete...');
        default:
          return stage;
      }
    },
    [t]
  );

  const cancelGeneration = useCallback(() => {
    generationRequestIdRef.current += 1;
    autoGenerateSuppressedRef.current = true;
    cancelledPrimaryDebouncedConfigRef.current = currentPrimaryDebouncedConfigRef.current;
    cancelledOverlaySourceKeyRef.current = currentOverlaySourceKeyRef.current;
    activeQArtRequestAbortRef.current?.abort();
    activeQArtRequestAbortRef.current = null;
    activeAnimationRequestAbortRef.current?.abort();
    activeAnimationRequestAbortRef.current = null;
    setIsLoading(false);
    setIsRendering(false);
    setIsLoadingOverlay(false);
    setIsAnimationCacheReady(true);
    setPendingVisible(false);
    setIsValidating(false);
    clearGenerationProgress();
  }, [clearGenerationProgress]);

  useEffect(() => {
    return () => {
      activeQArtRequestAbortRef.current?.abort();
      activeQArtRequestAbortRef.current = null;
      activeAnimationRequestAbortRef.current?.abort();
      activeAnimationRequestAbortRef.current = null;
      terminateValidationWorker();
      terminateQArtWorkerIfLoaded();
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_QART_PERF_OVERLAY || typeof document === 'undefined') return;

    let overlayEl = document.getElementById(QART_PERF_OVERLAY_ELEMENT_ID) as HTMLDivElement | null;
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.id = QART_PERF_OVERLAY_ELEMENT_ID;
      overlayEl.style.position = 'fixed';
      overlayEl.style.right = '12px';
      overlayEl.style.bottom = '12px';
      overlayEl.style.zIndex = '2147483646';
      overlayEl.style.maxWidth = '72vw';
      overlayEl.style.padding = '6px 10px';
      overlayEl.style.borderRadius = '8px';
      overlayEl.style.background = 'rgba(0, 0, 0, 0.82)';
      overlayEl.style.color = '#7CFFBE';
      overlayEl.style.font = '11px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace';
      overlayEl.style.pointerEvents = 'none';
      overlayEl.style.whiteSpace = 'pre';
      overlayEl.textContent = 'QArt perf: waiting...';
      document.body.appendChild(overlayEl);
    }

    qartPerfOverlayRef.current = overlayEl;

    return () => {
      overlayEl?.remove();
      qartPerfOverlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_QART_PERF_OVERLAY) return;
    const overlayEl = qartPerfOverlayRef.current;
    if (!overlayEl || !qartPerfSnapshot) return;

    const computeMs =
      qartPerfSnapshot.computeMs === null ? null : Math.round(qartPerfSnapshot.computeMs);
    const renderMs =
      qartPerfSnapshot.renderMs === null ? null : Math.round(qartPerfSnapshot.renderMs);
    const previewMs =
      qartPerfSnapshot.previewMs === null ? null : Math.round(qartPerfSnapshot.previewMs);

    overlayEl.textContent = [
      `QArt ${qartPerfSnapshot.source} v${qartPerfSnapshot.version} m${qartPerfSnapshot.maskPattern}`,
      `compute=${computeMs ?? '-'}ms render=${renderMs ?? '-'}ms preview=${previewMs ?? '-'}ms`,
    ].join('\n');
  }, [qartPerfSnapshot]);

  // Get all relevant state from store
  // Subscribe to payload to trigger re-renders when payload changes
  // This is critical - without this dependency, config won't update when payload changes
  const payload = useQRStore((s) => s.payload);
  const qr = useQRStore((s) => s.qr);
  const render = useQRStore((s) => s.render);
  const overlay = useQRStore((s) => s.overlay);

  const watermark = useQRStore((s) => s.watermark);
  const output = useQRStore((s) => s.output);
  const animation = useQRStore((s) => s.animation);
  const _setAnimationPlaying = useQRStore((s) => s.setAnimationPlaying);
  const setQrCharacterEncoding = useQRStore((s) => s.setQrCharacterEncoding);
  const safety = useQRStore((s) => s.safety);
  const metadata = useQRStore((s) => s.metadata);
  const auto = useQRStore((s) => s.auto);
  const getPayloadText = useQRStore((s) => s.getPayloadText);
  const _setOverlayIntensity = useQRStore((s) => s.setOverlayIntensity);

  // Auto-pick ECC based on content length and overlay usage
  const autoPickedEcc = useMemo(() => {
    if (!auto.pickEcc) return qr.ecc;

    const content = getPayloadText();
    const contentLength = content.length;

    // If overlay is enabled with high intensity, prefer higher ECC
    if (overlay.enabled && overlay.intensity > 50) {
      return 'H'; // Maximum error correction for heavy overlays
    }

    if (overlay.enabled && overlay.intensity > 25) {
      return 'Q'; // High error correction for moderate overlays
    }

    // For longer content, use lower ECC to fit more data
    if (contentLength > 500) {
      return 'L'; // Low ECC for very long content
    }

    if (contentLength > 200) {
      return 'M'; // Medium ECC for long content
    }

    // Default to Q for good balance
    return 'Q';
  }, [auto.pickEcc, qr.ecc, overlay.enabled, overlay.intensity, getPayloadText]);

  // Apply safety constraints and generate warnings
  const { safetyAdjustedConfig, safetyWarnings } = useMemo(() => {
    const effectiveEcc = auto.pickEcc ? autoPickedEcc : qr.ecc;
    const result = computeSafetyAdjustments({
      safetyMode: safety.mode,
      minModulePx: safety.minModulePx,
      minQuietZoneModules: safety.minQuietZoneModules,
      maxOverlayIntensityByEcc: safety.maxOverlayIntensityByEcc,
      modulePx: render.modulePx,
      moduleGapPercent: render.moduleGapPercent,
      moduleStyle: render.moduleStyle,
      quietZoneModules: qr.quietZoneModules,
      ecc: qr.ecc,
      overlayEnabled: overlay.enabled,
      overlayIntensity: overlay.intensity,
      pickEcc: auto.pickEcc,
      reduceIntensityUntilSafe: auto.reduceIntensityUntilSafe,
      autoPickedEcc,
      effectiveEcc,
    });

    return {
      safetyAdjustedConfig: {
        modulePx: result.modulePx,
        quietZone: result.quietZone,
        intensity: result.intensity,
        ecc: result.ecc,
      },
      safetyWarnings: result.warnings,
    };
  }, [
    safety.mode,
    safety.minModulePx,
    safety.minQuietZoneModules,
    safety.maxOverlayIntensityByEcc,
    render.modulePx,
    render.moduleGapPercent,
    render.moduleStyle,
    qr.quietZoneModules,
    qr.ecc,
    overlay.enabled,
    overlay.intensity,
    auto.pickEcc,
    auto.reduceIntensityUntilSafe,
    autoPickedEcc,
  ]);

  // Get content and debounce it separately with longer delay for typing
  // This allows users to type without immediate QR rendering
  const rawContent = useMemo(() => {
    // Force dependency on payload by accessing it
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _payloadDep = payload;
    return getPayloadText();
  }, [getPayloadText, payload]);

  // Longer debounce for content (700ms) to allow typing without blur
  const debouncedContent = useDebounce(rawContent, 700);

  // Auto-detect the most appropriate character encoding based on content
  // This helps users who paste UTF-8 content (emojis, Chinese, Japanese, etc.)
  // without manually changing the encoding setting
  const detectedCharacterEncoding = useMemo(() => {
    if (!rawContent) return 'default';

    // Helper functions to categorize characters
    // Uniquely Japanese: only found in Japanese text (hiragana, katakana)
    const isUniquelyJapanese = (charCode: number): boolean => {
      // Hiragana: U+3040 - U+309F
      if (charCode >= 0x3040 && charCode <= 0x309f) return true;
      // Katakana: U+30A0 - U+30FF
      if (charCode >= 0x30a0 && charCode <= 0x30ff) return true;
      // Half-width Katakana: U+FF65 - U+FF9F
      if (charCode >= 0xff65 && charCode <= 0xff9f) return true;
      return false;
    };

    // Shared CJK: characters used in Chinese, Japanese, and Korean
    // Shift-JIS can encode these, but presence alone doesn't indicate Japanese
    const isSharedCJK = (charCode: number): boolean => {
      // CJK Unified Ideographs (Kanji/Hanzi): U+4E00 - U+9FFF
      if (charCode >= 0x4e00 && charCode <= 0x9fff) return true;
      // CJK Symbols and Punctuation: U+3000 - U+303F
      if (charCode >= 0x3000 && charCode <= 0x303f) return true;
      return false;
    };

    let hasUniquelyJapanese = false; // Hiragana, Katakana - definitively Japanese
    let hasSharedCJK = false; // Kanji - could be Chinese or Japanese
    let hasOtherNonLatin1 = false; // Emojis, Korean, etc.

    // Check each character in the content
    for (let i = 0; i < rawContent.length; i++) {
      const charCode = rawContent.codePointAt(i)!;

      // Skip characters within Latin-1 range (0-255)
      if (charCode <= 255) continue;

      // Categorize the character
      if (isUniquelyJapanese(charCode)) {
        hasUniquelyJapanese = true;
      } else if (isSharedCJK(charCode)) {
        hasSharedCJK = true;
      } else {
        // Non-Latin-1, non-CJK character (e.g., emoji, Korean, etc.)
        hasOtherNonLatin1 = true;
      }
    }

    // Priority 1: If content has non-CJK Unicode (emojis, Korean, etc.), use UTF-8
    if (hasOtherNonLatin1) {
      return 'utf8';
    }

    // Priority 2: If content has uniquely Japanese chars (hiragana/katakana),
    // use Shift-JIS for efficiency (it's a native QR code encoding mode)
    if (hasUniquelyJapanese) {
      return 'shift-jis';
    }

    // Priority 3: If content has only shared CJK (kanji without hiragana/katakana),
    // it's likely Chinese text - use UTF-8 as Shift-JIS may not encode all Chinese chars
    if (hasSharedCJK) {
      return 'utf8';
    }

    // Content fits within Latin-1 range, default encoding works
    return 'default';
  }, [rawContent]);

  // Auto-update character encoding when user has 'default' selected and content requires
  // a different encoding (UTF-8 or Shift-JIS)
  // This ensures content is properly encoded without user intervention
  // Note: We only auto-update when characterEncoding is 'default' (the auto-detect state)
  // If user explicitly selected utf8, iso-8859-1, or shift-jis, we respect their choice
  useEffect(() => {
    // Only auto-update when character encoding is 'default' (allows auto-detection)
    // If user explicitly set a specific encoding, don't override their choice
    if (qr.characterEncoding !== 'default') return;

    // If content requires UTF-8 or Shift-JIS, update the encoding
    if (detectedCharacterEncoding === 'utf8') {
      setQrCharacterEncoding('utf8');
    } else if (detectedCharacterEncoding === 'shift-jis') {
      setQrCharacterEncoding('shift-jis');
    }
    // Note: We don't auto-downgrade back to 'default' because once the user's
    // content triggered a specific encoding, they might paste more such content later
  }, [detectedCharacterEncoding, qr.characterEncoding, setQrCharacterEncoding]);

  // Build comprehensive config object for QRGenerator
  // Content is pre-debounced, so config only changes after typing settles
  const config = useMemo(() => {
    // Use debounced content to avoid frequent re-renders while typing
    const content = debouncedContent;
    const resolvedOverlayMode = overlay.enabled ? overlay.mode : undefined;
    const preservation = resolveOverlayPreservationOptions({
      overlayEnabled: overlay.enabled,
      overlayMode: resolvedOverlayMode,
      safetyMode: safety.mode,
      safetyLockFinders: safety.lockFinders,
      safetyLockTiming: safety.lockTiming,
      safetyLockAlign: safety.lockAlign,
      safetyLockFormat: safety.lockFormat,
      safetyLockVersion: safety.lockVersion,
      preserveFinders: overlay.preserveFinders,
      preserveTiming: overlay.preserveTiming,
      preserveAlignment: overlay.preserveAlignment,
      protectFormatInfo: overlay.protectFormatInfo,
      protectVersionInfo: overlay.protectVersionInfo,
    });

    return {
      content,
      // === QR ENCODING OPTIONS ===
      typeNumber: qr.version,
      errorCorrection: safetyAdjustedConfig.ecc,
      encodingMode: qr.encodingMode,
      maskPattern: qr.maskPattern,
      characterEncoding: qr.characterEncoding,

      // === RENDER OPTIONS (with safety adjustments) ===
      moduleSize: safetyAdjustedConfig.modulePx,
      margin: safetyAdjustedConfig.quietZone + qr.borderModulesExtra,
      moduleGap: render.moduleGapPercent,
      gapMode: render.gapMode,
      moduleStyle: render.moduleStyle,
      finderStyle: render.finderStyle,
      alignmentStyle: render.alignmentStyle,
      timingStyle: render.timingStyle,
      cornerRadius: render.cornerRadius,
      dotRotationDeg: render.dotRotationDeg,
      eyeOuterStyle: render.eyeOuterStyle,
      eyeInnerStyle: render.eyeInnerStyle,
      eyeScale: render.eyeScale,
      frameStyle: render.frameStyle,
      frameText: render.frameText,
      crispEdges: render.crispEdges,
      pixelSnap: render.pixelSnap,

      // Colors
      fgColor: render.fgColor,
      bgColor: render.bgColor,
      transparentBg: render.bgTransparent,
      gradient: render.gradient,
      palette: render.palette,
      paletteMode: render.paletteMode,
      perModuleColorMode: render.perModuleColorMode,
      contrastGuard: render.contrastGuard,
      minContrastRatio: render.minContrastRatio,

      // === OVERLAY SETTINGS (with safety adjustments) ===
      overlayMode: resolvedOverlayMode,
      overlayIntensity: safetyAdjustedConfig.intensity,
      colorMode: overlay.colorMode,
      // Avoid hidden ECC clamping in normal mode; only apply explicit safety policy caps.
      maxOverlayIntensityByEcc: safety.mode === 'off' ? undefined : safety.maxOverlayIntensityByEcc,
      preserveFinders: preservation.preserveFinders,
      preserveTiming: preservation.preserveTiming,
      preserveAlignment: preservation.preserveAlignment,
      protectFormatInfo: preservation.protectFormatInfo,
      protectVersionInfo: preservation.protectVersionInfo,
      logoSize: 25, // For center mode

      // Overlay preprocessing (wired to qr-generator filter* fields)
      // Note: store values are already in UI units (brightness/contrast/saturation: -100..100,
      // gamma: ~0.2..3, hueRotateDeg: degrees, blurPx: px, sharpen: 0..100, posterizeLevels: 0..16, threshold: 0..255)
      filterInvert: overlay.invert,
      filterBrightness: overlay.brightness,
      filterContrast: overlay.contrast,
      filterGamma: overlay.gamma,
      filterSaturation: overlay.saturation,
      filterHue: overlay.hueRotateDeg,
      filterBlur: overlay.blurPx,
      filterSharpen: overlay.sharpen,
      filterPosterize: overlay.posterizeLevels,
      // Threshold remains opt-in from the overlay control. B&W mode itself is handled by colorMode.
      filterThreshold: overlay.threshold,
      filterEdgeDetect: overlay.edgeDetect !== 'off',
      filterEdgeMode: overlay.edgeDetect,
      filterDuotone1: overlay.duotoneColors?.[0],
      filterDuotone2: overlay.duotoneColors?.[1],
      // Map colorMode to filterGrayscale for preprocessing
      filterGrayscale: overlay.colorMode === 'grayscale' || overlay.colorMode === 'bw',
      // NOTE: Geometric transforms (rotate, flip, crop, fit) are applied in
      // applyGeometricTransforms() BEFORE passing to qr-generator.
      // We intentionally do NOT pass these values to avoid double-application.
      // overlayRotate, overlayFlipX, overlayFlipY, overlayCrop, overlayFit are omitted.

      // Dither options - on mobile, use cheap default unless user explicitly changed it
      ditherKind: getOverlayDitherKind({
        enabled: true,
        kind: overlay.ditherKind === STORE_DEFAULT_DITHER.kind ? undefined : overlay.ditherKind,
      }),
      ditherStrength: overlay.ditherStrength,
      finderDitherStrength: overlay.finderDitherStrength,
      blendPreservations: overlay.blendPreservations,
      blendPreservationMode: overlay.blendPreservationMode,
      ditherSerpentine: overlay.ditherSerpentine,
      diffusionKernel: overlay.diffusionKernel,
      orderedMatrix: overlay.orderedMatrix,
      blueNoiseTileSize: overlay.blueNoiseTileSize,
      blueNoiseSeed: overlay.blueNoiseSeed,
      colorDither: overlay.colorDither,

      // Subpixel options
      subpixelGridSize: overlay.subpixelGridSize,
      subpixelCenterRule: overlay.subpixelCenterRule,
      subpixelNeutralColor: overlay.subpixelNeutralColor,
      subpixelFinderOverride: overlay.subpixelFinderOverride,

      // Halftone options
      halftoneCell: overlay.halftoneCell,
      halftoneDotShape: overlay.halftoneDotShape,
      duotoneColors: overlay.duotoneColors,
      brightnessCurve: overlay.brightnessCurve,

      // ECC aware
      eccAwareEnabled: overlay.eccAwareEnabled,
      eccAwareRiskBudget: overlay.eccAwareRiskBudget,
      eccAwareWeightMap: overlay.eccAwareWeightMap,

      // QR-first mode (for high-contrast B&W images)
      qrFirstMode: overlay.qrFirstMode,

      // QR-Art options
      qrartIterations: overlay.qrartIterations,
      qrartFragmentLength: overlay.qrartFragmentLength,
      qrartSeed: overlay.qrartSeed,

      // Debug flag for overlay preprocessing
      // Automatically enabled in development builds, disabled in production
      debugOverlayDither: import.meta.env.DEV, // Debug logging: ON in dev, OFF in production

      // === ANIMATION / TEMPORAL DITHERING ===
      temporalDither: animation.temporalDither,
      frameIndex: 0, // Default for static images, will be overridden per-frame for animations
      animationSeed: animation.seed,
      moduleJitterPx: animation.moduleJitterPx,
      colorCycle: animation.colorCycle,

      // === QR ENCODING ENFORCEMENT ===
      quietZoneMinEnforce: qr.quietZoneMinEnforce,

      // === SAFETY CONSTRAINTS ===
      safetyMode: safety.mode,
      safetyLockFinders: safety.lockFinders,
      safetyLockTiming: safety.lockTiming,
      safetyLockAlign: safety.lockAlign,
      safetyLockFormat: safety.lockFormat,
      safetyLockVersion: safety.lockVersion,
      safetyMinModulePx: safety.minModulePx,
      safetyMinQuietZone: safety.minQuietZoneModules,
    };
  }, [
    debouncedContent, // Use debounced content instead of raw payload
    safetyAdjustedConfig,
    // QR encoding
    qr.version,
    qr.encodingMode,
    qr.maskPattern,
    qr.characterEncoding,
    qr.borderModulesExtra,
    qr.quietZoneMinEnforce,
    render.moduleGapPercent,
    render.gapMode,
    render.moduleStyle,
    render.finderStyle,
    render.alignmentStyle,
    render.timingStyle,
    render.cornerRadius,
    render.dotRotationDeg,
    render.eyeOuterStyle,
    render.eyeInnerStyle,
    render.eyeScale,
    render.frameStyle,
    render.frameText,
    render.crispEdges,
    render.pixelSnap,
    render.fgColor,
    render.bgColor,
    render.bgTransparent,
    render.gradient,
    render.palette,
    render.paletteMode,
    render.perModuleColorMode,
    render.contrastGuard,
    render.minContrastRatio,
    // Overlay
    overlay.enabled,
    overlay.mode,
    overlay.colorMode,
    overlay.invert,
    overlay.preserveFinders,
    overlay.preserveTiming,
    overlay.preserveAlignment,
    overlay.protectFormatInfo,
    overlay.protectVersionInfo,
    overlay.brightness,
    overlay.contrast,
    overlay.gamma,
    overlay.saturation,
    overlay.hueRotateDeg,
    overlay.blurPx,
    overlay.sharpen,
    overlay.posterizeLevels,
    overlay.threshold,
    overlay.edgeDetect,
    overlay.ditherKind,
    overlay.ditherStrength,
    overlay.finderDitherStrength,
    overlay.blendPreservations,
    overlay.blendPreservationMode,
    overlay.ditherSerpentine,
    overlay.diffusionKernel,
    overlay.orderedMatrix,
    overlay.blueNoiseTileSize,
    overlay.blueNoiseSeed,
    overlay.colorDither,
    overlay.subpixelGridSize,
    overlay.subpixelCenterRule,
    overlay.subpixelNeutralColor,
    overlay.subpixelFinderOverride,
    overlay.halftoneCell,
    overlay.halftoneDotShape,
    overlay.duotoneColors,
    overlay.brightnessCurve,
    overlay.eccAwareEnabled,
    overlay.eccAwareRiskBudget,
    overlay.eccAwareWeightMap,
    overlay.qrFirstMode,
    overlay.qrartIterations,
    overlay.qrartFragmentLength,
    overlay.qrartSeed,
    // Animation
    animation.temporalDither,
    animation.seed,
    animation.moduleJitterPx,
    animation.colorCycle,
    // Safety
    safety.mode,
    safety.lockFinders,
    safety.lockTiming,
    safety.lockAlign,
    safety.lockFormat,
    safety.lockVersion,
    safety.minModulePx,
    safety.minQuietZoneModules,
    safety.maxOverlayIntensityByEcc,
  ]);

  // Debounce config changes to prevent excessive regeneration.
  // We keep a fast-preview stage for live interaction, then settle to full quality.
  const primaryDebouncedConfig = useDebounce(config, CONFIG_DEBOUNCE_MS);
  const settledConfig = useDebounce(config, CONFIG_SETTLE_DEBOUNCE_MS);
  const overlaySourceKey = useMemo(() => {
    const file = overlay.file;
    if (!file) return `url:${overlay.url || ''}`;
    return `file:${file.name}:${file.size}:${file.lastModified}:${file.type}:${overlay.url || ''}`;
  }, [overlay.file, overlay.url]);
  currentOverlaySourceKeyRef.current = overlaySourceKey;

  useEffect(() => {
    const currentPrimary = primaryDebouncedConfig as object;
    if (
      autoGenerateSuppressedRef.current &&
      cancelledPrimaryDebouncedConfigRef.current &&
      cancelledPrimaryDebouncedConfigRef.current !== currentPrimary
    ) {
      autoGenerateSuppressedRef.current = false;
      cancelledPrimaryDebouncedConfigRef.current = null;
      cancelledOverlaySourceKeyRef.current = null;
    }
    currentPrimaryDebouncedConfigRef.current = currentPrimary;
  }, [primaryDebouncedConfig]);

  useEffect(() => {
    if (!autoGenerateSuppressedRef.current) return;
    if (
      cancelledOverlaySourceKeyRef.current &&
      cancelledOverlaySourceKeyRef.current !== overlaySourceKey
    ) {
      autoGenerateSuppressedRef.current = false;
      cancelledPrimaryDebouncedConfigRef.current = null;
      cancelledOverlaySourceKeyRef.current = null;
    }
  }, [overlaySourceKey]);

  // During active interaction, enable fast preview mode which skips
  // expensive rendering features. Once interaction stops and settledConfig catches up,
  // fast preview is removed and a full-quality re-render is triggered automatically.
  const debouncedConfig = useMemo(() => {
    if (primaryDebouncedConfig !== settledConfig) {
      return { ...primaryDebouncedConfig, fastPreview: true as const };
    }
    return primaryDebouncedConfig;
  }, [primaryDebouncedConfig, settledConfig]);

  // Track when config changes but debounce hasn't settled yet.
  // Compare against primaryDebouncedConfig (not debouncedConfig which may have fastPreview added)
  // so that fast-preview renders don't trigger the pending blur overlay.
  const isConfigPending = config !== primaryDebouncedConfig;

  // Show pending state for style changes only (not for content typing)
  // Use a short delay to avoid flickering on rapid style changes
  useEffect(() => {
    if (isConfigPending) {
      const timeout = setTimeout(() => setPendingVisible(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setPendingVisible(false);
    }
  }, [isConfigPending]);

  // CRITICAL: Clear overflow blocking state IMMEDIATELY when raw content changes
  // This fixes the calendar date selection issue where:
  // 1. User selects a date -> rawContent changes immediately
  // 2. But debouncedContent won't update for 700ms
  // 3. Without this, hasOverflowError stays true, blocking the generate useEffect
  // 4. The generate() function never runs, so its content-change detection never executes
  // This useEffect runs on RAW content, so it clears blocking state immediately
  //
  // IMPORTANT: We UNCONDITIONALLY clear overflow state on every rawContent change.
  // Previously this was conditional (only if overflow existed), but that caused timing
  // race conditions where React state updates hadn't propagated before the generate
  // useEffect ran. The clearing operations are cheap and ensuring they always run
  // prevents stuck overflow error states, especially in iCalendar/Event content types.
  useEffect(() => {
    log.debug('rawContent useEffect triggered', {
      rawContentLength: rawContent.length,
      rawContentPreview: rawContent.substring(0, 100),
      lastOverflowContent: lastOverflowContentRef.current?.substring(0, 50),
      isOverflowBlocked: isOverflowBlockedRef.current,
      hasOverflowError,
    });
    lastOverflowContentRef.current = null;
    isOverflowBlockedRef.current = false;
    setHasOverflowError(false);
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only react to rawContent changes, not state changes
  }, [rawContent]);

  // Clear error and overflow tracking when debounced content, version, or ECC changes
  // This is a secondary safety net - the rawContent effect above handles the critical path
  // This effect handles cases where version/ECC change independently
  useEffect(() => {
    // Always clear overflow tracking when these deps change - user is trying something different
    lastOverflowContentRef.current = null;
    isOverflowBlockedRef.current = false;

    setError(null);
    setHasOverflowError(false);
  }, [debouncedConfig.content, debouncedConfig.typeNumber, debouncedConfig.errorCorrection]);

  /**
   * Apply only geometric transforms (crop, fit, rotate, flip) to a canvas.
   * Color adjustments (brightness, contrast, etc.) are now done at moduleCount
   * resolution inside qr-generator.js for 10-50x speedup.
   *
   * NOTE: This is called from the hook BEFORE passing to qr-generator.
   * qr-generator.js has its own _applyGeometricTransforms but it checks
   * _hasGeometricTransforms() which looks at config.overlayRotate/overlayFlipX/overlayFlipY.
   * Since we apply transforms here and don't pass those config values to the generator,
   * the generator will NOT double-apply transforms.
   */
  const applyGeometricTransforms = useCallback(
    (sourceCanvas: HTMLCanvasElement | OffscreenCanvas): HTMLCanvasElement => {
      const source = sourceCanvas as HTMLCanvasElement;
      const needsTransform =
        overlay.rotateDeg !== 0 ||
        overlay.flipX ||
        overlay.flipY ||
        overlay.cropEnabled ||
        !!overlay.fit;

      if (!needsTransform) {
        return source as HTMLCanvasElement;
      }

      let workingCanvas: HTMLCanvasElement = source;
      if (overlay.cropEnabled && overlay.cropRegion) {
        const cropped = applyCropTransform(sourceCanvas, overlay.cropRegion);
        if (!cropped) return sourceCanvas as HTMLCanvasElement;
        workingCanvas = cropped;
      }

      if (overlay.fit) {
        const fitted = applyFitTransform(workingCanvas, overlay.fit);
        if (!fitted) return workingCanvas;
        workingCanvas = fitted;
      }

      if (overlay.rotateDeg !== 0 || overlay.flipX || overlay.flipY) {
        const rotated = applyRotateFlipTransform(
          workingCanvas,
          overlay.rotateDeg,
          overlay.flipX,
          overlay.flipY
        );
        if (!rotated) return workingCanvas;
        workingCanvas = rotated;
      }

      return workingCanvas;
    },
    [
      overlay.rotateDeg,
      overlay.flipX,
      overlay.flipY,
      overlay.cropEnabled,
      overlay.cropRegion,
      overlay.fit,
    ]
  );

  // Load overlay image when file changes
  // For GIFs: use compositor for optimal patch-only decoding
  // For static images: load directly
  useEffect(() => {
    if (!overlay.file) {
      setRawOverlayCanvas(null);
      setOverlayCanvas(null);
      setGifFrames([]);
      setGifCompositor(null);
      setCurrentFrame(0);
      setIsLoadingOverlay(false);
      return;
    }

    // Set loading state immediately when starting to load overlay
    // This prevents busy overlay flickering between QR render and animation cache build
    setIsLoadingOverlay(true);

    // Check for GIF format (use compositor for optimal decoding)
    const isGif =
      overlay.file.type === 'image/gif' || overlay.file.name.toLowerCase().endsWith('.gif');

    // Check for animated WebP (still uses legacy path for now)
    const isAnimatedWebP =
      overlay.file.type === 'image/webp' || overlay.file.name.toLowerCase().endsWith('.webp');

    if (isGif) {
      // Use GIF compositor for optimal patch-only decoding
      // Use modern Blob#arrayBuffer() API instead of FileReader
      overlay.file
        .arrayBuffer()
        .then((arrayBuffer) => {
          try {
            const compositor = createGifCompositor(arrayBuffer);
            setGifCompositor(compositor);
            setGifFrames([]); // Clear legacy frames
            setCurrentFrame(0);

            // Apply first frame to get initial canvas
            compositor.reset();
            compositor.apply(0);
            setRawOverlayCanvas(compositor.canvas);
            // Note: Don't clear isLoadingOverlay here - wait for animation cache to be ready
          } catch (err) {
            log.error('Failed to create GIF compositor', { error: err });
            setGifCompositor(null);
            // Fall back to static image loading
            const file = overlay.file;
            if (!file) return;
            loadFileAsCanvas(file)
              .then((canvas) => {
                setRawOverlayCanvas(canvas);
                setGifFrames([{ canvas, delay: 100, disposalType: 0 }]);
                setIsLoadingOverlay(false);
              })
              .catch(() => {
                setRawOverlayCanvas(null);
                setIsLoadingOverlay(false);
              });
          }
        })
        .catch((err) => {
          log.error('Failed to read GIF file', { error: err });
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    } else if (isAnimatedWebP) {
      // Use legacy parseAnimatedImage for WebP (compositor only supports GIF)
      // Use modern Blob#arrayBuffer() API instead of FileReader
      overlay.file
        .arrayBuffer()
        .then(async (arrayBuffer) => {
          try {
            const frames = await parseAnimatedImage(arrayBuffer, overlay.gifDisposalHandling);
            setGifFrames(frames);
            setGifCompositor(null);
            setCurrentFrame(0);
            if (frames.length > 0) {
              setRawOverlayCanvas(frames[0].canvas);
            }
            // Note: Don't clear isLoadingOverlay here for multi-frame - wait for animation cache
            if (frames.length <= 1) {
              setIsLoadingOverlay(false);
            }
          } catch (err) {
            log.error('Failed to parse animated WebP', { error: err });
            const file = overlay.file;
            if (!file) return;
            loadFileAsCanvas(file)
              .then((canvas) => {
                setRawOverlayCanvas(canvas);
                setGifFrames([{ canvas, delay: 100, disposalType: 0 }]);
                setIsLoadingOverlay(false);
              })
              .catch(() => {
                setRawOverlayCanvas(null);
                setIsLoadingOverlay(false);
              });
          }
        })
        .catch((err) => {
          log.error('Failed to read WebP file', { error: err });
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    } else {
      // Static image (PNG, JPG, etc.)
      setGifFrames([]);
      setGifCompositor(null);
      loadFileAsCanvas(overlay.file)
        .then((canvas) => {
          setRawOverlayCanvas(canvas);
          setIsLoadingOverlay(false);
        })
        .catch((err) => {
          log.error('Failed to load overlay', { error: err });
          setRawOverlayCanvas(null);
          setIsLoadingOverlay(false);
        });
    }
  }, [overlay.file, overlay.gifDisposalHandling]);

  // Apply geometric transforms when raw canvas or transform settings change
  // NOTE: Color adjustments are now done at moduleCount resolution in qr-generator.js
  useEffect(() => {
    if (rawOverlayCanvas) {
      const transformed = applyGeometricTransforms(rawOverlayCanvas);
      setOverlayCanvas(transformed);
    } else {
      setOverlayCanvas(null);
    }
  }, [rawOverlayCanvas, applyGeometricTransforms]);

  // Generate QR code
  const generate = useCallback(async () => {
    log.debug('generate() called', {
      debouncedContentLength: debouncedConfig.content?.length,
      debouncedContentPreview: debouncedConfig.content?.substring(0, 100),
      lastOverflowContent: lastOverflowContentRef.current?.substring(0, 50),
      isOverflowBlocked: isOverflowBlockedRef.current,
      hasOverflowError,
      typeNumber: debouncedConfig.typeNumber,
      errorCorrection: debouncedConfig.errorCorrection,
    });

    const preCheckResult = handleGeneratePreChecks({
      lastOverflowContentRef,
      isOverflowBlockedRef,
      content: debouncedConfig.content,
      setHasOverflowError,
      setError,
      clearGenerationProgress,
    });
    if (preCheckResult.shouldAbort) return;

    activeQArtRequestAbortRef.current?.abort();
    const qartAbortController = new AbortController();
    activeQArtRequestAbortRef.current = qartAbortController;

    const requestId = ++generationRequestIdRef.current;
    const isStaleRequest = (): boolean => generationRequestIdRef.current !== requestId;

    const trimmedContent = debouncedConfig.content?.trim() || '';
    if (!trimmedContent) {
      if (isStaleRequest()) return;
      setCanvas(null);
      setError(null);
      setIsLoading(false);
      setIsRendering(false);
      clearGenerationProgress();
      clearDisplayCanvas(canvasRef.current);
      return;
    }

    setIsLoading(true);
    setError(null);
    updateGenerationProgress(t('preview.busy.preparingPreview', 'Preparing your preview...'), 6);

    // CRITICAL: Yield to browser to allow React to render the loading state
    // before starting expensive QR generation. Without this, the busy overlay
    // may not appear because the heavy computation blocks the UI thread.
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        // Double-RAF ensures the browser has completed painting
        requestAnimationFrame(() => resolve());
      });
    });

    if (isStaleRequest()) return;
    setIsRendering(true);
    updateGenerationProgress(
      t('preview.busy.buildingQrStructure', 'Building the QR structure...'),
      14
    );
    const yieldForResponsiveness = async (): Promise<boolean> => {
      await yieldToMainThread(16);
      return isStaleRequest();
    };
    const runValidationIfNeeded = setupValidationRunner({
      requestId,
      animationFrameCount,
      hasMultipleSourceFramesRef,
      animationPlaying: animation.playing,
      setIsValidating,
      setValidation,
      generationRequestIdRef,
    });

    try {
      // Build effective config - may be modified by QR-Art fragment search
      const effectiveConfig = { ...debouncedConfig };
      const runGeneratorWithStatus = (
        cfg: QRGeneratorConfig,
        overlaySource: HTMLCanvasElement | OffscreenCanvas | null
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> =>
        runGeneratorWithSlowStatus({
          cfg,
          overlaySource,
          isStaleRequest,
          updateGenerationProgress,
          t,
        });

      if (overlay.enabled && overlay.mode === 'artwork' && overlayCanvas) {
        const qartResult = await runQArtGeneration({
          overlayCanvas,
          debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
          qartAbortController,
          isStaleRequest,
          yieldForResponsiveness,
          updateGenerationProgress,
          t,
          translateQArtStage,
          watermark,
          canvasRef,
          setCanvas,
          qrPackedMatrixRef,
          setQrMatrix,
          setIsRendering,
          setIsLoading,
          clearGenerationProgress,
          qartPreviewBitmapCanvasRef,
          effectiveConfig,
          runValidationIfNeeded,
          setQArtPerfSnapshot,
          requestId,
        });
        if (qartResult.handled) return;
      }

      const stdResult = await runStandardGeneration({
        effectiveConfig,
        debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
        overlayEnabled: overlay.enabled,
        overlayCanvas,
        isStaleRequest,
        yieldForResponsiveness,
        updateGenerationProgress,
        t,
        runGeneratorWithStatus,
        lastOverflowContentRef,
        isOverflowBlockedRef,
        setHasOverflowError,
        setError,
        setIsRendering,
        setIsLoading,
        clearGenerationProgress,
      });
      if (stdResult.aborted) return;

      await finalizeGeneratedCanvas({
        result: stdResult.result,
        watermark,
        isStaleRequest,
        setCanvas,
        updateGenerationProgress,
        t,
        qrPackedMatrixRef,
        setQrMatrix,
        canvasRef,
        runValidationIfNeeded,
        effectiveConfig,
      });
    } catch (err) {
      if (isStaleRequest()) return;
      log.error('QR generation error', { error: err });
      const errorMessage = formatGenerationErrorMessage(err, t);
      setError(errorMessage);
      clearGenerationProgress();
      dispatchRenderCompleteEvent(false, errorMessage);
    } finally {
      if (activeQArtRequestAbortRef.current === qartAbortController) {
        activeQArtRequestAbortRef.current = null;
      }
      if (!isStaleRequest()) {
        setIsRendering(false);
        setIsLoading(false);
        clearGenerationProgress();
        if (!error) {
          dispatchRenderCompleteEvent(true);
        }
      }
    }
  }, [
    debouncedConfig,
    overlay.enabled,
    overlay.mode,
    overlayCanvas,
    watermark.enabled,
    watermark.kind,
    watermark.text,
    watermark.image,
    watermark.position,
    watermark.opacity,
    watermark.blend,
    animation.playing,
    animationFrameCount,
    error,
    hasOverflowError,
    clearGenerationProgress,
    updateGenerationProgress,
    t,
    translateQArtStage,
  ]);

  const regenerate = useCallback(async () => {
    autoGenerateSuppressedRef.current = false;
    cancelledPrimaryDebouncedConfigRef.current = null;
    cancelledOverlaySourceKeyRef.current = null;
    await generate();
  }, [generate]);

  // Regenerate when config changes
  // Skip if we're playing from cached animation frames or if we have an overflow error
  useEffect(() => {
    log.debug('regenerate useEffect triggered', {
      hasOverflowError,
      isOverflowBlocked: isOverflowBlockedRef.current,
      isAnimationCacheReady,
      animationFramesLength: animationFrameCount,
      animationPlaying: animation.playing,
    });

    // CRITICAL: Only check the REF, not the state!
    // The rawContent useEffect clears isOverflowBlockedRef synchronously,
    // but setHasOverflowError(false) is async (React batches state updates).
    // If we check hasOverflowError here, we might see stale TRUE value
    // from before the rawContent useEffect's state update was flushed.
    // The ref is always up-to-date because it's synchronous.
    if (isOverflowBlockedRef.current) {
      log.debug('regenerate BLOCKED by overflow ref');
      return;
    }
    if (autoGenerateSuppressedRef.current) {
      log.debug('regenerate BLOCKED by user cancel');
      return;
    }
    // If we have cached animation frames and animation is playing, don't regenerate
    // The cached frames will be displayed by the animation playback effect
    if (isAnimationCacheReady && animationFrameCount > 1 && animation.playing) {
      return;
    }
    // During cache building for multi-frame animations, skip - cache builder handles generation
    if (!isAnimationCacheReady && hasMultipleSourceFramesRef.current && animation.playing) {
      return;
    }
    generate();
    // NOTE: hasOverflowError is intentionally NOT in the dependency array.
    // We only use the ref (isOverflowBlockedRef) for blocking decisions because
    // the ref is synchronously updated by the rawContent useEffect, while the
    // state update (setHasOverflowError) is async and may not be flushed yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generate, isAnimationCacheReady, animationFrameCount, animation.playing, hasOverflowError]);

  // Calculate effective frame indices based on startFrame, maxFrames, frameStep, and FPS decimation
  // Works with both GIF compositor and legacy AnimationFrame array
  const effectiveFrameIndices = useMemo(() => {
    const totalFrames = gifCompositor?.frameCount || gifFrames.length;
    if (totalFrames === 0) return [];

    const startIdx = Math.min(animation.startFrame, totalFrames - 1);
    const maxCount = animation.maxFrames > 0 ? animation.maxFrames : totalFrames; // Use all frames when maxFrames is 0 (no limit)
    const step = Math.max(1, animation.frameStep);

    // First pass: apply startFrame and frameStep
    let candidateIndices: number[] = [];
    for (let i = startIdx; i < totalFrames && candidateIndices.length < maxCount; i += step) {
      candidateIndices.push(i);
    }

    // Second pass: apply FPS-based decimation if source FPS > target
    const preDecimationCount = candidateIndices.length;
    if (candidateIndices.length > 1 && overlay.gifMaxFps > 0 && gifCompositor) {
      // Use compositor-based decimation for GIFs
      const allIndices = decimateCompositorFrames(gifCompositor, overlay.gifMaxFps);
      const allIndexSet = new Set(allIndices);
      // Filter to only keep indices that are in our candidate set
      candidateIndices = candidateIndices.filter((i) => allIndexSet.has(i));
    }

    if (candidateIndices.length > 0) {
      log.debug('effectiveFrameIndices', {
        totalFrames,
        preDecimation: preDecimationCount,
        postDecimation: candidateIndices.length,
        dropped: preDecimationCount - candidateIndices.length,
        gifMaxFps: overlay.gifMaxFps,
        startFrame: animation.startFrame,
        frameStep: animation.frameStep,
      });
    }

    return candidateIndices;
  }, [
    gifCompositor,
    gifFrames.length,
    animation.startFrame,
    animation.maxFrames,
    animation.frameStep,
    overlay.gifMaxFps,
  ]);

  // For backward compatibility - get effective frames for legacy code paths
  const effectiveFrames = useMemo(() => {
    if (gifCompositor) {
      // Create synthetic AnimationFrame objects from compositor
      const frames = effectiveFrameIndices.map((i) => {
        const srcDisposal = gifCompositor.disposalType(i);
        const effectiveDisposal =
          overlay.gifDisposalHandling === 'simplify' && srcDisposal === 3 ? 2 : srcDisposal;
        return {
          canvas: gifCompositor.canvas, // Note: this is the same canvas, caller must use compositor.apply(i)
          delay: gifCompositor.delayMs(i),
          disposalType: effectiveDisposal,
        };
      });
      const totalMs = frames.reduce((s, f) => s + f.delay, 0);
      const uniqueDisposals = [...new Set(frames.map((f) => f.disposalType))].sort((a, b) => a - b);
      log.debug('effectiveFrames: compositor', {
        frameCount: frames.length,
        sampleDelays: frames.slice(0, 3).map((f) => f.delay),
        uniqueDisposals,
        disposalHandling: overlay.gifDisposalHandling,
        totalDurationMs: totalMs,
        avgFps: totalMs > 0 ? Math.round((frames.length / totalMs) * 1000 * 10) / 10 : 0,
      });
      return frames;
    }
    // Legacy path for WebP
    const frames = effectiveFrameIndices.map((i) => gifFrames[i]).filter(Boolean);
    if (frames.length > 0) {
      log.debug('effectiveFrames: legacy', {
        frameCount: frames.length,
        sampleDelays: frames.slice(0, 3).map((f) => f.delay),
      });
    }
    return frames;
  }, [gifCompositor, gifFrames, effectiveFrameIndices, overlay.gifDisposalHandling]);

  // Expose state to window for external tools (gallery generator)
  // NOTE: We intentionally DON'T store animationFrames directly to avoid pinning
  // large canvases in memory. External tools should use getAnimationFrames() getter.
  useEffect(() => {
    // Get original frame delays from parsed GIF frames
    const frameDelays = effectiveFrames.map((f) => f.delay || 100);

    globalThis.__ANQR_STATE__ = {
      isLoading,
      isAnimationReady: isAnimationCacheReady && animationFrameCount > 1,
      animationFrameCount,
      currentFrame,
      // Use getter function instead of direct reference to allow GC when not actively used
      get animationFrames() {
        return animationFramesRef.current;
      },
      animationSpeedMs: animation.speedMs,
      frameDelays, // Original delays from source GIF
    };

    // Cleanup: remove reference when component unmounts or deps change
    return () => {
      if (globalThis.__ANQR_STATE__) {
        // Clear the reference to allow GC
        globalThis.__ANQR_STATE__ = undefined;
      }
    };
  }, [
    isLoading,
    isAnimationCacheReady,
    animationFrameCount,
    currentFrame,
    animation.speedMs,
    effectiveFrames,
  ]);

  // Determine the total frame count for animation playback
  // This handles both overlay-based animations (effectiveFrames) and base QR animations (animationFrames)
  const playbackFrameCount = useMemo(() => {
    // Only start playback tick once cache is fully built.
    // All animated content (multi-frame overlays, patterns, base effects) goes through
    // the cache path. Starting the tick before cache is ready causes the tick, overlay
    // frame update effect, and cache builder to fight over the shared gifCompositor.
    if (isAnimationCacheReady && animationFrameCount > 1) return animationFrameCount;
    return 0;
  }, [isAnimationCacheReady, animationFrameCount]);

  // Animation loop for both overlay-based and base QR animations
  useEffect(() => {
    currentFrameRef.current = currentFrame;
  }, [currentFrame]);

  useEffect(() => {
    // Only animate if we have multiple frames and animation is playing
    if (playbackFrameCount <= 1 || !animation.playing) {
      setIsAnimating(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    setIsAnimating(true);
    lastFrameTime.current = performance.now();
    // Reset direction when animation settings change
    animationDirection.current = 1;

    let tickCount = 0;
    const tick = (now: number) => {
      const elapsed = now - lastFrameTime.current;
      const activeFrameIndex = currentFrameRef.current;
      const frameDelay = resolveAnimationFrameDelay(effectiveFrames, activeFrameIndex, {
        useSourceFrameDelays:
          overlay.enabled && effectiveFrames.length > 1 && overlay.gifUseFrameDelays,
        gifMaxFps: overlay.gifMaxFps,
        fallbackDelayMs: animation.speedMs,
      });

      if (elapsed >= frameDelay) {
        if (tickCount < 3) {
          log.debug('animation tick', {
            tickCount,
            frameIndex: activeFrameIndex,
            elapsed: Math.round(elapsed),
            frameDelay,
            playbackFrameCount,
          });
        } else if (tickCount % 60 === 0) {
          log.trace('animation tick', {
            tickCount,
            frameIndex: activeFrameIndex,
            elapsed: Math.round(elapsed),
            frameDelay,
            playbackFrameCount,
          });
        }
        tickCount++;
        // Use additive timing to prevent drift - increment by frameDelay instead of resetting to now
        lastFrameTime.current += frameDelay;

        // Prevent catch-up storms: if we've fallen too far behind, reset to now
        if (now - lastFrameTime.current > frameDelay * 3) {
          lastFrameTime.current = now;
        }

        setCurrentFrame((prev) => {
          // Get frame delay from current frame if available
          let next = prev + animationDirection.current;

          // Handle bounds based on playback frame count
          if (next >= playbackFrameCount) {
            if (animation.bounce) {
              animationDirection.current = -1;
              next = playbackFrameCount - 2;
            } else if (animation.loop) {
              next = 0;
            } else {
              next = playbackFrameCount - 1;
            }
          } else if (next < 0) {
            if (animation.bounce) {
              animationDirection.current = 1;
              next = 1;
            } else if (animation.loop) {
              next = playbackFrameCount - 1;
            } else {
              next = 0;
            }
          }

          return Math.max(0, Math.min(playbackFrameCount - 1, next));
        });
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [
    playbackFrameCount,
    animation.playing,
    animation.speedMs,
    animation.loop,
    animation.bounce,
    effectiveFrames,
    overlay.enabled,
    overlay.gifUseFrameDelays,
    overlay.gifMaxFps,
  ]);

  // Update overlay canvas when current frame changes (for animation preview)
  // Uses compositor for GIFs (optimal), legacy frames for WebP
  // OPTIMIZATION: Track last rendered frame to avoid O(n²) replay from frame 0
  const lastRenderedFrameRef = useRef<number>(-1);

  useEffect(() => {
    // If we have cached animation frames, skip - we'll draw from cache
    if (isAnimationCacheReady && animationFrameCount > 0) {
      return;
    }

    // During cache building for multi-frame overlays, skip compositor operations.
    // The cache builder exclusively owns the compositor during this phase.
    if (!isAnimationCacheReady && hasMultipleSourceFramesRef.current) return;

    const frameIdx = effectiveFrameIndices[currentFrame];
    if (frameIdx === undefined) return;

    if (gifCompositor) {
      const lastRendered = lastRenderedFrameRef.current;

      log.trace('overlay frame update', {
        currentFrame,
        frameIdx,
        lastRendered,
        action:
          lastRendered < 0 || frameIdx < lastRendered
            ? 'replay'
            : frameIdx > lastRendered
              ? 'forward'
              : 'noop',
      });

      updateCompositorToFrame(gifCompositor, frameIdx, lastRendered);

      lastRenderedFrameRef.current = frameIdx;
      setRawOverlayCanvas(gifCompositor.getSnapshot());
    } else if (gifFrames[frameIdx]) {
      // Legacy path for WebP
      setRawOverlayCanvas(gifFrames[frameIdx].canvas);
    }
  }, [
    currentFrame,
    effectiveFrameIndices,
    gifCompositor,
    gifFrames,
    isAnimationCacheReady,
    animationFrameCount,
  ]);

  // Reset the frame tracking when compositor changes (new GIF loaded), animation cache state changes,
  // or when effective frame indices change (user changed frame settings)
  useEffect(() => {
    lastRenderedFrameRef.current = -1;
  }, []);

  // Track whether we have multiple source frames (for validation skip during cache building)
  useEffect(() => {
    hasMultipleSourceFramesRef.current =
      (gifCompositor?.frameCount ?? 0) > 1 || effectiveFrameIndices.length > 1;
  }, [gifCompositor, effectiveFrameIndices.length]);

  // Display cached animation frames during playback (fast path - no re-encoding)
  useEffect(() => {
    // Guard against race conditions: don't draw during active rendering
    if (isRendering) return;

    const cachedFrames = animationFramesRef.current;
    if (isAnimationCacheReady && animationFrameCount > 1 && cachedFrames[currentFrame]) {
      const cachedFrame = cachedFrames[currentFrame];

      // Draw directly to display canvas (skip setCanvas during playback to avoid re-renders)
      if (canvasRef.current) {
        drawToDisplayCanvas(canvasRef.current, cachedFrame);
      }
    }
  }, [currentFrame, isAnimationCacheReady, animationFrameCount, isRendering]);

  // Prepare interstitial ad on mount (so it's ready when user downloads)
  useEffect(() => {
    prepareInterstitial('export');
  }, []);

  // Download function with output scaling
  const download = useCallback(async () => {
    if (!canvas) return;

    setIsExporting(true);

    // Allow React to render the busy overlay before starting export
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      // Show interstitial ad BEFORE download on native platforms
      await showInterstitial('export');
      scheduleTrackEvent('export', { format: output.format });
      const exporter = await loadExporterModule();

      const exportCanvas = createScaledExportCanvas(
        canvas,
        output.widthPx,
        output.heightPx,
        render.crispEdges
      );

      const exportConfig = buildExportConfig(output, metadata);
      const pngMetadata = buildPngMetadata(metadata);

      if (output.format === 'svg') {
        await downloadSvgFormat({
          exporter,
          exportCanvas,
          exportConfig,
          svgTrueVector: output.svgTrueVector,
          qrMatrix,
          qrPackedMatrixRef: qrPackedMatrixRef.current,
          outputWidthPx: output.widthPx,
          outputFilename: output.filename,
          quietZoneModules: qr.quietZoneModules,
          borderModulesExtra: qr.borderModulesExtra,
          renderState: render,
          metadataState: metadata,
        });
      } else if (output.format === 'gif' && animationFrameCount > 1) {
        await downloadAnimatedGifFormat({
          exporter,
          cachedAnimationFrames: animationFramesRef.current,
          exportConfig,
          outputWidthPx: output.widthPx,
          outputHeightPx: output.heightPx,
          crispEdges: render.crispEdges,
          animationSpeedMs: animation.speedMs,
          animationLoop: animation.loop,
          effectiveFrames,
          gifUseFrameDelays: overlay.gifUseFrameDelays,
          gifMaxFps: overlay.gifMaxFps,
        });
      } else if (output.format === 'gif') {
        await exporter.downloadGif([exportCanvas], exportConfig);
      } else {
        await exporter.downloadImage(exportCanvas, exportConfig, pngMetadata, output.dpi);
      }
    } catch (err) {
      log.error('Download error', { error: err });
    } finally {
      setIsExporting(false);
    }
  }, [
    canvas,
    output,
    render.crispEdges,
    render.fgColor,
    render.bgColor,
    render.bgTransparent,
    render.moduleStyle,
    render.cornerRadius,
    render.finderStyle,
    render.eyeOuterStyle,
    render.eyeInnerStyle,
    render.alignmentStyle,
    render.timingStyle,
    render.gradient,
    qr.quietZoneModules,
    qr.borderModulesExtra,
    qrMatrix,
    animationFrameCount,
    animation.speedMs,
    animation.loop,
    metadata,
    overlay.gifUseFrameDelays,
    overlay.gifMaxFps,
    effectiveFrames,
  ]);

  // Generate all animation frames for GIF export and playback cache
  // This runs once when config changes, then frames are cached for fast playback
  useEffect(() => {
    // Track if this effect is still current (for cleanup/cancellation)
    let isCancelled = false;
    const animationQArtAbortController = new AbortController();
    activeAnimationRequestAbortRef.current?.abort();
    activeAnimationRequestAbortRef.current = animationQArtAbortController;
    const isRunCancelled = (): boolean =>
      isCancelled || animationQArtAbortController.signal.aborted;

    const { modulePatternEffects, resultPatternEffects } = buildPatternEffectLists(animation);
    const hasColorCycle = animation.colorCycle === true;
    const hasPattern = modulePatternEffects.length > 0 || resultPatternEffects.length > 0;
    const hasTemporalDither = animation.temporalDither !== 'off';
    const hasInterpolation = animation.interpolate !== 'none';
    const hasJitter = animation.moduleJitterPx > 0 || modulePatternEffects.length > 0;

    // True only if at least one animation effect is actually enabled
    const hasAnyAnimationEffect = hasColorCycle || hasPattern || hasTemporalDither || hasJitter;

    // Check if we should generate animation from base QR (no overlay)
    // Only when at least one effect is actually enabled
    const shouldGenerateBaseAnimation = hasAnyAnimationEffect && !overlay.enabled;

    // Check if we should generate animation effects on a static overlay image
    // This handles colorCycle, temporalDither, jitter on single-frame overlays
    const shouldGenerateStaticOverlayAnimation =
      hasAnyAnimationEffect && overlay.enabled && effectiveFrames.length === 1;

    const computePatternDrivenJitter = (frameIndex: number, totalFrames: number): number =>
      computePatternDrivenJitterValue(
        frameIndex,
        totalFrames,
        animation.moduleJitterPx,
        modulePatternEffects
      );

    const scratchPool = createScratchCanvasPool();
    const applyResultPatternStackPersistent = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        resultPatternEffects,
        frameIndex,
        totalFrames,
        true,
        scratchPool.getPatternScratch
      );
    const applyResultPatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        resultPatternEffects,
        frameIndex,
        totalFrames,
        false,
        scratchPool.getPatternScratch
      );
    const applyModulePatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStackToCanvas(
        sourceCanvas,
        modulePatternEffects,
        frameIndex,
        totalFrames,
        false,
        scratchPool.getPatternScratch
      );

    // Early return only if no animation is needed
    // For multi-frame overlays (animated GIFs), we need to generate frames regardless of other animation effects
    const hasMultiFrameOverlay = effectiveFrames.length > 1 && overlay.enabled;

    // OPTIMIZATION: If we have a single static overlay with NO animation effects enabled,
    // skip batch frame generation entirely - the normal generate() path handles this
    if (
      !(hasMultiFrameOverlay || shouldGenerateBaseAnimation || shouldGenerateStaticOverlayAnimation)
    ) {
      clearAnimationFrames();
      setIsAnimationCacheReady(false);
      return;
    }

    // Mark cache as not ready while generating
    setIsAnimationCacheReady(false);
    setIsLoading(true);
    updateGenerationProgress(
      t('preview.busy.preparingAnimationFrames', 'Preparing the animation frames...'),
      8
    );

    // Generate QR for each frame (batch generation)
    const generateAllFrames = async () => {
      let frames: (HTMLCanvasElement | OffscreenCanvas)[] = [];

      const persistFrameCanvas = (frameCanvas: HTMLCanvasElement | OffscreenCanvas): void => {
        frames.push(cloneCanvasSimple(frameCanvas));
      };

      // Create yield controller for time-based yielding
      const yieldCtrl = new YieldController();
      yieldCtrl.reset();

      const watermarkImage = await loadWatermarkForAnimation(watermark);

      // Calculate temporal dither mode - only if enabled
      const temporalMode = animation.temporalDither as TemporalDitherMode;
      const useTemporalDither = hasTemporalDither && isTemporalDitherActive(temporalMode);

      // Determine frames to process
      // For GIF compositor, we need to process frames sequentially using apply/dispose
      let framesToProcess = effectiveFrames;
      const useCompositor = gifCompositor && effectiveFrameIndices.length > 0 && overlay.enabled;

      log.debug('animation cache: building', {
        effectiveFrameCount: effectiveFrames.length,
        useCompositor: !!useCompositor,
        hasMultiFrameOverlay,
        shouldGenerateBaseAnimation,
        shouldGenerateStaticOverlayAnimation,
        sampleDelays: effectiveFrames.slice(0, 3).map((f) => f.delay),
      });
      const isScaledOverlayMode = (mode: string | undefined): boolean =>
        mode !== undefined && INTRINSICALLY_SCALED_OVERLAY_MODES.has(mode);
      const previewScanConfigBase = {
        ...debouncedConfig,
        scanGateProfile: 'preview' as const,
        ...(hasMultiFrameOverlay && isScaledOverlayMode(debouncedConfig.overlayMode)
          ? { forceScaledOverlay: true }
          : {}),
      };

      const baseResult = await computeBaseAnimationFramesToProcess({
        shouldGenerateBaseAnimation,
        shouldGenerateStaticOverlayAnimation,
        effectiveFrames,
        hasPattern,
        hasJitter,
        previewScanConfigBase,
        speedMs: animation.speedMs,
        isRunCancelled,
        yieldCtrl,
        computeJitter: computePatternDrivenJitter,
        applyResultPersistent: applyResultPatternStackPersistent,
        applyGeometricTransforms,
      });
      if (!baseResult.framesToProcess || isRunCancelled()) return;
      framesToProcess = baseResult.framesToProcess;

      if (useCompositor && gifCompositor) {
        gifCompositor.reset();
      }

      const isArtworkMode = overlay.enabled && overlay.mode === 'artwork';
      const qartModule = isArtworkMode ? await loadQArtModule() : null;
      const artworkState = createArtworkFrameState(
        debouncedConfig as unknown as Record<string, unknown>
      );

      const generateArtworkFrame = (
        frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas,
        frameIdx: number
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> =>
        generateArtworkFrameStandalone({
          frameOverlayCanvas,
          frameIdx,
          artworkState,
          qartModule,
          debouncedConfig: debouncedConfig as unknown as Record<string, unknown>,
          previewScanConfigBase,
          abortSignal: animationQArtAbortController.signal,
          isRunCancelled,
        });

      await executeFrameGenerationLoop({
        frames,
        framesToProcess,
        isRunCancelled,
        yieldCtrl,
        gifCompositor: gifCompositor ?? null,
        updateGenerationProgress,
        t,
        shouldGenerateBaseAnimation,
        hasPattern,
        hasJitter,
        previewScanConfigBase,
        useTemporalDither,
        temporalMode,
        animationSeed: animation.seed,
        useCompositor: !!(useCompositor && gifCompositor),
        effectiveFrameIndices,
        applyGeometricTransforms,
        scratchPool,
        isArtworkMode,
        generateArtworkFrame,
        modulePatternEffects,
        applyModulePatternEphemeral: applyModulePatternStackEphemeral,
        computeJitter: computePatternDrivenJitter,
        moduleJitterPx: animation.moduleJitterPx,
        resultPatternEffects,
        applyResultEphemeral: applyResultPatternStackEphemeral,
        hasColorCycle,
        watermarkConfig: watermark,
        watermarkImage,
        persistFrameCanvas,
        setCanvas,
        canvasRef,
        getLatestFrame: () => frames[frames.length - 1],
      });

      frames = await finalizeAnimationFrames({
        frames,
        hasInterpolation,
        interpolateMode: animation.interpolate,
        content: debouncedConfig.content,
        isRunCancelled,
        updateGenerationProgress,
        t,
      });

      completeAnimationGeneration({
        frames,
        isRunCancelled,
        replaceAnimationFrames,
        setIsAnimationCacheReady,
        setIsLoading,
        setIsLoadingOverlay,
        clearGenerationProgress,
        setCanvas,
        canvasRef,
      });
    };

    generateAllFrames();

    // Cleanup: cancel in-flight generation if deps change
    // IMPORTANT: Reset loading states to prevent stuck spinner when navigating away and back
    return () => {
      isCancelled = true;
      animationQArtAbortController.abort();
      if (activeAnimationRequestAbortRef.current === animationQArtAbortController) {
        activeAnimationRequestAbortRef.current = null;
      }
      setIsLoading(false);
      setIsLoadingOverlay(false);
      clearGenerationProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    effectiveFrames,
    effectiveFrameIndices,
    gifCompositor,
    overlay.enabled,
    debouncedConfig,
    watermark,
    animation.temporalDither,
    animation.seed,
    animation.pattern,
    animation.pattern2,
    animation.target,
    animation.target2,
    animation.waveAxis,
    animation.waveAxis2,
    animation.interpolate,
    animation.speedMs,
    animation.colorCycle,
    animation.moduleJitterPx,
    applyGeometricTransforms,
    clearAnimationFrames,
    overlay.mode,
    replaceAnimationFrames,
    clearGenerationProgress,
    updateGenerationProgress,
    t,
    translateQArtStage,
  ]);

  // Fast-preview is active when the short debounce has fired but the settled
  // debounce hasn't caught up yet.
  const isFastPreview = primaryDebouncedConfig !== settledConfig;

  // Determine if we're still preparing animation
  // This covers: GIF overlays, static overlays with animation effects, and base QR animation effects
  const hasMultiFrameContent = (gifCompositor?.frameCount || 0) > 1 || gifFrames.length > 1;
  const hasAnimationEffectsEnabled =
    animation.colorCycle ||
    animation.pattern !== 'none' ||
    animation.pattern2 !== 'none' ||
    animation.temporalDither !== 'off' ||
    animation.moduleJitterPx > 0;

  // Show preparing state when:
  // 1. We're loading an overlay file (GIF parsing, etc.), OR
  // 2. We have multi-frame GIF content and cache isn't ready, OR
  // 3. We have animation effects enabled (on static image or no overlay) and cache isn't ready
  const isPreparingAnimation =
    isLoadingOverlay ||
    (!isAnimationCacheReady && hasMultiFrameContent) ||
    (!isAnimationCacheReady &&
      hasAnimationEffectsEnabled &&
      animationFrameCount === 0 &&
      isLoading);

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    canvas,
    isLoading,
    isExporting,
    isRendering,
    isPending: pendingVisible, // Use delayed version to avoid immediate blur while typing
    error,
    regenerate,
    cancelGeneration,
    download,
    // Animation state
    isAnimating,
    currentFrame,
    totalFrames: playbackFrameCount || effectiveFrames.length,
    // True when we have multi-frame content but animation cache isn't ready yet
    isPreparingAnimation,
    // Safety warnings
    safetyWarnings,
    // Validation
    validation,
    isValidating,
    // Busy feedback
    busyStage: generationProgress?.stage ?? null,
    busyProgress: generationProgress?.percent ?? null,
    // Fast preview
    isFastPreview,
    // Animation frames for GIF export
    animationFrames: animationFramesRef.current,
  };
}

// Singleton context — ensures only ONE animation loop + compositor effect runs
const QRGeneratorContext = createContext<UseQRGeneratorResult | null>(null);

export function QRGeneratorProvider({ children }: Readonly<{ children: ReactNode }>) {
  const value = useQRGenerator();
  return createElement(QRGeneratorContext.Provider, { value }, children);
}

export function useQRGeneratorContext(): UseQRGeneratorResult {
  const ctx = useContext(QRGeneratorContext);
  if (!ctx) throw new Error('useQRGeneratorContext must be used within QRGeneratorProvider');
  return ctx;
}
