/**
 * QR Generator Advanced Dithering Module
 * Uses dither-algorithms module for advanced dithering types
 */

import { applyDither } from '../dither-algorithms.ts';

/**
 * Apply advanced dithering using dither-algorithms module
 * Supports all dithering types: ordered, error diffusion, blue noise, etc.
 */
export async function applyAdvancedDither(overlayCanvas, moduleCount, config, createCanvasFn) {
  // Get overlay as ImageData at module resolution using canvas factory
  const tempCanvas = await createCanvasFn(moduleCount, moduleCount);
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
