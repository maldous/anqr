/**
 * Animation Patterns Module
 * Generates animated QR code effects from static images
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

// ============================================
// TYPES
// ============================================

export type AnimationPattern =
  | 'none'
  | 'pulse'
  | 'wave'
  | 'scanline'
  | 'shimmer'
  | 'drift'
  | 'color_cycle';

export type InterpolationMode = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

// ============================================
// MAIN EXPORTS
// ============================================

/**
 * Generate animation pattern frames from a static image
 * Creates multiple frames with pattern effects applied
 */
export function generateAnimationPatternFrames(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  pattern: AnimationPattern,
  frameCount: number,
  speed: number = 1.0,
  seed: number = 0
): HTMLCanvasElement[] {
  if (pattern === 'none' || frameCount <= 1) {
    // Return single frame copy
    const canvas = document.createElement('canvas');
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(sourceCanvas, 0, 0);
    return [canvas];
  }

  const frames: HTMLCanvasElement[] = [];
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  // Get source image data
  const sourceCtx = (sourceCanvas as HTMLCanvasElement).getContext('2d');
  if (!sourceCtx) {
    throw new Error('Could not get 2D context from source canvas');
  }
  const sourceData = sourceCtx.getImageData(0, 0, width, height);

  for (let f = 0; f < frameCount; f++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Copy source data
    const frameData = new ImageData(new Uint8ClampedArray(sourceData.data), width, height);

    // Apply pattern effect based on frame number
    const progress = f / frameCount;
    applyPatternToImageData(frameData, pattern, progress, speed, seed);

    ctx.putImageData(frameData, 0, 0);
    frames.push(canvas);
  }

  return frames;
}

/**
 * Interpolate between frames with easing
 */
export function interpolateAnimationFramesWithEasing(
  frames: HTMLCanvasElement[],
  targetCount: number,
  mode: InterpolationMode = 'linear'
): HTMLCanvasElement[] {
  if (frames.length === 0) return [];
  if (frames.length === 1 || targetCount <= frames.length) {
    return frames.slice(0, targetCount);
  }

  const result: HTMLCanvasElement[] = [];
  const width = frames[0].width;
  const height = frames[0].height;

  for (let i = 0; i < targetCount; i++) {
    const t = i / (targetCount - 1);
    const easedT = applyEasing(t, mode);
    const sourcePos = easedT * (frames.length - 1);
    const frameA = Math.floor(sourcePos);
    const frameB = Math.min(frameA + 1, frames.length - 1);
    const blend = sourcePos - frameA;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    if (blend === 0 || frameA === frameB) {
      ctx.drawImage(frames[frameA], 0, 0);
    } else {
      // Blend between frames
      const ctxA = frames[frameA].getContext('2d')!;
      const ctxB = frames[frameB].getContext('2d')!;
      const dataA = ctxA.getImageData(0, 0, width, height);
      const dataB = ctxB.getImageData(0, 0, width, height);

      for (let p = 0; p < dataA.data.length; p += 4) {
        dataA.data[p] = Math.round(dataA.data[p] * (1 - blend) + dataB.data[p] * blend);
        dataA.data[p + 1] = Math.round(dataA.data[p + 1] * (1 - blend) + dataB.data[p + 1] * blend);
        dataA.data[p + 2] = Math.round(dataA.data[p + 2] * (1 - blend) + dataB.data[p + 2] * blend);
        dataA.data[p + 3] = Math.round(dataA.data[p + 3] * (1 - blend) + dataB.data[p + 3] * blend);
      }

      ctx.putImageData(dataA, 0, 0);
    }

    result.push(canvas);
  }

  return result;
}

// ============================================
// INTERNAL HELPERS
// ============================================

function applyEasing(t: number, mode: InterpolationMode): number {
  switch (mode) {
    case 'ease':
      return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return 1 - (1 - t) * (1 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    default:
      return t;
  }
}

function applyPatternToImageData(
  imageData: ImageData,
  pattern: AnimationPattern,
  progress: number,
  speed: number,
  seed: number
): void {
  const { data, width, height } = imageData;
  const time = progress * speed * Math.PI * 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      let factor = 1.0;

      switch (pattern) {
        case 'pulse': {
          // Global brightness pulse
          factor = 0.7 + 0.3 * Math.sin(time);
          break;
        }
        case 'wave': {
          // Horizontal wave
          const waveOffset = (x / width) * Math.PI * 4;
          factor = 0.7 + 0.3 * Math.sin(time + waveOffset);
          break;
        }
        case 'scanline': {
          // Vertical scanline
          const scanY = ((progress * speed) % 1) * height;
          const dist = Math.abs(y - scanY);
          factor = dist < 20 ? 1.3 : 1.0;
          break;
        }
        case 'shimmer': {
          // Diagonal shimmer
          const shimmerOffset = ((x + y) / (width + height)) * Math.PI * 4;
          factor = 0.8 + 0.2 * Math.sin(time + shimmerOffset + seed);
          break;
        }
        case 'drift': {
          // Subtle color drift
          const driftX = Math.sin(time + seed) * 0.1;
          const driftY = Math.cos(time + seed) * 0.1;
          factor =
            0.9 +
            0.1 *
              Math.sin((x / width + driftX) * Math.PI * 2 + (y / height + driftY) * Math.PI * 2);
          break;
        }
        case 'color_cycle': {
          // Hue rotation effect (simplified - just shifts RGB channels)
          const hueShift = progress * speed;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Simple RGB rotation
          const angle = hueShift * Math.PI * 2;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          data[i] = Math.max(0, Math.min(255, r * cos + g * sin));
          data[i + 1] = Math.max(0, Math.min(255, g * cos + b * sin));
          data[i + 2] = Math.max(0, Math.min(255, b * cos + r * sin));
          continue; // Skip normal factor application
        }
      }

      // Apply brightness factor
      data[i] = Math.max(0, Math.min(255, Math.round(data[i] * factor)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(data[i + 1] * factor)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(data[i + 2] * factor)));
    }
  }
}

// Default export for the module
export default {
  generateAnimationPatternFrames,
  interpolateAnimationFramesWithEasing,
};
