/**
 * Dither Algorithms Module
 * Re-exports dithering functionality from dither-algorithms/ subdirectory
 */

import {
  applyDither,
  bayerDither,
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  screenedBlueNoiseDither,
  temporalBlueNoiseDither,
  errorDiffusion,
  orderedDither,
  adaptiveThresholdDither,
  edgeAwareDither,
  perceptualDither,
  whiteNoiseDither,
  gaussianNoiseDither,
  triangularNoiseDither,
  imageDataToFloat,
  DitherAlgorithms,
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
  type DitherOptions,
  type DitherResult,
  type RGB,
  type TemporalDitherMode,
} from './dither-algorithms/';

// Re-export types
export type { DitherOptions, DitherResult, RGB, TemporalDitherMode };

// Re-export functions and namespace
export {
  applyDither,
  bayerDither,
  blueNoiseDither,
  blueNoiseErrorDiffusion,
  screenedBlueNoiseDither,
  temporalBlueNoiseDither,
  errorDiffusion,
  orderedDither,
  adaptiveThresholdDither,
  edgeAwareDither,
  perceptualDither,
  whiteNoiseDither,
  gaussianNoiseDither,
  triangularNoiseDither,
  imageDataToFloat,
  DitherAlgorithms,
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
};

export default DitherAlgorithms;
