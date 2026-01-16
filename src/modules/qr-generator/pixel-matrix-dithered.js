/**
 * Pixel Matrix - Dithered Mode Handlers
 * Error diffusion and blue noise dithering at 3x scale
 */

import { generateBlueNoiseDithered } from '../blue-noise-dither.ts';
import { generateQR } from '../qr-core.ts';

import { applyDitherToMatrix } from './dithering.js';
import {
  hasPreprocessingOptions,
  loadImageDataRGB,
  preprocessOverlay,
} from './overlay.js';

/**
 * Generate pixel matrix for 'dithered' mode (error diffusion at 3x scale)
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement} overlayCanvas - Overlay canvas
 * @param {number} scale - Scale factor (3)
 * @param {number} effectiveIntensity - Effective overlay intensity
 * @param {object} effectiveConfig - Config with adjusted intensity
 * @param {Function} createCanvasFn - Canvas factory function
 * @returns {Promise<{matrix: boolean[][], colors: object[][], scale: number, overlayData: null, effectiveIntensity: number}>}
 */
export async function generateDitheredMatrix(
  config,
  overlayCanvas,
  scale,
  effectiveIntensity,
  effectiveConfig,
  createCanvasFn
) {
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

/**
 * Generate pixel matrix for 'blue-noise' mode (blue noise dithering at 3x scale)
 * @param {object} config - Generator config
 * @param {HTMLCanvasElement} overlayCanvas - Overlay canvas
 * @param {number} scale - Scale factor (3)
 * @param {number} effectiveIntensity - Effective overlay intensity
 * @param {object} canvasFactory - Canvas factory object
 * @param {Function} createCanvasFn - Canvas factory function
 * @returns {Promise<{matrix: boolean[][], colors: object[][], scale: number, overlayData: null, effectiveIntensity: number}>}
 */
export async function generateBlueNoiseMatrix(
  config,
  overlayCanvas,
  scale,
  effectiveIntensity,
  canvasFactory,
  createCanvasFn
) {
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
