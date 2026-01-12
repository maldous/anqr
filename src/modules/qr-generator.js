import { generateBlueNoiseDithered } from './blue-noise-dither.ts';
import { blendColors, parseColor } from './color-utils.ts';
import { applyDither } from './dither-algorithms.ts';
import {
  calculateOptimalVersion,
  generateQR,
  getAlignmentPatternCenters,
  getCompatibleMode,
  isData,
  isFinderPattern,
  isLocked,
  isStructuralModule,
  isTimingPattern,
} from './qr-core.ts';
import qrcode from './qrcode.mjs';
import { createShiftJISEncoder } from './shift-jis-encoder.ts';

// Store default stringToBytes function for restoration after UTF-8 encoding
const defaultStringToBytes = (s) => {
  const bytes = [];
  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i);
    bytes.push(c & 0xff);
  }
  return bytes;
};

// ============================================
// MEMOIZATION CACHES
// ============================================

/**
 * LRU-style cache with max size limit
 * Used for memoizing expensive computations
 */
class MemoCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    // Delete if exists to update order
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

// Global caches for expensive operations
const alignmentCache = new MemoCache(50); // For getAlignmentPositions
const overlayDataCache = new MemoCache(20); // For overlay data
const qrMatrixCache = new MemoCache(30); // For QR matrix (content+ecc+version+encodingMode)

// WeakMap for canvas hash caching (avoids re-hashing same canvas)
const canvasHashCache = new WeakMap();

/**
 * Clear all QR generator caches
 * Useful for testing or memory management
 */
export function clearQRCaches() {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}

/**
 * Calculate contrast ratio between two colors (WCAG formula)
 * @param {string} color1 - First color (hex or rgb)
 * @param {string} color2 - Second color (hex or rgb)
 * @returns {number} Contrast ratio (1 to 21)
 */
