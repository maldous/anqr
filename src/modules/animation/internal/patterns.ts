/**
 * Animation Patterns Module
 * Generates animated QR code effects from static images
 */

import { hslToRgb } from '../../core';

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
  | 'rotate'
  | 'color_cycle';

export type InterpolationMode = 'none' | 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface PatternOptions {
  frameCount?: number;
  seed?: number;
  intensity?: number;
}

// ============================================
// PATTERN GENERATION
// ============================================

/**
 * Generate frames for an animation pattern from a source canvas
 */
export function generatePatternFrames(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  pattern: AnimationPattern,
  frameCount: number = 30,
  options: PatternOptions = {}
): (HTMLCanvasElement | OffscreenCanvas)[] {
  if (pattern === 'none') {
    return [sourceCanvas];
  }

  const frames: HTMLCanvasElement[] = [];
  const { seed = 0, intensity = 1 } = options;

  for (let i = 0; i < frameCount; i++) {
    const progress = i / frameCount;
    const frame = applyPatternToFrame(sourceCanvas, pattern, progress, seed, intensity);
    frames.push(frame);
  }

  return frames;
}

/**
 * Apply a pattern effect to a single frame
 */
function applyPatternToFrame(
  source: HTMLCanvasElement | OffscreenCanvas,
  pattern: AnimationPattern,
  progress: number,
  seed: number,
  intensity: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return source as HTMLCanvasElement;

  switch (pattern) {
    case 'pulse': {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05 * intensity;
      const offset = ((1 - scale) * source.width) / 2;
      ctx.drawImage(
        source,
        offset,
        offset,
        source.width * scale,
        source.height * scale
      );
      break;
    }

    case 'wave': {
      ctx.drawImage(source, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const tempData = new Uint8ClampedArray(data);

      for (let y = 0; y < canvas.height; y++) {
        const waveOffset = Math.sin((y / canvas.height + progress) * Math.PI * 4) * 3 * intensity;
        for (let x = 0; x < canvas.width; x++) {
          const srcX = Math.round(x + waveOffset);
          if (srcX >= 0 && srcX < canvas.width) {
            const srcIdx = (y * canvas.width + srcX) * 4;
            const dstIdx = (y * canvas.width + x) * 4;
            data[dstIdx] = tempData[srcIdx];
            data[dstIdx + 1] = tempData[srcIdx + 1];
            data[dstIdx + 2] = tempData[srcIdx + 2];
            data[dstIdx + 3] = tempData[srcIdx + 3];
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }

    case 'scanline': {
      ctx.drawImage(source, 0, 0);
      const scanY = Math.floor(progress * canvas.height);
      const gradient = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.3 * intensity})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, scanY - 10, canvas.width, 20);
      break;
    }

    case 'shimmer': {
      ctx.drawImage(source, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        const shimmer = Math.sin((x / canvas.width + progress + seed * 0.1) * Math.PI * 8) * 20 * intensity;
        data[i] = Math.min(255, Math.max(0, data[i] + shimmer));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + shimmer));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + shimmer));
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }

    case 'drift': {
      const driftX = Math.sin(progress * Math.PI * 2) * 3 * intensity;
      const driftY = Math.cos(progress * Math.PI * 2) * 3 * intensity;
      ctx.drawImage(source, driftX, driftY);
      break;
    }

    case 'rotate': {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(progress * Math.PI * 2 * 0.02 * intensity);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(source, 0, 0);
      break;
    }

    case 'color_cycle': {
      ctx.drawImage(source, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const hueShift = progress * 360;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple hue rotation
        const brightness = (r + g + b) / 3;
        const isDark = brightness < 128;

        if (isDark) {
          const rgb = hslToRgb((hueShift + seed * 10) % 360, 80, 40);
          const blend = 0.3 * intensity;
          data[i] = Math.round(r * (1 - blend) + rgb.r * blend);
          data[i + 1] = Math.round(g * (1 - blend) + rgb.g * blend);
          data[i + 2] = Math.round(b * (1 - blend) + rgb.b * blend);
        }
      }
      ctx.putImageData(imageData, 0, 0);
      break;
    }

    default:
      ctx.drawImage(source, 0, 0);
  }

  return canvas;
}

// ============================================
// INTERPOLATION
// ============================================

/**
 * Apply interpolation easing function to a value
 * Note: This is distinct from applyEasing in shared-patterns.ts which uses AnimationEasing type
 */
function applyInterpolationEasing(t: number, mode: InterpolationMode): number {
  switch (mode) {
    case 'ease':
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    case 'ease-in':
      return t * t * t;
    case 'ease-out':
      return 1 - Math.pow(1 - t, 3);
    case 'ease-in-out':
      return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
    case 'linear':
    default:
      return t;
  }
}

/**
 * Interpolate between two frames with easing
 * Note: This is distinct from interpolateFrames in interpolate-frames.ts which uses blend modes
 */
export function interpolateFramesWithEasing(
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number,
  mode: InterpolationMode = 'linear'
): HTMLCanvasElement {
  if (mode === 'none' || t === 0) return frame1 as HTMLCanvasElement;
  if (t >= 1) return frame2 as HTMLCanvasElement;

  const easedT = applyInterpolationEasing(t, mode);

  const result = document.createElement('canvas');
  result.width = frame1.width;
  result.height = frame1.height;
  const ctx = result.getContext('2d');
  if (!ctx) return frame1 as HTMLCanvasElement;

  // Crossfade blend
  ctx.globalAlpha = 1 - easedT;
  ctx.drawImage(frame1, 0, 0);
  ctx.globalAlpha = easedT;
  ctx.drawImage(frame2, 0, 0);
  ctx.globalAlpha = 1;

  return result;
}

export default {
  generatePatternFrames,
  interpolateFramesWithEasing,
};
