/**
 * Pixel Matrix - Dither/Extreme Mode Handlers
 * True dither at 1x scale - modifies module dark/light state
 */

import { parseColor } from '../color-utils.ts';
import { isFinderPattern, isStructuralModule } from '../qr-core.ts';

import { applyAdvancedDither, applyTrueDither } from './dithering.js';
import { isEccSafeToModify } from './ecc.js';
import { getOverlayData } from './overlay.js';
import { createSeededRandom, hashString } from './utils.js';

/**
 * Generate pixel matrix for 'dither' or 'extreme' mode (1x scale)
 * @param {object} qr - QR code object
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement} overlayCanvas - Overlay canvas
 * @param {number} moduleCount - Number of modules
 * @param {number} effectiveIntensity - Effective overlay intensity
 * @param {object} effectiveConfig - Config with adjusted intensity
 * @param {string} overlayMode - 'dither' or 'extreme'
 * @param {Function} createCanvasFn - Canvas factory function
 * @returns {Promise<{matrix: boolean[][], colors: object[][], scale: number, overlayData: object, effectiveIntensity: number}>}
 */
export async function generateDitherModeMatrix(
  qr,
  config,
  overlayCanvas,
  moduleCount,
  effectiveIntensity,
  effectiveConfig,
  overlayMode,
  createCanvasFn
) {
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
  const normalizedColors = normalizeColors(matrix, colors, moduleCount);

  return {
    matrix,
    colors: normalizedColors,
    scale: 1,
    overlayData,
    effectiveIntensity,
  };
}

/**
 * Normalize colors to RGB object format
 * @param {boolean[][]} matrix - Decision matrix
 * @param {any[][]} colors - Colors array (may be strings or objects)
 * @param {number} moduleCount - Number of modules
 * @returns {object[][]} Normalized colors as RGB objects
 */
export function normalizeColors(matrix, colors, moduleCount) {
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
  return normalizedColors;
}
