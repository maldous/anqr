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

// Main apply dither function
export { applyDither } from './apply-dither';
