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

// Import from color-utils for color cycling (used in patterns)
import { hslToRgb } from '../color-utils';

// Re-export animation patterns from internal module
export {
  generatePatternFrames,
  interpolateFrames as interpolatePatternFrames,
  type AnimationPattern as PatternType,
  type InterpolationMode,
} from './internal/patterns';

// Re-export types for convenience
import type { AnimationFrame, AnimationOptions, AnimationPattern, AnimationState, GifCompositor } from './types';
import { createGifCompositor } from './gif-compositor';
import { calculateSourceFps, calculateCompositorFps, decimateCompositorFrames, decimateFramesToFps } from './decimation';
import { isAnimatedWebP, detectImageFormat } from './format-detection';
import { parseWebPFrames, parseAnimatedImage, parseGifFrames, getGifDelays } from './parsing';
import { createAnimationState, getNextFrame, advanceAnimation } from './state';

// ============================================
// ANIMATION PATTERNS
// ============================================

/**
 * Apply animation pattern to a frame
 */
export function applyAnimationPattern(
  canvas: HTMLCanvasElement,
  frameIndex: number,
  totalFrames: number,
  pattern: AnimationPattern,
  options: Partial<AnimationOptions> = {}
): HTMLCanvasElement {
  if (pattern === 'none') return canvas;

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  const progress = frameIndex / Math.max(1, totalFrames - 1);
  const seed = options.seed ?? 0;

  switch (pattern) {
    case 'pulse': {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
      const offset = ((1 - scale) * canvas.width) / 2;
      ctx.drawImage(canvas, offset, offset, canvas.width * scale, canvas.height * scale);
      break;
    }

    case 'wave': {
      ctx.drawImage(canvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let y = 0; y < canvas.height; y++) {
        const waveOffset = Math.sin((y + progress * canvas.height) * 0.1) * 2;
        for (let x = 0; x < canvas.width; x++) {
          const srcX = Math.round(x + waveOffset);
          if (srcX >= 0 && srcX < canvas.width) {
            const srcIdx = (y * canvas.width + srcX) * 4;
            const dstIdx = (y * canvas.width + x) * 4;
            data[dstIdx] = data[srcIdx];
            data[dstIdx + 1] = data[srcIdx + 1];
            data[dstIdx + 2] = data[srcIdx + 2];
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }

    case 'scanline': {
      ctx.drawImage(canvas, 0, 0);
      const scanY = Math.floor(progress * canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, scanY - 2, canvas.width, 4);
      break;
    }

    case 'shimmer': {
      ctx.drawImage(canvas, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const shimmer = Math.sin((x + progress * 100 + seed) * 0.1) * 20;
        data[i] = Math.min(255, Math.max(0, data[i] + shimmer));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + shimmer));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + shimmer));
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }

    case 'drift': {
      const driftX = Math.sin(progress * Math.PI * 2) * 3;
      const driftY = Math.cos(progress * Math.PI * 2) * 3;
      ctx.drawImage(canvas, driftX, driftY);
      break;
    }

    default:
      ctx.drawImage(canvas, 0, 0);
  }

  return result;
}

// ============================================
// TEMPORAL DITHERING
// ============================================

/**
 * Apply temporal dithering for animation frames
 */
export function applyTemporalDither(
  canvas: HTMLCanvasElement,
  frameIndex: number,
  mode: 'off' | 'blue_noise' | 'flicker_safe',
  seed: number = 0
): HTMLCanvasElement {
  if (mode === 'off') return canvas;

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const phi = 1.618033988749895;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;

      let noiseValue: number;

      if (mode === 'blue_noise') {
        const ign = (52.9829189 * ((0.06711056 * x + 0.00583715 * y) % 1)) % 1;
        const offset = (x * phi + y * phi * phi + frameIndex * 0.1 + seed) % 1;
        noiseValue = (ign + offset * 0.5) % 1;
      } else {
        noiseValue = (x * phi + y * phi * phi + frameIndex * 0.02 + seed) % 1;
      }

      const threshold = (noiseValue - 0.5) * 10;

      data[i] = Math.min(255, Math.max(0, data[i] + threshold));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + threshold));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + threshold));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}

// ============================================
// FRAME INTERPOLATION
// ============================================

/**
 * Interpolate between two frames
 */
