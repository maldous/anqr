/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

import { createLogger } from '../../lib/logger';
import type { GradientConfig } from '../core';
import {
  calculateOptimalVersion,
  createShiftJISEncoder,
  getCompatibleMode,
  qrcode,
  resetStringToBytes,
  setStringToBytes,
} from '../qr-encoder';
import { verifyQRStructure } from '../qr-spec';
import { qrMatrixCache } from './cache';
import { type CanvasFactory, CanvasPool, defaultBrowserCanvasFactory } from './canvas-factory';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from './drawing';
import {
  applyGeometricTransforms,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  preprocessOverlay,
} from './overlay';
import { getAlignmentPositionsCached } from './pattern-helpers';
import { getScaleFactor, prepareUnifiedOverlayData } from './pixel-matrix';
import { renderModules } from './render-loop';
import { generateScaledQR } from './scaled-render';
import type { OverlayData, QRCodeInstance, QRGeneratorConfig, QRMatrixResult } from './types';
import { hashCanvasContent, validateColor } from './utils';

const log = createLogger('GENERATE');
type QRDecoderModule = typeof import('../qr-decoder');
let qrDecoderModulePromise: Promise<QRDecoderModule> | null = null;

function loadQRDecoderModule(): Promise<QRDecoderModule> {
  if (!qrDecoderModulePromise) {
    qrDecoderModulePromise = import('../qr-decoder');
  }
  return qrDecoderModulePromise;
}

// Note: stringToBytes management is now handled via qr-encoder/string-bytes.ts

/**
 * Wrapper class that provides QRCodeInstance interface for a pre-computed boolean matrix.
 * Used by renderFromMatrix() to render QR-Art matrices with the full styling pipeline.
 */
class MatrixWrapper {
  private matrix: boolean[][];
  private moduleCount: number;

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
  private packed: Uint8Array;
  private moduleCount: number;

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

export class QRGenerator {
  private qrcode: typeof qrcode;
  private canvasFactory: CanvasFactory;
  private _canvasPool: CanvasPool;
  private _lastMatrix: boolean[][] | null = null;
  private _lastModuleCount: number = 0;
  private _ditherPatchCache: Map<string, DitherPatchCacheEntry> = new Map();
  private _overlayComplexityCache: Map<string, OverlayComplexityCacheEntry> = new Map();
  private static readonly DITHER_PATCH_CACHE_MAX_ENTRIES = 64;
  private static readonly DITHER_PATCH_CACHE_TTL_MS = 5 * 60 * 1000;
  private static readonly OVERLAY_COMPLEXITY_CACHE_MAX_ENTRIES = 96;
  private static readonly OVERLAY_COMPLEXITY_CACHE_TTL_MS = 2 * 60 * 1000;

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
    const qr = this.qrcode(typeNumber, config.errorCorrection as 'L' | 'M' | 'Q' | 'H');

    // Handle character encoding (ECI - Extended Channel Interpretation)
    if (characterEncodingConfig === 'utf8') {
      setStringToBytes((s: string) => {
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(s));
      });
    } else if (characterEncodingConfig === 'shift-jis') {
      setStringToBytes(createShiftJISEncoder());
    } else {
      resetStringToBytes();
    }

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

  /**
   * Draw finder and alignment patterns, returning a flat skip mask.
   * The Uint8Array is indexed by (row * moduleCount + col); non-zero = already drawn.
   */
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

    // Only draw finder patterns separately if preserveFinders is true OR there's no overlay
    const shouldDrawFindersFirst = config.preserveFinders !== false || !overlayData;

    const finderPositions = [
      { row: 0, col: 0 },
      { row: 0, col: moduleCount - 7 },
      { row: moduleCount - 7, col: 0 },
    ];

    if (shouldDrawFindersFirst) {
      for (const pos of finderPositions) {
        const x = (pos.col + margin) * moduleSize;
        const y = (pos.row + margin) * moduleSize;
        drawFinderPatternComplete(ctx as CanvasRenderingContext2D, x, y, moduleSize, config);

        // Mark all modules in this finder pattern as drawn
        for (let r = pos.row; r < pos.row + 7; r++) {
          for (let c = pos.col; c < pos.col + 7; c++) {
            skipMask[r * moduleCount + c] = 1;
          }
        }
      }
    }

    // Draw alignment patterns (for version 2+)
    const shouldDrawAlignmentFirst = config.preserveAlignment !== false || !overlayData;
    const alignmentStyle = config.alignmentStyle || 'match_finder';

