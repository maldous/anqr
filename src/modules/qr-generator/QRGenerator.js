/**
 * QRGenerator Class
 * Main QR code generation class with unified rendering pipeline
 */

import { generateBlueNoiseDithered } from '../blue-noise-dither.ts';
import { blendColors, parseColor } from '../color-utils.ts';
import {
  calculateOptimalVersion,
  generateQR,
  getAlignmentPatternCenters,
  getCompatibleMode,
  isFinderPattern,
  isStructuralModule,
  isTimingPattern,
} from '../qr-core.ts';
import qrcode from '../qrcode.mjs';
import { createShiftJISEncoder } from '../shift-jis-encoder.ts';

import { alignmentCache, qrMatrixCache } from './cache.js';
import { defaultBrowserCanvasFactory } from './canvas-factory.js';
import {
  applyPerModuleColor,
  applyPaletteColor,
  ensureContrast,
} from './color.js';
import {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
  getDiffusionKernel,
} from './dithering.js';
import {
  createGradientFill,
  drawAlignmentPattern,
  drawCenterLogo,
  drawFinderPatternComplete,
  drawFrame,
  drawFrameBackground,
  drawHalftoneModule,
  drawModule,
  drawTimingModule,
} from './drawing.js';
import { isEccSafeToModify } from './ecc.js';
import { preprocessImageData } from './filters.js';
import {
  applyGeometricTransforms,
  generateSubpixelMatrix,
  getOverlayData,
  getSubpixelOverlayData,
  hasGeometricTransforms,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from './overlay.js';
import { createSeededRandom, hashCanvasContent, hashString } from './utils.js';

// Store default stringToBytes function for restoration after UTF-8 encoding
const defaultStringToBytes = (s) => {
  const bytes = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    bytes.push(c & 0xff);
  }
  return bytes;
};

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

  // ============================================
  // UNIFIED PIPELINE HELPERS
  // ============================================

  /**
   * Get the scale factor for a given overlay mode.
   * - Standard modes: scale=1 (module-level rendering)
   * - Dithered/Blue-noise modes: scale=3 (subpixel dithering)
   * - Subpixel modes: scale=2,3,4 (configurable grid)
   * @private
   */
  getScaleFactor(overlayMode, config) {
    switch (overlayMode) {
      case 'dithered':
      case 'blue-noise':
        return 3; // Fixed 3x scale for error diffusion modes
      case 'subpixel':
      case 'subpixel-size': {
        // Configurable NxN grid
        const gridSizeStr = config?.subpixelGridSize || '3x3';
        return Number.parseInt(gridSizeStr.charAt(0), 10) || 3;
      }
      default:
        return 1; // Module-level rendering
    }
  }

  /**
   * UNIFIED PIXEL DECISION MATRIX
   * Generates pixel-level decisions for ALL overlay modes.
   * Returns a unified format that the render loop can use consistently.
   *
   * @returns {Object} { matrix: boolean[][], colors: RGB[][], scale: number, overlayData: brightness[][] }
   */
  async generatePixelDecisionMatrix(qr, config, overlayCanvas, moduleCount) {
    const overlayMode = config.overlayMode;
    const scale = this.getScaleFactor(overlayMode, config);
    const scaledSize = moduleCount * scale;

    // Apply per-ECC intensity limits
    let effectiveIntensity = config.overlayIntensity ?? 100;
    if (config.maxOverlayIntensityByEcc) {
      const eccLimit = config.maxOverlayIntensityByEcc[config.errorCorrection];
      if (eccLimit !== undefined && eccLimit < effectiveIntensity) {
        effectiveIntensity = eccLimit;
      }
    }
    const effectiveConfig = { ...config, overlayIntensity: effectiveIntensity };

    // No overlay - return base QR matrix at requested scale
    if (overlayCanvas === null || overlayCanvas === undefined) {
      const matrix = [];
      const colors = [];
      for (let y = 0; y < scaledSize; y++) {
        matrix[y] = [];
        colors[y] = [];
        for (let x = 0; x < scaledSize; x++) {
          const moduleRow = Math.floor(y / scale);
          const moduleCol = Math.floor(x / scale);
          const isDark = qr.isDark(moduleRow, moduleCol);
          matrix[y][x] = isDark;
          colors[y][x] = isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
        }
      }
      return { matrix, colors, scale, overlayData: null, effectiveIntensity };
    }

    // Route to mode-specific pixel generation
    switch (overlayMode) {
      case 'dithered': {
        // Use error diffusion dithering at 3x scale
        const qrResult = generateQR({
          text: config.content,
          ecc: config.errorCorrection,
          version: config.typeNumber || 0,
          scale,
        });
        const createCanvasFn = this.createCanvas.bind(this);
        const loadImageDataRGBFn = (canvas, size, cfg) =>
          loadImageDataRGB(canvas, size, cfg, createCanvasFn);
        const ditheredResult = await applyDitherToMatrix(
          qrResult.matrix,
          qrResult.moduleCount,
          scale,
          overlayCanvas,
          effectiveIntensity,
          config.colorMode || 'color',
          config.ditherSerpentine !== false,
          effectiveConfig,
          createCanvasFn,
          loadImageDataRGBFn
        );
        return {
          matrix: ditheredResult.matrix,
          colors: ditheredResult.colors,
          scale,
          overlayData: null,
          effectiveIntensity,
        };
      }

      case 'blue-noise': {
        // Use blue noise dithering at 3x scale
        let processedOverlay = overlayCanvas;
        if (hasPreprocessingOptions(config)) {
          processedOverlay = await preprocessOverlay(
            overlayCanvas,
            config,
            this.createCanvas.bind(this)
          );
        }
        const blueNoiseResult = await generateBlueNoiseDithered({
          text: config.content,
          ecc: config.errorCorrection,
          version: config.typeNumber || 0,
          scale,
          overlayCanvas: processedOverlay,
          overlayIntensity: effectiveIntensity,
          colorMode: config.colorMode || 'color',
          canvasFactory: this.canvasFactory,
        });
        return {
          matrix: blueNoiseResult.matrix,
          colors: blueNoiseResult.colors,
          scale,
          overlayData: null,
          effectiveIntensity,
        };
      }

      case 'subpixel':
      case 'subpixel-size': {
        // Generate NxN grid where center=QR data, surrounding=image
        const useHalftoneCenter = overlayMode === 'subpixel-size';
        return await generateSubpixelMatrix(
          qr,
          config,
          overlayCanvas,
          moduleCount,
          scale,
          useHalftoneCenter,
          this.createCanvas.bind(this)
        );
      }

      case 'dither':
      case 'extreme': {
        // True dither at 1x scale - modifies module dark/light state
        const overlayData = await getOverlayData(
          overlayCanvas,
          moduleCount,
          config.colorMode || 'color',
          config.invertImage,
          config.frameIndex || 0,
          effectiveConfig,
          this.createCanvas.bind(this)
        );
        let ditherPattern = null;
        let ditherColors = null;
        const useAdvancedDither =
          config.ditherKind &&
          config.ditherKind !== 'true_dither' &&
          config.ditherKind !== 'error_diffusion';

        if (useAdvancedDither) {
          try {
            const advResult = await applyAdvancedDither(
              overlayCanvas,
              moduleCount,
              effectiveConfig,
              this.createCanvas.bind(this)
            );
            ditherPattern = advResult.matrix;
            ditherColors = advResult.colors;
          } catch (e) {
            console.warn('Advanced dithering failed, falling back to true dither:', e);
            ditherPattern = applyTrueDither(
              qr,
              overlayData,
              effectiveConfig,
              overlayMode === 'extreme',
              isStructuralModule,
              isFinderPattern,
              isEccSafeToModify,
              hashString,
              createSeededRandom
            );
          }
        } else {
          ditherPattern = applyTrueDither(
            qr,
            overlayData,
            effectiveConfig,
            overlayMode === 'extreme',
            isStructuralModule,
            isFinderPattern,
            isEccSafeToModify,
            hashString,
            createSeededRandom
          );
        }
        // Convert to unified format
        const matrix = ditherPattern || [];
        const colors = ditherColors || overlayData.colors || [];
        // Ensure colors is in RGB object format
        const normalizedColors = [];
        for (let y = 0; y < moduleCount; y++) {
          normalizedColors[y] = [];
          for (let x = 0; x < moduleCount; x++) {
            const c = colors[y]?.[x];
            if (c && typeof c === 'object' && 'r' in c) {
              normalizedColors[y][x] = c;
            } else if (c && typeof c === 'string') {
              const parsed = parseColor(c);
              normalizedColors[y][x] = parsed;
            } else {
              normalizedColors[y][x] = matrix[y]?.[x]
                ? { r: 0, g: 0, b: 0 }
                : { r: 255, g: 255, b: 255 };
            }
          }
        }
        return {
          matrix,
          colors: normalizedColors,
          scale: 1,
          overlayData,
          effectiveIntensity,
        };
      }

      default: {
        // Standard modes (blend, halftone, center, etc.) - 1x scale
        // Return base QR matrix with overlay data for per-module effects
        const overlayData = await getOverlayData(
          overlayCanvas,
          moduleCount,
          config.colorMode || 'color',
          config.invertImage,
          config.frameIndex || 0,
          effectiveConfig,
          this.createCanvas.bind(this)
        );
        const matrix = [];
        const colors = [];
        for (let y = 0; y < moduleCount; y++) {
          matrix[y] = [];
          colors[y] = [];
          for (let x = 0; x < moduleCount; x++) {
            const isDark = qr.isDark(y, x);
            matrix[y][x] = isDark;
            const c = overlayData.colors?.[y]?.[x];
            if (c && typeof c === 'string') {
              const parsed = parseColor(c);
              colors[y][x] = parsed;
            } else {
              colors[y][x] = isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
            }
          }
        }
        return {
          matrix,
          colors,
          scale: 1,
          overlayData,
          effectiveIntensity,
        };
      }
    }
  }

  /**
   * UNIFIED OVERLAY PROCESSING
   * Prepares overlay data for ANY overlay mode, returning a unified format
   * that the main render loop can use consistently.
   */
  async prepareUnifiedOverlayData(qr, config, overlayCanvas, moduleCount) {
    if (!overlayCanvas) {
      return { ditherPattern: null, colors: null, overlayData: null, effectiveIntensity: 100 };
    }

    const overlayMode = config.overlayMode;

    // Get base overlay data (brightness + colors) - used by all modes
    const overlayData = await getOverlayData(
      overlayCanvas,
      moduleCount,
      config.colorMode || 'color',
      config.invertImage,
      config.frameIndex || 0,
      config,
      this.createCanvas.bind(this)
    );

    // Apply per-ECC intensity limits
    let effectiveIntensity = config.overlayIntensity ?? 100;
    if (config.maxOverlayIntensityByEcc) {
      const eccLimit = config.maxOverlayIntensityByEcc[config.errorCorrection];
      if (eccLimit !== undefined && eccLimit < effectiveIntensity) {
        effectiveIntensity = eccLimit;
      }
    }
    const effectiveConfig = { ...config, overlayIntensity: effectiveIntensity };

    // For modes that modify module dark/light state, generate dither pattern
    let ditherPattern = null;
    let ditherColors = null;

    if (overlayMode === 'dither' || overlayMode === 'extreme') {
      // Check if advanced dithering params are specified
      const useAdvancedDither =
        config.ditherKind &&
        config.ditherKind !== 'true_dither' &&
        config.ditherKind !== 'error_diffusion';

      if (useAdvancedDither) {
        try {
          const advResult = await applyAdvancedDither(
            overlayCanvas,
            moduleCount,
            effectiveConfig,
            this.createCanvas.bind(this)
          );
          ditherPattern = advResult.matrix;
          ditherColors = advResult.colors;
        } catch (e) {
          console.warn('Advanced dithering failed, falling back to true dither:', e);
          ditherPattern = applyTrueDither(
            qr,
            overlayData,
            effectiveConfig,
            overlayMode === 'extreme',
            isStructuralModule,
            isFinderPattern,
            isEccSafeToModify,
            hashString,
            createSeededRandom
          );
        }
      } else {
        ditherPattern = applyTrueDither(
          qr,
          overlayData,
          effectiveConfig,
          overlayMode === 'extreme',
          isStructuralModule,
          isFinderPattern,
          isEccSafeToModify,
          hashString,
          createSeededRandom
        );
      }
    }

    return {
      ditherPattern,
      colors: ditherColors || overlayData.colors,
      overlayData,
      effectiveIntensity,
    };
  }

  /**
   * UNIFIED SCALED QR GENERATION
   * Handles ALL scaled overlay modes (dithered, blue-noise, subpixel, subpixel-size)
   * through a single code path with ALL settings applied uniformly.
   */
  async generateScaledQR(qr, config, overlayCanvas, moduleCount, scale) {
    // Get pixel decision matrix (unified for all scaled modes)
    const pixelData = await this.generatePixelDecisionMatrix(
      qr,
      config,
      overlayCanvas,
      moduleCount
    );
    const { matrix, colors } = pixelData;
    const scaledSize = matrix.length;

    // UNIFIED: Apply quietZoneMinEnforce setting
    const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
    const marginModules = Math.max(quietZoneMin, config.margin);

    // Calculate pixel size
    const subPixelSize = Math.max(1, Math.round(config.moduleSize / scale));
    const effectiveModuleSize = subPixelSize * scale;

    // UNIFIED: Apply frame settings
    const frameExtra =
      config.frameStyle && config.frameStyle !== 'none' && config.frameText
        ? effectiveModuleSize * 4
        : 0;
    const marginPx = marginModules * effectiveModuleSize;
    const size = scaledSize * subPixelSize + marginPx * 2 + frameExtra;

    const canvas = await this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Draw background
    if (!config.transparentBg) {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw frame background (sticker) BEFORE QR modules so it appears behind
    drawFrameBackground(ctx, size, effectiveModuleSize, marginModules, config);

    // UNIFIED: Create gradient fill if configured
    const gradientFill = createGradientFill(ctx, config, size);
    const useGradient = config.gradient && config.gradient.type !== 'none';

    // Determine color rendering mode
    const useColorRendering = overlayCanvas && config.colorMode !== 'bw';

    // Render all pixels
    for (let y = 0; y < scaledSize; y++) {
      for (let x = 0; x < scaledSize; x++) {
        const isDark = matrix[y]?.[x];
        const color = colors[y]?.[x];

        // Skip light pixels unless doing color rendering
        if (!(isDark || useColorRendering)) continue;

        const dx = marginPx + x * subPixelSize;
        const dy = marginPx + y * subPixelSize;

        if (useColorRendering && color) {
          // Check for halftone rendering flag
          if (color.halftone && isDark) {
            // Draw halftone dot
            ctx.fillStyle = config.bgColor;
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
            ctx.fillStyle = useGradient ? gradientFill : config.fgColor;
            const dotSize = subPixelSize * (color.sizeRatio || 1);
            const offset = (subPixelSize - dotSize) / 2;
            ctx.fillRect(dx + offset, dy + offset, dotSize, dotSize);
          } else {
            // Use the actual color from pixel data
            ctx.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
            ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
          }
        } else if (isDark) {
          // B&W mode: use foreground color (with optional gradient)
          ctx.fillStyle = useGradient ? gradientFill : config.fgColor;
          ctx.fillRect(dx, dy, subPixelSize, subPixelSize);
        }
      }
    }

    // UNIFIED: Draw styled finder patterns on top of pixel rendering
    // Only draw finders separately if preserveFinders is true OR there's no overlay
    // When preserveFinders=false with overlay, finder modules were already rendered with overlay effects
    const shouldDrawFindersFirst = config.preserveFinders !== false || !overlayCanvas;

    const finderPositions = [
      { row: 0, col: 0 }, // Top-left
      { row: 0, col: moduleCount - 7 }, // Top-right
      { row: moduleCount - 7, col: 0 }, // Bottom-left
    ];

    if (shouldDrawFindersFirst) {
      for (const pos of finderPositions) {
        // Position is in module coordinates, convert to pixels
        const x = marginPx + pos.col * effectiveModuleSize;
        const y = marginPx + pos.row * effectiveModuleSize;
        drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, config);
      }
    }

    // UNIFIED: Draw styled alignment patterns (for version 2+)
    // Note: moduleCount is the base QR module count (not scaled)
    const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);
    if (version >= 2) {
      const alignPositions = this.getAlignmentPositions(version, moduleCount);
      const alignmentStyle = config.alignmentStyle || 'match_finder';
      for (const pos of alignPositions) {
        // pos.row/col is the CENTER module of the alignment pattern
        // Convert to pixel center position
        const centerX = marginPx + (pos.col + 0.5) * effectiveModuleSize;
        const centerY = marginPx + (pos.row + 0.5) * effectiveModuleSize;
        drawAlignmentPattern(
          ctx,
          centerX,
          centerY,
          effectiveModuleSize,
          alignmentStyle,
          config
        );
      }
    }

    // UNIFIED: Draw frame if configured
    drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

    // Store the QR matrix for vector SVG export
    const syntheticQr = {
      isDark: (row, col) => {
        const subRow = row * scale + Math.floor(scale / 2);
        const subCol = col * scale + Math.floor(scale / 2);
        return matrix[subRow]?.[subCol] ?? false;
      },
    };
    this.storeMatrix(syntheticQr, moduleCount);

    return canvas;
  }

  /**
   * Check if a module is part of format information area
   */
  isFormatInfo(row, col, moduleCount) {
    // Format info is around finder patterns
    // Horizontal: row 8, cols 0-8 and moduleCount-8 to moduleCount-1
    // Vertical: col 8, rows 0-8 and moduleCount-7 to moduleCount-1
    if (row === 8 && (col <= 8 || col >= moduleCount - 8)) return true;
    if (col === 8 && (row <= 8 || row >= moduleCount - 7)) return true;
    return false;
  }

  /**
   * Check if a module is part of version information area (version 7+)
   */
  isVersionInfo(row, col, moduleCount, version) {
    if (version < 7) return false;
    // Version info is in two 6x3 blocks
    // Bottom-left: rows moduleCount-11 to moduleCount-9, cols 0-5
    // Top-right: rows 0-5, cols moduleCount-11 to moduleCount-9
    if (row >= moduleCount - 11 && row <= moduleCount - 9 && col <= 5) return true;
    if (col >= moduleCount - 11 && col <= moduleCount - 9 && row <= 5) return true;
    return false;
  }

  /**
   * Get alignment pattern positions with caching
   * Uses qr-core's getAlignmentPatternCenters but adds caching layer
   */
  getAlignmentPositions(version, moduleCount) {
    if (version < 2) return [];

    // Check cache first (called multiple times per render)
    const cacheKey = `${version}:${moduleCount}`;
    const cached = alignmentCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Get positions from qr-core
    const positions = getAlignmentPatternCenters(version, moduleCount);

    // Cache the result
    alignmentCache.set(cacheKey, positions);
    return positions;
  }

  async generate(config, overlayCanvas = null) {
    if (!this.qrcode) {
      await this.loadLibrary();
    }

    // Get encoding mode early (needed for version calculation)
    // CRITICAL: Validate that content is compatible with the selected mode.
    // If user selected 'numeric' but content has letters, we must fall back
    // to a compatible mode to avoid "illegal char" errors from the library.
    let encodingMode = config.encodingMode || 'auto';
    const content = config.content || '';

    // Use getCompatibleMode which handles both auto-detection AND validation
    // This prevents crashes when user selects numeric/alphanumeric with incompatible content
    encodingMode = getCompatibleMode(content, encodingMode);

    // Auto-detect best version if set to 0
    let typeNumber = config.typeNumber;
    if (typeNumber === 0) {
      typeNumber = calculateOptimalVersion(config.content, config.errorCorrection, encodingMode);
    }

    // NOTE: Preprocessing is now done at moduleCount resolution inside _getOverlayData
    // This provides 10-50x speedup. Skip full-res preprocessing entirely.
    // Only geometric transforms (rotation, flip) are done at full res if needed.
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
    // All overlay modes now go through the same QR generation path
    // =======================================================================

    // Note: Dithered/blue-noise modes use 3x scale and subpixel modes use NxN grid rendering
    // These are handled by the getScaleFactor() and generateScaledQR() methods below

    // Build cache key for QR matrix reuse (avoids expensive qr.make() on every frame)
    // Get mask pattern and character encoding for cache key and generation
    const maskPatternConfig = config.maskPattern;
    const characterEncodingConfig = config.characterEncoding || 'default';
    const qrCacheKey = `${config.content}:${config.errorCorrection}:${typeNumber}:${encodingMode}:${maskPatternConfig}:${characterEncodingConfig}`;

    // Check cache for existing QR matrix
    let qr;
    let moduleCount;
    const cachedQr = qrMatrixCache.get(qrCacheKey);

    if (cachedQr) {
      // Reuse cached QR object
      qr = cachedQr.qr;
      moduleCount = cachedQr.moduleCount;
    } else {
      // Build new QR matrix
      qr = this.qrcode(typeNumber, config.errorCorrection);

      // Handle character encoding (ECI - Extended Channel Interpretation)
      // Set the stringToBytes function based on characterEncoding config
      // NOTE: We restore stringToBytes to default after generation to avoid affecting other QR codes
      if (characterEncodingConfig === 'utf8') {
        // UTF-8 encoding - handles full Unicode
        qrcode.stringToBytes = (s) => {
          const encoder = new TextEncoder(); // UTF-8 by default
          return Array.from(encoder.encode(s));
        };
      } else if (characterEncodingConfig === 'shift-jis') {
        // Full Shift-JIS encoding for Japanese text
        // Supports hiragana, katakana, kanji, punctuation, and full-width characters
        qrcode.stringToBytes = createShiftJISEncoder();
      } else {
        // Default: ISO-8859-1 (Latin-1) - QR code default encoding
        qrcode.stringToBytes = defaultStringToBytes;
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

      // Get mask pattern from config ('auto' or 0-7)
      // If 'auto' or undefined, pass undefined to let library auto-select best pattern
      const maskPattern =
        typeof maskPatternConfig === 'number' && maskPatternConfig >= 0 && maskPatternConfig <= 7
          ? maskPatternConfig
          : undefined; // Let library auto-select

      qr.make(maskPattern);
      moduleCount = qr.getModuleCount();

      // Restore stringToBytes to default after generation to avoid affecting other QR codes
      qrcode.stringToBytes = defaultStringToBytes;

      // Cache the result
      qrMatrixCache.set(qrCacheKey, { qr, moduleCount });
    }

    // =======================================================================
    // UNIFIED SCALED RENDERING (dithered, blue-noise, subpixel modes)
    // All scaled modes now go through the unified pipeline
    // =======================================================================
    const scale = this.getScaleFactor(config.overlayMode, config);
    if (scale > 1 && processedOverlayCanvas) {
      return await this.generateScaledQR(qr, config, processedOverlayCanvas, moduleCount, scale);
    }

    // =======================================================================
    // STAGE 2: OVERLAY PROCESSING (unified for all standard modes)
    // =======================================================================
    const { ditherPattern, overlayData, effectiveIntensity } = await this.prepareUnifiedOverlayData(
      qr,
      { ...config, typeNumber },
      processedOverlayCanvas,
      moduleCount
    );

    // =======================================================================
    // STAGE 3: UNIFIED RENDERING (all settings apply to ALL modes)
    // =======================================================================
    const moduleSize = config.moduleSize;
    // Apply quiet zone minimum enforcement if enabled (QR spec recommends 4 modules)
    const quietZoneMin = config.quietZoneMinEnforce === false ? 0 : 4;
    const margin = Math.max(config.margin, quietZoneMin);
    const frameExtra =
      config.frameStyle && config.frameStyle !== 'none' && config.frameText ? moduleSize * 4 : 0;
    const size = moduleCount * moduleSize + margin * 2 * moduleSize + frameExtra;

    const canvas = await this.createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Keep edges crisp (critical for QR scanning)
    ctx.imageSmoothingEnabled = false;

    // Draw background
    if (!config.transparentBg) {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Draw frame background (sticker) BEFORE QR modules so it appears behind
    drawFrameBackground(ctx, size, moduleSize, margin, config);

    // NOTE: Overlay data is now prepared in prepareUnifiedOverlayData above
    // effectiveIntensity, ditherPattern, overlayColors, and overlayData are already available

    // Get version for alignment pattern detection
    const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

    // Create gradient fill if configured
    const gradientFill = createGradientFill(ctx, config, size);
    const useGradient = config.gradient && config.gradient.type !== 'none';

    // Render options
    const cornerRadius = config.cornerRadius || 0;
    const dotRotation = config.dotRotationDeg || 0;
    const alignmentStyle = config.alignmentStyle || 'match_finder';
    const timingStyle = config.timingStyle || 'match_module';

    // Track drawn finder patterns to avoid double-drawing
    const drawnFinderPatterns = new Set();
    const drawnAlignmentPatterns = new Set();

    // Draw complete finder patterns first (eyes)
    // Only draw finder patterns separately if preserveFinders is true OR there's no overlay
    // When preserveFinders=false with overlay, finder modules go through the normal render loop
    // so overlay effects can be applied to them
    const shouldDrawFindersFirst = config.preserveFinders !== false || !overlayData;

    const finderPositions = [
      { row: 0, col: 0 }, // Top-left
      { row: 0, col: moduleCount - 7 }, // Top-right
      { row: moduleCount - 7, col: 0 }, // Bottom-left
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
    // Only draw alignment patterns separately if preserveAlignment is true OR there's no overlay
    const shouldDrawAlignmentFirst = config.preserveAlignment !== false || !overlayData;

    if (version >= 2 && shouldDrawAlignmentFirst) {
      const alignPositions = this.getAlignmentPositions(version, moduleCount);
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

    // Draw QR modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip if this module is part of a finder pattern (already drawn)
        if (drawnFinderPatterns.has(`${row},${col}`)) continue;

        // Skip if this module is part of an alignment pattern (already drawn)
        if (drawnAlignmentPatterns.has(`${row},${col}`)) continue;

        // Use dithered pattern if available, otherwise use original QR
        const isDark = ditherPattern ? ditherPattern[row][col] : qr.isDark(row, col);
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;

        const isFinder = isFinderPattern(row, col, moduleCount);
        const isTiming = isTimingPattern(row, col, moduleCount);
        const isFormatInfo = this.isFormatInfo(row, col, moduleCount);
        const isVersionInfo = this.isVersionInfo(row, col, moduleCount, version);
        // Note: alignment pattern modules are already skipped via drawnAlignmentPatterns set
        const isInAlignmentSet = drawnAlignmentPatterns.has(`${row},${col}`);

        // Protection settings
        const protectFormat = config.protectFormatInfo;
        const protectVersion = config.protectVersionInfo;

        const applyOverlay =
          overlayData &&
          !(config.preserveFinders && isFinder) &&
          !(config.preserveTiming && isTiming) &&
          !(config.preserveAlignment && isInAlignmentSet) &&
          !(protectFormat && isFormatInfo) &&
          !(protectVersion && isVersionInfo);

        let moduleColor = isDark ? config.fgColor : config.bgColor;
        let moduleSizeModifier = 1;
        let moduleOpacity = 1;
        let waveOffsetX = 0;
        let waveOffsetY = 0;
        let drawOutlineOnly = false;
        let useHalftoneRendering = false;
        let halftoneBrightness = 0.5;

        // For mosaic mode, we draw both dark and white cells
        let shouldDrawCell = isDark;

        if (applyOverlay) {
          const brightness = overlayData[row][col];

          switch (config.overlayMode) {
            case 'halftone':
              if (isDark) {
                // Use halftone params if available
                if (config.halftoneCell || config.halftoneDotShape || config.brightnessCurve) {
                  // Store brightness for halftone rendering - will be handled specially below
                  useHalftoneRendering = true;
                  halftoneBrightness = brightness;
                } else {
                  // Legacy halftone behavior
                  const intensity = effectiveIntensity / 100;
                  const minSize = 0.3;
                  const maxSize = 1;
                  moduleSizeModifier =
                    minSize +
                    (1 - brightness) * (maxSize - minSize) * intensity +
                    ((1 - intensity) * (maxSize - minSize)) / 2;
                }
              }
              break;

            case 'blend':
              if (isDark) {
                const blendColor = overlayData.colors?.[row]?.[col];
                if (blendColor) {
                  const blendAmount = effectiveIntensity / 100;
                  moduleColor = blendColors(config.fgColor, blendColor, blendAmount);
                }
              }
              break;

            case 'brightness':
              if (isDark) {
                const threshold = (100 - effectiveIntensity) / 100;
                if (brightness > threshold) {
                  moduleOpacity = 0;
                }
              }
              break;

            case 'gapfill':
              // Fill white spaces with faded image colors
              if (isDark) {
                moduleColor = config.fgColor;
              } else {
                // Draw white spaces with faded image color
                const gapColor = overlayData.colors?.[row]?.[col];
                if (gapColor) {
                  const fadeAmount = (config.overlayIntensity / 100) * 0.4; // Max 40% opacity
                  moduleColor = blendColors(config.bgColor, gapColor, fadeAmount);
                  shouldDrawCell = true;
                }
              }
              break;

            case 'pixelate':
              // True pixelation - 3x3 blocks get same averaged color for chunky pixel look
              if (isDark) {
                const blockSize = 3;
                const blockRow = Math.floor(row / blockSize) * blockSize;
                const blockCol = Math.floor(col / blockSize) * blockSize;
                let avgR = 0,
                  avgG = 0,
                  avgB = 0,
                  pixCount = 0;
                for (let br = 0; br < blockSize && blockRow + br < moduleCount; br++) {
                  for (let bc = 0; bc < blockSize && blockCol + bc < moduleCount; bc++) {
                    const c = overlayData.colors?.[blockRow + br]?.[blockCol + bc];
                    if (c) {
                      const parsed = parseColor(c);
                      avgR += parsed.r;
                      avgG += parsed.g;
                      avgB += parsed.b;
                      pixCount++;
                    }
                  }
                }
                if (pixCount > 0) {
                  avgR = Math.round(avgR / pixCount);
                  avgG = Math.round(avgG / pixCount);
                  avgB = Math.round(avgB / pixCount);
                  const blockColor = `rgb(${avgR},${avgG},${avgB})`;
                  const pixBlendAmt = config.overlayIntensity / 100;
                  moduleColor = blendColors(config.fgColor, blockColor, pixBlendAmt);
                }
              }
              break;

            case 'duotone':
              if (isDark) {
                // duotoneColors is an array [shadowColor, highlightColor] from the store
                const duotoneArr = config.duotoneColors || [];
                const shadowColor = duotoneArr[0] || config.fgColor;
                const highlightColor = duotoneArr[1] || null;
                const intensity = config.overlayIntensity / 100;

                if (brightness > 0.5 && highlightColor) {
                  // Bright areas get highlight color
                  moduleColor = blendColors(
                    config.fgColor,
                    highlightColor,
                    intensity * (brightness - 0.5) * 2
                  );
                } else if (brightness > 0.5) {
                  // Fallback: lighten the foreground color
                  const fgParsed = parseColor(config.fgColor);
                  const lightR = Math.min(255, fgParsed.r + 80);
                  const lightG = Math.min(255, fgParsed.g + 80);
                  const lightB = Math.min(255, fgParsed.b + 80);
                  moduleColor = `rgb(${lightR},${lightG},${lightB})`;
                } else {
                  // Dark areas get shadow color
                  moduleColor = blendColors(
                    config.fgColor,
                    shadowColor,
                    intensity * (0.5 - brightness) * 2
                  );
                }
              }
              break;

            case 'outline':
              if (isDark) {
                drawOutlineOnly = true;
                const outlineColor = overlayData.colors?.[row]?.[col];
                if (outlineColor) {
                  const outlineBlend = config.overlayIntensity / 100;
                  moduleColor = blendColors(config.fgColor, outlineColor, outlineBlend);
                }
              }
              break;

            case 'wave':
              if (isDark) {
                const waveAmt = (1 - brightness) * (config.overlayIntensity / 100) * 3;
                waveOffsetX = Math.sin(row * 0.5) * waveAmt;
                waveOffsetY = Math.cos(col * 0.5) * waveAmt;
              }
              break;

            case 'mosaic': {
              // Mosaic fills EVERY cell with image colors - reveals full image
              // Dark modules get actual color, white spaces get lighter version
              shouldDrawCell = true; // Draw all cells
              const mosaicColor = overlayData.colors?.[row]?.[col];
              if (mosaicColor) {
                const intensity = effectiveIntensity / 100;
                if (isDark) {
                  // Dark cells get the actual image color (darkened slightly to maintain QR readability)
                  const parsed = parseColor(mosaicColor);
                  const darkFactor = 0.7;
                  moduleColor = `rgb(${Math.round(parsed.r * darkFactor)},${Math.round(parsed.g * darkFactor)},${Math.round(parsed.b * darkFactor)})`;
                } else {
                  // White cells get a lighter/brighter version of the image color
                  const parsed = parseColor(mosaicColor);
                  const lightFactor = 0.4 + (1 - intensity) * 0.4;
                  const lightR = Math.round(255 - (255 - parsed.r) * lightFactor);
                  const lightG = Math.round(255 - (255 - parsed.g) * lightFactor);
                  const lightB = Math.round(255 - (255 - parsed.b) * lightFactor);
                  moduleColor = `rgb(${lightR},${lightG},${lightB})`;
                }
              }
              break;
            }
          }
        }

        if (shouldDrawCell && moduleOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = moduleOpacity;

          // Apply per-module color mode
          let finalModuleColor = moduleColor;
          if (
            isDark &&
            config.perModuleColorMode &&
            config.perModuleColorMode !== 'solid' &&
            overlayData
          ) {
            finalModuleColor = applyPerModuleColor(
              config.perModuleColorMode,
              moduleColor,
              overlayData,
              row,
              col,
              moduleCount,
              config
            );
          }

          // Apply palette coloring if palette is provided
          const paletteBrightness = overlayData?.[row]?.[col] ?? 0.5;
          if (isDark && config.palette && config.palette.length > 0) {
            finalModuleColor = applyPaletteColor(
              row,
              col,
              moduleCount,
              paletteBrightness,
              config.palette,
              config
            );
          }

          // Apply contrast guard if enabled
          if (isDark && config.contrastGuard && config.minContrastRatio) {
            finalModuleColor = ensureContrast(
              finalModuleColor,
              config.bgColor,
              config.minContrastRatio
            );
          }

          // Note: colorCycle is now applied as post-processing in useQRGenerator.ts
          // using the applyColorCycle function from animation.ts for better results

          // Use gradient for dark modules if configured, otherwise use module color
          if (isDark && useGradient) {
            ctx.fillStyle = gradientFill;
          } else {
            ctx.fillStyle = finalModuleColor;
          }

          let gap = config.moduleGap ? (moduleSize * config.moduleGap) / 100 : 0;

          // Apply gap mode
          const gapMode = config.gapMode || 'none';
          let strokeWidth = 0;
          if (gapMode === 'inset') {
            // Inset mode: gap is applied as inset
            gap = Math.max(gap, moduleSize * 0.1);
          } else if (gapMode === 'stroke') {
            // Stroke mode: draw outline instead of fill
            strokeWidth = Math.max(1, moduleSize * 0.15);
            gap = strokeWidth;
          } else if (gapMode === 'negative_space') {
            // Negative space: larger gaps for artistic effect
            gap = Math.max(gap, moduleSize * 0.2);
          }

          const adjustedSize = (moduleSize - gap) * moduleSizeModifier;
          const offset = (moduleSize - adjustedSize) / 2;

          let drawX = x + offset + waveOffsetX;
          let drawY = y + offset + waveOffsetY;

          // Apply module jitter if configured (for animation effects)
          if (config.moduleJitterPx && config.moduleJitterPx > 0) {
            // Use deterministic jitter based on row, col, and frame index for consistency
            const jitterSeed = (row * 31 + col * 17 + (config.frameIndex || 0) * 13) % 1000;
            const jitterX = ((jitterSeed % 100) / 100 - 0.5) * 2 * config.moduleJitterPx;
            const jitterY = (((jitterSeed * 7) % 100) / 100 - 0.5) * 2 * config.moduleJitterPx;
            drawX += jitterX;
            drawY += jitterY;
          }

          // Apply pixel snap if configured
          const pixelSnap = config.pixelSnap || 'floor';
          if (pixelSnap === 'floor') {
            drawX = Math.floor(drawX);
            drawY = Math.floor(drawY);
          } else if (pixelSnap === 'round') {
            drawX = Math.round(drawX);
            drawY = Math.round(drawY);
          } else if (pixelSnap === 'ceil') {
            drawX = Math.ceil(drawX);
            drawY = Math.ceil(drawY);
          }

          if (drawOutlineOnly || (gapMode === 'stroke' && isDark)) {
            ctx.strokeStyle = finalModuleColor;
            ctx.lineWidth = strokeWidth || 1;
            ctx.strokeRect(
              drawX + ctx.lineWidth / 2,
              drawY + ctx.lineWidth / 2,
              adjustedSize - ctx.lineWidth,
              adjustedSize - ctx.lineWidth
            );
          } else if (useHalftoneRendering && isDark) {
            // Use advanced halftone rendering with htDot/htCurve params
            drawHalftoneModule(ctx, drawX, drawY, adjustedSize, halftoneBrightness, config);
          } else if (isTiming) {
            // Draw timing pattern module with timing style
            drawTimingModule(ctx, drawX, drawY, adjustedSize, timingStyle, config);
          } else {
            drawModule(ctx, drawX, drawY, adjustedSize, config.moduleStyle, {
              cornerRadius,
              rotation: dotRotation,
            });
          }

          ctx.restore();
        }
      }
    }

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