export function interpolateFrames(
  frame1: HTMLCanvasElement,
  frame2: HTMLCanvasElement,
  t: number,
  mode: 'none' | 'crossfade' | 'morph'
): HTMLCanvasElement {
  if (mode === 'none' || t === 0) return frame1;
  if (t === 1) return frame2;

  const result = document.createElement('canvas');
  result.width = frame1.width;
  result.height = frame1.height;
  const ctx = result.getContext('2d');
  if (!ctx) return frame1;

  switch (mode) {
    case 'crossfade': {
      ctx.globalAlpha = 1 - t;
      ctx.drawImage(frame1, 0, 0);
      ctx.globalAlpha = t;
      ctx.drawImage(frame2, 0, 0);
      ctx.globalAlpha = 1;
      break;
    }

    case 'morph': {
      const ctx1 = frame1.getContext('2d');
      const ctx2 = frame2.getContext('2d');
      if (!(ctx1 && ctx2)) {
        ctx.drawImage(frame1, 0, 0);
        break;
      }
      const data1 = ctx1.getImageData(0, 0, frame1.width, frame1.height);
      const data2 = ctx2.getImageData(0, 0, frame2.width, frame2.height);
      const resultData = ctx.createImageData(result.width, result.height);

      for (let i = 0; i < data1.data.length; i++) {
        resultData.data[i] = Math.round(data1.data[i] * (1 - t) + data2.data[i] * t);
      }

      ctx.putImageData(resultData, 0, 0);
      break;
    }

    default:
      ctx.drawImage(frame1, 0, 0);
  }

  return result;
}

// ============================================
// COLOR CYCLING
// ============================================

/**
 * Apply color cycling effect to a frame
 */
export function applyColorCycle(
  canvas: HTMLCanvasElement,
  frameIndex: number,
  totalFrames: number
): HTMLCanvasElement {
  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(canvas, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const progress = frameIndex / Math.max(1, totalFrames);
  const baseHue = progress * 360;

  const tintColor = hslToRgb(baseHue, 80, 50);
  const complementHue = (baseHue + 180) % 360;
  const complementColor = hslToRgb(complementHue, 30, 70);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      const tintAmount = 0.7;
      data[i] = Math.min(255, r + tintColor.r * tintAmount);
      data[i + 1] = Math.min(255, g + tintColor.g * tintAmount);
      data[i + 2] = Math.min(255, b + tintColor.b * tintAmount);
    } else {
      const tintAmount = 0.15;
      data[i] = Math.max(0, Math.round(r - (255 - complementColor.r) * tintAmount));
      data[i + 1] = Math.max(0, Math.round(g - (255 - complementColor.g) * tintAmount));
      data[i + 2] = Math.max(0, Math.round(b - (255 - complementColor.b) * tintAmount));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}

// ============================================
// ANIMATION LOOP
// ============================================

/**
 * Create an animation loop handler
 */
export function createAnimationLoop(
  onFrame: (frameIndex: number, canvas: HTMLCanvasElement) => void,
  options: AnimationOptions
): { start: () => void; stop: () => void; setFrames: (frames: AnimationFrame[]) => void } {
  let state: AnimationState | null = null;
  let animationId: number | null = null;

  const tick = () => {
    if (!state?.playing) return;

    const now = performance.now();
    const frameDelay = state.frames[state.currentFrame]?.delay || options.speedMs;

    if (now - state.lastFrameTime >= frameDelay) {
      onFrame(state.currentFrame, state.frames[state.currentFrame].canvas);
      state = advanceAnimation(state, options);
    }

    animationId = requestAnimationFrame(tick);
  };

  return {
    start: () => {
      if (state) {
        state.playing = true;
        state.lastFrameTime = performance.now();
        tick();
      }
    },
    stop: () => {
      if (state) {
        state.playing = false;
      }
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    },
    setFrames: (frames: AnimationFrame[]) => {
      state = createAnimationState(frames);
    },
  };
}

// ============================================
// EXPORT
// ============================================

export const Animation = {
  // Image parsing
  parseAnimatedImage,
  parseGifFrames,
  parseWebPFrames,
  getGifDelays,
  detectImageFormat,
  isAnimatedWebP,

  // State management
  createAnimationState,
  getNextFrame,
  advanceAnimation,

  // Patterns
  applyAnimationPattern,
  applyTemporalDither,

  // Interpolation
  interpolateFrames,
  applyColorCycle,

  // Loop
  createAnimationLoop,

  // Performance utilities - GIF compositor (optimal)
  createGifCompositor,
  calculateCompositorFps,
  decimateCompositorFrames,
  // Legacy utilities (kept for backward compatibility)
  calculateSourceFps,
  decimateFramesToFps,
};

export default Animation;
