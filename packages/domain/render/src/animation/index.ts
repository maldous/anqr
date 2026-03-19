// Barrel: domain/render/animation
export type { AnimationPattern, InterpolationMode } from "./animation-patterns.types";
export type { AnimationEasing } from "./shared-patterns";
export { generateAnimationPatternFrames } from "./generate-animation-pattern-frames";
export { interpolateAnimationFramesWithEasing } from "./interpolate-animation-frames-with-easing";
export { createGifCompositor } from "./gif-compositor";
export { interpolateFrames } from "./interpolate-frames";
export { applyAnimationPattern } from "./apply-animation-pattern";
export {
  applyAnimationColorCycle,
  applyAnimationDrift,
  applyAnimationEasing,
  applyAnimationPulse,
  applyAnimationScanline,
  applyAnimationShimmer,
  applyAnimationWave,
} from "./shared-patterns";
export { applyColorCycle } from "./color-cycle";
export { createAnimationLoop } from "./animation-loop";
export { withGifEncodeLock } from "./gif-lock";
export { decodeGif, isGifEncodingAvailable, isGifSignature } from "./gif-codec";
export { createGifEncoder, indexGifPixels, quantizeGifPalette } from "./gif-codec";
export type { DecodedGif, GifPatchFrame } from "./gif-codec";
export type { AnimationFrame, GifCompositor } from "./types";
export { parseAnimatedImage } from "./parsing";
export { decimateCompositorFrames } from "./decimate-compositor-frames";
export { resolveAnimationFrameDelay } from "./playback-delay";
