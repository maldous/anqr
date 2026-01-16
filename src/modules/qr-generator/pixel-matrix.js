/**
 * Pixel Decision Matrix Generation
 * Unified pixel-level decision making for all overlay modes
 */

import { generateBlueNoiseDithered } from '../blue-noise-dither.ts';
import { parseColor } from '../color-utils.ts';
import { generateQR, isFinderPattern, isStructuralModule } from '../qr-core.ts';

import {
  applyAdvancedDither,
  applyDitherToMatrix,
  applyTrueDither,
} from './dithering.js';
import { isEccSafeToModify } from './ecc.js';
import {
  generateSubpixelMatrix,
  getOverlayData,
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from './overlay.js';
import { createSeededRandom, hashString } from './utils.js';

/**
 * Get the scale factor for a given overlay mode.
 * - Standard modes: scale=1 (module-level rendering)
 * - Dithered/Blue-noise modes: scale=3 (subpixel dithering)
 * - Subpixel modes: scale=2,3,4 (configurable grid)
 * @param {string} overlayMode - The overlay mode
 * @param {object} config - Generator config
 * @returns {number} Scale factor
 */
export function getScaleFactor(overlayMode, config) {
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
 * @param {object} qr - QR code object
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement|null} overlayCanvas - Overlay canvas
 * @param {number} moduleCount - Number of modules
 * @param {Function} createCanvasFn - Canvas factory function
 * @param {object} canvasFactory - Canvas factory object
 * @returns {Promise<{matrix: boolean[][], colors: RGB[][], scale: number, overlayData: any, effectiveIntensity: number}>}
 */
export async function generatePixelDecisionMatrix(
  qr,
  config,
  overlayCanvas,
  moduleCount,
  createCanvasFn,
  canvasFactory
) {
  const overlayMode = config.overlayMode;
  const scale = getScaleFactor(overlayMode, config);
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
          createCanvasFn
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
        canvasFactory: canvasFactory,
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
        createCanvasFn
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
        createCanvasFn
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
            createCanvasFn
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
        createCanvasFn
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
 *
 * @param {object} qr - QR code object
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement|null} overlayCanvas - Overlay canvas
 * @param {number} moduleCount - Number of modules
 * @param {Function} createCanvasFn - Canvas factory function
 * @returns {Promise<{ditherPattern: boolean[][]|null, colors: any, overlayData: any, effectiveIntensity: number}>}
 */
export async function prepareUnifiedOverlayData(
  qr,
  config,
  overlayCanvas,
  moduleCount,
  createCanvasFn
) {
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
    createCanvasFn
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
          createCanvasFn
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