    if (version >= 2 && shouldDrawAlignmentFirst) {
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

        // Mark all modules in this alignment pattern as drawn
        for (let r = pos.row - 2; r <= pos.row + 2; r++) {
          for (let c = pos.col - 2; c <= pos.col + 2; c++) {
            skipMask[r * moduleCount + c] = 1;
          }
        }
      }
    }

    return skipMask;
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
      typeNumber = calculateOptimalVersion(
        config.content,
        config.errorCorrection as 'L' | 'M' | 'Q' | 'H'
      );
    }

    // Apply geometric transforms if needed
    let processedOverlayCanvas: HTMLCanvasElement | OffscreenCanvas | null = overlayCanvas;
    if (overlayCanvas && hasGeometricTransforms(config)) {
      processedOverlayCanvas = await applyGeometricTransforms(
        overlayCanvas,
        config,
        this.createCanvas.bind(this)
      );
    }

    // Apply overlay preprocessing (brightness/contrast/gamma/etc) after geometry.
    // This must run BEFORE we sample overlay pixels for scaled/dithered/subpixel modes.
    // ALL overlay modes (including center) apply the full set of visual effects.
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

    // =======================================================================
    // FIX: Ensure overlayMode has a default when overlay canvas is provided but mode is undefined
    // This can happen due to debounce timing - overlay canvas is passed before config updates
    // Default to 'dithered' to match the store default in qr-store.ts
    // IMPORTANT: This must happen BEFORE the scale factor check!
    // =======================================================================
    const overlayModeWithDefault =
      processedOverlayCanvas && !config.overlayMode ? 'dithered' : config.overlayMode;
    const blendPreservationMode: 'overlay' | 'dither' =
      config.blendPreservationMode === 'dither' ? 'dither' : 'overlay';

    const effectiveOverlayMode = overlayModeWithDefault;

    const effectiveConfig: QRGeneratorConfig = {
      ...config,
      typeNumber,
      overlayMode: effectiveOverlayMode,
      blendPreservationMode,
    };

    // =======================================================================
    // UNIFIED SCALED RENDERING (dithered, blue-noise, subpixel modes)
    // =======================================================================
    const scale = getScaleFactor(effectiveOverlayMode, effectiveConfig);

    log.debug('Overlay mode resolution', {
      hasOverlay: !!processedOverlayCanvas,
      configOverlayMode: config.overlayMode,
      effectiveOverlayMode,
      scale,
      willUseScaledPath: scale > 1 && !!processedOverlayCanvas,
      colorMode: config.colorMode,
      overlayIntensity: config.overlayIntensity,
    });
    if (scale > 1 && processedOverlayCanvas) {
      const pool = this._canvasPool;
      const renderScaled = async (cfg: QRGeneratorConfig) =>
        await generateScaledQR(
          qr,
          cfg,
          processedOverlayCanvas as HTMLCanvasElement | OffscreenCanvas,
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

      // Fast preview: single render attempt, skip scan gate retry loop entirely
      if (effectiveConfig.fastPreview) {
        return await renderScaled(effectiveConfig);
      }

      if (
        effectiveConfig.overlayMode === 'dithered' ||
        effectiveConfig.forceScaledOverlay === true
      ) {
        let decodeFnPromise: Promise<QRDecoderModule['decodeQR']> | null = null;
        const getDecodeFn = async (): Promise<QRDecoderModule['decodeQR']> => {
          if (!decodeFnPromise) {
            decodeFnPromise = loadQRDecoderModule().then((mod) => mod.decodeQR);
          }
          return await decodeFnPromise;
        };

        const decodeCanvasData = async (
          c: HTMLCanvasElement | OffscreenCanvas
        ): Promise<{ success: boolean; data: string | null } | null> => {
          const ctx = c.getContext('2d') as CanvasRenderingContext2D | null;
          if (!ctx) return null;
          const imageData = ctx.getImageData(0, 0, c.width, c.height);
          const decodeQR = await getDecodeFn();
          return decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
        };

        const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
        const scanGateProfile = effectiveConfig.scanGateProfile ?? 'full';
        const isPreviewScanGate = scanGateProfile === 'preview';
        const isScanGateDisabled = scanGateProfile === 'off';
        const skipScanGateEscalation =
          effectiveConfig.preserveFinders === false && effectiveConfig.blendPreservations !== true;
        const edgeImprintThreshold = clamp(effectiveConfig.edgeImprintThreshold ?? 0.2, 0.05, 0.5);
        const toneStdThreshold = clamp(effectiveConfig.toneStdThreshold ?? 0.12, 0.05, 0.3);
        const edgeWorsenLimit = clamp(effectiveConfig.edgeImprintWorsenLimit ?? 0.015, 0, 0.2);

        const fixedVisualPolicy: Partial<QRGeneratorConfig> = {
          overlayMode: effectiveConfig.overlayMode,
          colorMode: effectiveConfig.colorMode,
          renderScalePerModule: effectiveConfig.renderScalePerModule,
          ditherKind: effectiveConfig.ditherKind,
          ditherMode: effectiveConfig.ditherMode,
          ditherStrength: effectiveConfig.ditherStrength,
          finderDitherStrength: effectiveConfig.finderDitherStrength,
          blendPreservations: effectiveConfig.blendPreservations,
          blendPreservationMode: effectiveConfig.blendPreservationMode,
          ditherScale: effectiveConfig.ditherScale,
          ditherSerpentine: effectiveConfig.ditherSerpentine,
          diffusionKernel: effectiveConfig.diffusionKernel,
          orderedMatrix: effectiveConfig.orderedMatrix,
          blueNoiseTileSize: effectiveConfig.blueNoiseTileSize,
          blueNoiseSeed: effectiveConfig.blueNoiseSeed,
          colorDither: effectiveConfig.colorDither,
          dotMinRadiusPx: effectiveConfig.dotMinRadiusPx,
          dotMaxRadiusPx: effectiveConfig.dotMaxRadiusPx,
          seed: effectiveConfig.seed,
        };

        const requestedOverlayIntensity = clamp(effectiveConfig.overlayIntensity ?? 100, 0, 100);
        const isAnimatedFrame =
          typeof effectiveConfig.frameIndex === 'number' &&
          Number.isFinite(effectiveConfig.frameIndex);
        const overlayFamilyKey = processedOverlayCanvas
          ? [
              processedOverlayCanvas.width,
              processedOverlayCanvas.height,
              effectiveConfig.overlayMode ?? 'none',
              effectiveConfig.colorMode ?? 'color',
              Math.round(effectiveConfig.overlayIntensity ?? 100),
              Math.round(effectiveConfig.ditherStrength ?? 50),
              Math.round(effectiveConfig.finderDitherStrength ?? 65),
              effectiveConfig.ditherKind ?? 'none',
              effectiveConfig.ditherMode ?? 'none',
              Math.round(effectiveConfig.renderScalePerModule ?? 18),
              effectiveConfig.blendPreservations === true ? 1 : 0,
              effectiveConfig.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
            ].join('|')
          : 'overlay:none';
        const readOverlayComplexityCache = (key: string): number | null => {
          const entry = this._overlayComplexityCache.get(key);
          if (!entry) return null;
          if (Date.now() - entry.updatedAt > QRGenerator.OVERLAY_COMPLEXITY_CACHE_TTL_MS) {
            this._overlayComplexityCache.delete(key);
            return null;
          }
          return entry.complexity;
        };
        const writeOverlayComplexityCache = (key: string, complexity: number): void => {
          this._overlayComplexityCache.set(key, { complexity, updatedAt: Date.now() });
          if (
            this._overlayComplexityCache.size <= QRGenerator.OVERLAY_COMPLEXITY_CACHE_MAX_ENTRIES
          ) {
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
        };
        const analysisSampleSize = 48;
        const analyzeOverlayComplexity = async (): Promise<number> => {
          if (!processedOverlayCanvas) return 0;
          const analysisCanvas = await pool.acquire(analysisSampleSize, analysisSampleSize);
          try {
            analysisCanvas.width = analysisSampleSize;
            analysisCanvas.height = analysisSampleSize;
            const analysisCtx =
              (analysisCanvas.getContext('2d', {
                willReadFrequently: true,
                desynchronized: true,
              } as CanvasRenderingContext2DSettings) as CanvasRenderingContext2D | null) ??
              (analysisCanvas.getContext('2d') as CanvasRenderingContext2D | null);
            if (!analysisCtx) return 0;

            analysisCtx.imageSmoothingEnabled = true;
            analysisCtx.imageSmoothingQuality = 'high';
            analysisCtx.clearRect(0, 0, analysisSampleSize, analysisSampleSize);
            analysisCtx.drawImage(
              processedOverlayCanvas as CanvasImageSource,
              0,
              0,
              analysisSampleSize,
              analysisSampleSize
            );

            const pixels = analysisCtx.getImageData(
              0,
              0,
              analysisSampleSize,
              analysisSampleSize
            ).data;
            const sampleCount = analysisSampleSize * analysisSampleSize;
            const luma = new Float32Array(sampleCount);

            let sum = 0;
            for (let i = 0; i < sampleCount; i++) {
              const idx = i * 4;
              const value =
                (0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]) / 255;
              luma[i] = value;
              sum += value;
            }
            const mean = sum / Math.max(1, sampleCount);

            let variance = 0;
            let edge = 0;
            let edgeCount = 0;
            for (let y = 0; y < analysisSampleSize; y++) {
              for (let x = 0; x < analysisSampleSize; x++) {
                const idx = y * analysisSampleSize + x;
                const v = luma[idx];
                const d = v - mean;
                variance += d * d;
                if (x + 1 < analysisSampleSize) {
                  edge += Math.abs(v - luma[idx + 1]);
                  edgeCount++;
                }
                if (y + 1 < analysisSampleSize) {
                  edge += Math.abs(v - luma[idx + analysisSampleSize]);
                  edgeCount++;
                }
              }
            }
            const toneStd = Math.sqrt(variance / Math.max(1, sampleCount));
            const edgeDensity = edge / Math.max(1, edgeCount);
            return clamp(toneStd * 1.8 + edgeDensity * 1.2, 0, 1);
          } catch {
            return 0;
          } finally {
            pool.release(analysisCanvas);
          }
        };

        const overlaySignature = processedOverlayCanvas
          ? isAnimatedFrame
            ? `anim-family:${overlayFamilyKey}`
            : `${processedOverlayCanvas.width}x${processedOverlayCanvas.height}:${await hashCanvasContent(
                processedOverlayCanvas as HTMLCanvasElement | OffscreenCanvas,
                this.createCanvas.bind(this)
              )}`
          : 'overlay:none';
        const overlayComplexityCacheKey = `${isAnimatedFrame ? 'anim' : 'static'}:${overlaySignature}`;
        const cachedOverlayComplexity = readOverlayComplexityCache(overlayComplexityCacheKey);
        const overlayComplexity =
          cachedOverlayComplexity !== null
            ? cachedOverlayComplexity
            : await analyzeOverlayComplexity();
        if (cachedOverlayComplexity === null) {
          writeOverlayComplexityCache(overlayComplexityCacheKey, overlayComplexity);
        }
        const adaptiveEdgeImprintThreshold = clamp(
          edgeImprintThreshold +
            overlayComplexity * 0.08 +
            (requestedOverlayIntensity / 100) * 0.03,
          0.05,
          0.6
        );
        const adaptiveToneStdThreshold = clamp(
          toneStdThreshold - overlayComplexity * 0.035,
          0.04,
          0.3
        );
        const adaptiveEdgeWorsenLimit = clamp(edgeWorsenLimit + overlayComplexity * 0.02, 0, 0.24);

        const patchSignature = (patch: DitherAttemptPatch): string =>
          JSON.stringify({
            d: patch.darkMinOccupancy ?? null,
            l: patch.lightMaxOccupancy ?? null,
            i: patch.optimizeIterations ?? null,
            o: patch.overlayIntensity ?? null,
            b: patch.qrBitBiasStrength ?? null,
            q: patch.qrFirstMode ?? null,
            f: patch.preserveFinders ?? null,
          });

        const buildScanCacheKey = (
          preserveFindersValue: boolean,
          overlayToken: string = overlaySignature
        ): string =>
          [
            effectiveConfig.content,
            effectiveConfig.errorCorrection,
            moduleCount,
            effectiveConfig.overlayMode,
            effectiveConfig.colorMode,
            scanGateProfile,
            Math.round(effectiveConfig.overlayIntensity ?? 100),
            Math.round(effectiveConfig.ditherStrength ?? 50),
            Math.round(effectiveConfig.finderDitherStrength ?? 65),
            effectiveConfig.blendPreservations === true ? 1 : 0,
            effectiveConfig.blendPreservationMode === 'dither' ? 'dither' : 'overlay',
            effectiveConfig.ditherKind ?? 'none',
            effectiveConfig.ditherMode ?? 'none',
            Math.round(effectiveConfig.ditherScale ?? 1),
            effectiveConfig.ditherSerpentine === false ? 0 : 1,
            effectiveConfig.diffusionKernel ?? 'floyd_steinberg',
            effectiveConfig.orderedMatrix ?? 'bayer4',
            Math.round(effectiveConfig.blueNoiseTileSize ?? 64),
            effectiveConfig.blueNoiseSeed ?? 'noise-seed:auto',
            effectiveConfig.colorDither ?? 'none',
            Math.round(effectiveConfig.renderScalePerModule ?? 18),
            preserveFindersValue ? 1 : 0,
            overlayToken,
            effectiveConfig.preserveTiming === true ? 1 : 0,
            effectiveConfig.preserveAlignment === true ? 1 : 0,
            effectiveConfig.protectFormatInfo === true ? 1 : 0,
            effectiveConfig.protectVersionInfo === true ? 1 : 0,
            effectiveConfig.qrFirstMode === true ? 1 : 0,
            effectiveConfig.seed ?? 'seed:auto',
          ].join('|');
        const scanCacheKey = buildScanCacheKey(effectiveConfig.preserveFinders !== false);
        const scanCacheFallbackKey = buildScanCacheKey(
          effectiveConfig.preserveFinders !== false,
          `overlay-family:${Math.round(overlayComplexity * 10)}`
        );
        const cacheIntensityFloor = clamp(
          requestedOverlayIntensity - Math.round(28 + overlayComplexity * 18),
          8,
          requestedOverlayIntensity
        );
        const isAggressivePatch = (patch: DitherAttemptPatch): boolean => {
          if (patch.qrFirstMode === true) return true;
          if (effectiveConfig.preserveFinders === false && patch.preserveFinders === true)
            return true;
          const patchIntensity = patch.overlayIntensity ?? requestedOverlayIntensity;
          if (patchIntensity < cacheIntensityFloor) return true;
          const patchBias = patch.qrBitBiasStrength ?? effectiveConfig.qrBitBiasStrength ?? 0.04;
          if (patchBias > 0.34 + overlayComplexity * 0.02) return true;
          if ((patch.darkMinOccupancy ?? 0) > 0.64) return true;
          if ((patch.lightMaxOccupancy ?? 1) < 0.36) return true;
          return false;
        };
        const resolveOverlayIntensity = (
          rawDrop: number,
          options?: { minIntensity?: number; maxDrop?: number }
        ): number => {
          const complexityScale = overlayComplexity >= 0.65 ? 0.75 : 1;
          const scaledDrop = Math.round(rawDrop * complexityScale);
          const defaultMaxDrop = isPreviewScanGate
            ? clamp(22 - overlayComplexity * 6, 14, 22)
            : clamp(36 - overlayComplexity * 10, 22, 36);
          const maxDrop = options?.maxDrop ?? defaultMaxDrop;
          const upperBound = requestedOverlayIntensity;
          const minIntensityRaw = options?.minIntensity ?? (isPreviewScanGate ? 16 : 12);
          const minIntensity = Math.min(minIntensityRaw, upperBound);
          const boundedDrop = Math.min(scaledDrop, maxDrop);
          return clamp(requestedOverlayIntensity - boundedDrop, minIntensity, upperBound);
        };

        const getCachedPatch = (): DitherAttemptPatch | null => {
          const keyCandidates =
            scanCacheFallbackKey === scanCacheKey
              ? [scanCacheKey]
              : [scanCacheKey, scanCacheFallbackKey];
          for (const resolvedKey of keyCandidates) {
            const entry = this._ditherPatchCache.get(resolvedKey);
            if (!entry) continue;
            if (Date.now() - entry.updatedAt > QRGenerator.DITHER_PATCH_CACHE_TTL_MS) {
              this._ditherPatchCache.delete(resolvedKey);
              continue;
            }
            if (isAggressivePatch(entry.patch)) {
              this._ditherPatchCache.delete(resolvedKey);
              continue;
            }
            return { ...entry.patch };
          }
          return null;
        };

        const rememberPatch = (patch: DitherAttemptPatch): void => {
          if (isAggressivePatch(patch)) return;
          const now = Date.now();
          const keys =
            scanCacheFallbackKey === scanCacheKey
              ? [scanCacheKey]
              : [scanCacheKey, scanCacheFallbackKey];
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
        };

        const useFinderRelaxedAttempts = skipScanGateEscalation && !isScanGateDisabled;
        const baseAttempts: DitherAttemptPatch[] = useFinderRelaxedAttempts
          ? [
              {
                darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.46, 0.4, 0.56),
                lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.54, 0.44, 0.6),
                optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
                overlayIntensity: resolveOverlayIntensity(8, { minIntensity: 18, maxDrop: 24 }),
                qrBitBiasStrength: clamp(
                  (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
                  0,
                  0.24
                ),
              },
              {
                darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.5, 0.46, 0.58),
                lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.42, 0.54),
                optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
                overlayIntensity: resolveOverlayIntensity(16, { minIntensity: 16, maxDrop: 26 }),
                qrBitBiasStrength: clamp(
                  (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.05 + overlayComplexity * 0.015,
                  0,
                  0.24
                ),
              },
              {
                darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.54, 0.5, 0.6),
                lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.46, 0.4, 0.5),
                optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
                overlayIntensity: resolveOverlayIntensity(24, { minIntensity: 14, maxDrop: 30 }),
                qrBitBiasStrength: clamp(
                  (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.02,
                  0,
                  0.24
                ),
              },
            ]
          : isPreviewScanGate
            ? [
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
                  optimizeIterations: Math.max(2, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(0, { minIntensity: 24, maxDrop: 0 }),
                  qrBitBiasStrength: clamp(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.48, 0.44, 0.56),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.52, 0.44, 0.56),
                  optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(10, { minIntensity: 20, maxDrop: 14 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.04 + overlayComplexity * 0.01,
                    0,
                    0.28
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.52, 0.48, 0.58),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.48, 0.42, 0.52),
                  optimizeIterations: Math.max(5, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(16, { minIntensity: 16, maxDrop: 18 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.07 + overlayComplexity * 0.015,
                    0,
                    0.28
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.55, 0.5, 0.6),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.4, 0.5),
                  optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(22, { minIntensity: 12, maxDrop: 22 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.1 + overlayComplexity * 0.02,
                    0,
                    0.3
                  ),
                },
              ]
            : [
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.42, 0.36, 0.56),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.58, 0.44, 0.64),
                  optimizeIterations: Math.max(4, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(0, { minIntensity: 20, maxDrop: 0 }),
                  qrBitBiasStrength: clamp(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.24),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.5, 0.5, 0.56),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.5, 0.44, 0.5),
                  optimizeIterations: Math.max(6, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(18, { minIntensity: 16, maxDrop: 26 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.03 + overlayComplexity * 0.01,
                    0,
                    0.24
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.53, 0.51, 0.56),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.47, 0.44, 0.49),
                  optimizeIterations: Math.max(7, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(26, { minIntensity: 14, maxDrop: 30 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.06 + overlayComplexity * 0.015,
                    0,
                    0.24
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.55, 0.53, 0.58),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.45, 0.42, 0.47),
                  optimizeIterations: Math.max(8, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(34, { minIntensity: 12, maxDrop: 32 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.09 + overlayComplexity * 0.02,
                    0,
                    0.24
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.57, 0.55, 0.6),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.43, 0.4, 0.45),
                  optimizeIterations: Math.max(9, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(42, { minIntensity: 10, maxDrop: 34 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.12 + overlayComplexity * 0.025,
                    0,
                    0.24
                  ),
                },
                {
                  darkMinOccupancy: clamp(effectiveConfig.darkMinOccupancy ?? 0.58, 0.56, 0.62),
                  lightMaxOccupancy: clamp(effectiveConfig.lightMaxOccupancy ?? 0.42, 0.38, 0.44),
                  optimizeIterations: Math.max(10, effectiveConfig.optimizeIterations ?? 6),
                  overlayIntensity: resolveOverlayIntensity(50, { minIntensity: 8, maxDrop: 36 }),
                  qrBitBiasStrength: clamp(
                    (effectiveConfig.qrBitBiasStrength ?? 0.04) + 0.16 + overlayComplexity * 0.03,
                    0,
                    0.28
                  ),
                },
              ];

        const attempts: DitherAttemptPatch[] = [];
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
        const cachedPatch = getCachedPatch();
        if (cachedPatch) pushUniqueAttempt(cachedPatch);

        const buildAttemptConfig = (patch: DitherAttemptPatch): QRGeneratorConfig => ({
          ...effectiveConfig,
          ...fixedVisualPolicy,
          preserveFunctionalPatterns: effectiveConfig.preserveFunctionalPatterns,
          preserveFinders:
            patch.preserveFinders !== undefined
              ? patch.preserveFinders
              : effectiveConfig.preserveFinders,
          forceCenterLock: false,
          cleanupSpeckle: false,
          darkMinOccupancy: patch.darkMinOccupancy,
          lightMaxOccupancy: patch.lightMaxOccupancy,
          optimizeIterations: patch.optimizeIterations,
          overlayIntensity: patch.overlayIntensity ?? effectiveConfig.overlayIntensity,
          qrBitBiasStrength: patch.qrBitBiasStrength ?? effectiveConfig.qrBitBiasStrength,
          qrFirstMode: patch.qrFirstMode ?? effectiveConfig.qrFirstMode ?? false,
        });

        const buildDecodeRescuePatches = (): DitherAttemptPatch[] => {
          const baseDark = clamp(effectiveConfig.darkMinOccupancy ?? 0.56, 0.5, 0.62);
          const baseLight = clamp(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.38, 0.5);
          const baseBias = clamp(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
          const rescueStep = isPreviewScanGate
            ? overlayComplexity >= 0.65
              ? 4
              : 5
            : overlayComplexity >= 0.65
              ? 4
              : 5;
          const rescueMaxDrop = isPreviewScanGate
            ? clamp(20 - overlayComplexity * 6, 10, 20)
            : clamp(46 - overlayComplexity * 10, 24, 46);
          const intensities: number[] = [];
          for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
            const intensity = resolveOverlayIntensity(drop, {
              minIntensity: isPreviewScanGate ? 16 : 10,
              maxDrop: rescueMaxDrop,
            });
            if (intensity < requestedOverlayIntensity && !intensities.includes(intensity)) {
              intensities.push(intensity);
            }
          }
          return intensities.map((overlayIntensity, idx) => ({
            darkMinOccupancy: clamp(baseDark + idx * 0.01, 0.5, 0.64),
            lightMaxOccupancy: clamp(baseLight - idx * 0.01, 0.36, 0.5),
            optimizeIterations: Math.max(4 + idx, effectiveConfig.optimizeIterations ?? 6),
            overlayIntensity,
            qrBitBiasStrength: clamp(
              baseBias + 0.1 + idx * 0.03 + overlayComplexity * 0.02,
              0,
              0.34
            ),
          }));
        };

        const buildFinderRescuePatches = (): DitherAttemptPatch[] => {
          if (effectiveConfig.preserveFinders !== false || isScanGateDisabled) return [];
          const baseDark = clamp(effectiveConfig.darkMinOccupancy ?? 0.56, 0.52, 0.66);
          const baseLight = clamp(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.34, 0.48);
          const baseBias = clamp(effectiveConfig.qrBitBiasStrength ?? 0.04, 0, 0.32);
          const rescueStep = isPreviewScanGate
            ? overlayComplexity >= 0.65
              ? 4
              : 5
            : overlayComplexity >= 0.65
              ? 4
              : 5;
          const rescueMaxDrop = isPreviewScanGate
            ? clamp(26 - overlayComplexity * 7, 12, 26)
            : clamp(52 - overlayComplexity * 12, 26, 52);
          const intensities: number[] = [];
          for (let drop = rescueStep; drop <= rescueMaxDrop; drop += rescueStep) {
            const intensity = resolveOverlayIntensity(drop, {
              minIntensity: 8,
              maxDrop: rescueMaxDrop,
            });
            if (intensity < requestedOverlayIntensity && !intensities.includes(intensity)) {
              intensities.push(intensity);
            }
          }
          return intensities.map((overlayIntensity, idx) => ({
            preserveFinders: true,
            darkMinOccupancy: clamp(baseDark + idx * 0.01, 0.52, 0.7),
            lightMaxOccupancy: clamp(baseLight - idx * 0.01, 0.3, 0.48),
            optimizeIterations: Math.max(6 + idx, effectiveConfig.optimizeIterations ?? 6),
            overlayIntensity,
            qrBitBiasStrength: clamp(
              baseBias + 0.12 + idx * 0.03 + overlayComplexity * 0.025,
              0,
              0.36
            ),
          }));
        };

        const computeFinalRasterMetrics = (
          src: HTMLCanvasElement | OffscreenCanvas
        ): { edgeImprint: number; toneStd: number } | null => {
          const ctx = src.getContext('2d') as CanvasRenderingContext2D | null;
          if (!ctx) return null;
          const { width, height } = src;
          const imageData = ctx.getImageData(0, 0, width, height).data;
          const grayAt = (x: number, y: number): number => {
            const xx = Math.max(0, Math.min(width - 1, Math.round(x)));
            const yy = Math.max(0, Math.min(height - 1, Math.round(y)));
            const i = (yy * width + xx) * 4;
            return (
              (0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]) / 255
            );
          };

          const quietZoneMin = effectiveConfig.quietZoneMinEnforce === false ? 0 : 4;
          const marginModules = Math.max(quietZoneMin, effectiveConfig.margin);
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
        };

        const toFinalRasterCanvas = async (
          src: HTMLCanvasElement | OffscreenCanvas
        ): Promise<HTMLCanvasElement | OffscreenCanvas> => {
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
            let imageSource: CanvasImageSource;
            if (typeof createImageBitmap === 'function' && typeof src.toBlob === 'function') {
              const blob = await new Promise<Blob | null>((resolve) => {
                src.toBlob((nextBlob) => resolve(nextBlob), 'image/png');
              });
              if (!blob) throw new Error('final-raster blob encode failed');
              bitmap = await createImageBitmap(blob);
              imageSource = bitmap;
            } else if (typeof Image !== 'undefined' && typeof src.toDataURL === 'function') {
              const pngDataUrl = src.toDataURL('image/png');
              imageSource = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('final-raster roundtrip failed'));
                img.src = pngDataUrl;
              });
            } else {
              return src;
            }

            out = await pool.acquire(src.width, src.height);
            out.width = src.width;
            out.height = src.height;
            const outCtx = out.getContext('2d');
            if (!outCtx) {
              pool.release(out);
              return src;
            }
            outCtx.imageSmoothingEnabled = false;
            outCtx.drawImage(imageSource, 0, 0, out.width, out.height);
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
        };

        const runDecode = async (src: HTMLCanvasElement | OffscreenCanvas): Promise<boolean> => {
          const decoded = await decodeCanvasData(src);
          return decoded?.success === true && decoded?.data === effectiveConfig.content;
        };

        const scenarioSeed = effectiveConfig.seed ?? 1337;
        const seeded01 = (salt: number): number => {
          const n = Math.sin((scenarioSeed + salt) * 12.9898) * 43758.5453;
          return n - Math.floor(n);
        };

        const decodeScenarios = async (
          canvas: HTMLCanvasElement | OffscreenCanvas,
          prevEdgeImprint: number | null
        ): Promise<{
          ok: boolean;
          baseDecodeOk: boolean;
          metrics: { edgeImprint: number; toneStd: number } | null;
          evaluatedCanvas: HTMLCanvasElement | OffscreenCanvas;
        }> => {
          if (isScanGateDisabled) {
            return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: canvas };
          }
          if (isPreviewScanGate && isAnimatedFrame) {
            // Animation preview path: run lightweight decode check but skip expensive
            // metrics computation and scenario simulation for throughput.
            const animDecodeOk = await runDecode(canvas);
            return {
              ok: animDecodeOk,
              baseDecodeOk: animDecodeOk,
              metrics: null,
              evaluatedCanvas: canvas,
            };
          }
          // Preview mode prioritizes generation throughput and checks decode on the render canvas.
          // Full mode validates on an export-equivalent raster roundtrip.
          const finalRaster = isPreviewScanGate ? canvas : await toFinalRasterCanvas(canvas);
          if (!(await runDecode(finalRaster))) {
            return { ok: false, baseDecodeOk: false, metrics: null, evaluatedCanvas: finalRaster };
          }

          if (skipScanGateEscalation) {
            const baseMetrics = isPreviewScanGate ? null : computeFinalRasterMetrics(finalRaster);
            return {
              ok: true,
              baseDecodeOk: true,
              metrics: baseMetrics,
              evaluatedCanvas: finalRaster,
            };
          }

          if (isPreviewScanGate) {
            return { ok: true, baseDecodeOk: true, metrics: null, evaluatedCanvas: finalRaster };
          }
          const baseMetrics = computeFinalRasterMetrics(finalRaster);
          if (baseMetrics) {
            if (
              baseMetrics.edgeImprint > adaptiveEdgeImprintThreshold ||
              baseMetrics.toneStd < adaptiveToneStdThreshold
            ) {
              return {
                ok: false,
                baseDecodeOk: true,
                metrics: baseMetrics,
                evaluatedCanvas: finalRaster,
              };
            }
            if (
              prevEdgeImprint !== null &&
              baseMetrics.edgeImprint > prevEdgeImprint + adaptiveEdgeWorsenLimit
            ) {
              return {
                ok: false,
                baseDecodeOk: true,
                metrics: baseMetrics,
                evaluatedCanvas: finalRaster,
              };
            }
          }

          const scenarios = [
            {
              blur: 0.8 + seeded01(11) * 0.4,
              exposure: -0.24 + seeded01(13) * 0.08,
              skewX: finalRaster.width * 0.02,
              skewY: finalRaster.height * 0.012,
              downscale: 0.9,
            },
            {
              blur: 1.0 + seeded01(17) * 0.5,
              exposure: 0.18 + seeded01(19) * 0.12,
              skewX: finalRaster.width * 0.028,
              skewY: finalRaster.height * 0.018,
              downscale: 0.82,
            },
          ];

          for (const s of scenarios) {
            const sim = await pool.acquire(finalRaster.width, finalRaster.height);
            try {
              const simCtx = sim.getContext('2d') as CanvasRenderingContext2D | null;
              if (!simCtx)
                return {
                  ok: false,
                  baseDecodeOk: true,
                  metrics: baseMetrics,
                  evaluatedCanvas: finalRaster,
                };

              const dsW = Math.max(1, Math.round(finalRaster.width * s.downscale));
              const dsH = Math.max(1, Math.round(finalRaster.height * s.downscale));
              const ds = await pool.acquire(dsW, dsH);
              try {
                const dsCtx = ds.getContext('2d') as CanvasRenderingContext2D | null;
                if (!dsCtx)
                  return {
                    ok: false,
                    baseDecodeOk: true,
                    metrics: baseMetrics,
                    evaluatedCanvas: finalRaster,
                  };
                dsCtx.imageSmoothingEnabled = true;
                dsCtx.drawImage(finalRaster as CanvasImageSource, 0, 0, dsW, dsH);

                if ('filter' in simCtx) {
                  simCtx.filter = `blur(${s.blur}px)`;
                }
                simCtx.setTransform(1, -s.skewY / sim.height, s.skewX / sim.width, 1, 0, 0);
                simCtx.drawImage(
                  ds as CanvasImageSource,
                  0,
                  0,
                  dsW,
                  dsH,
                  0,
                  0,
                  Math.max(1, sim.width - Math.abs(s.skewX)),
                  Math.max(1, sim.height - Math.abs(s.skewY))
                );
                simCtx.setTransform(1, 0, 0, 1, 0, 0);
                if ('filter' in simCtx) {
                  simCtx.filter = 'none';
                }
                if (s.exposure !== 0) {
                  simCtx.globalCompositeOperation = 'source-atop';
                  if (s.exposure > 0) {
                    simCtx.fillStyle = `rgba(255,255,255,${Math.min(0.35, s.exposure)})`;
                  } else {
                    simCtx.fillStyle = `rgba(0,0,0,${Math.min(0.35, Math.abs(s.exposure))})`;
                  }
                  simCtx.fillRect(0, 0, sim.width, sim.height);
                  simCtx.globalCompositeOperation = 'source-over';
                }

                if (!(await runDecode(sim))) {
                  return {
                    ok: false,
                    baseDecodeOk: true,
                    metrics: baseMetrics,
                    evaluatedCanvas: finalRaster,
                  };
                }
              } finally {
                pool.release(ds);
              }
            } finally {
              pool.release(sim);
            }
          }

          return {
            ok: true,
            baseDecodeOk: true,
            metrics: baseMetrics,
            evaluatedCanvas: finalRaster,
          };
        };

        let lastCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
        let bestBaseDecodable: HTMLCanvasElement | OffscreenCanvas | null = null;
        let bestBaseDecodablePatch: DitherAttemptPatch | null = null;
        let prevEdgeImprint: number | null = null;
        for (const patch of attempts) {
          if (lastCanvas && lastCanvas !== bestBaseDecodable) {
            pool.release(lastCanvas);
            lastCanvas = null;
          }
          const attemptCanvas = await renderScaled(buildAttemptConfig(patch));
          try {
            const evaluated = await decodeScenarios(attemptCanvas, prevEdgeImprint);
            lastCanvas = evaluated.evaluatedCanvas;
            if (evaluated.baseDecodeOk && !bestBaseDecodable) {
              bestBaseDecodable = evaluated.evaluatedCanvas;
              bestBaseDecodablePatch = patch;
            }
            if (
              evaluated.metrics &&
              (prevEdgeImprint === null || evaluated.metrics.edgeImprint < prevEdgeImprint)
            ) {
              prevEdgeImprint = evaluated.metrics.edgeImprint;
            }
            if (evaluated.ok) {
              rememberPatch(patch);
              return evaluated.evaluatedCanvas;
            }
            if (skipScanGateEscalation) {
              if (evaluated.baseDecodeOk) {
                rememberPatch(patch);
                return evaluated.evaluatedCanvas;
              }
            }
          } catch {
            lastCanvas = attemptCanvas;
            // Keep iterating without escalating occupancy pressure aggressively.
            if (skipScanGateEscalation) {
            }
          }
        }
        if (bestBaseDecodable) {
          if (bestBaseDecodablePatch) rememberPatch(bestBaseDecodablePatch);
          return bestBaseDecodable;
        }

        const lastPatch = attempts[attempts.length - 1] || {};
        if (skipScanGateEscalation) {
          const finderRescuePatches = buildFinderRescuePatches();
          for (const patch of finderRescuePatches) {
            if (lastCanvas && lastCanvas !== bestBaseDecodable) {
              pool.release(lastCanvas);
              lastCanvas = null;
            }
            const rescueCanvas = await renderScaled(buildAttemptConfig(patch));
            const rescueRaster = isPreviewScanGate
              ? rescueCanvas
              : await toFinalRasterCanvas(rescueCanvas);
            if (await runDecode(rescueRaster)) {
              rememberPatch(patch);
              return rescueRaster;
            }
            lastCanvas = rescueRaster;
          }
          const fallback = lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
          if (Object.keys(lastPatch).length > 0) rememberPatch(lastPatch);
          return fallback;
        }

        const rescuePatches = [...buildDecodeRescuePatches(), ...buildFinderRescuePatches()];
        for (const patch of rescuePatches) {
          if (lastCanvas && lastCanvas !== bestBaseDecodable) {
            pool.release(lastCanvas);
            lastCanvas = null;
          }
          const rescueCanvas = await renderScaled(buildAttemptConfig(patch));
          const rescueRaster = isPreviewScanGate
            ? rescueCanvas
            : await toFinalRasterCanvas(rescueCanvas);
          if (await runDecode(rescueRaster)) {
            rememberPatch(patch);
            return rescueRaster;
          }
          lastCanvas = rescueRaster;
        }

        const requireDecodableResult = !isScanGateDisabled;
        if (!requireDecodableResult && effectiveConfig.qrFirstMode !== true) {
          // Artistic mode defaults to art-preserving fallback unless QR-first is explicitly requested.
          return lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
        }

        if (isPreviewScanGate && effectiveConfig.qrFirstMode !== true) {
          // Keep preview visuals stable; defer harsh QR-first fallback to settled/full validation paths.
          return lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch)));
        }

        // Emergency scan fallback: QR-first variants with conservative intensity.
        // This only runs when scan gating is enabled or QR-first was explicitly requested.
        let qrFirstLast: HTMLCanvasElement | OffscreenCanvas | null = null;
        const qrFirstDrops = isPreviewScanGate ? [10, 16, 22, 28, 34] : [8, 14, 20, 26, 32, 38, 44];
        const qrFirstIntensities = qrFirstDrops
          .map((drop) => resolveOverlayIntensity(drop, { minIntensity: 6, maxDrop: 46 }))
          .filter(
            (intensity, idx, values) =>
              intensity < requestedOverlayIntensity && values.indexOf(intensity) === idx
          );
        for (const intensity of qrFirstIntensities) {
          if (qrFirstLast) {
            pool.release(qrFirstLast);
            qrFirstLast = null;
          }
          const qrFirstFallback = await renderScaled({
            ...buildAttemptConfig(lastPatch),
            qrFirstMode: true,
            overlayIntensity: Math.min(intensity, effectiveConfig.overlayIntensity ?? 100),
          });
          const fallbackRaster = isPreviewScanGate
            ? qrFirstFallback
            : await toFinalRasterCanvas(qrFirstFallback);
          qrFirstLast = fallbackRaster;
          if (await runDecode(fallbackRaster)) {
            if (effectiveConfig.qrFirstMode === true) {
              rememberPatch({
                ...lastPatch,
                qrFirstMode: true,
                overlayIntensity: intensity,
              });
            }
            return fallbackRaster;
          }
        }

        // If strict decode still fails, return best QR-first artifact (never plain QR in artistic mode).
        return qrFirstLast ?? (lastCanvas || (await renderScaled(buildAttemptConfig(lastPatch))));
      }

      return await renderScaled(effectiveConfig);
    }

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
    renderModules(
      ctx,
      qr,
      effectiveConfig, // Use effectiveConfig with corrected overlayMode
      moduleCount,
      moduleSize,
      margin,
      overlayData,
      ditherPattern,
      effectiveIntensity,
      skipMask,
      version,
      gradientFill,
      useGradient ?? false
    );

    // Enforce a clean quiet zone in the final composition.
    const qrStart = margin * moduleSize;
    const qrSpan = moduleCount * moduleSize;
    const qrEnd = qrStart + qrSpan;
    if (config.transparentBg) {
      ctx.clearRect(0, 0, size, qrStart);
      ctx.clearRect(0, qrStart, qrStart, qrSpan);
      ctx.clearRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
      ctx.clearRect(0, qrEnd, size, Math.max(0, size - qrEnd));
    } else {
      ctx.fillStyle = effectiveBgColor;
      ctx.fillRect(0, 0, size, qrStart);
      ctx.fillRect(0, qrStart, qrStart, qrSpan);
      ctx.fillRect(qrEnd, qrStart, Math.max(0, size - qrEnd), qrSpan);
      ctx.fillRect(0, qrEnd, size, Math.max(0, size - qrEnd));
    }

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
    renderModules(
      ctx,
      qr,
      effectiveConfig,
      moduleCount,
      moduleSize,
      margin,
      null, // No overlay data
      null, // No dither pattern - use qr.isDark() which reads from our matrix
      0, // No effective intensity
      skipMask,
      version,
      gradientFill,
      useGradient ?? false
    );

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
