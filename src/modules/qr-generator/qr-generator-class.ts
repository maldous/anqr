/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

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
import {
  type CanvasFactory,
  CanvasPool,
  defaultBrowserCanvasFactory,
} from '../../platform/browser/canvas/canvas-factory';
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
import {
  curveIntensity,
  getScaleFactor,
  prepareUnifiedOverlayData,
} from '../../domain/render/generator/pixel-matrix';
import { renderModules } from '../../domain/render/generator/render-loop';
import { generateScaledQR } from '../../domain/render/generator/scaled-render';
import type { OverlayData, QRCodeInstance, QRGeneratorConfig, QRMatrixResult } from './types';
import { validateColor } from './utils';
import { MatrixWrapper } from './matrix-wrapper';
import { PackedMatrixWrapper } from './packed-matrix-wrapper';
import {
  buildFixedVisualPolicy,
  buildOverlayFamilyKey,
  buildScanCacheKey,
  clampN,
  clearQuietZone,
  computeOverlayComplexity,
  computeOverlaySignature,
  computeScanGateRasterMetrics,
  configureStringEncoding,
  decodeCanvasData,
  ditherPatchSignature,
  roundtripToFinalRaster,
  simulateScenarioDecode,
} from './qr-generator-helpers';
import {
  type DitherAttemptPatch,
  type ScanGateCallbacks,
  type ScanGateCtx,
  buildDitherAttemptList,
  runScanGateMainLoop,
  runScanGateQRFirstFallback,
  runScanGateRescueLoop,
} from './qr-generator-scan-gate';
import {
  buildScanGateBaseAttempts,
  buildScanGateDecodeRescuePatches,
  buildScanGateFinderRescuePatches,
  isAggressiveScanPatch,
} from './qr-generator-scan-gate-patches';
import type { DitherPatchCacheEntry } from './dither-patch-cache-entry.type';
import { generatorLog as log } from './generator-log';
import type { OverlayComplexityCacheEntry } from './overlay-complexity-cache-entry.type';

// Note: stringToBytes management is now handled via qr-encoder/string-bytes.ts

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