function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const parsed = parseColor(color);
    const [r, g, b] = [parsed.r, parsed.g, parsed.b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Canvas factory interface for environment-agnostic canvas creation.
 * Allows QRGenerator to work in both browser and Node.js (Netlify functions).
 *
 * @typedef {Object} CanvasFactory
 * @property {function(number, number): Promise<HTMLCanvasElement|object>} createCanvas - Creates a canvas with given width/height
 * @property {function(string): Promise<HTMLImageElement|object>} [loadImage] - Optional: loads an image from URL/buffer
 */

/**
 * Default browser canvas factory - uses DOM APIs
 * Exported for reference/extension by custom factories
 */
export const defaultBrowserCanvasFactory = {
  createCanvas: (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return Promise.resolve(canvas);
  },
  loadImage: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (_e) => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },
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
        const ditheredResult = await this.applyDitherToMatrix(
          qrResult.matrix,
          qrResult.moduleCount,
          scale,
          overlayCanvas,
          effectiveIntensity,
          config.colorMode || 'color',
          config.ditherSerpentine !== false,
          effectiveConfig
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
        if (this.hasPreprocessingOptions(config)) {
          processedOverlay = await this.preprocessOverlay(overlayCanvas, config);
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
        return await this.generateSubpixelMatrix(
          qr,
          config,
          overlayCanvas,
          moduleCount,
          scale,
          useHalftoneCenter
        );
      }

      case 'dither':
      case 'extreme': {
        // True dither at 1x scale - modifies module dark/light state
        const overlayData = await this.getOverlayData(
          overlayCanvas,
          moduleCount,
          config.colorMode || 'color',
          config.invertImage,
          config.frameIndex || 0,
          effectiveConfig
        );
        let ditherPattern = null;
        let ditherColors = null;
        const useAdvancedDither =
          config.ditherKind &&
          config.ditherKind !== 'true_dither' &&
          config.ditherKind !== 'error_diffusion';

        if (useAdvancedDither) {
          try {
            const advResult = await this.applyAdvancedDither(
              overlayCanvas,
              moduleCount,
              effectiveConfig
            );
            ditherPattern = advResult.matrix;
            ditherColors = advResult.colors;
          } catch (e) {
            console.warn('Advanced dithering failed, falling back to true dither:', e);
            ditherPattern = this.applyTrueDither(
              qr,
              overlayData,
              effectiveConfig,
              overlayMode === 'extreme'
            );
          }
        } else {
          ditherPattern = this.applyTrueDither(
            qr,
            overlayData,
            effectiveConfig,
            overlayMode === 'extreme'
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
        const overlayData = await this.getOverlayData(
          overlayCanvas,
          moduleCount,
          config.colorMode || 'color',
          config.invertImage,
          config.frameIndex || 0,
          effectiveConfig
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
    const overlayData = await this.getOverlayData(
      overlayCanvas,
      moduleCount,
      config.colorMode || 'color',
      config.invertImage,
      config.frameIndex || 0,
      config
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
          const advResult = await this.applyAdvancedDither(
            overlayCanvas,
            moduleCount,
            effectiveConfig
          );
          ditherPattern = advResult.matrix;
          ditherColors = advResult.colors;
        } catch (e) {
          console.warn('Advanced dithering failed, falling back to true dither:', e);
          ditherPattern = this.applyTrueDither(
            qr,
            overlayData,
            effectiveConfig,
            overlayMode === 'extreme'
          );
        }
      } else {
        ditherPattern = this.applyTrueDither(
          qr,
          overlayData,
          effectiveConfig,
          overlayMode === 'extreme'
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

    // UNIFIED: Create gradient fill if configured
    const gradientFill = this.createGradientFill(ctx, config, size);
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
        this.drawFinderPatternComplete(ctx, x, y, effectiveModuleSize, config);
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
        this.drawAlignmentPattern(
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
    this.drawFrame(ctx, size, effectiveModuleSize, marginModules, config);

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
   * Generate subpixel matrix for subpixel/subpixel-size modes.
   * Each module becomes NxN pixels where center=QR data, surrounding=image.
   * @private
   */
  async generateSubpixelMatrix(
    qr,
    config,
    overlayCanvas,
    moduleCount,
    scale,
    useHalftoneCenter = false
  ) {
    const scaledSize = moduleCount * scale;
    const matrix = [];
    const colors = [];

    // Get overlay data at scaled resolution
    const overlayData = await this.getSubpixelOverlayData(
      overlayCanvas,
      scaledSize,
      config.colorMode || 'color',
      config
    );
    // Also get per-module brightness for halftone center
    const moduleBrightness = await this.getOverlayData(
      overlayCanvas,
      moduleCount,
      'color',
      false,
      config.frameIndex || 0
    );

    const intensity = (config.overlayIntensity ?? 100) / 100;
    const centerIdx = Math.floor(scale / 2);
    const centerRule = config.subpixelCenterRule || 'strict';
    const finderOverride = config.subpixelFinderOverride || 'solid';
    const neutralColor = config.subpixelNeutralColor || '#808080';
    const neutralParsed = parseColor(neutralColor);

    for (let moduleRow = 0; moduleRow < moduleCount; moduleRow++) {
      for (let moduleCol = 0; moduleCol < moduleCount; moduleCol++) {
        const isDark = qr.isDark(moduleRow, moduleCol);
        const isFinder = isFinderPattern(moduleRow, moduleCol, moduleCount);

        for (let subRow = 0; subRow < scale; subRow++) {
          for (let subCol = 0; subCol < scale; subCol++) {
            const y = moduleRow * scale + subRow;
            const x = moduleCol * scale + subCol;

            if (!matrix[y]) {
              matrix[y] = [];
              colors[y] = [];
            }

            // For finder patterns with solid override, fill entire block
            if (isFinder && finderOverride === 'solid') {
              matrix[y][x] = isDark;
              colors[y][x] = isDark ? parseColor(config.fgColor) : parseColor(config.bgColor);
              continue;
            }

            const isCenter = subRow === centerIdx && subCol === centerIdx;

            if (isCenter) {
              // CENTER pixel - MUST show QR data for scannability
              const useHalftone = useHalftoneCenter || centerRule === 'halftone_center';
              if (useHalftone && isDark) {
                // Halftone center uses brightness to vary appearance
                const brightness = moduleBrightness[moduleRow]?.[moduleCol] ?? 0.5;
                const minSize = 0.4;
                const maxSize = 1;
                const sizeRatio = minSize + (1 - brightness) * (maxSize - minSize) * intensity;
                // For the matrix, we still mark it as dark
                matrix[y][x] = true;
                // Store a flag in color for halftone rendering
                colors[y][x] = {
                  r: 0,
                  g: 0,
                  b: 0,
                  halftone: true,
                  sizeRatio,
                };
              } else {
                matrix[y][x] = isDark;
                colors[y][x] = isDark ? parseColor(config.fgColor) : parseColor(config.bgColor);
              }
            } else {
              // SURROUNDING pixels - show overlay image
              const overlayColor = overlayData.colors?.[y]?.[x];
              if (overlayColor && intensity > 0) {
                let parsed;
                if (typeof overlayColor === 'string') {
                  parsed = parseColor(overlayColor);
                } else {
                  parsed = overlayColor;
                }
                if (intensity >= 1) {
                  matrix[y][x] = parsed.r * 0.299 + parsed.g * 0.587 + parsed.b * 0.114 < 128;
                  colors[y][x] = parsed;
                } else {
                  // Blend with neutral
                  const blended = {
                    r: Math.round(neutralParsed.r + (parsed.r - neutralParsed.r) * intensity),
                    g: Math.round(neutralParsed.g + (parsed.g - neutralParsed.g) * intensity),
                    b: Math.round(neutralParsed.b + (parsed.b - neutralParsed.b) * intensity),
                  };
                  matrix[y][x] = blended.r * 0.299 + blended.g * 0.587 + blended.b * 0.114 < 128;
                  colors[y][x] = blended;
                }
              } else if (isDark) {
                // No overlay - show based on QR pattern with reduced contrast
                const darkened = {
                  r: Math.round(neutralParsed.r * 0.5),
                  g: Math.round(neutralParsed.g * 0.5),
                  b: Math.round(neutralParsed.b * 0.5),
                };
                matrix[y][x] = true;
                colors[y][x] = darkened;
              } else {
                const lightened = {
                  r: Math.round(255 - (255 - neutralParsed.r) * 0.5),
                  g: Math.round(255 - (255 - neutralParsed.g) * 0.5),
                  b: Math.round(255 - (255 - neutralParsed.b) * 0.5),
                };
                matrix[y][x] = false;
                colors[y][x] = lightened;
              }
            }
          }
        }
      }
    }

    return {
      matrix,
      colors,
      scale,
      overlayData: moduleBrightness,
      effectiveIntensity: intensity * 100,
    };
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
    if (overlayCanvas && this.hasGeometricTransforms(config)) {
      processedOverlayCanvas = await this.applyGeometricTransforms(overlayCanvas, config);
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

    // NOTE: Overlay data is now prepared in prepareUnifiedOverlayData above
    // effectiveIntensity, ditherPattern, overlayColors, and overlayData are already available

    // Get version for alignment pattern detection
    const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

    // Create gradient fill if configured
    const gradientFill = this.createGradientFill(ctx, config, size);
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
        this.drawFinderPatternComplete(ctx, x, y, moduleSize, config);

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
        this.drawAlignmentPattern(ctx, centerX, centerY, moduleSize, alignmentStyle, config);

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
            finalModuleColor = this.applyPerModuleColor(
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
            finalModuleColor = this.applyPaletteColor(
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
            finalModuleColor = this.ensureContrast(
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
            this.drawHalftoneModule(ctx, drawX, drawY, adjustedSize, halftoneBrightness, config);
          } else if (isTiming) {
            // Draw timing pattern module with timing style
            this.drawTimingModule(ctx, drawX, drawY, adjustedSize, timingStyle, config);
          } else {
            this.drawModule(ctx, drawX, drawY, adjustedSize, config.moduleStyle, {
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
      this.drawCenterLogo(ctx, processedOverlayCanvas, size, config.logoSize);
    }

    // Draw frame if configured
    this.drawFrame(ctx, size, moduleSize, margin, config);

    // Store the QR matrix for vector SVG export
    this.storeMatrix(qr, moduleCount);

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
   * Get the center position of an alignment pattern if this module is part of one
   */
  getAlignmentCenter(row, col, moduleCount, version) {
    if (version < 2) return null;
    const positions = this.getAlignmentPositions(version, moduleCount);
    for (const pos of positions) {
      if (Math.abs(row - pos.row) <= 2 && Math.abs(col - pos.col) <= 2) {
        return pos;
      }
    }
    return null;
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

  applyTrueDither(qr, overlayData, config, extremeMode = false) {
    const moduleCount = qr.getModuleCount();
    const version = config.typeNumber || Math.ceil((moduleCount - 17) / 4);

    // ECC-aware mode tracking
    const eccAware = config.eccAwareEnabled === true;
    let totalModifiedCount = 0;

    // Create a seeded PRNG for deterministic output
    // Seed from content hash + config to ensure same settings = same output
    const seed = config.seed ?? this.hashString(config.content || '');
    const seededRandom = this.createSeededRandom(seed);

    // Create modifiable pattern - start with original QR
    const modifiedPattern = [];

    for (let row = 0; row < moduleCount; row++) {
      modifiedPattern[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        modifiedPattern[row][col] = qr.isDark(row, col);
      }
    }

    // Count total data modules for ECC budget calculation
    let totalDataModules = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (!isStructuralModule(row, col, moduleCount, version)) {
          totalDataModules++;
        }
      }
    }

    // In extreme mode, flip ALL non-finder modules to match image
    // In normal dither mode, respect error correction limits
    if (extremeMode) {
      // Extreme: flip everything except finder patterns
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          // Only protect finder patterns (corners)
          if (isFinderPattern(row, col, moduleCount)) continue;

          const brightness = overlayData[row]?.[col] ?? 0.5;
          const intensity = config.overlayIntensity / 100;

          // Desired state based on image
          const desiredDark = brightness < 0.5;

          // ECC-aware check
          if (eccAware && desiredDark !== modifiedPattern[row][col]) {
            if (
              !this.isEccSafeToModify(
                row,
                col,
                moduleCount,
                version,
                config,
                totalModifiedCount,
                totalDataModules
              )
            ) {
              continue; // Skip this modification
            }
            totalModifiedCount++;
          }

          // Apply with intensity blend using seeded PRNG for determinism
          if (intensity >= 1 || seededRandom() < intensity) {
            modifiedPattern[row][col] = desiredDark;
          }
        }
      }
    } else {
      // Safe dither: respect error correction limits
      const ecCapacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
      const maxFlipRatio = ecCapacity[config.errorCorrection] || 0.25;
      const intensity = config.overlayIntensity / 100;

      let totalDataModules = 0;
      const flipCandidates = [];

      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (isStructuralModule(row, col, moduleCount, version)) continue;
          totalDataModules++;

          const currentState = qr.isDark(row, col);
          const brightness = overlayData[row]?.[col] ?? 0.5;
          const desiredState = brightness < 0.5;

          if (currentState !== desiredState) {
            flipCandidates.push({
              row,
              col,
              score: Math.abs(brightness - 0.5),
              desiredState,
            });
          }
        }
      }

      // Sort by visual importance and flip up to limit
      flipCandidates.sort((a, b) => b.score - a.score);
      const maxFlips = Math.floor(totalDataModules * maxFlipRatio * intensity);

      for (let i = 0; i < Math.min(flipCandidates.length, maxFlips); i++) {
        const c = flipCandidates[i];
        modifiedPattern[c.row][c.col] = c.desiredState;
      }
    }

    return modifiedPattern;
  }

  /**
   * Create a simple seeded PRNG (mulberry32)
   * Returns a function that generates deterministic pseudo-random numbers [0, 1)
   * @private
   */
  createSeededRandom(seed) {
    let state = seed >>> 0; // Ensure unsigned 32-bit integer
    return () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Simple string hash function (djb2)
   * @private
   */
  hashString(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) + hash + (str.codePointAt(i) ?? 0);
      hash = hash >>> 0; // Keep as unsigned 32-bit
    }
    return hash;
  }

  /**
   * Hash canvas content for cache key disambiguation
   * Uses a downscaled 32x32 canvas for speed (avoids full-resolution getImageData)
   * Results are cached in a WeakMap to avoid re-hashing the same canvas
   * @private
   */
  async hashCanvasContent(canvas) {
    // Check WeakMap cache first (avoids re-hashing same canvas instance)
    const cachedHash = canvasHashCache.get(canvas);
    if (cachedHash !== undefined) {
      return cachedHash;
    }

    try {
      // Downscale to a tiny 32x32 canvas for fast hashing
      // This is 10-50x faster than hashing full resolution on large overlays
      const hashSize = 32;
      // Use DOM API directly for browser (faster, avoids async overhead)
      // Falls back to canvas factory for server-side
      const hashCanvas =
        typeof document !== 'undefined'
          ? (() => {
              const c = document.createElement('canvas');
              c.width = hashSize;
              c.height = hashSize;
              return c;
            })()
          : await this.createCanvas(hashSize, hashSize);
      const hashCtx = hashCanvas.getContext('2d');

      // Draw downscaled version
      hashCtx.drawImage(canvas, 0, 0, hashSize, hashSize);

      // Get pixel data from the small canvas
      const imageData = hashCtx.getImageData(0, 0, hashSize, hashSize);
      const data = imageData.data;

      // Hash all pixels in the small canvas (32x32 = 1024 pixels = 4096 bytes)
      let hash = 5381;
      for (let i = 0; i < data.length; i += 4) {
        // Combine RGB values into hash (skip alpha for consistency)
        hash = (hash << 5) + hash + data[i];
        hash = (hash << 5) + hash + data[i + 1];
        hash = (hash << 5) + hash + data[i + 2];
        hash = hash >>> 0;
      }

      const hashStr = hash.toString(16);

      // Cache the result in WeakMap (auto-cleanup when canvas is GC'd)
      canvasHashCache.set(canvas, hashStr);

      return hashStr;
    } catch (error_) {
      // Fallback to dimensions-only if getImageData fails
      console.warn('Canvas hashing failed:', error_);
      return `${canvas.width}x${canvas.height}`;
    }
  }

  /**
   * Draw a single module with support for style, corner radius, and rotation
   */
  drawModule(ctx, x, y, size, style, options = {}) {
    const { cornerRadius = 0, rotation = 0 } = options;
    const padding = size * 0.05;
    const innerSize = size - padding * 2;

    // Calculate corner radius based on percentage
    const radiusPercent = cornerRadius / 100;
    const maxRadius = innerSize / 2;
    const actualRadius = maxRadius * radiusPercent;

    ctx.save();

    // Apply rotation around center if specified
    if (rotation !== 0) {
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }

    switch (style) {
      case 'rounded': {
        // Use cornerRadius if specified, otherwise default rounded
        const roundedRadius = actualRadius > 0 ? actualRadius : size * 0.3;
        this.roundRect(ctx, x + padding, y + padding, innerSize, innerSize, roundedRadius);
        ctx.fill();
        break;
      }

      case 'dots':
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, innerSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + padding);
        ctx.lineTo(x + size - padding, y + size / 2);
        ctx.lineTo(x + size / 2, y + size - padding);
        ctx.lineTo(x + padding, y + size / 2);
        ctx.closePath();
        ctx.fill();
        break;

      case 'connected':
        // Draw full rectangle with no gaps for connected look
        if (actualRadius > 0) {
          this.roundRect(ctx, x, y, size, size, actualRadius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, size, size);
        }
        break;
      default:
        if (actualRadius > 0) {
          this.roundRect(ctx, x + padding, y + padding, innerSize, innerSize, actualRadius);
          ctx.fill();
        } else {
          ctx.fillRect(x + padding, y + padding, innerSize, innerSize);
        }
        break;
    }

    ctx.restore();
  }

  /**
   * Draw a single finder pattern module
   */
  drawFinderModule(ctx, x, y, size, style, cornerRadius = 0) {
    const radiusPercent = cornerRadius / 100;
    const maxRadius = size / 2;
    const actualRadius = maxRadius * radiusPercent;

    switch (style) {
      case 'rounded': {
        const roundedRadius = actualRadius > 0 ? actualRadius : size * 0.2;
        this.roundRect(ctx, x, y, size, size, roundedRadius);
        ctx.fill();
        break;
      }

      case 'circle':
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      default:
        if (actualRadius > 0) {
          this.roundRect(ctx, x, y, size, size, actualRadius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, size, size);
        }
        break;
    }
  }

  /**
   * Draw a complete finder pattern (eye) with outer and inner styles
   */
  drawFinderPatternComplete(ctx, centerX, centerY, moduleSize, config) {
    const outerStyle = config.eyeOuterStyle || config.finderStyle || 'square';
    const innerStyle = config.eyeInnerStyle || config.finderStyle || 'square';
    const scale = (config.eyeScale || 100) / 100;
    const cornerRadius = config.cornerRadius || 0;

    // Finder pattern is 7x7 modules
    // Outer: 7x7, Middle (white): 5x5, Inner: 3x3
    const outerSize = 7 * moduleSize * scale;
    const middleSize = 5 * moduleSize * scale;
    const innerSize = 3 * moduleSize * scale;

    const outerOffset = (7 * moduleSize - outerSize) / 2;
    const x = centerX + outerOffset;
    const y = centerY + outerOffset;

    // Draw outer (dark)
    ctx.fillStyle = config.fgColor;
    this.drawFinderModule(ctx, x, y, outerSize, outerStyle, cornerRadius);

    // Draw middle (light/background)
    ctx.fillStyle = config.bgColor;
    const middleOffset = (outerSize - middleSize) / 2;
    this.drawFinderModule(
      ctx,
      x + middleOffset,
      y + middleOffset,
      middleSize,
      outerStyle,
      cornerRadius
    );

    // Draw inner (dark)
    ctx.fillStyle = config.fgColor;
    const innerOffset = (outerSize - innerSize) / 2;
    this.drawFinderModule(
      ctx,
      x + innerOffset,
      y + innerOffset,
      innerSize,
      innerStyle,
      cornerRadius
    );
  }

  /**
   * Draw an alignment pattern with specified style
   */
  drawAlignmentPattern(ctx, centerX, centerY, moduleSize, style, config) {
    const cornerRadius = config.cornerRadius || 0;

    // Alignment pattern is 5x5 modules
    // Outer: 5x5, Middle (white): 3x3, Inner: 1x1
    const outerSize = 5 * moduleSize;
    const middleSize = 3 * moduleSize;
    const innerSize = 1 * moduleSize;

    const x = centerX - outerSize / 2;
    const y = centerY - outerSize / 2;

    // Use the specified style or match finder style
    const effectiveStyle = style === 'match_finder' ? config.finderStyle || 'square' : style;

    // Draw outer (dark)
    ctx.fillStyle = config.fgColor;
    this.drawFinderModule(ctx, x, y, outerSize, effectiveStyle, cornerRadius);

    // Draw middle (light/background)
    ctx.fillStyle = config.bgColor;
    const middleX = centerX - middleSize / 2;
    const middleY = centerY - middleSize / 2;
    this.drawFinderModule(ctx, middleX, middleY, middleSize, effectiveStyle, cornerRadius);

    // Draw inner (dark)
    ctx.fillStyle = config.fgColor;
    const innerX = centerX - innerSize / 2;
    const innerY = centerY - innerSize / 2;
    this.drawFinderModule(ctx, innerX, innerY, innerSize, effectiveStyle, cornerRadius);
  }

  /**
   * Draw timing pattern with specified style
   */
  drawTimingModule(ctx, x, y, size, style, config) {
    const cornerRadius = config.cornerRadius || 0;

    // Use the specified style or match module style
    const effectiveStyle = style === 'match_module' ? config.moduleStyle || 'square' : style;

    switch (effectiveStyle) {
      case 'solid':
        ctx.fillRect(x, y, size, size);
        break;
      case 'dashed': {
        // Draw a smaller centered rectangle for dashed look
        const dashSize = size * 0.7;
        const offset = (size - dashSize) / 2;
        ctx.fillRect(x + offset, y + offset, dashSize, dashSize);
        break;
      }
      default:
        // Use regular module drawing
        this.drawModule(ctx, x, y, size, effectiveStyle, { cornerRadius });
    }
  }

  /**
   * Create a gradient fill style based on config
   */
  createGradientFill(ctx, config, size) {
    if (!config.gradient || config.gradient.type === 'none') {
      return config.fgColor;
    }

    const { type, stops, centerX = 0.5, centerY = 0.5 } = config.gradient;
    const angle = config.gradient.angle || 0;
    let gradient;

    switch (type) {
      case 'linear': {
        // Convert angle to start/end points
        const angleRad = (angle * Math.PI) / 180;
        const x1 = size / 2 - (Math.cos(angleRad) * size) / 2;
        const y1 = size / 2 - (Math.sin(angleRad) * size) / 2;
        const x2 = size / 2 + (Math.cos(angleRad) * size) / 2;
        const y2 = size / 2 + (Math.sin(angleRad) * size) / 2;
        gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        break;
      }
      case 'radial': {
        const cx = size * (centerX || 0.5);
        const cy = size * (centerY || 0.5);
        const radius = size * 0.7;
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        break;
      }
      case 'conic': {
        // Canvas doesn't have native conic gradient, simulate with radial
        const cx = size * (centerX || 0.5);
        const cy = size * (centerY || 0.5);
        gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.7);
        break;
      }
      default:
        return config.fgColor;
    }

    // Add color stops
    if (stops && stops.length > 0) {
      for (const stop of stops) {
        gradient.addColorStop(stop.pos, stop.color);
      }
    } else {
      // Default gradient from fgColor to a lighter version
      gradient.addColorStop(0, config.fgColor);
      gradient.addColorStop(1, config.bgColor);
    }

    return gradient;
  }

  /**
   * Draw a decorative frame around the QR code
   */
  drawFrame(ctx, size, moduleSize, margin, config) {
    const frameStyle = config.frameStyle;
    if (!frameStyle || frameStyle === 'none') return;

    const frameText = config.frameText || '';
    const qrSize = size - margin * 2 * moduleSize - (frameText ? moduleSize * 4 : 0);
    const qrStart = margin * moduleSize;

    ctx.save();

    switch (frameStyle) {
      case 'rounded_frame': {
        // Draw rounded rectangle frame around QR
        ctx.strokeStyle = config.fgColor;
        ctx.lineWidth = moduleSize * 0.5;
        const frameMargin = moduleSize;
        this.roundRect(
          ctx,
          qrStart - frameMargin,
          qrStart - frameMargin,
          qrSize + frameMargin * 2,
          qrSize + frameMargin * 2 + (frameText ? moduleSize * 3 : 0),
          moduleSize * 2
        );
        ctx.stroke();
        break;
      }

      case 'sticker': {
        // Draw sticker-style background with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = moduleSize * 2;
        ctx.shadowOffsetX = moduleSize * 0.5;
        ctx.shadowOffsetY = moduleSize * 0.5;

        ctx.fillStyle = config.bgColor;
        const stickerPadding = moduleSize * 1.5;
        this.roundRect(
          ctx,
          qrStart - stickerPadding,
          qrStart - stickerPadding,
          qrSize + stickerPadding * 2,
          qrSize + stickerPadding * 2 + (frameText ? moduleSize * 4 : 0),
          moduleSize * 3
        );
        ctx.fill();
        ctx.shadowColor = 'transparent';
        break;
      }

      case 'tag': {
        // Draw tag-style frame with pointed end
        ctx.fillStyle = config.fgColor;
        const tagPadding = moduleSize;
        const tagWidth = qrSize + tagPadding * 2;
        const tagHeight = qrSize + tagPadding * 2 + (frameText ? moduleSize * 4 : 0);
        const tagX = qrStart - tagPadding;
        const tagY = qrStart - tagPadding;

        ctx.beginPath();
        ctx.moveTo(tagX + moduleSize, tagY);
        ctx.lineTo(tagX + tagWidth - moduleSize, tagY);
        ctx.quadraticCurveTo(tagX + tagWidth, tagY, tagX + tagWidth, tagY + moduleSize);
        ctx.lineTo(tagX + tagWidth, tagY + tagHeight - moduleSize);
        ctx.quadraticCurveTo(
          tagX + tagWidth,
          tagY + tagHeight,
          tagX + tagWidth - moduleSize,
          tagY + tagHeight
        );
        ctx.lineTo(tagX + moduleSize, tagY + tagHeight);
        ctx.quadraticCurveTo(tagX, tagY + tagHeight, tagX, tagY + tagHeight - moduleSize);
        ctx.lineTo(tagX, tagY + moduleSize);
        ctx.quadraticCurveTo(tagX, tagY, tagX + moduleSize, tagY);
        ctx.closePath();
        ctx.stroke();
        break;
      }
    }

    // Draw frame text if provided
    if (frameText) {
      ctx.fillStyle = config.fgColor;
      ctx.font = `bold ${moduleSize * 2}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const textY = qrStart + qrSize + moduleSize * 1.5;
      ctx.fillText(frameText, size / 2, textY);
    }

    ctx.restore();
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Apply preprocessing (brightness, contrast, gamma, saturation, hue rotation, invert,
   * posterize, threshold, blur, sharpen, edge detection) to ImageData.
   * This is a shared helper used by all overlay data loading methods.
   * @private
   */
  preprocessImageData(imageData, config, invertImage = false) {
    const data = imageData.data;

    const brightness_adj = config.overlayBrightness || 0;
    const contrast_adj = config.overlayContrast || 0;
    const gamma_adj = config.overlayGamma || 1;
    const saturation_adj = config.overlaySaturation || 0;
    const hueRotate_adj = config.overlayHueRotate || 0;
    const posterize_levels = config.overlayPosterize || 0;
    const threshold_val = config.overlayThreshold;
    const blur_radius = config.overlayBlur || 0;
    const sharpen_amt = config.overlaySharpen || 0;
    const edge_detect = config.overlayEdgeDetect || 'off';

    const needsPerPixelPreprocess =
      brightness_adj !== 0 ||
      contrast_adj !== 0 ||
      gamma_adj !== 1 ||
      saturation_adj !== 0 ||
      hueRotate_adj !== 0 ||
      posterize_levels >= 2 ||
      (threshold_val !== undefined && threshold_val !== 128 && edge_detect === 'off') ||
      invertImage;

    const needsConvolutionFilters =
      blur_radius > 0 || sharpen_amt > 0 || edge_detect === 'sobel' || edge_detect === 'canny';

    if (!(needsPerPixelPreprocess || needsConvolutionFilters)) return imageData;

    // First pass: per-pixel adjustments
    if (needsPerPixelPreprocess) {
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        if (brightness_adj !== 0) {
          const factor = brightness_adj * 2.55;
          r = Math.max(0, Math.min(255, r + factor));
          g = Math.max(0, Math.min(255, g + factor));
          b = Math.max(0, Math.min(255, b + factor));
        }

        // Contrast
        if (contrast_adj !== 0) {
          const factor = (259 * (contrast_adj + 255)) / (255 * (259 - contrast_adj));
          r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
          g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
          b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
        }

        // Gamma
        if (gamma_adj !== 1) {
          const gammaCorrection = 1 / gamma_adj;
          r = 255 * (r / 255) ** gammaCorrection;
          g = 255 * (g / 255) ** gammaCorrection;
          b = 255 * (b / 255) ** gammaCorrection;
        }

        // Saturation
        if (saturation_adj !== 0) {
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          const factor = (saturation_adj + 100) / 100;
          r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
          g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
          b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
        }

        // Hue rotation
        if (hueRotate_adj !== 0) {
          const angle = (hueRotate_adj * Math.PI) / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const newR =
            r * (0.213 + cos * 0.787 - sin * 0.213) +
            g * (0.715 - cos * 0.715 - sin * 0.715) +
            b * (0.072 - cos * 0.072 + sin * 0.928);
          const newG =
            r * (0.213 - cos * 0.213 + sin * 0.143) +
            g * (0.715 + cos * 0.285 + sin * 0.14) +
            b * (0.072 - cos * 0.072 - sin * 0.283);
          const newB =
            r * (0.213 - cos * 0.213 - sin * 0.787) +
            g * (0.715 - cos * 0.715 + sin * 0.715) +
            b * (0.072 + cos * 0.928 + sin * 0.072);
          r = Math.max(0, Math.min(255, newR));
          g = Math.max(0, Math.min(255, newG));
          b = Math.max(0, Math.min(255, newB));
        }

        // Posterize (need at least 2 levels to avoid division by zero)
        if (posterize_levels >= 2) {
          const levels = posterize_levels;
          const step = 255 / (levels - 1);
          r = Math.round(Math.round(r / step) * step);
          g = Math.round(Math.round(g / step) * step);
          b = Math.round(Math.round(b / step) * step);
        }

        // Threshold (only if edge detection is off)
        if (threshold_val !== undefined && threshold_val !== 128 && edge_detect === 'off') {
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          const bw = gray > threshold_val ? 255 : 0;
          r = bw;
          g = bw;
          b = bw;
        }

        // Invert
        if (invertImage) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }

        data[i] = Math.round(r);
        data[i + 1] = Math.round(g);
        data[i + 2] = Math.round(b);
      }
    }

    // Second pass: convolution filters (blur, sharpen, edge detection)
    if (needsConvolutionFilters) {
      if (blur_radius > 0) {
        this.applyBoxBlur(imageData, Math.min(blur_radius, 5));
      }

      if (sharpen_amt > 0) {
        this.applySharpen(imageData, sharpen_amt / 100);
      }

      if (edge_detect === 'sobel') {
        this.applySobelEdge(imageData);
      } else if (edge_detect === 'canny') {
        this.applyCannyEdge(imageData);
      }
    }

    return imageData;
  }

  /**
   * Get overlay data - async version using canvas factory
   * OPTIMIZED: Preprocessing is now done at moduleCount resolution (not full res)
   * This is 10-50x faster than preprocessing at full resolution.
   * @private
   */
  async getOverlayData(
    overlayCanvas,
    moduleCount,
    colorMode = 'color',
    invertImage = false,
    frameIndex = 0,
    config = {}
  ) {
    // Create cache key based on canvas identity, content hash, and parameters
    // Include frameIndex to ensure different animation frames aren't cached together
    // Use content hash to disambiguate different images with same dimensions
    const contentHash = await this.hashCanvasContent(overlayCanvas);
    const canvasKey = `${overlayCanvas.width}x${overlayCanvas.height}:${contentHash}`;
    const preprocessKey = `${config.overlayBrightness || 0}:${config.overlayContrast || 0}:${config.overlayGamma || 1}:${config.overlaySaturation || 0}:${config.overlayHueRotate || 0}:${invertImage}:${config.overlayBlur || 0}:${config.overlaySharpen || 0}:${config.overlayPosterize || 0}:${config.overlayThreshold ?? 128}:${config.overlayEdgeDetect || 'off'}`;
    const cacheKey = `${canvasKey}:${moduleCount}:${colorMode}:${preprocessKey}:${frameIndex}`;

    // Check if we have this exact configuration cached
    const cached = overlayDataCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const tempCanvas = await this.createCanvas(moduleCount, moduleCount);
    const ctx = tempCanvas.getContext('2d');

    // STEP 1: Downscale to moduleCount FIRST (this is the key optimization)
    ctx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);

    // STEP 2: Apply preprocessing on the SMALL image (O(moduleCount^2) instead of O(overlay_width*height))
    const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);
    this.preprocessImageData(imageData, config, invertImage);
    const data = imageData.data;

    // STEP 3: Extract brightness and color maps
    const brightness = [];
    const colors = [];

    for (let row = 0; row < moduleCount; row++) {
      brightness[row] = [];
      colors[row] = [];

      for (let col = 0; col < moduleCount; col++) {
        const i = (row * moduleCount + col) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        brightness[row][col] = gray / 255;

        if (colorMode === 'bw') {
          const bw = gray > 127 ? 255 : 0;
          colors[row][col] = `rgb(${bw},${bw},${bw})`;
        } else if (colorMode === 'grayscale') {
          colors[row][col] = `rgb(${gray},${gray},${gray})`;
        } else {
          colors[row][col] = `rgb(${r},${g},${b})`;
        }
      }
    }

    brightness.colors = colors;

    // Cache the result
    overlayDataCache.set(cacheKey, brightness);

    return brightness;
  }

  // blendColors and parseColor are now imported from ./color-utils.ts

  drawCenterLogo(ctx, logoCanvas, canvasSize, logoSizePercent) {
    const logoSize = canvasSize * (logoSizePercent / 100);
    const x = (canvasSize - logoSize) / 2;
    const y = (canvasSize - logoSize) / 2;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);

    ctx.drawImage(logoCanvas, x, y, logoSize, logoSize);
  }

  /**
   * Darken a color by a factor (0-1)
   * @private
   */
  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.round(Number.parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.round(Number.parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.round(Number.parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Lighten a color by a factor (0-1)
   * @private
   */
  lightenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = Math.round(
      Number.parseInt(hex.substr(0, 2), 16) + (255 - Number.parseInt(hex.substr(0, 2), 16)) * factor
    );
    const g = Math.round(
      Number.parseInt(hex.substr(2, 2), 16) + (255 - Number.parseInt(hex.substr(2, 2), 16)) * factor
    );
    const b = Math.round(
      Number.parseInt(hex.substr(4, 2), 16) + (255 - Number.parseInt(hex.substr(4, 2), 16)) * factor
    );
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Apply dithering to a QR matrix with overlay image
   * Uses Floyd-Steinberg error diffusion for free points
   * Supports serpentine scanning for better quality
   */
  /**
   * Diffusion kernel definitions for error diffusion dithering.
   * Each kernel defines offsets (dx, dy) and weights for error distribution.
   * @private
   */
  getDiffusionKernel(kernelName) {
    const kernels = {
      floyd_steinberg: [
        { dx: 1, dy: 0, w: 7 / 16 },
        { dx: -1, dy: 1, w: 3 / 16 },
        { dx: 0, dy: 1, w: 5 / 16 },
        { dx: 1, dy: 1, w: 1 / 16 },
      ],
      jarvis_judice_ninke: [
        { dx: 1, dy: 0, w: 7 / 48 },
        { dx: 2, dy: 0, w: 5 / 48 },
        { dx: -2, dy: 1, w: 3 / 48 },
        { dx: -1, dy: 1, w: 5 / 48 },
        { dx: 0, dy: 1, w: 7 / 48 },
        { dx: 1, dy: 1, w: 5 / 48 },
        { dx: 2, dy: 1, w: 3 / 48 },
        { dx: -2, dy: 2, w: 1 / 48 },
        { dx: -1, dy: 2, w: 3 / 48 },
        { dx: 0, dy: 2, w: 5 / 48 },
        { dx: 1, dy: 2, w: 3 / 48 },
        { dx: 2, dy: 2, w: 1 / 48 },
      ],
      stucki: [
        { dx: 1, dy: 0, w: 8 / 42 },
        { dx: 2, dy: 0, w: 4 / 42 },
        { dx: -2, dy: 1, w: 2 / 42 },
        { dx: -1, dy: 1, w: 4 / 42 },
        { dx: 0, dy: 1, w: 8 / 42 },
        { dx: 1, dy: 1, w: 4 / 42 },
        { dx: 2, dy: 1, w: 2 / 42 },
        { dx: -2, dy: 2, w: 1 / 42 },
        { dx: -1, dy: 2, w: 2 / 42 },
        { dx: 0, dy: 2, w: 4 / 42 },
        { dx: 1, dy: 2, w: 2 / 42 },
        { dx: 2, dy: 2, w: 1 / 42 },
      ],
      burkes: [
        { dx: 1, dy: 0, w: 8 / 32 },
        { dx: 2, dy: 0, w: 4 / 32 },
        { dx: -2, dy: 1, w: 2 / 32 },
        { dx: -1, dy: 1, w: 4 / 32 },
        { dx: 0, dy: 1, w: 8 / 32 },
        { dx: 1, dy: 1, w: 4 / 32 },
        { dx: 2, dy: 1, w: 2 / 32 },
      ],
      sierra: [
        { dx: 1, dy: 0, w: 5 / 32 },
        { dx: 2, dy: 0, w: 3 / 32 },
        { dx: -2, dy: 1, w: 2 / 32 },
        { dx: -1, dy: 1, w: 4 / 32 },
        { dx: 0, dy: 1, w: 5 / 32 },
        { dx: 1, dy: 1, w: 4 / 32 },
        { dx: 2, dy: 1, w: 2 / 32 },
        { dx: -1, dy: 2, w: 2 / 32 },
        { dx: 0, dy: 2, w: 3 / 32 },
        { dx: 1, dy: 2, w: 2 / 32 },
      ],
      sierra_2: [
        { dx: 1, dy: 0, w: 4 / 16 },
        { dx: 2, dy: 0, w: 3 / 16 },
        { dx: -2, dy: 1, w: 1 / 16 },
        { dx: -1, dy: 1, w: 2 / 16 },
        { dx: 0, dy: 1, w: 3 / 16 },
        { dx: 1, dy: 1, w: 2 / 16 },
        { dx: 2, dy: 1, w: 1 / 16 },
      ],
      sierra_lite: [
        { dx: 1, dy: 0, w: 2 / 4 },
        { dx: -1, dy: 1, w: 1 / 4 },
        { dx: 0, dy: 1, w: 1 / 4 },
      ],
      atkinson: [
        { dx: 1, dy: 0, w: 1 / 8 },
        { dx: 2, dy: 0, w: 1 / 8 },
        { dx: -1, dy: 1, w: 1 / 8 },
        { dx: 0, dy: 1, w: 1 / 8 },
        { dx: 1, dy: 1, w: 1 / 8 },
        { dx: 0, dy: 2, w: 1 / 8 },
      ],
    };

    return kernels[kernelName] || kernels.floyd_steinberg;
  }

  /**
   * Apply dithering to QR matrix - async version using canvas factory
   * Supports multiple diffusion kernels, serpentine scanning, and dither strength.
   * @private
   */
  async applyDitherToMatrix(
    baseMatrix,
    scaledSize,
    scale,
    overlayCanvas,
    overlayIntensity,
    colorMode,
    serpentine = false,
    config = {}
  ) {
    // Initialize output
    const matrix = baseMatrix.map((row) => [...row]);
    const colors = baseMatrix.map((row) =>
      row.map((isDark) => (isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }))
    );

    if (!overlayCanvas) {
      return { matrix, colors };
    }

    // Get dither settings from config
    const ditherStrength = (config.ditherStrength ?? 100) / 100; // 0-1 scale
    const diffusionKernel = config.diffusionKernel || 'floyd_steinberg';
    const fsKernel = this.getDiffusionKernel(diffusionKernel);

    // Load overlay image data with preprocessing
    const imageData = await this.loadImageDataRGB(overlayCanvas, scaledSize, config);
    const intensity = overlayIntensity / 100;

    // Convert to grayscale if needed
    if (colorMode === 'grayscale' || colorMode === 'bw') {
      for (let y = 0; y < scaledSize; y++) {
        for (let x = 0; x < scaledSize; x++) {
          const { r, g, b } = imageData[y][x];
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          imageData[y][x] = { r: gray, g: gray, b: gray };
        }
      }
    }

    // Apply Floyd-Steinberg error diffusion to free points
    // With optional serpentine scanning (alternating row direction)
    for (let y = 0; y < scaledSize; y++) {
      const leftToRight = !serpentine || y % 2 === 0;
      const xStart = leftToRight ? 0 : scaledSize - 1;
      const xEnd = leftToRight ? scaledSize : -1;
      const xStep = leftToRight ? 1 : -1;

      for (let x = xStart; leftToRight ? x < xEnd : x > xEnd; x += xStep) {
        // Skip locked areas and data points
        if (isLocked(scaledSize, x, y, scale)) continue;
        if (isData(x, y, scale)) continue;

        const pixel = imageData[y][x];

        if (colorMode === 'bw') {
          const gray = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
          const newVal = gray > 0.5 ? 1 : 0;
          const error = gray - newVal;

          imageData[y][x] = { r: newVal, g: newVal, b: newVal };
          this.distributeError(
            imageData,
            x,
            y,
            scaledSize,
            scale,
            error,
            error,
            error,
            leftToRight,
            fsKernel,
            ditherStrength
          );
        } else if (colorMode === 'grayscale') {
          const gray = pixel.r;
          const levels = 4;
          const newVal = Math.round(gray * (levels - 1)) / (levels - 1);
          const error = gray - newVal;

          imageData[y][x] = { r: newVal, g: newVal, b: newVal };
          this.distributeError(
            imageData,
            x,
            y,
            scaledSize,
            scale,
            error,
            error,
            error,
            leftToRight,
            fsKernel,
            ditherStrength
          );
        } else {
          const levels = 4;
          const newR = Math.round(pixel.r * (levels - 1)) / (levels - 1);
          const newG = Math.round(pixel.g * (levels - 1)) / (levels - 1);
          const newB = Math.round(pixel.b * (levels - 1)) / (levels - 1);

          const errorR = pixel.r - newR;
          const errorG = pixel.g - newG;
          const errorB = pixel.b - newB;

          imageData[y][x] = { r: newR, g: newG, b: newB };
          this.distributeError(
            imageData,
            x,
            y,
            scaledSize,
            scale,
            errorR,
            errorG,
            errorB,
            leftToRight,
            fsKernel,
            ditherStrength
          );
        }
      }
    }

    // Merge dithered image with QR matrix
    // Use seeded PRNG for deterministic output (same settings = same output)
    // Seed based on scale to ensure reproducibility
    const seededRandom = this.createSeededRandom(scale * 12345);

    for (let y = 0; y < scaledSize; y++) {
      for (let x = 0; x < scaledSize; x++) {
        if (isLocked(scaledSize, x, y, scale)) continue;
        if (isData(x, y, scale)) continue;

        const pixel = imageData[y][x];
        const brightness = pixel.r * 0.299 + pixel.g * 0.587 + pixel.b * 0.114;
        // Use seeded PRNG instead of Math.random() for deterministic output
        const useImage = seededRandom() < intensity;

        if (useImage) {
          matrix[y][x] = brightness < 0.5;
          colors[y][x] = {
            r: Math.round(Math.max(0, Math.min(1, pixel.r)) * 255),
            g: Math.round(Math.max(0, Math.min(1, pixel.g)) * 255),
            b: Math.round(Math.max(0, Math.min(1, pixel.b)) * 255),
          };
        }
      }
    }

    return { matrix, colors };
  }

  /**
   * Load image data from canvas as RGB values (0-1 range)
   * Now supports preprocessing via config parameter
   * @private
   */
  async loadImageDataRGB(canvas, size, config = {}) {
    const tempCanvas = await this.createCanvas(size, size);
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, size, size);
    const imgData = ctx.getImageData(0, 0, size, size);

    // Apply preprocessing if config is provided
    this.preprocessImageData(imgData, config, config.invertImage);

    const output = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        row.push({
          r: imgData.data[i] / 255,
          g: imgData.data[i + 1] / 255,
          b: imgData.data[i + 2] / 255,
        });
      }
      output.push(row);
    }
    return output;
  }

  /**
   * Distribute error to neighboring pixels using the specified diffusion kernel
   * Supports serpentine scanning with leftToRight parameter and dither strength
   */
  distributeError(
    imageData,
    x,
    y,
    size,
    scale,
    errorR,
    errorG,
    errorB,
    leftToRight = true,
    kernel = null,
    strength = 1
  ) {
    const canChange = (px, py) => {
      if (px < 0 || py < 0 || px >= size || py >= size) return false;
      return !(isLocked(size, px, py, scale) || isData(px, py, scale));
    };

    // Apply strength to errors
    const scaledErrorR = errorR * strength;
    const scaledErrorG = errorG * strength;
    const scaledErrorB = errorB * strength;
    // Note: strength of 1.0 means full error diffusion

    // Use provided kernel or default Floyd-Steinberg
    const diffusionKernel = kernel || [
      { dx: 1, dy: 0, w: 7 / 16 },
      { dx: -1, dy: 1, w: 3 / 16 },
      { dx: 0, dy: 1, w: 5 / 16 },
      { dx: 1, dy: 1, w: 1 / 16 },
    ];

    // Distribute error using the kernel
    for (const { dx, dy, w } of diffusionKernel) {
      // Flip x direction for serpentine scanning on reverse passes
      const effectiveDx = leftToRight ? dx : -dx;
      const nx = x + effectiveDx;
      const ny = y + dy;

      if (canChange(nx, ny)) {
        imageData[ny][nx].r += scaledErrorR * w;
        imageData[ny][nx].g += scaledErrorG * w;
        imageData[ny][nx].b += scaledErrorB * w;
      }
    }
  }

  /**
   * Get subpixel overlay data - async version using canvas factory
   * Now supports preprocessing via config parameter
   * @private
   */
  async getSubpixelOverlayData(overlayCanvas, subpixelCount, colorMode = 'color', config = {}) {
    const tempCanvas = await this.createCanvas(subpixelCount, subpixelCount);
    const ctx = tempCanvas.getContext('2d');

    ctx.drawImage(overlayCanvas, 0, 0, subpixelCount, subpixelCount);

    const imageData = ctx.getImageData(0, 0, subpixelCount, subpixelCount);

    // Apply preprocessing if config is provided
    this.preprocessImageData(imageData, config, config.invertImage);

    const data = imageData.data;

    const brightness = [];
    const colors = [];

    for (let row = 0; row < subpixelCount; row++) {
      brightness[row] = [];
      colors[row] = [];

      for (let col = 0; col < subpixelCount; col++) {
        const i = (row * subpixelCount + col) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
        brightness[row][col] = gray / 255;

        if (colorMode === 'bw') {
          const bw = gray > 127 ? 255 : 0;
          colors[row][col] = `rgb(${bw},${bw},${bw})`;
        } else if (colorMode === 'grayscale') {
          colors[row][col] = `rgb(${gray},${gray},${gray})`;
        } else {
          colors[row][col] = `rgb(${r},${g},${b})`;
        }
      }
    }

    brightness.colors = colors;
    return brightness;
  }

  /**
   * Check if any preprocessing options are set
   * @private
   * @deprecated Color adjustments are now done at moduleCount resolution in _getOverlayData
   */
  hasPreprocessingOptions(config) {
    return (
      (config.overlayBrightness && config.overlayBrightness !== 0) ||
      (config.overlayContrast && config.overlayContrast !== 0) ||
      (config.overlayGamma && config.overlayGamma !== 1) ||
      (config.overlaySaturation && config.overlaySaturation !== 0) ||
      (config.overlayHueRotate && config.overlayHueRotate !== 0) ||
      config.invertImage ||
      (config.overlayBlur && config.overlayBlur > 0) ||
      (config.overlaySharpen && config.overlaySharpen > 0) ||
      (config.overlayPosterize && config.overlayPosterize > 0) ||
      (config.overlayEdgeDetect && config.overlayEdgeDetect !== 'off') ||
      (config.overlayThreshold !== undefined && config.overlayThreshold !== 128) ||
      config.overlayFlipX ||
      config.overlayFlipY ||
      (config.overlayRotate && config.overlayRotate !== 0)
    );
  }

  /**
   * Check if geometric transforms are needed (rotation, flip)
   * These must be done before downscaling as they affect spatial layout
   * @private
   */
  hasGeometricTransforms(config) {
    return (
      config.overlayFlipX ||
      config.overlayFlipY ||
      (config.overlayRotate && config.overlayRotate !== 0)
    );
  }

  /**
   * Apply only geometric transforms (rotation, flip) at full resolution
   * Color adjustments are done at moduleCount resolution in _getOverlayData
   * @private
   */
  async applyGeometricTransforms(overlayCanvas, config) {
    const width = overlayCanvas.width;
    const height = overlayCanvas.height;

    const processedCanvas = await this.createCanvas(width, height);
    const ctx = processedCanvas.getContext('2d');

    ctx.save();

    // Handle rotation
    if (config.overlayRotate && config.overlayRotate !== 0) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((config.overlayRotate * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    }

    // Handle flips
    if (config.overlayFlipX || config.overlayFlipY) {
      ctx.translate(config.overlayFlipX ? width : 0, config.overlayFlipY ? height : 0);
      ctx.scale(config.overlayFlipX ? -1 : 1, config.overlayFlipY ? -1 : 1);
    }

    ctx.drawImage(overlayCanvas, 0, 0);
    ctx.restore();

    return processedCanvas;
  }

  /**
   * Preprocess overlay canvas with filters and transforms
   * @private
   */
  async preprocessOverlay(overlayCanvas, config) {
    const width = overlayCanvas.width;
    const height = overlayCanvas.height;

    // Create a new canvas for processing
    const processedCanvas = await this.createCanvas(width, height);
    const ctx = processedCanvas.getContext('2d');

    // Apply geometric transforms first
    ctx.save();

    // Handle rotation
    if (config.overlayRotate && config.overlayRotate !== 0) {
      ctx.translate(width / 2, height / 2);
      ctx.rotate((config.overlayRotate * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
    }

    // Handle flips
    if (config.overlayFlipX || config.overlayFlipY) {
      ctx.translate(config.overlayFlipX ? width : 0, config.overlayFlipY ? height : 0);
      ctx.scale(config.overlayFlipX ? -1 : 1, config.overlayFlipY ? -1 : 1);
    }

    ctx.drawImage(overlayCanvas, 0, 0);
    ctx.restore();

    // Get image data for filter processing
    const imageData = ctx.getImageData(0, 0, width, height);

    // Build filter options
    const filterOptions = {
      brightness: config.overlayBrightness || 0,
      contrast: config.overlayContrast || 0,
      gamma: config.overlayGamma || 1,
      saturation: config.overlaySaturation || 0,
      hueRotate: config.overlayHueRotate || 0,
      invert: config.invertImage,
      blur: config.overlayBlur || 0,
      sharpen: config.overlaySharpen || 0,
      posterize: config.overlayPosterize || 0,
      edgeDetect: config.overlayEdgeDetect || 'off',
    };

    // Only apply threshold if explicitly set and edge detection is off
    if (
      config.overlayThreshold !== undefined &&
      config.overlayThreshold !== 128 &&
      filterOptions.edgeDetect === 'off'
    ) {
      filterOptions.threshold = config.overlayThreshold;
    }

    // Apply filters manually (self-contained implementation)
    this.applyFiltersManual(imageData, filterOptions);

    // Put processed image data back
    ctx.putImageData(imageData, 0, 0);

    return processedCanvas;
  }

  /**
   * Manual filter application - self-contained implementation
   * @private
   */
  applyFiltersManual(imageData, options) {
    const data = imageData.data;

    // First pass: per-pixel adjustments
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (options.brightness && options.brightness !== 0) {
        const factor = options.brightness * 2.55;
        r = Math.max(0, Math.min(255, r + factor));
        g = Math.max(0, Math.min(255, g + factor));
        b = Math.max(0, Math.min(255, b + factor));
      }

      // Contrast
      if (options.contrast && options.contrast !== 0) {
        const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128));
      }

      // Gamma
      if (options.gamma && options.gamma !== 1) {
        const gammaCorrection = 1 / options.gamma;
        r = 255 * (r / 255) ** gammaCorrection;
        g = 255 * (g / 255) ** gammaCorrection;
        b = 255 * (b / 255) ** gammaCorrection;
      }

      // Saturation
      if (options.saturation && options.saturation !== 0) {
        const gray = r * 0.299 + g * 0.587 + b * 0.114;
        const factor = (options.saturation + 100) / 100;
        r = Math.max(0, Math.min(255, gray + factor * (r - gray)));
        g = Math.max(0, Math.min(255, gray + factor * (g - gray)));
        b = Math.max(0, Math.min(255, gray + factor * (b - gray)));
      }

      // Hue rotation
      if (options.hueRotate && options.hueRotate !== 0) {
        const angle = (options.hueRotate * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const newR =
          r * (0.213 + cos * 0.787 - sin * 0.213) +
          g * (0.715 - cos * 0.715 - sin * 0.715) +
          b * (0.072 - cos * 0.072 + sin * 0.928);
        const newG =
          r * (0.213 - cos * 0.213 + sin * 0.143) +
          g * (0.715 + cos * 0.285 + sin * 0.14) +
          b * (0.072 - cos * 0.072 - sin * 0.283);
        const newB =
          r * (0.213 - cos * 0.213 - sin * 0.787) +
          g * (0.715 - cos * 0.715 + sin * 0.715) +
          b * (0.072 + cos * 0.928 + sin * 0.072);
        r = Math.max(0, Math.min(255, newR));
        g = Math.max(0, Math.min(255, newG));
        b = Math.max(0, Math.min(255, newB));
      }

      // Posterize
      if (options.posterize && options.posterize > 0) {
        const levels = options.posterize;
        const step = 255 / (levels - 1);
        r = Math.round(Math.round(r / step) * step);
        g = Math.round(Math.round(g / step) * step);
        b = Math.round(Math.round(b / step) * step);
      }

      // Invert
      if (options.invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      data[i] = Math.round(r);
      data[i + 1] = Math.round(g);
      data[i + 2] = Math.round(b);
    }

    // Second pass: convolution filters (blur, sharpen)
    if (options.blur && options.blur > 0) {
      this.applyBoxBlur(imageData, Math.min(options.blur, 5));
    }

    if (options.sharpen && options.sharpen > 0) {
      this.applySharpen(imageData, options.sharpen / 100);
    }

    // Edge detection
    if (options.edgeDetect === 'sobel') {
      this.applySobelEdge(imageData);
    }
  }

  /**
   * Apply box blur
   * @private
   */
  applyBoxBlur(imageData, radius) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const copy = new Uint8ClampedArray(data);
    const size = radius * 2 + 1;
    const divisor = size * size;

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let r = 0,
          g = 0,
          b = 0;

        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            r += copy[idx];
            g += copy[idx + 1];
            b += copy[idx + 2];
          }
        }

        const outIdx = (y * width + x) * 4;
        data[outIdx] = Math.round(r / divisor);
        data[outIdx + 1] = Math.round(g / divisor);
        data[outIdx + 2] = Math.round(b / divisor);
      }
    }
  }

  /**
   * Apply sharpen filter
   * @private
   */
  applySharpen(imageData, amount) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const copy = new Uint8ClampedArray(data);

    // Sharpen kernel: center = 1 + 4*amount, neighbors = -amount
    const kernel = [0, -amount, 0, -amount, 1 + 4 * amount, -amount, 0, -amount, 0];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0;
        let ki = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const k = kernel[ki++];
            r += copy[idx] * k;
            g += copy[idx + 1] * k;
            b += copy[idx + 2] * k;
          }
        }

        const outIdx = (y * width + x) * 4;
        data[outIdx] = Math.max(0, Math.min(255, Math.round(r)));
        data[outIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
        data[outIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      }
    }
  }

  /**
   * Apply Canny edge detection (simplified implementation)
   * Uses Gaussian blur -> Sobel gradient -> Non-maximum suppression -> Hysteresis thresholding
   * @private
   */
  applyCannyEdge(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Step 1: Convert to grayscale
    const gray = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    }

    // Step 2: Apply Gaussian blur (3x3 kernel)
    const blurred = new Float32Array(width * height);
    const gaussKernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    const gaussSum = 16;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += gray[(y + ky) * width + (x + kx)] * gaussKernel[ki++];
          }
        }
        blurred[y * width + x] = sum / gaussSum;
      }
    }

    // Step 3: Sobel gradient (magnitude and direction)
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const magnitude = new Float32Array(width * height);
    const direction = new Float32Array(width * height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0;
        let ki = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const val = blurred[(y + ky) * width + (x + kx)];
            gx += val * sobelX[ki];
            gy += val * sobelY[ki];
            ki++;
          }
        }
        const idx = y * width + x;
        magnitude[idx] = Math.hypot(gx, gy);
        direction[idx] = Math.atan2(gy, gx);
      }
    }

    // Step 4: Non-maximum suppression
    const suppressed = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const angle = direction[idx];
        const mag = magnitude[idx];

        // Quantize angle to 4 directions (0, 45, 90, 135 degrees)
        let q = 0,
          r = 0;
        const absAngle = Math.abs(angle);

        if (absAngle < Math.PI / 8 || absAngle > (7 * Math.PI) / 8) {
          // Horizontal edge (compare left/right)
          q = magnitude[idx - 1];
          r = magnitude[idx + 1];
        } else if (absAngle >= Math.PI / 8 && absAngle < (3 * Math.PI) / 8) {
          // Diagonal edge (compare top-right/bottom-left)
          if (angle > 0) {
            q = magnitude[(y - 1) * width + (x + 1)];
            r = magnitude[(y + 1) * width + (x - 1)];
          } else {
            q = magnitude[(y - 1) * width + (x - 1)];
            r = magnitude[(y + 1) * width + (x + 1)];
          }
        } else if (absAngle >= (3 * Math.PI) / 8 && absAngle < (5 * Math.PI) / 8) {
          // Vertical edge (compare top/bottom)
          q = magnitude[(y - 1) * width + x];
          r = magnitude[(y + 1) * width + x];
        } else if (angle > 0) {
          // Diagonal edge (compare top-left/bottom-right)
          q = magnitude[(y - 1) * width + (x - 1)];
          r = magnitude[(y + 1) * width + (x + 1)];
        } else {
          q = magnitude[(y - 1) * width + (x + 1)];
          r = magnitude[(y + 1) * width + (x - 1)];
        }

        // Keep only local maxima
        suppressed[idx] = mag >= q && mag >= r ? mag : 0;
      }
    }

    // Step 5: Double threshold and hysteresis
    const highThreshold = 50;
    const lowThreshold = 20;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = suppressed[idx];
        let output = 0;

        if (val >= highThreshold) {
          output = 255; // Strong edge
        } else if (val >= lowThreshold) {
          // Weak edge - check if connected to strong edge
          let hasStrongNeighbor = false;
          for (let ky = -1; ky <= 1 && !hasStrongNeighbor; ky++) {
            for (let kx = -1; kx <= 1 && !hasStrongNeighbor; kx++) {
              const ny = y + ky;
              const nx = x + kx;
              if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                if (suppressed[ny * width + nx] >= highThreshold) {
                  hasStrongNeighbor = true;
                }
              }
            }
          }
          output = hasStrongNeighbor ? 255 : 0;
        }

        const outIdx = idx * 4;
        data[outIdx] = output;
        data[outIdx + 1] = output;
        data[outIdx + 2] = output;
      }
    }
  }

  /**
   * Apply Sobel edge detection
   * @private
   */
  applySobelEdge(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to grayscale first
    const gray = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      gray[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    }

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0;
        let ki = 0;

        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const grayIdx = (y + ky) * width + (x + kx);
            gx += gray[grayIdx] * sobelX[ki];
            gy += gray[grayIdx] * sobelY[ki];
            ki++;
          }
        }

        const magnitude = Math.min(255, Math.hypot(gx, gy));
        const outIdx = (y * width + x) * 4;
        data[outIdx] = magnitude;
        data[outIdx + 1] = magnitude;
        data[outIdx + 2] = magnitude;
      }
    }
  }

  /**
   * Apply per-module color mode
   * @private
   */
  applyPerModuleColor(mode, baseColor, overlayData, row, col, moduleCount, config) {
    const brightness = overlayData[row]?.[col] ?? 0.5;
    const overlayColor = overlayData.colors?.[row]?.[col];
    const intensity = (config.overlayIntensity || 100) / 100;

    switch (mode) {
      case 'by_brightness': {
        // Vary module color based on image brightness
        const parsed = parseColor(baseColor);
        const factor = 0.5 + brightness * 0.5; // 0.5 to 1.0
        return `rgb(${Math.round(parsed.r * factor)},${Math.round(parsed.g * factor)},${Math.round(parsed.b * factor)})`;
      }

      case 'by_position': {
        // Color varies based on position in QR code
        const parsed = parseColor(baseColor);
        const xFactor = col / moduleCount;
        const yFactor = row / moduleCount;
        const r = Math.round(parsed.r * (0.5 + xFactor * 0.5));
        const g = Math.round(parsed.g * (0.5 + yFactor * 0.5));
        const b = Math.round(parsed.b * (0.5 + (1 - xFactor) * 0.5));
        return `rgb(${r},${g},${b})`;
      }

      case 'by_overlay': {
        // Use overlay image color directly
        if (overlayColor) {
          return blendColors(baseColor, overlayColor, intensity);
        }
        return baseColor;
      }

      case 'by_cluster': {
        // Group nearby modules with similar colors
        const blockSize = 3;
        const blockRow = Math.floor(row / blockSize);
        const blockCol = Math.floor(col / blockSize);
        const seed = blockRow * 100 + blockCol;
        const hueShift = (seed * 37) % 360;
        const parsed = parseColor(baseColor);
        // Simple hue rotation approximation
        const angle = (hueShift * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const r = Math.max(
          0,
          Math.min(
            255,
            parsed.r * (0.213 + cos * 0.787 - sin * 0.213) +
              parsed.g * (0.715 - cos * 0.715 - sin * 0.715) +
              parsed.b * (0.072 - cos * 0.072 + sin * 0.928)
          )
        );
        const g = Math.max(
          0,
          Math.min(
            255,
            parsed.r * (0.213 - cos * 0.213 + sin * 0.143) +
              parsed.g * (0.715 + cos * 0.285 + sin * 0.14) +
              parsed.b * (0.072 - cos * 0.072 - sin * 0.283)
          )
        );
        const b = Math.max(
          0,
          Math.min(
            255,
            parsed.r * (0.213 - cos * 0.213 - sin * 0.787) +
              parsed.g * (0.715 - cos * 0.715 + sin * 0.715) +
              parsed.b * (0.072 + cos * 0.928 + sin * 0.072)
          )
        );
        return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
      }

      default:
        return baseColor;
    }
  }

  /**
   * Ensure module color has sufficient contrast with background
   * @private
   */
  ensureContrast(moduleColor, bgColor, minRatio) {
    try {
      const ratio = getContrastRatio(moduleColor, bgColor);
      if (ratio >= minRatio) {
        return moduleColor;
      }

      // Darken the module color to improve contrast
      const parsed = parseColor(moduleColor);
      let factor = 0.9;
      let newColor = moduleColor;

      // Iteratively darken until we meet contrast ratio
      for (let i = 0; i < 10; i++) {
        const r = Math.round(parsed.r * factor);
        const g = Math.round(parsed.g * factor);
        const b = Math.round(parsed.b * factor);
        newColor = `rgb(${r},${g},${b})`;

        const newRatio = getContrastRatio(newColor, bgColor);
        if (newRatio >= minRatio) {
          return newColor;
        }
        factor *= 0.85;
      }

      // If still not enough contrast, return black
      return '#000000';
    } catch (error_) {
      console.warn('Contrast check failed:', error_);
      return moduleColor;
    }
  }

  /**
   * Apply advanced dithering using dither-algorithms module
   * Supports all dithering types: ordered, error diffusion, blue noise, etc.
   */
  async applyAdvancedDither(overlayCanvas, moduleCount, config) {
    // Get overlay as ImageData at module resolution using canvas factory
    const tempCanvas = await this.createCanvas(moduleCount, moduleCount);
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(overlayCanvas, 0, 0, moduleCount, moduleCount);
    const imageData = ctx.getImageData(0, 0, moduleCount, moduleCount);

    // Build dither options from config
    const ditherOptions = {
      kind: config.ditherKind || 'error_diffusion',
      strength: config.ditherStrength ?? 100,
      serpentine: config.serpentine !== false,
      diffusionKernel: config.diffusionKernel || 'floyd_steinberg',
      orderedMatrix: config.orderedMatrix || 'bayer4',
      colorMode: config.colorMode || 'bw',
      levels: 2,
      blueNoiseSeed: config.blueNoiseSeed || 0,
      blueNoiseTileSize: config.blueNoiseTileSize || 64,
    };

    // Apply dithering algorithm
    const result = applyDither(imageData, ditherOptions);
    return result;
  }

  /**
   * Apply palette color to a module based on position/brightness
   * @private
   */
  applyPaletteColor(row, col, moduleCount, brightness, palette, config) {
    if (!palette || palette.length === 0) return config.fgColor;

    const paletteMode = config.paletteMode || 'position';

    switch (paletteMode) {
      case 'brightness': {
        // Map brightness to palette index
        const idx = Math.floor((1 - brightness) * (palette.length - 0.01));
        return palette[Math.max(0, Math.min(palette.length - 1, idx))];
      }
      case 'diagonal': {
        // Color based on diagonal position
        const diag = (row + col) / (moduleCount * 2);
        const idx = Math.floor(diag * palette.length) % palette.length;
        return palette[idx];
      }
      case 'radial': {
        // Color based on distance from center
        const cx = moduleCount / 2;
        const cy = moduleCount / 2;
        const dist = Math.hypot(row - cy, col - cx);
        const maxDist = Math.hypot(cx, cy);
        const idx = Math.floor((dist / maxDist) * palette.length) % palette.length;
        return palette[idx];
      }
      case 'random': {
        // Deterministic random based on position
        const hash = ((row * 31 + col) * 17) % palette.length;
        return palette[hash];
      }
      case 'row': {
        // Color by row
        const idx = Math.floor((row / moduleCount) * palette.length) % palette.length;
        return palette[idx];
      }
      case 'column': {
        // Color by column
        const idx = Math.floor((col / moduleCount) * palette.length) % palette.length;
        return palette[idx];
      }
      default: {
        // Cycle through palette based on linear position
        const linearPos = row * moduleCount + col;
        const idx = linearPos % palette.length;
        return palette[idx];
      }
    }
  }

  /**
   * Apply halftone rendering to a module
   * @private
   */
  drawHalftoneModule(ctx, x, y, size, brightness, config) {
    // halftoneCell setting determines rendering scope (per_module is default)
    const htDot = config.halftoneDotShape || 'circle';
    const htCurve = config.brightnessCurve || 'linear';

    // Apply brightness curve
    let adjustedBrightness = brightness;
    switch (htCurve) {
      case 's-curve':
        adjustedBrightness = brightness * brightness * (3 - 2 * brightness);
        break;
      case 'gamma':
        adjustedBrightness = brightness ** 2.2;
        break;
      default: // linear
        break;
    }

    // Calculate dot size based on brightness (darker = larger dot)
    const minSize = 0.2;
    const maxSize = 1;
    const dotSizeRatio = minSize + (1 - adjustedBrightness) * (maxSize - minSize);
    const dotSize = size * dotSizeRatio;
    const offset = (size - dotSize) / 2;

    const centerX = x + size / 2;
    const centerY = y + size / 2;

    switch (htDot) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(x + offset, y + offset, dotSize, dotSize);
        break;

      case 'line': {
        // Draw a line that varies in thickness
        const lineWidth = dotSize * 0.8;
        ctx.fillRect(x, y + (size - lineWidth) / 2, size, lineWidth);
        break;
      }

      case 'diamond': {
        ctx.beginPath();
        ctx.moveTo(centerX, y + offset);
        ctx.lineTo(x + size - offset, centerY);
        ctx.lineTo(centerX, y + size - offset);
        ctx.lineTo(x + offset, centerY);
        ctx.closePath();
        ctx.fill();
        break;
      }
      // default case uses identical logic to 'circle' - fall through
    }
  }

  /**
   * Calculate ECC-aware weight for a module position
   * Higher weight = more important to preserve
   * @private
   */
  getEccWeight(_row, _col, _moduleCount, _version, _weightMap) {
    switch (_weightMap) {
      case 'distance_to_finders': {
        // Closer to finders = more important
        const distTL = Math.hypot(row, col);
        const distTR = Math.hypot(row, moduleCount - 1 - col);
        const distBL = Math.hypot(moduleCount - 1 - row, col);
        const minDist = Math.min(distTL, distTR, distBL);
        const maxDist = (Math.sqrt(2) * moduleCount) / 2;
        return 1 - minDist / maxDist;
      }

      case 'block_heatmap': {
        // Center blocks are less critical than edge blocks
        const centerRow = moduleCount / 2;
        const centerCol = moduleCount / 2;
        const distToCenter = Math.hypot(row - centerRow, col - centerCol);
        const maxDist = (Math.sqrt(2) * moduleCount) / 2;
        return distToCenter / maxDist;
      }

      case 'empirical_scan_heatmap': {
        // Simulate typical scanner patterns - top-left to bottom-right priority
        const scanProgress = (row + col) / (2 * moduleCount);
        // Earlier in scan = more important
        return 1 - scanProgress * 0.5;
      }

      default:
        return 0.5;
    }
  }

  /**
   * Check if modifying a module is safe given ECC-aware constraints
   * Uses deterministic decision based on position hash for reproducibility
   * @private
   */
  isEccSafeToModify(row, col, moduleCount, version, config, modifiedCount, totalDataModules) {
    if (!config.eccAwareEnabled) return true;

    const riskBudget = (config.eccAwareRiskBudget || 50) / 100;
    const eccCapacity = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };
    const maxRisk = eccCapacity[config.errorCorrection] || 0.25;
    const allowedModifications = Math.floor(totalDataModules * maxRisk * riskBudget);

    if (modifiedCount >= allowedModifications) return false;

    const weight = this.getEccWeight(
      row,
      col,
      moduleCount,
      version,
      config.eccAwareWeightMap || 'distance_to_finders'
    );

    // Use deterministic decision based on position hash for reproducibility
    // This replaces Math.random() to ensure same settings = same output
    const positionHash = ((row * 31 + col) * 17 + (config.seed || 0)) % 1000;
    const deterministicValue = positionHash / 1000;

    // Higher weight modules are less likely to be modified
    return deterministicValue > weight * 0.5;
  }
}
