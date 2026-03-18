export {
  applyTemporalNoiseToCanvas,
  calculateTemporalOffset,
  generateTemporalSequence,
  isTemporalDitherActive,
  type TemporalDitherMode,
  temporalBlueNoiseDither,
} from "../dither-algorithms";
export { createAnimationLoop } from "./animation-loop";
export {
  type AnimationPattern as PatternType,
  generateAnimationPatternFrames,
  type InterpolationMode,
  interpolateAnimationFramesWithEasing,
} from "./animation-patterns";
export { applyAnimationPattern } from "./apply-animation-pattern";
export { applyColorCycle } from "./color-cycle";
export { calculateCompositorFps, calculateSourceFps, decimateCompositorFrames, decimateFramesToFps } from "./decimation";
export { detectImageFormat, isAnimatedWebP } from "./format-detection";
export {
  createGifEncoder,
  type DecodedGif,
  decodeGif,
  type GifPatchFrame,
  indexGifPixels,
  isGifEncodingAvailable,
  isGifSignature,
  quantizeGifPalette,
} from "./gif-codec";
export { createGifCompositor } from "./gif-compositor";
export { interpolateFrames } from "./interpolate-frames";
export { getGifDelays, parseAnimatedImage, parseGifFrames, parseWebPFrames } from "./parsing";
export { resolveAnimationFrameDelay } from "./playback-delay";
export type { AnimationEasing } from "./shared-patterns";
export {
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationEasing,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
  applyAnimationWave,
} from "./shared-patterns";
export { advanceAnimation, createAnimationState, getNextFrame } from "./state";
export { applyTemporalDither } from "./temporal-dither";
export type { AnimationFrame, AnimationOptions, AnimationPattern, AnimationState, GifCompositor } from "./types";
