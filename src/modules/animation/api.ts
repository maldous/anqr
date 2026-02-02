/**
 * Animation Module - Public API Manifest
 *
 * This file documents all public exports from the animation module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

// Parsing
export const PARSING_API = [
  'parseAnimatedImage',
  'parseGifFrames',
  'parseWebPFrames',
  'getGifDelays',
] as const;

// Format Detection
export const FORMAT_DETECTION_API = ['detectImageFormat', 'isAnimatedWebP'] as const;

// Animation Patterns
export const PATTERN_API = [
  'generateAnimationPatternFrames',
  'applyAnimationPattern',
  'interpolateAnimationFramesWithEasing',
  'interpolateFrames',
] as const;

// Shared Pattern Functions
export const SHARED_PATTERN_API = [
  'applyAnimationColorCycle',
  'applyAnimationDrift',
  'applyAnimationEasing',
  'applyAnimationPulse',
  'applyAnimationScanline',
  'applyAnimationShimmer',
  'applyAnimationWave',
] as const;

// State Management
export const STATE_API = ['createAnimationState', 'advanceAnimation', 'getNextFrame'] as const;

// GIF Compositor
export const COMPOSITOR_API = ['createGifCompositor', 'createAnimationLoop'] as const;

// Frame Decimation
export const DECIMATION_API = [
  'calculateCompositorFps',
  'calculateSourceFps',
  'decimateCompositorFrames',
  'decimateFramesToFps',
] as const;

// Color Effects
export const COLOR_API = ['applyColorCycle'] as const;

// Temporal Dithering (re-exported from dither-algorithms)
export const TEMPORAL_DITHER_API = [
  'applyTemporalNoiseToCanvas',
  'calculateTemporalOffset',
  'generateTemporalSequence',
  'isTemporalDitherActive',
  'temporalBlueNoiseDither',
  'applyTemporalDither',
] as const;

// Types
export const TYPES = [
  'AnimationFrame',
  'AnimationOptions',
  'AnimationPattern',
  'AnimationState',
  'AnimationEasing',
  'GifCompositor',
  'PatternType',
  'InterpolationMode',
  'TemporalDitherMode',
] as const;

// All public exports
export const PUBLIC_API = [
  ...PARSING_API,
  ...FORMAT_DETECTION_API,
  ...PATTERN_API,
  ...SHARED_PATTERN_API,
  ...STATE_API,
  ...COMPOSITOR_API,
  ...DECIMATION_API,
  ...COLOR_API,
  ...TEMPORAL_DITHER_API,
] as const;
