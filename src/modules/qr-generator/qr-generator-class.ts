/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

import { createLogger } from '../../lib/logger';
import type { GradientConfig } from '../core';
import type { QRCodeInstance } from '../qr-encoder';
import {
  calculateOptimalVersion,
  createShiftJISEncoder,
  getCompatibleMode,
  qrcode,
  resetStringToBytes,
  setStringToBytes,
} from '../qr-encoder';
import { verifyQRStructure } from '../qr-spec';
import { decodeFromCanvas, decodeQR, decodeQRLegacy } from '../qr-decoder';
import { qrMatrixCache } from './cache';
import { type CanvasFactory, defaultBrowserCanvasFactory } from './canvas-factory';
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
import type { OverlayData, QRGeneratorConfig, QRMatrixResult } from './types';
import { validateColor } from './utils';

const log = createLogger('GENERATE');

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

export class QRGenerator {
  private qrcode: typeof qrcode;
  private canvasFactory: CanvasFactory;
  private _lastMatrix: boolean[][] | null = null;
  private _lastModuleCount: number = 0;

  /**
   * Create a QR generator instance
   * @param canvasFactory - Optional canvas factory for non-browser environments
   */
  constructor(canvasFactory: CanvasFactory | null = null) {
    this.qrcode = qrcode;
    this.canvasFactory = canvasFactory || defaultBrowserCanvasFactory;
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
   * Draw finder and alignment patterns
   */
  private drawStructuralPatterns(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    config: QRGeneratorConfig,
    moduleCount: number,
    moduleSize: number,
    margin: number,
    overlayData: unknown,
    version: number
  ): { drawnFinderPatterns: Set<string>; drawnAlignmentPatterns: Set<string> } {
    const drawnFinderPatterns = new Set<string>();
    const drawnAlignmentPatterns = new Set<string>();

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
            drawnFinderPatterns.add(`${r},${c}`);
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
            drawnAlignmentPatterns.add(`${r},${c}`);
          }
        }
      }
    }

    return { drawnFinderPatterns, drawnAlignmentPatterns };
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

    if (processedOverlayCanvas && needsPreprocessing) {
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

    const effectiveOverlayMode = overlayModeWithDefault;

    const effectiveConfig = {
      ...config,
      typeNumber,
      overlayMode: effectiveOverlayMode,
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
      const renderScaled = async (cfg: QRGeneratorConfig) =>
        await generateScaledQR(
          qr,
          cfg,
          processedOverlayCanvas as HTMLCanvasElement | OffscreenCanvas,
          moduleCount,
          scale,
          this.createCanvas.bind(this),
          this.canvasFactory,
          this.storeMatrix.bind(this) as (
            qr: { isDark(row: number, col: number): boolean; getModuleCount(): number },
            moduleCount: number
          ) => void
        );

      if (effectiveConfig.overlayMode === 'dithered') {
        const decodeCanvasData = (
          c: HTMLCanvasElement | OffscreenCanvas
        ): { success: boolean; data: string | null } | null => {
          const ctx = c.getContext('2d');
          if (!ctx) return null;
          const imageData = ctx.getImageData(0, 0, c.width, c.height);
          return decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
        };

        const attempts: Partial<QRGeneratorConfig>[] = [
          {
            preserveFunctionalPatterns: true,
            forceCenterLock: false,
            cleanupSpeckle: false,
            darkMinOccupancy: effectiveConfig.darkMinOccupancy ?? 0.0,
            lightMaxOccupancy: effectiveConfig.lightMaxOccupancy ?? 1.0,
          },
          {
            preserveFunctionalPatterns: true,
            forceCenterLock: true,
            cleanupSpeckle: false,
            darkMinOccupancy: Math.max(
              effectiveConfig.darkMinOccupancy !== undefined
                ? effectiveConfig.darkMinOccupancy
                : 0.55,
              0.55
            ),
            lightMaxOccupancy: Math.min(
              effectiveConfig.lightMaxOccupancy !== undefined
                ? effectiveConfig.lightMaxOccupancy
                : 0.45,
              0.45
            ),
          },
          {
            preserveFunctionalPatterns: true,
            forceCenterLock: true,
            cleanupSpeckle: true,
            darkMinOccupancy: Math.max(effectiveConfig.darkMinOccupancy ?? 0.56, 0.68),
            lightMaxOccupancy: Math.min(effectiveConfig.lightMaxOccupancy ?? 0.44, 0.32),
            optimizeIterations: Math.max(effectiveConfig.optimizeIterations ?? 6, 10),
          },
        ];

        let lastCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
        const decodeScenarios = (canvas: HTMLCanvasElement | OffscreenCanvas): boolean => {
          const computeFinalRasterMetrics = (
            src: HTMLCanvasElement | OffscreenCanvas
          ): { edgeImprint: number; toneStd: number } | null => {
            const ctx = src.getContext('2d');
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

          const runDecode = (src: HTMLCanvasElement | OffscreenCanvas): boolean => {
            if (typeof HTMLCanvasElement !== 'undefined' && src instanceof HTMLCanvasElement) {
              const decoded = decodeFromCanvas(src);
              if (!(decoded?.success === true && decoded?.data === effectiveConfig.content)) {
                return false;
              }
              // Secondary decoder is advisory; do not override primary failure.
              const ctx = src.getContext('2d');
              if (ctx) {
                const imageData = ctx.getImageData(0, 0, src.width, src.height);
                void decodeQRLegacy(imageData, { inversionAttempts: 'attemptBoth' });
              }
              return true;
            }
            const decoded = decodeCanvasData(src);
            return decoded?.success === true && decoded?.data === effectiveConfig.content;
          };
          if (!runDecode(canvas)) return false;
          const baseMetrics = computeFinalRasterMetrics(canvas);
          if (baseMetrics && (baseMetrics.edgeImprint > 0.2 || baseMetrics.toneStd < 0.12)) {
            return false;
          }
          if (
            typeof document === 'undefined' ||
            typeof HTMLCanvasElement === 'undefined' ||
            !(canvas instanceof HTMLCanvasElement)
          ) {
            return true;
          }

          const scenarios = [
            { blur: 0.8, exposure: -0.2 },
            { blur: 1.2, exposure: 0.25 },
          ];

          for (const s of scenarios) {
            const sim = document.createElement('canvas');
            sim.width = canvas.width;
            sim.height = canvas.height;
            const simCtx = sim.getContext('2d');
            if (!simCtx) return false;
            simCtx.filter = `blur(${s.blur}px) brightness(${1 + s.exposure})`;
            simCtx.drawImage(canvas, 0, 0);
            simCtx.filter = 'none';
            if (!runDecode(sim)) return false;
          }

          // iPhone-like off-axis capture simulation: mild perspective/skew.
          const warp = document.createElement('canvas');
          warp.width = canvas.width;
          warp.height = canvas.height;
          const wctx = warp.getContext('2d');
          if (!wctx) return false;
          const skewX = canvas.width * 0.03;
          const skewY = canvas.height * 0.02;
          wctx.setTransform(1, -skewY / canvas.height, skewX / canvas.width, 1, 0, 0);
          wctx.filter = 'blur(0.8px) brightness(0.95)';
          wctx.drawImage(canvas, 0, 0, canvas.width - skewX, canvas.height - skewY);
          wctx.setTransform(1, 0, 0, 1, 0, 0);
          wctx.filter = 'none';
          if (!runDecode(warp)) return false;

          return true;
        };

        for (const patch of attempts) {
          const canvas = await renderScaled({ ...effectiveConfig, ...patch });
          lastCanvas = canvas;
          try {
            if (decodeScenarios(canvas)) {
              return canvas;
            }
          } catch {
            // Keep iterating toward stricter correction settings.
          }
        }
        return lastCanvas as HTMLCanvasElement | OffscreenCanvas;
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
    const margin = Math.max(config.margin, quietZoneMin);
    const frameExtra =
      config.frameStyle && config.frameStyle !== 'none' && config.frameText ? moduleSize * 4 : 0;
    const size = moduleCount * moduleSize + margin * 2 * moduleSize + frameExtra;

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

    // Create gradient fill if configured
    const gradientFill = createGradientFill(ctx, config, size);
    const useGradient = config.gradient && config.gradient.type !== 'none';

    // =======================================================================
    // STAGE 4: DRAW STRUCTURAL PATTERNS
    // =======================================================================

    const { drawnFinderPatterns, drawnAlignmentPatterns } = this.drawStructuralPatterns(
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
      drawnFinderPatterns,
      drawnAlignmentPatterns,
      version,
      gradientFill,
      useGradient ?? false
    );

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
    if (moduleCount === 0) {
      throw new Error('Empty matrix provided to renderFromMatrix');
    }

    // Create a wrapper that implements QRCodeInstance interface
    const qr = new MatrixWrapper(matrix);

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
    const margin = Math.max(config.margin || 4, quietZoneMin);
    const frameExtra =
      config.frameStyle && config.frameStyle !== 'none' && config.frameText ? moduleSize * 4 : 0;
    const size = moduleCount * moduleSize + margin * 2 * moduleSize + frameExtra;

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

    // Create gradient fill if configured
    const gradientFill = createGradientFill(ctx, effectiveConfig, size);
    const useGradient = config.gradient && config.gradient.type !== 'none';

    // =======================================================================
    // STAGE 4: DRAW STRUCTURAL PATTERNS
    // =======================================================================
    const { drawnFinderPatterns, drawnAlignmentPatterns } = this.drawStructuralPatterns(
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
      drawnFinderPatterns,
      drawnAlignmentPatterns,
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
    this.storeMatrixDirect(matrix, moduleCount);

    log.debug('renderFromMatrix complete', {
      moduleCount,
      version,
      canvasSize: size,
      moduleSize,
      margin,
    });

    return canvas;
  }
}
