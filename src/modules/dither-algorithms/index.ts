/**
 * Dithering Algorithms Module
 * Comprehensive implementation of all dithering algorithms
 * Supports error diffusion, ordered dithering, and noise-based methods
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('DITHER');

// Advanced algorithms
export {
  adaptiveThresholdDither,
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  edgeAwareDither,
  perceptualDither,
  screenedBlueNoiseDither,
} from '../../domain/render/dither/advanced';
// Main apply dither function
export { applyDither } from '../../domain/render/dither/apply-dither';
// Error diffusion
export { distributeErrorWithKernel, errorDiffusion } from '../../domain/render/dither/error-diffusion';
// Kernels
export { DIFFUSION_KERNELS, type DiffusionKernelDef } from '../../domain/render/dither/kernels';
// Matrices
export { BAYER_2, BAYER_4, BAYER_8, CLUSTERED_DOT, VOID_CLUSTER } from '../../domain/render/dither/matrices';
// Noise-based dithering
export { gaussianNoiseDither, triangularNoiseDither, whiteNoiseDither } from '../../domain/render/dither/noise';
// Ordered dithering
export { bayerDither, orderedDither } from '../../domain/render/dither/ordered';
// Temporal dithering
export {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from '../../domain/render/dither/temporal';
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
export {
  clamp01,
  createRNG,
  generateBlueNoiseTile,
  getOrderedMatrix,
  imageDataToFloat,
  rgbToGray,
  sampleBlueNoise,
} from './utils';
