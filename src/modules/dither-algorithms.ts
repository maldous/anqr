/**
 * Dither Algorithms Module
 * Re-exports dithering functionality from dither-algorithms/ subdirectory
 */

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
  type DitherOptions,
  type DitherResult,
  type RGB,
  type TemporalDitherMode,
} from './dither-algorithms/';

export default DitherAlgorithms;
