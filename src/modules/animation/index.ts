/**
 * Animation Module
 * Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

// Re-export temporal dithering from canonical source (dither-algorithms)
export {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from '../dither-algorithms';
// Animation loop
export { createAnimationLoop } from './animation-loop';
// Animation patterns
export {
  type AnimationPattern as PatternType,
  generateAnimationPatternFrames,
  type InterpolationMode,
  interpolateAnimationFramesWithEasing,
} from './animation-patterns';
// Animation pattern application
export { applyAnimationPattern } from './apply-animation-pattern';
// Color cycling
export { applyColorCycle } from './color-cycle';
// Frame Decimation
export {
  calculateCompositorFps,
  calculateSourceFps,
  decimateCompositorFrames,
  decimateFramesToFps,
} from './decimation';
// Format Detection
export { detectImageFormat, isAnimatedWebP } from './format-detection';
// GIF Compositor
export { createGifCompositor } from './gif-compositor';
// Frame interpolation
export { interpolateFrames } from './interpolate-frames';
// Parsing
export {
  getGifDelays,
  parseAnimatedImage,
  parseGifFrames,
  parseWebPFrames,
} from './parsing';
// Shared pixel-level pattern functions (used by client and server)
export type { AnimationEasing } from './shared-patterns';
export {
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationEasing,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
  applyAnimationWave,
} from './shared-patterns';
// State Management
export {
  advanceAnimation,
  createAnimationState,
  getNextFrame,
} from './state';

// Temporal dithering (deprecated wrapper - use dither-algorithms directly)
export { applyTemporalDither } from './temporal-dither';
// Types
export type {
  AnimationFrame,
  AnimationOptions,
  AnimationPattern,
  AnimationState,
  GifCompositor,
} from './types';
