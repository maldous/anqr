/**
 * Pixel Matrix - Unified Overlay Processing
 * Prepares overlay data for any overlay mode
 */

import { isFinderPattern, isStructuralModule } from '../qr-core.ts';

import { applyAdvancedDither, applyTrueDither } from './dithering.js';
import { isEccSafeToModify } from './ecc.js';
import { getOverlayData } from './overlay.js';
import { getEffectiveIntensity } from './pixel-matrix-utils.js';
import { createSeededRandom, hashString } from './utils.js';

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
  const { effectiveIntensity, effectiveConfig } = getEffectiveIntensity(config);

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
