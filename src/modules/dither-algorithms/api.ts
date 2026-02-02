/**
 * Dither Algorithms Module - Public API Manifest
 *
 * This file documents all public exports from the dither-algorithms module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('DITHER');

// Main apply function
export const MAIN_API = ['applyDither'] as const;

// Error diffusion
export const ERROR_DIFFUSION_API = ['errorDiffusion', 'distributeErrorWithKernel'] as const;

// Ordered dithering
export const ORDERED_API = ['bayerDither', 'orderedDither'] as const;

// Blue noise
export const BLUE_NOISE_API = [
  'blueNoiseDither',
  'generateBlueNoiseTile',
  'sampleBlueNoise',
] as const;

// Temporal dithering
export const TEMPORAL_API = [
  'applyTemporalNoiseToCanvas',
  'calculateTemporalOffset',
  'generateTemporalSequence',
  'isTemporalDitherActive',
  'temporalBlueNoiseDither',
] as const;

// Noise-based dithering
export const NOISE_API = [
  'whiteNoiseDither',
  'gaussianNoiseDither',
  'triangularNoiseDither',
] as const;

// Advanced algorithms
export const ADVANCED_API = [
  'adaptiveThresholdDither',
  'blueNoiseErrorDiffusion',
  'edgeAwareDither',
  'perceptualDither',
  'screenedBlueNoiseDither',
] as const;

// Kernels
export const KERNEL_API = ['DIFFUSION_KERNELS'] as const;

// Matrices
export const MATRIX_API = [
  'BAYER_2',
  'BAYER_4',
  'BAYER_8',
  'CLUSTERED_DOT',
  'VOID_CLUSTER',
] as const;

// Utilities
export const UTILS_API = [
  'clamp01',
  'createRNG',
  'getOrderedMatrix',
  'imageDataToFloat',
  'rgbToGray',
] as const;

// Types
export const TYPES = [
  'ColorMode',
  'DiffusionKernel',
  'DiffusionKernelDef',
  'DitherKind',
  'DitherOptions',
  'DitherResult',
  'OrderedMatrix',
  'RGB',
  'TemporalDitherMode',
] as const;

// All public exports
export const PUBLIC_API = [
  ...MAIN_API,
  ...ERROR_DIFFUSION_API,
  ...ORDERED_API,
  ...BLUE_NOISE_API,
  ...TEMPORAL_API,
  ...NOISE_API,
  ...ADVANCED_API,
  ...KERNEL_API,
  ...MATRIX_API,
  ...UTILS_API,
] as const;
