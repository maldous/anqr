/**
 * Pixel Matrix - Standard Mode Handler
 * Standard modes (blend, halftone, center, etc.) at 1x scale
 */

import { parseColor } from '../color-utils.ts';

import { getOverlayData } from './overlay.js';

/**
 * Generate pixel matrix for standard modes (blend, halftone, center, etc.)
 * Returns base QR matrix with overlay data for per-module effects
 * @param {object} qr - QR code object
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement} overlayCanvas - Overlay canvas
 * @param {number} moduleCount - Number of modules
 * @param {number} effectiveIntensity - Effective overlay intensity
 * @param {object} effectiveConfig - Config with adjusted intensity
 * @param {Function} createCanvasFn - Canvas factory function
 * @returns {Promise<{matrix: boolean[][], colors: object[][], scale: number, overlayData: object, effectiveIntensity: number}>}
 */
export async function generateStandardMatrix(
  qr,
  config,
  overlayCanvas,
  moduleCount,
  effectiveIntensity,
  effectiveConfig,
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
