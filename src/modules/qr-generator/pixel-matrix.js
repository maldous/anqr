/**
 * Pixel Decision Matrix Generation
 * Unified pixel-level decision making for all overlay modes
 * Re-exports from split module files
 */

import { generateSubpixelMatrix } from './overlay.js';
import { generateDitheredMatrix, generateBlueNoiseMatrix } from './pixel-matrix-dithered.js';
import { generateDitherModeMatrix, normalizeColors } from './pixel-matrix-dither.js';
import { prepareUnifiedOverlayData } from './pixel-matrix-overlay.js';
import { generateStandardMatrix } from './pixel-matrix-standard.js';
import {
  generateBaseMatrix,
  getEffectiveIntensity,
  getScaleFactor,
} from './pixel-matrix-utils.js';

// Re-export utilities
export { getScaleFactor, getEffectiveIntensity, generateBaseMatrix } from './pixel-matrix-utils.js';
export { generateDitheredMatrix, generateBlueNoiseMatrix } from './pixel-matrix-dithered.js';
export { generateDitherModeMatrix, normalizeColors } from './pixel-matrix-dither.js';
export { generateStandardMatrix } from './pixel-matrix-standard.js';
export { prepareUnifiedOverlayData } from './pixel-matrix-overlay.js';

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
  const { effectiveIntensity, effectiveConfig } = getEffectiveIntensity(config);

  // No overlay - return base QR matrix at requested scale
  if (overlayCanvas === null || overlayCanvas === undefined) {
    const { matrix, colors } = generateBaseMatrix(qr, scaledSize, scale);
    return { matrix, colors, scale, overlayData: null, effectiveIntensity };
  }

  // Route to mode-specific pixel generation
  switch (overlayMode) {
    case 'dithered':
      return generateDitheredMatrix(
        config,
        overlayCanvas,
        scale,
        effectiveIntensity,
        effectiveConfig,
        createCanvasFn
      );

    case 'blue-noise':
      return generateBlueNoiseMatrix(
        config,
        overlayCanvas,
        scale,
        effectiveIntensity,
        canvasFactory,
        createCanvasFn
      );

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
    case 'extreme':
      return generateDitherModeMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        effectiveIntensity,
        effectiveConfig,
        overlayMode,
        createCanvasFn
      );

    default:
      return generateStandardMatrix(
        qr,
        config,
        overlayCanvas,
        moduleCount,
        effectiveIntensity,
        effectiveConfig,
        createCanvasFn
      );
  }
}
