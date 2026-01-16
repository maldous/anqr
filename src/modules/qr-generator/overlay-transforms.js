/**
 * QR Generator Overlay Transforms Module
 * Handles geometric transforms and preprocessing for overlays
 */

import { applyFiltersManual } from './filters.js';

/**
 * Check if any preprocessing options are set
 * @deprecated Color adjustments are now done at moduleCount resolution in getOverlayData
 */
export function hasPreprocessingOptions(config) {
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
 */
export function hasGeometricTransforms(config) {
  return (
    config.overlayFlipX ||
    config.overlayFlipY ||
    (config.overlayRotate && config.overlayRotate !== 0)
  );
}

/**
 * Apply only geometric transforms (rotation, flip) at full resolution
 * Color adjustments are done at moduleCount resolution in getOverlayData
 */
export async function applyGeometricTransforms(overlayCanvas, config, createCanvasFn) {
  const width = overlayCanvas.width;
  const height = overlayCanvas.height;

  const processedCanvas = await createCanvasFn(width, height);
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
 */
export async function preprocessOverlay(overlayCanvas, config, createCanvasFn) {
  const width = overlayCanvas.width;
  const height = overlayCanvas.height;

  // Create a new canvas for processing
  const processedCanvas = await createCanvasFn(width, height);
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
  applyFiltersManual(imageData, filterOptions);

  // Put processed image data back
  ctx.putImageData(imageData, 0, 0);

  return processedCanvas;
}
