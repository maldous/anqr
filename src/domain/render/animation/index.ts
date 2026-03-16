// Barrel: domain/render/animation
export type { AnimationPattern, InterpolationMode } from "./animation-patterns.types";
export { generateAnimationPatternFrames } from "./generate-animation-pattern-frames";
export { interpolateAnimationFramesWithEasing } from "./interpolate-animation-frames-with-easing";
export { createGifCompositor } from "./gif-compositor";
export { interpolateFrames } from "./interpolate-frames";
export { applyAnimationPattern } from "./apply-animation-pattern";
export { applyColorCycle } from "./color-cycle";
export { createAnimationLoop } from "./animation-loop";
// Re-export types from modules/animation
export type { AnimationFrame, GifCompositor } from "../../../modules/animation/types";
export { parseAnimatedImage } from "../../../modules/animation/parsing";
export { decimateCompositorFrames } from "./decimate-compositor-frames";
export { resolveAnimationFrameDelay } from "./playback-delay";
