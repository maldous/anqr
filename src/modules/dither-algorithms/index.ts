/**
 * Dithering Algorithms Module
 * Comprehensive implementation of all dithering algorithms
 * Supports error diffusion, ordered dithering, and noise-based methods
 */

// Types
export type { RGB, DitherOptions, DitherResult, ColorMode, DiffusionKernel, DitherKind, OrderedMatrix } from './types';

// Matrices
export { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from './matrices';

// Kernels
export { DIFFUSION_KERNELS, type DiffusionKernelDef } from './kernels';

// Utilities
export { clamp01, rgbToGray, createRNG, getOrderedMatrix, imageDataToFloat } from './utils';

// Blue noise
export { generateBlueNoiseTile, sampleBlueNoise } from './blue-noise';

// Ordered dithering
export { orderedDither, bayerDither } from './ordered';

// Error diffusion
export { errorDiffusion, distributeErrorWithKernel } from './error-diffusion';

// Noise-based dithering
export { whiteNoiseDither, gaussianNoiseDither, triangularNoiseDither } from './noise';

// Advanced algorithms
export {
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  screenedBlueNoiseDither,
  perceptualDither,
  edgeAwareDither,
  adaptiveThresholdDither,
} from './advanced';

// Temporal dithering
export {
  temporalBlueNoiseDither,
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
} from './temporal';

// Import all for applyDither
import type { DitherOptions, DitherResult } from './types';
import { CLUSTERED_DOT, VOID_CLUSTER } from './matrices';
import { imageDataToFloat } from './utils';
import { bayerDither, orderedDither } from './ordered';
import { errorDiffusion } from './error-diffusion';
import { whiteNoiseDither, gaussianNoiseDither, triangularNoiseDither } from './noise';
import {
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  screenedBlueNoiseDither,
  perceptualDither,
  edgeAwareDither,
  adaptiveThresholdDither,
} from './advanced';
import { temporalBlueNoiseDither } from './temporal';

/** Apply dithering based on kind */
export function applyDither(imageData: ImageData, options: DitherOptions): DitherResult {
  const floatData = imageDataToFloat(imageData);
  const { width, height } = imageData;

  switch (options.kind) {
    case 'ordered_bayer': {
      const bayerSizeMap: Record<string, 2 | 4 | 8> = { bayer2: 2, bayer4: 4, bayer8: 8 };
      const bayerSize = bayerSizeMap[options.orderedMatrix] ?? 4;
      return bayerDither(floatData, width, height, bayerSize, options.levels, options.strength);
    }

    case 'ordered_clustered':
      return orderedDither(
        floatData,
        width,
        height,
        CLUSTERED_DOT,
        options.levels,
        options.strength
      );

    case 'ordered_void_cluster':
      return orderedDither(
        floatData,
        width,
        height,
        VOID_CLUSTER,
        options.levels,
        options.strength
      );

    case 'blue_noise':
    case 'blue_noise_threshold':
      return blueNoiseDither(floatData, width, height, {
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'white_noise':
      return whiteNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'gaussian_noise':
      return gaussianNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'triangular_noise':
      return triangularNoiseDither(
        floatData,
        width,
        height,
        options.blueNoiseSeed,
        options.strength,
        options.colorMode
      );

    case 'blue_noise_error_diffusion':
      return blueNoiseErrorDiffusion(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
      });

    case 'screened_blue_noise':
      return screenedBlueNoiseDither(floatData, width, height, {
        tileSize: options.blueNoiseTileSize,
        seed: options.blueNoiseSeed,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'perceptual':
      return perceptualDither(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'edge_aware':
      return edgeAwareDither(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });

    case 'adaptive_threshold':
      return adaptiveThresholdDither(floatData, width, height, options.strength, options.colorMode);

    case 'temporal_blue_noise':
      return temporalBlueNoiseDither(
        floatData,
        width,
        height,
        0,
        options.blueNoiseTileSize,
        options.blueNoiseSeed,
        options.colorMode
      );

    default:
      return errorDiffusion(floatData, width, height, {
        kernelName: options.diffusionKernel,
        serpentine: options.serpentine,
        levels: options.levels,
        strength: options.strength,
        colorMode: options.colorMode,
      });
  }
}

// Export object for backwards compatibility
export const DitherAlgorithms = {
  orderedDither,
  bayerDither,
  errorDiffusion,
  blueNoiseDither,
  temporalBlueNoiseDither,
  blueNoiseErrorDiffusion,
  screenedBlueNoiseDither,
  perceptualDither,
  edgeAwareDither,
  adaptiveThresholdDither,
  whiteNoiseDither,
  gaussianNoiseDither,
  triangularNoiseDither,
  applyDither,
  imageDataToFloat,
};

export default DitherAlgorithms;
