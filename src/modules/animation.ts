/**
 * Animation Module
 * Re-exports animation functionality from animation/ subdirectory
 */

export {
  // Types
  type AnimationFrame,
  type AnimationOptions,
  type AnimationPattern,
  type AnimationState,
  type GifCompositor,
  type PatternType,
  type InterpolationMode,
  type AnimationEasing,
  
  // GIF Compositor
  createGifCompositor,
  
  // Frame Decimation
  calculateSourceFps,
  calculateCompositorFps,
  decimateCompositorFrames,
  decimateFramesToFps,
  
  // Format Detection
  isAnimatedWebP,
  detectImageFormat,
  
  // Parsing
  parseWebPFrames,
  parseAnimatedImage,
  parseGifFrames,
  getGifDelays,
  
  // State Management
  createAnimationState,
  getNextFrame,
  advanceAnimation,
  
  // Patterns
  applyAnimationPattern,
  applyTemporalDither,
  generatePatternFrames,
  interpolatePatternFrames,
  
  // Interpolation
  interpolateFrames,
  applyColorCycle,
  
  // Animation Loop
  createAnimationLoop,
  
  // Shared pixel-level pattern functions
  applyEasing,
  applyPulsePattern,
  applyWavePattern,
  applyScanlinePattern,
  applyShimmerPattern,
  applyDriftPattern,
  applyColorCyclePattern,
  
  // Namespace
  Animation,
} from './animation/';

export default Animation;
