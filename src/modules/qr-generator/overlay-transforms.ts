/**
 * QR Generator Overlay Transforms
 * Geometric transformations for overlay images
 */

import type { QRGeneratorConfig, CreateCanvasFn } from './types';

/**
 * Check if overlay has preprocessing options that need to be applied
 */
export function hasPreprocessingOptions(config: QRGeneratorConfig): boolean {
  return !!(
    config.filterBrightness ||
    config.filterContrast ||
    config.filterSaturation ||
    config.filterHue ||
    config.filterGamma ||
    config.filterInvert ||
    config.filterGrayscale ||
    config.filterThreshold ||
    config.filterBlur ||
    config.filterSharpen ||
    config.filterEdgeDetect
  );
}

/**
 * Check if overlay has geometric transforms that need to be applied
 */
export function hasGeometricTransforms(config: QRGeneratorConfig): boolean {
  // This function checks for rotation, flip, scale, etc.
  // Currently we handle these through the overlay processor
  return false;
}

/**
 * Apply geometric transforms to overlay canvas
 */
export async function applyGeometricTransforms(
  canvas: HTMLCanvasElement,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<HTMLCanvasElement> {
  // Return canvas as-is if no transforms needed
  if (!hasGeometricTransforms(config)) {
    return canvas;
  }

  // Create new canvas for transformed output
  const result = await createCanvasFn(canvas.width, canvas.height);
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  return result;
}

/**
 * Preprocess overlay with filters
 */
export async function preprocessOverlay(
  canvas: HTMLCanvasElement,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<HTMLCanvasElement> {
  if (!hasPreprocessingOptions(config)) {
    return canvas;
  }

  // Get image data
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Import and apply filters
  const { preprocessImageData } = await import('./filters-preprocess');
  const processed = preprocessImageData(imageData, config);

  // Create output canvas
  const result = await createCanvasFn(canvas.width, canvas.height);
  const resultCtx = result.getContext('2d');
  if (!resultCtx) return canvas;

  resultCtx.putImageData(processed, 0, 0);
  return result;
}
