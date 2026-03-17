// Shim
/**
 * Animation Module
 * Handles GIF and WebP animation parsing, frame management, animation patterns, and temporal effects
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("ANIMATION");

// Re-export temporal dithering from canonical source (dither-algorithms)
export {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from "../dither-algorithms";
// Animation loop
export { createAnimationLoop } from "../../domain/render/animation/animation-loop";
// Animation patterns
export {
  type AnimationPattern as PatternType,
  generateAnimationPatternFrames,
  type InterpolationMode,
  interpolateAnimationFramesWithEasing,
} from "../../domain/render/animation/animation-patterns";
// Animation pattern application
export { applyAnimationPattern } from "../../domain/render/animation/apply-animation-pattern";
// Color cycling
export { applyColorCycle } from "../../domain/render/animation/color-cycle";
// Frame Decimation
export {
  calculateCompositorFps,
  calculateSourceFps,
  decimateCompositorFrames,
  decimateFramesToFps,
} from "../../domain/render/animation/decimation";
// Format Detection
export { detectImageFormat, isAnimatedWebP } from "../../domain/render/animation/format-detection";
// GIF Codec Facade
export {
  createGifEncoder,
  type DecodedGif,
  decodeGif,
  type GifPatchFrame,
  indexGifPixels,
  isGifEncodingAvailable,
  isGifSignature,
  quantizeGifPalette,
} from "../../domain/render/animation/gif-codec";
// GIF Compositor
export { createGifCompositor } from "../../domain/render/animation/gif-compositor";
// Frame interpolation
export { interpolateFrames } from "../../domain/render/animation/interpolate-frames";
// Parsing
export { getGifDelays, parseAnimatedImage, parseGifFrames, parseWebPFrames } from "./parsing";
// Playback delay resolution
export { resolveAnimationFrameDelay } from "../../domain/render/animation/playback-delay";
// Shared pixel-level pattern functions (used by client and server)
export type { AnimationEasing } from "../../domain/render/animation/shared-patterns";
export {
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationEasing,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
  applyAnimationWave,
} from "../../domain/render/animation/shared-patterns";
// State Management
export { advanceAnimation, createAnimationState, getNextFrame } from "./state";

// Temporal dithering (deprecated wrapper - use dither-algorithms directly)
export { applyTemporalDither } from "../../domain/render/animation/temporal-dither";
// Types
export type {
  AnimationFrame,
  AnimationOptions,
  AnimationPattern,
  AnimationState,
  GifCompositor,
} from "./types";
