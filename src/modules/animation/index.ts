/**
 * Animation Module
 * Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects
 */

// Types
export type {
  AnimationFrame,
  AnimationOptions,
  AnimationPattern,
  AnimationState,
  GifCompositor,
} from './types';

// GIF Compositor
export { createGifCompositor } from './gif-compositor';

// Frame Decimation
export {
  calculateSourceFps,
  calculateCompositorFps,
  decimateCompositorFrames,
  decimateFramesToFps,
} from './decimation';

// Format Detection
export { isAnimatedWebP, detectImageFormat } from './format-detection';

// Parsing
export {
  parseWebPFrames,
  parseAnimatedImage,
  parseGifFrames,
  getGifDelays,
} from './parsing';

// State Management
export {
  createAnimationState,
  getNextFrame,
  advanceAnimation,
} from './state';

// Animation patterns from internal module
export {
  generatePatternFrames,
  interpolateFramesWithEasing,
  type AnimationPattern as PatternType,
  type InterpolationMode,
} from './patterns';

// Shared pixel-level pattern functions (used by client and server)
export type { AnimationEasing } from './shared-patterns';
export {
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
} from './shared-patterns';

// Animation pattern application
export { applyAnimationPattern } from './apply-animation-pattern';

// Frame interpolation
export { interpolateFrames } from './interpolate-frames';

// Color cycling
export { applyColorCycle } from './color-cycle';

// Animation loop
export { createAnimationLoop } from './animation-loop';

// Temporal dithering (deprecated wrapper - use dither-algorithms directly)
export { applyTemporalDither } from './temporal-dither';

// Re-export temporal dithering from canonical source (dither-algorithms)
export {
  calculateTemporalOffset,
  applyTemporalNoiseToCanvas,
  generateTemporalSequence,
  isTemporalDitherActive,
  temporalBlueNoiseDither,
  type TemporalDitherMode,
} from '../dither-algorithms';
