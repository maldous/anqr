/**
 * QR Generator Overlay Transforms
 * Geometric transformations for overlay images
 */

import { createLogger } from '../../lib/logger';
import { preprocessImageData } from './filters-preprocess';
import type { CreateCanvasFn, QRGeneratorConfig } from './types';

const log = createLogger('GENERATE');

/**
 * Check if overlay has preprocessing options that need to be applied
 */
export function hasPreprocessingOptions(config: QRGeneratorConfig): boolean {
  return (
    (config.filterBrightness !== undefined && config.filterBrightness !== 0) ||
    (config.filterContrast !== undefined && config.filterContrast !== 0) ||
    (config.filterSaturation !== undefined && config.filterSaturation !== 0) ||
    (config.filterHue !== undefined && config.filterHue !== 0) ||
    (config.filterGamma !== undefined && config.filterGamma !== 1) ||
    !!config.filterInvert ||
    !!config.filterGrayscale ||
    (config.filterThreshold !== undefined && config.filterThreshold > 0) ||
    (config.filterBlur !== undefined && config.filterBlur > 0) ||
    (config.filterSharpen !== undefined && config.filterSharpen > 0) ||
    (config.filterPosterize !== undefined && config.filterPosterize > 0) ||
    (!!config.filterDuotone1 && !!config.filterDuotone2) ||
    !!config.filterEdgeDetect ||
    // colorMode 'grayscale' or 'bw' requires preprocessing
    (config.colorMode !== undefined && config.colorMode !== 'color')
  );
}

/**
 * Check if overlay has geometric transforms that need to be applied
 */
export function hasGeometricTransforms(_config: QRGeneratorConfig): boolean {
  // This function checks for rotation, flip, scale, etc.
  // Currently we handle these through the overlay processor
  return false;
}

/**
 * Apply geometric transforms to overlay canvas
 */
export async function applyGeometricTransforms(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  // Return canvas as-is if no transforms needed
  if (!hasGeometricTransforms(config)) {
    return canvas;
  }

  // Create new canvas for transformed output
  const result = await createCanvasFn(canvas.width, canvas.height);
  const ctx = result.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) return canvas;

  ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  return result;
}

/**
 * Preprocess overlay with filters
 */
export async function preprocessOverlay(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  const debug = config.debugOverlayDither === true;

  if (!hasPreprocessingOptions(config)) {
    if (debug) {
      log.debug('preprocessOverlay - no preprocessing needed, returning original canvas');
    }
    return canvas;
  }

  if (debug) {
    log.debug('preprocessOverlay - starting preprocessing', {
      canvasSize: { width: canvas.width, height: canvas.height },
      colorMode: config.colorMode,
      filterGrayscale: config.filterGrayscale,
      filterBrightness: config.filterBrightness,
      filterContrast: config.filterContrast,
    });
  }

  // Get image data
  const ctx = (
    canvas as unknown as {
      getContext(
        contextId: '2d',
        options?: CanvasRenderingContext2DSettings
      ): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    }
  ).getContext('2d', {
    willReadFrequently: true,
  });
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Apply filters - pass debug flag through
  const processed = preprocessImageData(imageData, config, debug);

  // Create output canvas
  const result = await createCanvasFn(canvas.width, canvas.height);
  const resultCtx = result.getContext('2d') as CanvasRenderingContext2D | null;
  if (!resultCtx) return canvas;

  resultCtx.putImageData(processed, 0, 0);

  if (debug) {
    log.debug('preprocessOverlay - complete', {
      resultSize: { width: result.width, height: result.height },
    });
  }

  return result;
}
