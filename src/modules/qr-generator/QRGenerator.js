/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

import { calculateOptimalVersion, getCompatibleMode } from '../qr-core.ts';
import qrcode, { setStringToBytes, resetStringToBytes } from '../qr-encoder/index.ts';
import { createShiftJISEncoder } from '../shift-jis-encoder.ts';

import { qrMatrixCache } from './cache.js';
import { defaultBrowserCanvasFactory } from './canvas-factory.js';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
} from './drawing.js';
import { getAlignmentPositions } from './pattern-helpers.js';
import { getScaleFactor, prepareUnifiedOverlayData } from './pixel-matrix.js';
import { renderModules } from './render-loop.js';
import { generateScaledQR } from './scaled-render.js';
import {
  applyGeometricTransforms,
  hasGeometricTransforms,
} from './overlay.js';

// Note: stringToBytes management is now handled via qr-encoder/string-bytes.ts

export class QRGenerator {
  /**
   * Create a QR generator instance
   * @param {CanvasFactory} [canvasFactory] - Optional canvas factory for non-browser environments
   */
  constructor(canvasFactory = null) {
    this.qrcode = qrcode;
    this.canvasFactory = canvasFactory || defaultBrowserCanvasFactory;
    /** @type {boolean[][] | null} */
    this._lastMatrix = null;
    /** @type {number} */
    this._lastModuleCount = 0;
  }

  /**
   * Get the QR matrix from the last generate() call
   * Returns a 2D boolean array where true = dark module, false = light module
   * @returns {{ matrix: boolean[][], moduleCount: number } | null}
   */
  getLastMatrix() {
    if (!this._lastMatrix) return null;
    return {
      matrix: this._lastMatrix,
      moduleCount: this._lastModuleCount,
    };
  }

  /**
   * Store the QR matrix for vector SVG export
   * Reusable helper to avoid code duplication across render methods
   * @param {object} qr - The QR code object with isDark() method
   * @param {number} moduleCount - Number of modules in the QR code
   */
  storeMatrix(qr, moduleCount) {
    const matrix = [];
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
   * Create a canvas using the configured factory
   * @param {number} width
   * @param {number} height
   * @returns {Promise<HTMLCanvasElement|object>}
   */
  async createCanvas(width, height) {
    return this.canvasFactory.createCanvas(width, height);
  }

  async loadLibrary() {
    // Library is imported synchronously via ES module
    // This method is kept for backwards compatibility
  }

  /**
   * Build QR matrix with caching
   * @private
   */
  buildQRMatrix(config, typeNumber, encodingMode, maskPatternConfig, characterEncodingConfig) {
    const qrCacheKey = `${config.content}:${config.errorCorrection}:${typeNumber}:${encodingMode}:${maskPatternConfig}:${characterEncodingConfig}`;

    // Check cache for existing QR matrix
    const cachedQr = qrMatrixCache.get(qrCacheKey);
    if (cachedQr) {
      return { qr: cachedQr.qr, moduleCount: cachedQr.moduleCount };
    }

    // Build new QR matrix
    const qr = this.qrcode(typeNumber, config.errorCorrection);

    // Handle character encoding (ECI - Extended Channel Interpretation)
    if (characterEncodingConfig === 'utf8') {
      setStringToBytes((s) => {
        const encoder = new TextEncoder();
        return Array.from(encoder.encode(s));
      });
    } else if (characterEncodingConfig === 'shift-jis') {
      setStringToBytes(createShiftJISEncoder());
    } else {
      resetStringToBytes();
    }

    // Map encoding mode to qrcode-generator mode parameter
    const modeMap = {
      numeric: 'Numeric',
      alphanumeric: 'Alphanumeric',
      byte: 'Byte',
      kanji: 'Kanji',
      auto: undefined,
    };
    const libraryMode = modeMap[encodingMode] || undefined;

    qr.addData(config.content, libraryMode);

    // Get mask pattern from config
    const maskPattern =
      typeof maskPatternConfig === 'number' && maskPatternConfig >= 0 && maskPatternConfig <= 7
        ? maskPatternConfig
        : undefined;

    qr.make(maskPattern);
    const moduleCount = qr.getModuleCount();

    // Restore stringToBytes to default
    resetStringToBytes();

    // Cache the result
    qrMatrixCache.set(qrCacheKey, { qr, moduleCount });

    return { qr, moduleCount };
  }

  /**
   * Draw finder and alignment patterns
   * @private
   */
  drawStructuralPatterns(
    ctx,
    config,
    moduleCount,
    moduleSize,
    margin,
    overlayData,
    version
  ) {
    const drawnFinderPatterns = new Set();
    const drawnAlignmentPatterns = new Set();

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
        drawFinderPatternComplete(ctx, x, y, moduleSize, config);

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
      const alignPositions = getAlignmentPositions(version, moduleCount);
      for (const pos of alignPositions) {
        const centerX = (pos.col + margin) * moduleSize + moduleSize / 2;
        const centerY = (pos.row + margin) * moduleSize + moduleSize / 2;
        drawAlignmentPattern(ctx, centerX, centerY, moduleSize, alignmentStyle, config);

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

  async generate(config, overlayCanvas = null) {
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
      typeNumber = calculateOptimalVersion(config.content, config.errorCorrection, encodingMode);
    }

    // Apply geometric transforms if needed
    let processedOverlayCanvas = overlayCanvas;
    if (overlayCanvas && hasGeometricTransforms(config)) {
      processedOverlayCanvas = await applyGeometricTransforms(
        overlayCanvas,
        config,
        this.createCanvas.bind(this)
      );
    }

    // =======================================================================
    // STAGE 1: QR MATRIX GENERATION
    // =======================================================================
    const maskPatternConfig = config.maskPattern;
    const characterEncodingConfig = config.characterEncoding || 'default';

    const { qr, moduleCount } = this.buildQRMatrix(
      config,
      typeNumber,
      encodingMode,
      maskPatternConfig,
      characterEncodingConfig
    );

    // =======================================================================
    // UNIFIED SCALED RENDERING (dithered, blue-noise, subpixel modes)
    // =======================================================================
    const scale = getScaleFactor(config.overlayMode, config);
    if (scale > 1 && processedOverlayCanvas) {
      return await generateScaledQR(
        qr,
        config,
        processedOverlayCanvas,
        moduleCount,
        scale,
        this.createCanvas.bind(this),
        this.canvasFactory,
        this.storeMatrix.bind(this)
      );
    }

    // =======================================================================
    // STAGE 2: OVERLAY PROCESSING
    // =======================================================================
    const { ditherPattern, overlayData, effectiveIntensity } = await prepareUnifiedOverlayData(
      qr,
      { ...config, typeNumber },
      processedOverlayCanvas,
      moduleCount,
      this.createCanvas.bind(this)
    );

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
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Draw background
    if (!config.transparentBg) {
      ctx.fillStyle = config.bgColor;
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
      config,
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
      useGradient
    );

    // =======================================================================
    // STAGE 6: FINAL TOUCHES
    // =======================================================================
    // Draw center logo if in center mode
    if (processedOverlayCanvas && config.overlayMode === 'center') {
      drawCenterLogo(ctx, processedOverlayCanvas, size, config.logoSize);
    }

    // Draw frame if configured
    drawFrame(ctx, size, moduleSize, margin, config);

    // Store the QR matrix for vector SVG export
    this.storeMatrix(qr, moduleCount);

    return canvas;
  }
}
