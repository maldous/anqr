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
  if (!qartModulePromise) {
    qartModulePromise = import('@/modules/qr-art');
  }
  return qartModulePromise;
}

function loadExporterModule(): Promise<ExporterModule> {
  if (!exporterModulePromise) {
    exporterModulePromise = import('@/modules/exporter');
  }
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
      if (overlayEl?.parentNode) {
        overlayEl.parentNode.removeChild(overlayEl);
      }
      qartPerfOverlayRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ENABLE_QART_PERF_OVERLAY) return;
    const overlayEl = qartPerfOverlayRef.current;
    if (!overlayEl || !qartPerfSnapshot) return;

    const computeMs =
      qartPerfSnapshot.computeMs !== null ? Math.round(qartPerfSnapshot.computeMs) : null;
    const renderMs =
      qartPerfSnapshot.renderMs !== null ? Math.round(qartPerfSnapshot.renderMs) : null;
    const previewMs =
      qartPerfSnapshot.previewMs !== null ? Math.round(qartPerfSnapshot.previewMs) : null;

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
    const warnings: string[] = [];
    let adjustedModulePx = render.modulePx;
    let adjustedQuietZone = qr.quietZoneModules;
    let adjustedIntensity = overlay.intensity;
    const effectiveEcc = auto.pickEcc ? autoPickedEcc : qr.ecc;

    // Apply safety mode constraints
    if (safety.mode !== 'off') {
      // Enforce minimum module size
      if (render.modulePx < safety.minModulePx) {
        adjustedModulePx = safety.minModulePx;
        warnings.push(`Module size increased to ${safety.minModulePx}px for scannability`);
      }

      // Enforce minimum quiet zone
      if (qr.quietZoneModules < safety.minQuietZoneModules) {
        adjustedQuietZone = safety.minQuietZoneModules;
        warnings.push(`Quiet zone increased to ${safety.minQuietZoneModules} modules`);
      }

      // Check overlay intensity against ECC capacity (use store-configured limits)
      const maxSafeIntensity = safety.maxOverlayIntensityByEcc[effectiveEcc] ?? 50;

      if (safety.mode === 'strict' && overlay.enabled && overlay.intensity > maxSafeIntensity) {
        adjustedIntensity = maxSafeIntensity;
        warnings.push(
          `Overlay intensity reduced to ${maxSafeIntensity}% for ECC level ${effectiveEcc}`
        );
      } else if (
        safety.mode === 'balanced' &&
        overlay.enabled &&
        overlay.intensity > maxSafeIntensity
      ) {
        warnings.push(
          `Overlay intensity (${overlay.intensity}%) may reduce scannability with ECC ${effectiveEcc}`
        );
      }

      // Auto-reduce intensity if enabled
      if (
        auto.reduceIntensityUntilSafe &&
        overlay.enabled &&
        overlay.intensity > maxSafeIntensity
      ) {
        adjustedIntensity = maxSafeIntensity;
        warnings.push(`Auto-reduced overlay intensity to ${maxSafeIntensity}% for safe scanning`);
      }

      // Warn about risky style combinations
      if (render.moduleGapPercent > 20) {
        warnings.push('Large module gaps may affect QR readability');
      }

      if (render.moduleStyle === 'dots' && render.moduleGapPercent > 10) {
        warnings.push('Dots with large gaps may be hard to scan');
      }
    }

    // Show auto-pick ECC info
    if (auto.pickEcc && autoPickedEcc !== qr.ecc) {
      warnings.push(`Auto-selected ECC level ${autoPickedEcc} for optimal balance`);
    }

    return {
      safetyAdjustedConfig: {
        modulePx: adjustedModulePx,
        quietZone: adjustedQuietZone,
        intensity: adjustedIntensity,
        ecc: effectiveEcc,
      },
      safetyWarnings: warnings,
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
      const charCode = rawContent.charCodeAt(i);

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
  }, [rawContent, hasOverflowError]);

  // Clear error and overflow tracking when debounced content, version, or ECC changes
  // This is a secondary safety net - the rawContent effect above handles the critical path
  // This effect handles cases where version/ECC change independently
  useEffect(() => {
    // Always clear overflow tracking when these deps change - user is trying something different
    lastOverflowContentRef.current = null;
    isOverflowBlockedRef.current = false;

    if (error || hasOverflowError) {
      setError(null);
      setHasOverflowError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Only clear error on config change, not when error/hasOverflowError state itself changes
  }, [error, hasOverflowError]);

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
      // Cast to HTMLCanvasElement for DOM operations - this is safe because
      // the hook only works in browser context where we always have HTMLCanvasElement
      const source = sourceCanvas as HTMLCanvasElement;
      // Check if any geometric transforms are needed
      const needsTransform =
        overlay.rotateDeg !== 0 ||
        overlay.flipX ||
        overlay.flipY ||
        overlay.cropEnabled ||
        !!overlay.fit;

      if (!needsTransform) {
        return source as HTMLCanvasElement;
      }

      // First apply crop if enabled
      let workingCanvas: HTMLCanvasElement = source;
      if (overlay.cropEnabled && overlay.cropRegion) {
        const { x, y, size } = overlay.cropRegion;
        const cropCanvas = document.createElement('canvas');
        const cropCtx = cropCanvas.getContext('2d');
        if (!cropCtx) return sourceCanvas as HTMLCanvasElement;

        const srcWidth = sourceCanvas.width;
        const srcHeight = sourceCanvas.height;
        // Crop must use a square source region to avoid aspect distortion.
        // `size` scales against the shorter edge so 100% means a max square crop.
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
        workingCanvas = cropCanvas;
      }

      // Apply fit mode if specified
      if (overlay.fit) {
        const fitCanvas = document.createElement('canvas');
        const fitCtx = fitCanvas.getContext('2d');
        if (!fitCtx) return workingCanvas;
        const srcW = workingCanvas.width;
        const srcH = workingCanvas.height;
        const targetSize = Math.max(srcW, srcH);

        fitCanvas.width = targetSize;
        fitCanvas.height = targetSize;

        let drawX = 0,
          drawY = 0,
          drawW = srcW,
          drawH = srcH;

        if (overlay.fit === 'cover') {
          const scale = Math.max(targetSize / srcW, targetSize / srcH);
          drawW = srcW * scale;
          drawH = srcH * scale;
          drawX = (targetSize - drawW) / 2;
          drawY = (targetSize - drawH) / 2;
        } else if (overlay.fit === 'contain') {
          const scale = Math.min(targetSize / srcW, targetSize / srcH);
          drawW = srcW * scale;
          drawH = srcH * scale;
          drawX = (targetSize - drawW) / 2;
          drawY = (targetSize - drawH) / 2;
          fitCtx.fillStyle = 'transparent';
          fitCtx.fillRect(0, 0, targetSize, targetSize);
        } else if (overlay.fit === 'stretch') {
          drawW = targetSize;
          drawH = targetSize;
        }

        fitCtx.drawImage(workingCanvas, drawX, drawY, drawW, drawH);
        workingCanvas = fitCanvas;
      }

      // Apply rotation and flip if needed
      if (overlay.rotateDeg !== 0 || overlay.flipX || overlay.flipY) {
        const processedCanvas = document.createElement('canvas');
        const ctx = processedCanvas.getContext('2d');
        if (!ctx) return workingCanvas;
        const angle = (overlay.rotateDeg * Math.PI) / 180;
        const isRightAngle = overlay.rotateDeg === 90 || overlay.rotateDeg === 270;

        if (isRightAngle) {
          processedCanvas.width = workingCanvas.height;
          processedCanvas.height = workingCanvas.width;
        } else {
          processedCanvas.width = workingCanvas.width;
          processedCanvas.height = workingCanvas.height;
        }

        ctx.save();
        ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);

        if (overlay.rotateDeg !== 0) {
          ctx.rotate(angle);
        }
        if (overlay.flipX) {
          ctx.scale(-1, 1);
        }
        if (overlay.flipY) {
          ctx.scale(1, -1);
        }

        ctx.drawImage(workingCanvas, -workingCanvas.width / 2, -workingCanvas.height / 2);
        ctx.restore();
        workingCanvas = processedCanvas;
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

    // CRITICAL: Check if content has changed from last failed content FIRST
    // This allows retry when user modifies the form (e.g., calendar date changes)
    // Must run before the blocking checks to ensure content changes reset the block
    if (
      lastOverflowContentRef.current !== null &&
      lastOverflowContentRef.current !== debouncedConfig.content
    ) {
      // Content changed - clear overflow blocking to allow retry with new content
      log.debug('Content changed from failed content, clearing block');
      lastOverflowContentRef.current = null;
      isOverflowBlockedRef.current = false;
      setHasOverflowError(false);
      setError(null);
    }

    // Now check if we're still blocked (same content that previously failed)
    if (isOverflowBlockedRef.current) {
      log.debug('generate BLOCKED by overflow ref');
      clearGenerationProgress();
      return;
    }

    activeQArtRequestAbortRef.current?.abort();
    const qartAbortController = new AbortController();
    activeQArtRequestAbortRef.current = qartAbortController;

    const requestId = ++generationRequestIdRef.current;
    const isStaleRequest = (): boolean => generationRequestIdRef.current !== requestId;

    // Check for empty content - don't generate QR if there's nothing to encode
    // This prevents displaying a non-scannable QR code
    // Just show a blank white screen without any text message
    const trimmedContent = debouncedConfig.content?.trim() || '';
    if (!trimmedContent) {
      if (isStaleRequest()) return;
      setCanvas(null);
      setError(null); // No error message - just blank
      setIsLoading(false);
      setIsRendering(false);
      clearGenerationProgress();
      // Clear the display canvas if it exists
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    updateGenerationProgress('Preparing preview', 6);

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
    updateGenerationProgress('Generating QR modules', 14);
    const yieldForResponsiveness = async (): Promise<boolean> => {
      await yieldToMainThread(16);
      return isStaleRequest();
    };
    const qartPerfMarkPrefix = `anqr:qart:${requestId}`;
    const qartRequestMark = `${qartPerfMarkPrefix}:request`;
    const qartResultMark = `${qartPerfMarkPrefix}:result`;
    const qartRenderMark = `${qartPerfMarkPrefix}:render`;
    const runValidationIfNeeded = (
      renderedCanvas: HTMLCanvasElement | OffscreenCanvas,
      expectedContent: string | undefined
    ): void => {
      const isCurrentlyAnimating =
        (animationFrameCount > 1 || hasMultipleSourceFramesRef.current) && animation.playing;
      const shouldValidate = Boolean(expectedContent) && !isCurrentlyAnimating;
      if (!shouldValidate) return;

      const validationRequestId = requestId;
      setIsValidating(true);
      const validationDelay = 120;
      setTimeout(() => {
        if (generationRequestIdRef.current !== validationRequestId) {
          setIsValidating(false);
          return;
        }
        validateInWorker(renderedCanvas, expectedContent, 2)
          .then((validationResult) => {
            if (generationRequestIdRef.current === validationRequestId) {
              setValidation(validationResult);
            }
          })
          .catch((err) => {
            log.error('Validation error', { error: err });
            if (generationRequestIdRef.current === validationRequestId) {
              setValidation(null);
            }
          })
          .finally(() => {
            setIsValidating(false);
          });
      }, validationDelay);
    };

    try {
      // Build effective config - may be modified by QR-Art fragment search
      const effectiveConfig = { ...debouncedConfig };
      const runGeneratorWithStatus = async (
        cfg: QRGeneratorConfig,
        overlaySource: HTMLCanvasElement | OffscreenCanvas | null
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> => {
        let slowRenderTimer: ReturnType<typeof setTimeout> | null = null;
        slowRenderTimer = setTimeout(() => {
          if (!isStaleRequest()) {
            updateGenerationProgress('Still rendering complex overlay', 72);
          }
        }, 900);
        try {
          return await qrGenerator.generate(cfg, overlaySource);
        } finally {
          if (slowRenderTimer) {
            clearTimeout(slowRenderTimer);
          }
        }
      };

      // QR-Art: if artwork mode is selected, try full RS basis manipulation first, then fall back to fragment search
      if (overlay.enabled && overlay.mode === 'artwork' && overlayCanvas) {
        const qartModule = await loadQArtModule();
        if (isStaleRequest()) return;
        updateGenerationProgress('Preparing QR-Art computation', 18);
        log.info('Starting QR-Art generation', {
          content: debouncedConfig.content?.substring(0, 50),
          version: debouncedConfig.typeNumber,
          ecc: debouncedConfig.errorCorrection,
        });

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

        // Try full QR-Art algorithm (RS basis manipulation)
        try {
          if (await yieldForResponsiveness()) return;
          const useAutoMask =
            typeof debouncedConfig.maskPattern !== 'number' || debouncedConfig.maskPattern < 0;
          const qartConfig = {
            data: debouncedConfig.content,
            version: debouncedConfig.typeNumber || 0,
            // QArt: honor user-selected ECC (default to M if unset)
            ecc: (debouncedConfig.errorCorrection || 'M') as 'L' | 'M' | 'Q' | 'H',
            strictSuffix: true,
            // QArt: start at 100% control and reduce until scannable (handled in generator)
            targetControlPercent: 100,
            searchAttempts: getQArtSearchAttempts(debouncedConfig.qrartIterations),
            searchSeed: debouncedConfig.qrartSeed ?? 0,
            lockVersionToMinimum: debouncedConfig.typeNumber === 0,
            performanceProfile: 'quality' as const,
            onProgress: (stage: string, percent: number) => {
              updateGenerationProgress(`QR-Art: ${stage}`, 18 + percent * 0.64);
              log.debug('QR-Art progress', { stage, percent: `${percent}%` });
            },
          };

          safeMark(qartRequestMark);
          qartRequestMarked = true;

          let fullQArtResult: QArtResult;
          try {
            const targetImage = readCanvasImageData(overlayCanvas);
            const workerRenderConfig = sanitizeQArtRenderConfig({
              ...debouncedConfig,
              typeNumber: qartConfig.version,
              overlayMode: undefined,
            } as QRGeneratorConfig);
            const workerResult = await qartModule.generateQArtInWorker(
              {
                data: qartConfig.data,
                targetImage,
                version: qartConfig.version,
                ecc: qartConfig.ecc,
                strictSuffix: qartConfig.strictSuffix,
                targetControlPercent: qartConfig.targetControlPercent,
                searchAttempts: qartConfig.searchAttempts,
                searchSeed: qartConfig.searchSeed,
                lockVersionToMinimum: qartConfig.lockVersionToMinimum,
                maskPattern: useAutoMask ? undefined : (debouncedConfig.maskPattern as number),
                performanceProfile: qartConfig.performanceProfile,
                renderConfig: workerRenderConfig,
                renderInWorker: true,
              },
              {
                onProgress: qartConfig.onProgress,
                signal: qartAbortController.signal,
              }
            );

            qartResultSource = 'worker';
            workerPackedMatrix =
              workerResult.success && workerResult.matrix && workerResult.moduleCount > 0
                ? workerResult.matrix
                : null;
            workerRenderedBitmap =
              workerResult.success && workerResult.bitmap ? workerResult.bitmap : null;
            fullQArtResult = {
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
          } catch (workerErr) {
            if (qartAbortController.signal.aborted || isStaleRequest()) {
              return;
            }
            log.warn('QArt worker failed, falling back to main thread generation', {
              error: workerErr,
            });
            qartResultSource = 'main';
            fullQArtResult = useAutoMask
              ? await qartModule.generateFullQArtOptimal({
                  ...qartConfig,
                  targetImage: overlayCanvas,
                })
              : await qartModule.generateFullQArt({
                  ...qartConfig,
                  targetImage: overlayCanvas,
                  maskPattern: debouncedConfig.maskPattern as number,
                });
          }

          safeMark(qartResultMark);
          if (qartRequestMarked) {
            qartComputeMs = safeMeasure(
              `${qartPerfMarkPrefix}:compute`,
              qartRequestMark,
              qartResultMark
            );
          }
          qartResultVersion = fullQArtResult.version;
          qartResultMaskPattern = fullQArtResult.maskPattern;
          qartResultModuleCount = fullQArtResult.moduleCount;

          // Use full QR-Art result if successful, regardless of match percentage
          // The RS basis manipulation algorithm is mathematically correct and produces valid QR codes
          // Low match percentage just means limited image visibility, not invalid QR
          if (fullQArtResult.success && fullQArtResult.encodedData) {
            log.info('Full QR-Art generation successful', {
              matchPercentage: `${fullQArtResult.matchPercentage.toFixed(1)}%`,
              matchingPixels: fullQArtResult.matchingPixels,
              totalControllable: fullQArtResult.totalControllable,
              version: fullQArtResult.version,
              maskPattern: fullQArtResult.maskPattern,
              encodedData: fullQArtResult.encodedData,
              source: qartResultSource,
              computeMs: qartComputeMs !== null ? Math.round(qartComputeMs) : null,
            });

            // CRITICAL: Use renderFromMatrix() to render the QR-Art matrix with proper styling.
            // This ensures proper module styling, contrast, and quality for phone scannability.
            //
            // IMPORTANT: We cannot use qrGenerator.generate() with encodedData because QR-Art
            // modifies the encoded codewords via RS basis manipulation - those modifications
            // are in the matrix, not in the input string. Re-encoding would produce the base
            // matrix without image matching.
            //
            // renderFromMatrix() takes the pre-computed matrix and applies the full styling
            // pipeline (finder patterns, gradients, module styles, frames, etc.)
            const qrArtConfig = {
              ...debouncedConfig,
              typeNumber: fullQArtResult.version,
              // Disable overlay mode - QR-Art already computed the optimal matrix
              overlayMode: undefined,
            };

            try {
              updateGenerationProgress('Rendering QR-Art preview', 86);
              if (workerRenderedBitmap) {
                fullQArtCanvas = imageBitmapToCanvas(
                  workerRenderedBitmap,
                  qartPreviewBitmapCanvasRef.current ?? undefined
                );
                qartPreviewBitmapCanvasRef.current = fullQArtCanvas as HTMLCanvasElement;
                usedWorkerBitmapRender = true;
                if (typeof workerRenderedBitmap.close === 'function') {
                  workerRenderedBitmap.close();
                }
                workerRenderedBitmap = null;
              } else if (workerPackedMatrix && fullQArtResult.moduleCount > 0) {
                fullQArtCanvas = (await qrGenerator.renderFromPackedMatrix(
                  workerPackedMatrix,
                  fullQArtResult.moduleCount,
                  qrArtConfig
                )) as HTMLCanvasElement;
              } else {
                fullQArtCanvas = (await qrGenerator.renderFromMatrix(
                  fullQArtResult.matrix,
                  qrArtConfig
                )) as HTMLCanvasElement;
              }
              useFullQArt = true;
            } catch (renderErr) {
              log.error('Failed to render QR-Art matrix', { error: renderErr });
              // Fall through to let the standard generation path handle it
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

        // If full QR-Art succeeded with good match, use that canvas directly
        if (useFullQArt && fullQArtCanvas) {
          if (isStaleRequest()) return;
          // Apply watermark if enabled
          let resultCanvas: HTMLCanvasElement | OffscreenCanvas = fullQArtCanvas;
          if (watermark.enabled) {
            let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;
            if ((watermark.kind === 'image' || watermark.kind === 'pattern') && watermark.image) {
              watermarkImage = await loadFileAsCanvas(watermark.image);
            }
            const watermarked = await applyWatermark(fullQArtCanvas, {
              kind: watermark.kind,
              text: watermark.text,
              image: watermarkImage ?? undefined,
              position: watermark.position as WatermarkPosition,
              opacity: watermark.opacity,
              blend: watermark.blend,
            });
            resultCanvas = watermarked.canvas;
          }

          if (isStaleRequest()) return;
          setCanvas(resultCanvas);
          updateGenerationProgress('Finalizing preview', 96);
          if (canvasRef.current) {
            drawToDisplayCanvas(canvasRef.current, resultCanvas);
          }

          safeMark(qartRenderMark);
          const qartRenderMs = qartRequestMarked
            ? safeMeasure(`${qartPerfMarkPrefix}:render`, qartResultMark, qartRenderMark)
            : null;
          const qartPreviewMs = qartRequestMarked
            ? safeMeasure(`${qartPerfMarkPrefix}:preview`, qartRequestMark, qartRenderMark)
            : null;
          log.info('QR-Art timing', {
            source: qartResultSource,
            computeMs: qartComputeMs !== null ? Math.round(qartComputeMs) : null,
            renderMs: qartRenderMs !== null ? Math.round(qartRenderMs) : null,
            previewMs: qartPreviewMs !== null ? Math.round(qartPreviewMs) : null,
          });
          setQArtPerfSnapshot({
            source: qartResultSource,
            computeMs: qartComputeMs,
            renderMs: qartRenderMs,
            previewMs: qartPreviewMs,
            version: qartResultVersion,
            maskPattern: qartResultMaskPattern,
          });

          if (
            usedWorkerBitmapRender &&
            workerPackedMatrix &&
            qartResultSource === 'worker' &&
            qartResultModuleCount > 0
          ) {
            qrPackedMatrixRef.current = {
              packed: workerPackedMatrix,
              moduleCount: qartResultModuleCount,
            };
            setQrMatrix(null);
          } else {
            const matrixData = qrGenerator.getLastMatrix();
            if (matrixData) {
              qrPackedMatrixRef.current = null;
              setQrMatrix(matrixData.matrix);
            }
          }

          runValidationIfNeeded(resultCanvas, effectiveConfig.content);
          setIsRendering(false);
          setIsLoading(false);
          clearGenerationProgress();
          return;
        }

        // NOTE: Fragment search fallback has been REMOVED.
        // The full QR-Art algorithm (RS basis manipulation) always produces valid QR codes
        // and uses the optimal suffix length to maximize controllable bits.
        // The old fragment search was limited to 8 characters and couldn't achieve good results.
      }

      // Generate QR code with automatic overflow handling
      let result: HTMLCanvasElement | OffscreenCanvas | null = null;
      let usedFallback = false;

      try {
        log.debug('Attempting QR generation', {
          contentLength: effectiveConfig.content?.length,
          typeNumber: effectiveConfig.typeNumber,
          errorCorrection: effectiveConfig.errorCorrection,
        });
        updateGenerationProgress('Rendering QR preview', 58);
        if (await yieldForResponsiveness()) return;
        result = await runGeneratorWithStatus(
          effectiveConfig,
          overlay.enabled ? overlayCanvas : null
        );
        if (isStaleRequest()) return;
        log.debug('Initial generation succeeded');
      } catch (initialErr) {
        // If overflow error, try progressively more forgiving settings
        const msg = initialErr instanceof Error ? initialErr.message : '';
        log.debug('Initial generation failed', {
          errorMessage: msg,
          isOverflow: msg.includes('code length overflow'),
        });
        if (msg.includes('code length overflow')) {
          // Try with lower ECC levels - more data capacity
          // Order: progressively lower ECC levels for more data capacity
          const currentEcc = effectiveConfig.errorCorrection || 'H';
          const allEccLevels = ['H', 'Q', 'M', 'L'] as const;
          const eccIndex = allEccLevels.indexOf(currentEcc as (typeof allEccLevels)[number]);
          // If original call used auto-version (typeNumber: 0), skip the current ECC level
          // since we already tried it. Otherwise, include current ECC with auto-version.
          const startIndex =
            debouncedConfig.typeNumber === 0
              ? Math.max(0, eccIndex + 1) // Skip current ECC, start with next lower
              : Math.max(0, eccIndex); // Include current ECC (wasn't tried with auto-version)
          const eccToTry = allEccLevels.slice(startIndex);

          // Safety: ensure we have at least one ECC level to try
          // If startIndex pushed us past all levels, try 'L' as last resort
          if (eccToTry.length === 0) {
            eccToTry.push('L');
          }

          let succeeded = false;

          log.debug('Trying ECC fallback sequence', { eccToTry, currentEcc });
          for (const ecc of eccToTry) {
            if (succeeded) break;
            const fallbackConfig = {
              ...effectiveConfig,
              typeNumber: 0, // Always use auto-version for retry
              errorCorrection: ecc,
            };
            try {
              log.debug('Trying ECC level', { ecc });
              if (await yieldForResponsiveness()) return;
              result = await runGeneratorWithStatus(
                fallbackConfig,
                overlay.enabled ? overlayCanvas : null
              );
              if (isStaleRequest()) return;
              usedFallback = true;
              succeeded = true;
              log.debug('ECC fallback succeeded', { ecc });
              if (ecc !== currentEcc) {
                log.info('QR generated with fallback ECC', { ecc, previousEcc: currentEcc });
              } else {
                log.info('QR generated with auto-version retry');
              }
            } catch (eccErr) {
              log.debug('ECC fallback failed', {
                ecc,
                error: eccErr instanceof Error ? eccErr.message : eccErr,
              });
            }
          }

          if (!succeeded) {
            // All attempts failed - content is too long even for max capacity
            log.debug('All ECC levels failed', {
              contentLength: effectiveConfig.content?.length,
              contentPreview: effectiveConfig.content?.substring(0, 100),
              triedEccLevels: eccToTry,
            });
            // CRITICAL: Set BOTH ref and state to block retries
            // Ref provides synchronous blocking, state triggers React update
            lastOverflowContentRef.current = effectiveConfig.content;
            isOverflowBlockedRef.current = true;
            setHasOverflowError(true);

            // Don't throw - just set error and return to avoid triggering catch handlers
            // that might cause additional state changes leading to re-renders
            setError(
              'Content too long for QR code. Please shorten your content or use a URL shortener.'
            );
            setIsRendering(false);
            setIsLoading(false);
            clearGenerationProgress();
            return;
          }
        } else {
          // Not an overflow error, re-throw
          throw initialErr;
        }
      }

      // Log if we used fallback settings (for debugging)
      if (usedFallback) {
        log.debug('QR generated using fallback settings due to content length');
      }

      // Apply watermark if enabled
      if (watermark.enabled && result) {
        let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;

        if ((watermark.kind === 'image' || watermark.kind === 'pattern') && watermark.image) {
          // Load watermark image (used for both image and pattern types)
          watermarkImage = await loadFileAsCanvas(watermark.image);
        }

        const watermarked = await applyWatermark(result as HTMLCanvasElement, {
          kind: watermark.kind,
          text: watermark.text,
          image: watermarkImage ?? undefined,
          position: watermark.position as WatermarkPosition,
          opacity: watermark.opacity,
          blend: watermark.blend,
        });

        result = watermarked.canvas;
      }

      if (isStaleRequest()) return;
      setCanvas(result);
      updateGenerationProgress('Finalizing preview', 92);

      // Capture the QR matrix for vector SVG export
      const matrixData = qrGenerator.getLastMatrix();
      if (matrixData) {
        qrPackedMatrixRef.current = null;
        setQrMatrix(matrixData.matrix);
      }

      // Copy to display canvas if ref exists
      if (canvasRef.current && result) {
        drawToDisplayCanvas(canvasRef.current, result);
      }

      if (result) {
        updateGenerationProgress('Validating scan', 98);
        runValidationIfNeeded(result, effectiveConfig.content);
      }
    } catch (err) {
      if (isStaleRequest()) return;
      log.error('QR generation error', { error: err });
      const rawMessage = err instanceof Error ? err.message : 'Failed to generate QR code';

      // Provide user-friendly error messages for common issues
      let errorMessage = rawMessage;
      if (
        rawMessage.includes('code length overflow') ||
        rawMessage.includes('maximum QR code capacity')
      ) {
        errorMessage =
          'Content too long for QR code. Please shorten your content or use a URL shortener.';
      }

      setError(errorMessage);
      clearGenerationProgress();
      // Don't clear the canvas - keep showing the last valid QR code
      // Dispatch render-complete event with error
      document.dispatchEvent(
        new CustomEvent('anqr:render-complete', {
          detail: { success: false, error: errorMessage },
        })
      );
    } finally {
      if (activeQArtRequestAbortRef.current === qartAbortController) {
        activeQArtRequestAbortRef.current = null;
      }
      if (!isStaleRequest()) {
        setIsRendering(false);
        setIsLoading(false);
        clearGenerationProgress();
        // Dispatch render-complete event on success (no error was thrown)
        if (!error) {
          document.dispatchEvent(
            new CustomEvent('anqr:render-complete', {
              detail: { success: true, error: null },
            })
          );
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
      // Use compositor for GIF - apply frame patch to canvas
      // OPTIMIZATION: Only replay from lastRenderedFrame instead of always from 0
      // This reduces O(n²) to O(n) for sequential playback
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

      if (lastRendered < 0 || frameIdx < lastRendered) {
        // Need to reset and replay from start (seeking backward or first frame)
        gifCompositor.reset();
        for (let i = 0; i <= frameIdx; i++) {
          if (i > 0) gifCompositor.dispose(i - 1);
          gifCompositor.apply(i);
        }
      } else if (frameIdx > lastRendered) {
        // Playing forward - only apply frames from lastRendered+1 to frameIdx
        for (let i = lastRendered + 1; i <= frameIdx; i++) {
          if (i > 0) gifCompositor.dispose(i - 1);
          gifCompositor.apply(i);
        }
      }
      // If frameIdx === lastRendered, no work needed

      lastRenderedFrameRef.current = frameIdx;
      // Use getSnapshot() to get a copy of the canvas - passing the canvas reference directly
      // causes React to not detect changes since it's the same object
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

      // Scale canvas to output dimensions if different
      // Cast to HTMLCanvasElement for export - safe because we're in browser context
      let exportCanvas: HTMLCanvasElement = canvas as HTMLCanvasElement;
      if (output.widthPx !== canvas.width || output.heightPx !== canvas.height) {
        exportCanvas = document.createElement('canvas');
        exportCanvas.width = output.widthPx;
        exportCanvas.height = output.heightPx;
        const exportCtx = exportCanvas.getContext('2d');
        if (exportCtx) {
          // Use high-quality scaling
          exportCtx.imageSmoothingEnabled = !render.crispEdges;
          exportCtx.imageSmoothingQuality = 'high';
          exportCtx.drawImage(canvas, 0, 0, output.widthPx, output.heightPx);
        }
      }

      const exportConfig = {
        outputFormat: output.format,
        outputWidth: output.widthPx,
        outputHeight: output.heightPx,
        outputQuality: output.quality,
        filename: output.filename,
        dpi: output.dpi,
        // Output options
        includeQuietZone: output.includeQuietZone,
        bgOverride: output.bgOverride,
        // GIF options
        gifPaletteSize: output.gifPaletteSize,
        gifQuantizer: output.gifQuantizer,
        gifDither: output.gifDither,
        gifTransparentColor: output.gifTransparentColor,
        gifDisposal: output.gifDisposal,
        // SVG options
        svgTrueVector: output.svgTrueVector,
        svgShapePrecision: output.svgShapePrecision,
        svgEmbedRasterOverlay: output.svgEmbedRasterOverlay,
        // Metadata
        metadata: {
          title: metadata.title || undefined,
          author: metadata.author || undefined,
          copyright: metadata.copyright || undefined,
          license: metadata.license || undefined,
          description: metadata.description || undefined,
          creationTime: metadata.creationTime,
          customKv: metadata.customKv.filter((kv) => kv.k && kv.v),
        },
      };

      // Build PNG metadata object for embedding
      const pngMetadata =
        metadata.title || metadata.author || metadata.copyright || metadata.description
          ? {
              title: metadata.title || undefined,
              author: metadata.author || undefined,
              copyright: metadata.copyright || undefined,
              description: metadata.description || undefined,
              creationTime: metadata.creationTime ? new Date().toISOString() : undefined,
              software: 'ANQR - https://anqr.link',
            }
          : undefined;

      if (output.format === 'svg') {
        // Use true vector SVG export if enabled and matrix is available
        if (output.svgTrueVector) {
          let vectorMatrix = qrMatrix;
          if (!vectorMatrix && qrPackedMatrixRef.current) {
            const { packed, moduleCount } = qrPackedMatrixRef.current;
            vectorMatrix = expandPackedQArtMatrix(packed, moduleCount);
          }

          if (!vectorMatrix) {
            log.warn(
              'Vector SVG export requested but QR matrix is unavailable. ' +
                'Falling back to raster SVG. This can happen with special render modes.'
            );
            await exporter.downloadSvg(exportCanvas, exportConfig);
            return;
          }
          // Calculate module size to match desired output dimensions
          const moduleCount = vectorMatrix.length;
          // Use the same margin calculation as generate() in qr-generator.js
          // config.margin = safetyAdjustedConfig.quietZone + qr.borderModulesExtra
          const totalMargin = qr.quietZoneModules + qr.borderModulesExtra;
          // SVG viewBox size = (moduleCount + 2*margin) * moduleSize
          const svgModuleSize = Math.floor(output.widthPx / (moduleCount + totalMargin * 2)) || 10;

          // True vector SVG - uses styled path elements
          exporter.downloadVectorSvg(vectorMatrix, {
            moduleSize: svgModuleSize,
            margin: totalMargin,
            fgColor: render.fgColor,
            bgColor: render.bgTransparent ? 'transparent' : render.bgColor,
            filename: output.filename,
            // Pass styling options for vector SVG
            moduleStyle: render.moduleStyle,
            cornerRadius: render.cornerRadius,
            finderStyle: render.finderStyle,
            eyeOuterStyle: render.eyeOuterStyle,
            eyeInnerStyle: render.eyeInnerStyle,
            alignmentStyle: render.alignmentStyle,
            timingStyle: render.timingStyle,
            gradient: render.gradient,
            // Pass metadata for SVG embedding
            metadata:
              metadata.title || metadata.author || metadata.copyright || metadata.description
                ? {
                    title: metadata.title || undefined,
                    author: metadata.author || undefined,
                    copyright: metadata.copyright || undefined,
                    description: metadata.description || undefined,
                    creationTime: metadata.creationTime,
                    software: 'ANQR - https://anqr.link',
                  }
                : undefined,
          });
        } else {
          // Raster SVG (embedded PNG) - preserves all styling including dithering
          await exporter.downloadSvg(exportCanvas, exportConfig);
        }
      } else if (output.format === 'gif' && animationFrameCount > 1) {
        const cachedAnimationFrames = animationFramesRef.current;
        // Scale animation frames to output dimensions
        // Use canvas pool for temporary scaled frames to reduce GC pressure
        const scaledFrames = cachedAnimationFrames.map((frame) => {
          const frameCanvas = frame as HTMLCanvasElement;
          if (frameCanvas.width === output.widthPx && frameCanvas.height === output.heightPx) {
            return frameCanvas;
          }
          const scaledCanvas = document.createElement('canvas');
          scaledCanvas.width = output.widthPx;
          scaledCanvas.height = output.heightPx;
          const scaledCtx = scaledCanvas.getContext('2d');
          if (scaledCtx) {
            scaledCtx.imageSmoothingEnabled = !render.crispEdges;
            scaledCtx.imageSmoothingQuality = 'high';
            scaledCtx.drawImage(frameCanvas, 0, 0, output.widthPx, output.heightPx);
          }
          return scaledCanvas;
        });

        // Calculate frame delays - use original GIF delays if enabled, otherwise use animation speed
        let frameDelays: number[] | undefined;
        if (overlay.gifUseFrameDelays && effectiveFrames.length > 0) {
          // Use original frame delays from source GIF, capped by maxFps
          const minDelayMs = overlay.gifMaxFps > 0 ? Math.floor(1000 / overlay.gifMaxFps) : 0;
          frameDelays = effectiveFrames.map((f) =>
            Math.max(f.delay || animation.speedMs, minDelayMs)
          );
        } else if (animationFrameCount > 1 && effectiveFrames.length === 0) {
          // For base QR animations (no overlay), use uniform animation speed
          frameDelays = cachedAnimationFrames.map(() => animation.speedMs);
        }

        log.debug('download GIF: delays computed', {
          effectiveFramesLen: effectiveFrames.length,
          animationFramesLen: animationFrameCount,
          scaledFramesLen: scaledFrames.length,
          frameDelaysLen: frameDelays?.length,
          minDelay: frameDelays ? Math.min(...frameDelays) : undefined,
          maxDelay: frameDelays ? Math.max(...frameDelays) : undefined,
          totalMs: frameDelays?.reduce((s, d) => s + d, 0),
          gifUseFrameDelays: overlay.gifUseFrameDelays,
          gifMaxFps: overlay.gifMaxFps,
          animSpeedMs: animation.speedMs,
        });

        // Export animated GIF with all frames
        await exporter.downloadGif(
          scaledFrames,
          {
            ...exportConfig,
            animationSpeed: animation.speedMs,
            loopAnimation: animation.loop,
          },
          frameDelays
        );

        // Note: We intentionally don't release scaled canvases back to the pool here
        // because downloadGif is async and may still be using the canvas data.
        // The canvases will be garbage collected naturally after export completes.
      } else if (output.format === 'gif') {
        // Single frame GIF
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

    // ==========================================
    // ANIMATION EFFECT FLAGS - only true when actually enabled
    // ==========================================
    const hasColorCycle = animation.colorCycle === true;
    const primaryPatternEnabled = animation.pattern !== 'none';
    const secondaryPatternEnabled = animation.pattern2 !== 'none';
    const modulePatternEffects: Array<{
      pattern: AnimationPattern;
      seed: number;
      waveAxis: 'x' | 'y' | 'xy';
    }> = [];
    const resultPatternEffects: Array<{
      pattern: AnimationPattern;
      seed: number;
      waveAxis: 'x' | 'y' | 'xy';
    }> = [];
    if (primaryPatternEnabled) {
      const primaryEffect = {
        pattern: animation.pattern as AnimationPattern,
        seed: animation.seed,
        waveAxis: animation.waveAxis,
      };
      if (animation.target === 'modules' || animation.target === 'both') {
        modulePatternEffects.push(primaryEffect);
      }
      if (animation.target === 'result' || animation.target === 'both') {
        resultPatternEffects.push(primaryEffect);
      }
    }
    if (secondaryPatternEnabled) {
      const secondaryEffect = {
        pattern: animation.pattern2 as AnimationPattern,
        seed: animation.seed + 911,
        waveAxis: animation.waveAxis2,
      };
      if (animation.target2 === 'modules' || animation.target2 === 'both') {
        modulePatternEffects.push(secondaryEffect);
      }
      if (animation.target2 === 'result' || animation.target2 === 'both') {
        resultPatternEffects.push(secondaryEffect);
      }
    }
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

    const computePatternDrivenJitter = (frameIndex: number, totalFrames: number): number => {
      let jitter = animation.moduleJitterPx;
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
    };

    let patternScratchA: HTMLCanvasElement | null = null;
    let patternScratchB: HTMLCanvasElement | null = null;
    let temporalScratchA: HTMLCanvasElement | null = null;
    let temporalScratchB: HTMLCanvasElement | null = null;
    const getPatternScratchCanvas = (
      slot: 0 | 1,
      width: number,
      height: number
    ): HTMLCanvasElement => {
      const current = slot === 0 ? patternScratchA : patternScratchB;
      if (!current) {
        const created = document.createElement('canvas');
        created.width = width;
        created.height = height;
        if (slot === 0) {
          patternScratchA = created;
        } else {
          patternScratchB = created;
        }
        return created;
      }
      if (current.width !== width) current.width = width;
      if (current.height !== height) current.height = height;
      return current;
    };
    const getTemporalScratchCanvas = (
      slot: 0 | 1,
      width: number,
      height: number
    ): HTMLCanvasElement => {
      const current = slot === 0 ? temporalScratchA : temporalScratchB;
      if (!current) {
        const created = document.createElement('canvas');
        created.width = width;
        created.height = height;
        if (slot === 0) {
          temporalScratchA = created;
        } else {
          temporalScratchB = created;
        }
        return created;
      }
      if (current.width !== width) current.width = width;
      if (current.height !== height) current.height = height;
      return current;
    };

    const cloneCanvas = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas
    ): HTMLCanvasElement | OffscreenCanvas => {
      const cloned = document.createElement('canvas');
      cloned.width = sourceCanvas.width;
      cloned.height = sourceCanvas.height;
      const clonedCtx = cloned.getContext('2d');
      if (clonedCtx) {
        clonedCtx.drawImage(sourceCanvas, 0, 0);
      }
      return cloned;
    };

    const applyPatternStack = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      effects: Array<{
        pattern: AnimationPattern;
        seed: number;
        waveAxis: 'x' | 'y' | 'xy';
      }>,
      frameIndex: number,
      totalFrames: number,
      persistentOutput = false
    ): HTMLCanvasElement | OffscreenCanvas => {
      if (effects.length === 0) return sourceCanvas;

      let out = sourceCanvas;
      for (let effectIdx = 0; effectIdx < effects.length; effectIdx++) {
        const effect = effects[effectIdx];
        const targetCanvas = getPatternScratchCanvas(
          (effectIdx % 2) as 0 | 1,
          out.width,
          out.height
        );
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

      return persistentOutput ? cloneCanvas(out) : out;
    };
    const applyResultPatternStackPersistent = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStack(sourceCanvas, resultPatternEffects, frameIndex, totalFrames, true);
    const applyResultPatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStack(sourceCanvas, resultPatternEffects, frameIndex, totalFrames, false);
    const applyModulePatternStackEphemeral = (
      sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
      frameIndex: number,
      totalFrames: number
    ): HTMLCanvasElement | OffscreenCanvas =>
      applyPatternStack(sourceCanvas, modulePatternEffects, frameIndex, totalFrames, false);

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
    updateGenerationProgress('Preparing animation frames', 8);

    // Generate QR for each frame (batch generation)
    const generateAllFrames = async () => {
      let frames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
      const sourceFrameIndices = new Map<HTMLCanvasElement | OffscreenCanvas, number[]>();

      const persistFrameCanvas = (frameCanvas: HTMLCanvasElement | OffscreenCanvas): void => {
        const existingIndices = sourceFrameIndices.get(frameCanvas);
        if (!existingIndices) {
          const newIndex = frames.length;
          frames.push(frameCanvas);
          sourceFrameIndices.set(frameCanvas, [newIndex]);
          return;
        }

        // If the generator reuses the same canvas instance across frames,
        // detach previously stored references once and then store clones.
        for (const idx of existingIndices) {
          if (frames[idx] === frameCanvas) {
            frames[idx] = cloneCanvas(frameCanvas);
          }
        }
        const detachedFrame = cloneCanvas(frameCanvas);
        const newIndex = frames.length;
        frames.push(detachedFrame);
        existingIndices.push(newIndex);
      };

      const ensureDecodableFirstFrame = async (): Promise<void> => {
        if (frames.length <= 1) return;
        const expectedContent = debouncedConfig.content;
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
      };

      // Create yield controller for time-based yielding
      const yieldCtrl = new YieldController();
      yieldCtrl.reset();

      // Load watermark image once if needed (for both image and pattern types)
      let watermarkImage: HTMLImageElement | HTMLCanvasElement | null = null;
      if (
        watermark.enabled &&
        (watermark.kind === 'image' || watermark.kind === 'pattern') &&
        watermark.image
      ) {
        try {
          watermarkImage = await loadFileAsCanvas(watermark.image);
        } catch (err) {
          log.error('Error loading watermark', { error: err });
        }
      }

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

      // Generate animation frames for base QR (no overlay)
      if (shouldGenerateBaseAnimation) {
        const frameCount = 24;

        // Check if we need per-frame QR generation (for moduleJitter)
        const needsPerFrameQR = hasJitter;

        if (hasPattern && !needsPerFrameQR) {
          // Generate base QR once, then apply result-targeted pattern stack
          const baseQR = await qrGenerator.generate(previewScanConfigBase, null);
          if (!baseQR || isRunCancelled()) return;
          framesToProcess = Array.from({ length: frameCount }, (_, i) => ({
            canvas: applyResultPatternStackPersistent(baseQR, i, frameCount),
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else if (hasPattern && needsPerFrameQR) {
          // Generate QR per frame for module-targeted effects, then layer result-targeted patterns
          const combinedFrames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
          for (let i = 0; i < frameCount; i++) {
            if (isRunCancelled()) return;
            // Time-based yielding for smoother UI
            if (await yieldCtrl.yieldIfNeeded()) {
              if (isRunCancelled()) return;
            }

            const frameConfig = {
              ...previewScanConfigBase,
              frameIndex: i,
              moduleJitterPx: computePatternDrivenJitter(i, frameCount),
            };
            const jitteredQR = await qrGenerator.generate(frameConfig, null);
            if (!jitteredQR) continue;
            combinedFrames.push(applyResultPatternStackPersistent(jitteredQR, i, frameCount));
          }

          framesToProcess = combinedFrames.map((canvas) => ({
            canvas,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else if (hasJitter) {
          // Module-only animation (jitter and module-targeted patterns)
          const jitteredFrames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
          for (let i = 0; i < frameCount; i++) {
            if (isRunCancelled()) return;

            // Time-based yielding for smoother UI
            if (await yieldCtrl.yieldIfNeeded()) {
              if (isRunCancelled()) return;
            }

            const frameConfig = {
              ...previewScanConfigBase,
              frameIndex: i,
              moduleJitterPx: computePatternDrivenJitter(i, frameCount),
            };
            const qrFrame = await qrGenerator.generate(frameConfig, null);
            if (qrFrame) {
              jitteredFrames.push(applyResultPatternStackPersistent(qrFrame, i, frameCount));
            }
          }

          framesToProcess = jitteredFrames.map((canvas) => ({
            canvas,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        } else {
          // For colorCycle/temporalDither without pattern or jitter
          // Generate base QR once, then create placeholder frames for post-processing
          const staticBaseQR = await qrGenerator.generate(previewScanConfigBase, null);
          if (!staticBaseQR || isRunCancelled()) return;

          framesToProcess = Array.from({ length: frameCount }, () => ({
            canvas: staticBaseQR,
            delay: animation.speedMs,
            disposalType: 0,
          }));
        }
      }
      // Generate animation frames from static overlay with effects
      else if (shouldGenerateStaticOverlayAnimation && effectiveFrames.length === 1) {
        const frameCount = 24;
        const baseCanvas = applyGeometricTransforms(effectiveFrames[0].canvas);

        // Create placeholder frames; per-frame module/result effects are applied in the render loop.
        framesToProcess = Array.from({ length: frameCount }, () => ({
          canvas: baseCanvas,
          delay: animation.speedMs,
          disposalType: 0,
        }));
      }

      // If using GIF compositor, reset it before processing frames
      if (useCompositor && gifCompositor) {
        gifCompositor.reset();
      }

      // Artwork mode: lock mask pattern and version after first frame for visual consistency
      const isArtworkMode = overlay.enabled && overlay.mode === 'artwork';
      const qartModule = isArtworkMode ? await loadQArtModule() : null;
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
          cached.height === sourceCanvas.height
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
      let artworkLockedVersion = debouncedConfig.typeNumber || 0;
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

      const generateArtworkFrame = async (
        frameOverlayCanvas: HTMLCanvasElement | OffscreenCanvas,
        frameIdx: number
      ): Promise<HTMLCanvasElement | OffscreenCanvas | null> => {
        const minOutlierMatchPercent = 58;
        const maxAllowedMatchDrop = 12;
        const reuseLastSuccessfulFrame = (): HTMLCanvasElement | null =>
          lastSuccessfulArtworkFrame ? cloneCanvasFrame(lastSuccessfulArtworkFrame) : null;
        const rememberSuccessfulFrame = (
          frame: HTMLCanvasElement | OffscreenCanvas,
          matchPercentage: number
        ): void => {
          lastSuccessfulArtworkFrame = cloneCanvasFrame(frame, lastSuccessfulArtworkFrame);
          if (Number.isFinite(matchPercentage)) {
            lastSuccessfulArtworkMatchPercentage = matchPercentage;
          }
        };
        const isNoisyOutlierMatch = (matchPercentage: number): boolean => {
          if (!Number.isFinite(matchPercentage)) return true;
          if (frameIdx === 0) return false;
          if (lastSuccessfulArtworkMatchPercentage < 0) {
            return matchPercentage < minOutlierMatchPercent;
          }
          const dynamicFloor = Math.max(
            minOutlierMatchPercent,
            lastSuccessfulArtworkMatchPercentage - maxAllowedMatchDrop
          );
          return matchPercentage < dynamicFloor;
        };

        try {
          const useAutoMask =
            typeof debouncedConfig.maskPattern !== 'number' || debouncedConfig.maskPattern < 0;
          const qartConfig = {
            data: debouncedConfig.content ?? '',
            version: artworkLockedVersion,
            ecc: (debouncedConfig.errorCorrection || 'M') as 'L' | 'M' | 'Q' | 'H',
            strictSuffix: true,
            targetControlPercent: 100,
            searchAttempts: getQArtSearchAttempts(debouncedConfig.qrartIterations),
            searchSeed: debouncedConfig.qrartSeed ?? 0,
            lockVersionToMinimum: debouncedConfig.typeNumber === 0 && frameIdx === 0,
            performanceProfile: 'quality' as const,
          };

          const workerRenderConfig: Record<string, unknown> = {
            ...artworkRenderConfigTemplate,
            typeNumber: artworkLockedVersion,
          };

          if (!qartModule) {
            return await qrGenerator.generate(
              { ...previewScanConfigBase, frameIndex: frameIdx, overlayMode: 'dithered' },
              frameOverlayCanvas
            );
          }

          let workerResult: QArtWorkerResult;
          try {
            const targetImage = getArtworkFrameTargetImage(frameOverlayCanvas, frameIdx);
            workerResult = await qartModule.generateQArtInWorker(
              {
                data: qartConfig.data,
                targetImage,
                version: qartConfig.version,
                ecc: qartConfig.ecc,
                strictSuffix: qartConfig.strictSuffix,
                targetControlPercent: qartConfig.targetControlPercent,
                searchAttempts: qartConfig.searchAttempts,
                searchSeed: qartConfig.searchSeed,
                lockVersionToMinimum: qartConfig.lockVersionToMinimum,
                maskPattern:
                  useAutoMask && artworkLockedMask < 0
                    ? undefined
                    : artworkLockedMask >= 0
                      ? artworkLockedMask
                      : (debouncedConfig.maskPattern as number),
                performanceProfile: qartConfig.performanceProfile,
                renderConfig: workerRenderConfig,
                renderInWorker: true,
              },
              { signal: animationQArtAbortController.signal }
            );
          } catch (workerErr) {
            if (isRunCancelled()) {
              return null;
            }
            log.warn('QR-Art animation frame worker failed; falling back to main thread', {
              frameIdx,
              error: workerErr,
            });
            const qartResult =
              useAutoMask && artworkLockedMask < 0
                ? await qartModule.generateFullQArtOptimal({
                    ...qartConfig,
                    targetImage: frameOverlayCanvas,
                  })
                : await qartModule.generateFullQArt({
                    ...qartConfig,
                    targetImage: frameOverlayCanvas,
                    maskPattern:
                      artworkLockedMask >= 0
                        ? artworkLockedMask
                        : (debouncedConfig.maskPattern as number),
                  });

            if (!qartResult.success || !qartResult.matrix) {
              log.warn('QR-Art failed for animation frame', { frameIdx });
              const preserved = reuseLastSuccessfulFrame();
              if (preserved) return preserved;
              return await qrGenerator.generate(
                { ...previewScanConfigBase, frameIndex: frameIdx, overlayMode: 'dithered' },
                frameOverlayCanvas
              );
            }

            if (frameIdx === 0) {
              artworkLockedMask = qartResult.maskPattern;
              artworkLockedVersion = qartResult.version;
            }
            const qrArtConfig = {
              ...debouncedConfig,
              typeNumber: qartResult.version,
              overlayMode: undefined,
            };
            const rendered = await qrGenerator.renderFromMatrix(qartResult.matrix, qrArtConfig);
            rememberSuccessfulFrame(rendered, qartResult.matchPercentage);
            return rendered;
          }

          if (workerResult.success) {
            let effectiveWorkerResult = workerResult;
            if (isNoisyOutlierMatch(workerResult.matchPercentage)) {
              const rescueAttempts = Math.min(8, Math.max(qartConfig.searchAttempts + 2, 4));
              const rescueSeed =
                ((qartConfig.searchSeed ?? 0) ^ Math.imul(frameIdx + 1, 0x85ebca6b)) >>> 0;
              log.warn('QR-Art frame quality outlier detected; retrying frame', {
                frameIdx,
                previousMatch: lastSuccessfulArtworkMatchPercentage,
                currentMatch: workerResult.matchPercentage,
                rescueAttempts,
              });
              try {
                const rescueResult = await qartModule.generateQArtInWorker(
                  {
                    data: qartConfig.data,
                    targetImage: getArtworkFrameTargetImage(frameOverlayCanvas, frameIdx),
                    version: qartConfig.version,
                    ecc: qartConfig.ecc,
                    strictSuffix: qartConfig.strictSuffix,
                    targetControlPercent: qartConfig.targetControlPercent,
                    searchAttempts: rescueAttempts,
                    searchSeed: rescueSeed,
                    lockVersionToMinimum: qartConfig.lockVersionToMinimum,
                    maskPattern:
                      useAutoMask && artworkLockedMask < 0
                        ? undefined
                        : artworkLockedMask >= 0
                          ? artworkLockedMask
                          : (debouncedConfig.maskPattern as number),
                    performanceProfile: 'quality',
                    renderConfig: workerRenderConfig,
                    renderInWorker: true,
                  },
                  { signal: animationQArtAbortController.signal }
                );

                if (
                  rescueResult.success &&
                  rescueResult.matchPercentage > workerResult.matchPercentage + 0.75
                ) {
                  if (workerResult.bitmap && typeof workerResult.bitmap.close === 'function') {
                    workerResult.bitmap.close();
                  }
                  effectiveWorkerResult = rescueResult;
                  log.info('QR-Art frame quality rescue accepted', {
                    frameIdx,
                    initialMatch: workerResult.matchPercentage,
                    rescuedMatch: rescueResult.matchPercentage,
                  });
                } else if (rescueResult.bitmap && typeof rescueResult.bitmap.close === 'function') {
                  rescueResult.bitmap.close();
                }
              } catch (rescueErr) {
                if (isRunCancelled()) return null;
                log.warn('QR-Art frame quality rescue failed; keeping initial frame result', {
                  frameIdx,
                  error: rescueErr,
                });
              }
            }

            if (frameIdx === 0) {
              artworkLockedMask = effectiveWorkerResult.maskPattern;
              artworkLockedVersion = effectiveWorkerResult.version;
            }

            if (effectiveWorkerResult.bitmap) {
              const rendered = imageBitmapToCanvas(
                effectiveWorkerResult.bitmap,
                getArtworkBitmapScratchCanvas(
                  (frameIdx % 2) as 0 | 1,
                  effectiveWorkerResult.bitmap.width,
                  effectiveWorkerResult.bitmap.height
                )
              );
              if (typeof effectiveWorkerResult.bitmap.close === 'function') {
                effectiveWorkerResult.bitmap.close();
              }
              rememberSuccessfulFrame(rendered, effectiveWorkerResult.matchPercentage);
              return rendered;
            }

            if (effectiveWorkerResult.matrix && effectiveWorkerResult.moduleCount > 0) {
              const qrArtConfig = {
                ...debouncedConfig,
                typeNumber: effectiveWorkerResult.version,
                overlayMode: undefined,
              };
              const rendered = await qrGenerator.renderFromPackedMatrix(
                effectiveWorkerResult.matrix,
                effectiveWorkerResult.moduleCount,
                qrArtConfig
              );
              rememberSuccessfulFrame(rendered, effectiveWorkerResult.matchPercentage);
              return rendered;
            }
          } else {
            log.warn('QR-Art failed for animation frame', { frameIdx, error: workerResult.error });
            const preserved = reuseLastSuccessfulFrame();
            if (preserved) return preserved;
          }
        } catch (err) {
          log.warn('QR-Art frame generation failed, falling back to standard', {
            frameIdx,
            error: err,
          });
          const preserved = reuseLastSuccessfulFrame();
          if (preserved) return preserved;
        }
        return await qrGenerator.generate(
          { ...previewScanConfigBase, frameIndex: frameIdx, overlayMode: 'dithered' },
          frameOverlayCanvas
        );
      };

      for (let frameIdx = 0; frameIdx < framesToProcess.length; frameIdx++) {
        const frame = framesToProcess[frameIdx];
        updateGenerationProgress(
          'Rendering animation frames',
          10 + ((frameIdx + 1) / Math.max(1, framesToProcess.length)) * 78
        );
        // Check if cancelled before each expensive operation
        if (isRunCancelled()) return;

        // Invalidate canvas hash cache to prevent stale overlay data
        // when the compositor reuses the same canvas object across frames
        if (gifCompositor?.canvas instanceof HTMLCanvasElement) {
          canvasHashCache.delete(gifCompositor.canvas);
        }

        // Time-based yielding: yield when we've used up our frame budget
        // This is more efficient than fixed-interval yielding
        if (await yieldCtrl.yieldIfNeeded()) {
          if (isRunCancelled()) return;
        }

        try {
          let result: HTMLCanvasElement | OffscreenCanvas | null = null;

          if (shouldGenerateBaseAnimation) {
            // For base QR animation, the frame.canvas is either:
            // - A pattern-processed frame (if pattern enabled)
            // - The base QR itself (for colorCycle/temporalDither only)
            if (hasPattern || hasJitter) {
              // Pattern and/or jitter already applied during frame generation, just use the frame directly
              result = frame.canvas;
            } else {
              // Re-render QR with different frameIndex for temporal effects
              const frameConfig = {
                ...previewScanConfigBase,
                frameIndex: frameIdx,
                temporalOffset: useTemporalDither
                  ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                  : 0,
              };
              result = await qrGenerator.generate(frameConfig, null);
            }
          } else if (useCompositor && gifCompositor) {
            // OPTIMAL PATH: Use GIF compositor for overlay animation
            // This avoids per-frame canvas allocation - compositor.canvas is reused
            const actualFrameIdx = effectiveFrameIndices[frameIdx];
            const prevActualFrameIdx = frameIdx > 0 ? effectiveFrameIndices[frameIdx - 1] : -1;

            // CRITICAL: GIF frames are delta patches that build on each other.
            // We cannot skip intermediate frames - we must apply ALL frames from
            // the previous target frame to the current target frame.
            // e.g., if effectiveFrameIndices = [0, 5, 10] and we want frame 5,
            // we need to apply frames 1, 2, 3, 4, 5 (not just jump from 0 to 5)
            for (let i = prevActualFrameIdx + 1; i <= actualFrameIdx; i++) {
              if (i > 0) {
                gifCompositor.dispose(i - 1);
              }
              gifCompositor.apply(i);
            }

            // Apply geometric transforms only (color adjustments at moduleCount resolution)
            const processedOverlay = applyGeometricTransforms(gifCompositor.canvas);

            // Apply temporal dithering if enabled (reduced strength for preview)
            let overlayToUse: HTMLCanvasElement | OffscreenCanvas = processedOverlay;
            if (useTemporalDither) {
              const temporalOffset = calculateTemporalOffset(
                frameIdx,
                temporalMode,
                animation.seed
              );
              // applyTemporalNoiseToCanvas accepts union type and returns union type
              overlayToUse = applyTemporalNoiseToCanvas(
                processedOverlay,
                temporalOffset,
                0.008,
                getTemporalScratchCanvas(
                  (frameIdx % 2) as 0 | 1,
                  processedOverlay.width,
                  processedOverlay.height
                )
              );
            }

            const frameConfig = {
              ...previewScanConfigBase,
              frameIndex: frameIdx,
              temporalOffset: useTemporalDither
                ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                : 0,
            };
            result = isArtworkMode
              ? await generateArtworkFrame(overlayToUse, frameIdx)
              : await qrGenerator.generate(frameConfig, overlayToUse);
          } else {
            // Legacy path for WebP or pattern animation
            // NOTE: Color adjustments (brightness/contrast/etc) are now done at moduleCount
            // resolution inside qr-generator.js - we only apply geometric transforms here
            let processedOverlay: HTMLCanvasElement | OffscreenCanvas = applyGeometricTransforms(
              frame.canvas
            );
            if (modulePatternEffects.length > 0) {
              processedOverlay = applyModulePatternStackEphemeral(
                processedOverlay,
                frameIdx,
                framesToProcess.length
              );
            }

            // Apply temporal dithering offset to the overlay image
            // This varies the input slightly per frame for smoother perceived quality
            // NOTE: Use reduced strength (0.008) during preview generation for speed
            // Full strength (0.015) is applied during export
            if (useTemporalDither) {
              const temporalOffset = calculateTemporalOffset(
                frameIdx,
                temporalMode,
                animation.seed
              );
              // applyTemporalNoiseToCanvas accepts union type and returns union type
              processedOverlay = applyTemporalNoiseToCanvas(
                processedOverlay,
                temporalOffset,
                0.008,
                getTemporalScratchCanvas(
                  (frameIdx % 2) as 0 | 1,
                  processedOverlay.width,
                  processedOverlay.height
                )
              );
            }

            // Pass frame index for temporal dithering (also used in qr-generator for dither pattern offset)
            const frameConfig = {
              ...previewScanConfigBase,
              frameIndex: frameIdx,
              moduleJitterPx: hasJitter
                ? computePatternDrivenJitter(frameIdx, framesToProcess.length)
                : animation.moduleJitterPx,
              temporalOffset: useTemporalDither
                ? calculateTemporalOffset(frameIdx, temporalMode, animation.seed)
                : 0,
            };
            result = isArtworkMode
              ? await generateArtworkFrame(processedOverlay, frameIdx)
              : await qrGenerator.generate(frameConfig, processedOverlay);
          }

          if (isRunCancelled()) return;

          if (result) {
            let finalResult: HTMLCanvasElement | OffscreenCanvas = result;
            if (!shouldGenerateBaseAnimation && resultPatternEffects.length > 0) {
              finalResult = applyResultPatternStackEphemeral(
                finalResult,
                frameIdx,
                framesToProcess.length
              );
            }

            // Apply color cycle as post-processing - ONLY if actually enabled
            if (hasColorCycle) {
              finalResult = applyColorCycle(
                finalResult,
                frameIdx,
                framesToProcess.length,
                finalResult
              );
            }

            let previewFrame: HTMLCanvasElement | OffscreenCanvas = finalResult;
            // Apply watermark if enabled
            if (watermark.enabled) {
              const watermarked = await applyWatermark(finalResult as HTMLCanvasElement, {
                kind: watermark.kind,
                text: watermark.text,
                image: watermarkImage ?? undefined,
                position: watermark.position as WatermarkPosition,
                opacity: watermark.opacity,
                blend: watermark.blend,
              });
              previewFrame = watermarked.canvas;
            }

            persistFrameCanvas(previewFrame);
            if (isRunCancelled()) return;

            // Stream latest rendered frame while cache builds to avoid frozen-feel on long runs.
            const latestStoredFrame = frames[frames.length - 1] ?? previewFrame;
            setCanvas(latestStoredFrame);
            if (canvasRef.current) {
              drawToDisplayCanvas(canvasRef.current, latestStoredFrame);
            }
          }
        } catch (err) {
          log.error('Error generating frame', { error: err });
        }
      }

      // Apply interpolation - ONLY if actually enabled
      // Note: interpolateFrames works on pairs of frames, so we interpolate between consecutive frames
      if (hasInterpolation && frames.length > 1) {
        updateGenerationProgress('Interpolating animation frames', 92);
        const interpolatedFrames: (HTMLCanvasElement | OffscreenCanvas)[] = [];
        const interpolationSteps = 2; // Number of intermediate frames to generate
        for (let i = 0; i < frames.length - 1; i++) {
          interpolatedFrames.push(frames[i]);
          // Generate intermediate frames between frames[i] and frames[i+1]
          for (let step = 1; step <= interpolationSteps; step++) {
            const t = step / (interpolationSteps + 1);
            const interpolated = interpolateFrames(
              frames[i],
              frames[i + 1],
              t,
              animation.interpolate as 'none' | 'crossfade' | 'morph'
            );
            interpolatedFrames.push(interpolated);
          }
        }
        // Add the last frame
        interpolatedFrames.push(frames[frames.length - 1]);
        frames = interpolatedFrames;
      }

      if (frames.length > 1 && debouncedConfig.content) {
        updateGenerationProgress('Finalizing animation startup frame', 96);
        await ensureDecodableFirstFrame();
      }

      // Only update state if not cancelled
      if (isRunCancelled()) return;

      log.debug('animation cache: complete', {
        totalFrames: frames.length,
        firstFrameSize: frames[0] ? { w: frames[0].width, h: frames[0].height } : null,
      });

      replaceAnimationFrames(frames);
      setIsAnimationCacheReady(true);
      setIsLoading(false);
      setIsLoadingOverlay(false); // Clear overlay loading state when animation cache is ready
      clearGenerationProgress();

      // Set the first frame as current canvas
      if (frames.length > 0) {
        setCanvas(frames[0]);
        if (canvasRef.current) {
          drawToDisplayCanvas(canvasRef.current, frames[0]);
        }
      }
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
