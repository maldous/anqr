/**
 * Dithering Algorithms Module
 * Comprehensive implementation of all dithering algorithms
 * Supports error diffusion, ordered dithering, and noise-based methods
 */

// Advanced algorithms
export {
  adaptiveThresholdDither,
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  edgeAwareDither,
  perceptualDither,
  screenedBlueNoiseDither,
} from './advanced';
// Main apply dither function
export { applyDither } from './apply-dither';
// Blue noise
export { generateBlueNoiseTile, sampleBlueNoise } from './blue-noise';
// Error diffusion
export { distributeErrorWithKernel, errorDiffusion } from './error-diffusion';
// Kernels
export { DIFFUSION_KERNELS, type DiffusionKernelDef } from './kernels';
// Matrices
export { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from './matrices';
// Noise-based dithering
export { gaussianNoiseDither, triangularNoiseDither, whiteNoiseDither } from './noise';
// Ordered dithering
export { bayerDither, orderedDither } from './ordered';
// Temporal dithering
export {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from './temporal';
// Types
export type {
  ColorMode,
  DiffusionKernel,
  DitherKind,
  DitherOptions,
  DitherResult,
  OrderedMatrix,
  RGB,
} from './types';
// Utilities
export { clamp01, createRNG, getOrderedMatrix, imageDataToFloat, rgbToGray } from './utils';
