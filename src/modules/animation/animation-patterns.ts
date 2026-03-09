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
  speed: number = 1,
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
  const sourceCtx =
    ((sourceCanvas as HTMLCanvasElement).getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
    ((sourceCanvas as HTMLCanvasElement).getContext('2d') as CanvasRenderingContext2D | null);
  if (!sourceCtx) {
    throw new Error('Could not get 2D context from source canvas');
  }
  const sourceData = sourceCtx.getImageData(0, 0, width, height);
  const sourcePixels = sourceData.data;
  const framePixels = new Uint8ClampedArray(sourcePixels.length);
  const reusableFrameData = new ImageData(framePixels, width, height);

  for (let f = 0; f < frameCount; f++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Copy source data into a reusable frame buffer.
    framePixels.set(sourcePixels);

    // Apply pattern effect based on frame number
    const progress = f / frameCount;
    applyPatternToImageData(reusableFrameData, pattern, progress, speed, seed);

    ctx.putImageData(reusableFrameData, 0, 0);
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
  const framePixels = new Array<Uint8ClampedArray | null>(frames.length);
  for (let i = 0; i < frames.length; i++) {
    const frameCtx =
      (frames[i]?.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
      (frames[i]?.getContext('2d') as CanvasRenderingContext2D | null);
    framePixels[i] = frameCtx ? frameCtx.getImageData(0, 0, width, height).data : null;
  }

  const blendPixels = new Uint8ClampedArray(width * height * 4);
  const reusableBlendData = new ImageData(blendPixels, width, height);

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
      const sourceA = framePixels[frameA];
      const sourceB = framePixels[frameB];
      if (!(sourceA && sourceB)) {
        ctx.drawImage(frames[frameA], 0, 0);
        result.push(canvas);
        continue;
      }

      for (let p = 0; p < sourceA.length; p += 4) {
        blendPixels[p] = Math.round(sourceA[p] * (1 - blend) + sourceB[p] * blend);
        blendPixels[p + 1] = Math.round(sourceA[p + 1] * (1 - blend) + sourceB[p + 1] * blend);
        blendPixels[p + 2] = Math.round(sourceA[p + 2] * (1 - blend) + sourceB[p + 2] * blend);
        blendPixels[p + 3] = Math.round(sourceA[p + 3] * (1 - blend) + sourceB[p + 3] * blend);
      }

      ctx.putImageData(reusableBlendData, 0, 0);
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

type PatternFrameApplier = (data: Uint8ClampedArray) => void;

const TAU = Math.PI * 2;
const PI4 = Math.PI * 4;

function clampToByte(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}

function applyUniformBrightness(data: Uint8ClampedArray, factor: number): void {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = clampToByte(data[i] * factor);
    data[i + 1] = clampToByte(data[i + 1] * factor);
    data[i + 2] = clampToByte(data[i + 2] * factor);
  }
}

function buildPatternFrameApplier(
  pattern: AnimationPattern,
  progress: number,
  speed: number,
  seed: number,
  width: number,
  height: number
): PatternFrameApplier {
  const time = progress * speed * TAU;

  switch (pattern) {
    case 'pulse': {
      const factor = 0.7 + 0.3 * Math.sin(time);
      return (data) => {
        applyUniformBrightness(data, factor);
      };
    }

    case 'wave': {
      const waveFactors = new Float32Array(width);
      const waveScale = PI4 / Math.max(1, width);
      for (let x = 0; x < width; x++) {
        waveFactors[x] = 0.7 + 0.3 * Math.sin(time + x * waveScale);
      }
      return (data) => {
        for (let y = 0; y < height; y++) {
          let i = y * width * 4;
          for (let x = 0; x < width; x++, i += 4) {
            const factor = waveFactors[x];
            data[i] = clampToByte(data[i] * factor);
            data[i + 1] = clampToByte(data[i + 1] * factor);
            data[i + 2] = clampToByte(data[i + 2] * factor);
          }
        }
      };
    }

    case 'scanline': {
      const scanY = ((progress * speed) % 1) * height;
      const rowFactors = new Float32Array(height);
      for (let y = 0; y < height; y++) {
        rowFactors[y] = Math.abs(y - scanY) < 20 ? 1.3 : 1;
      }
      return (data) => {
        for (let y = 0; y < height; y++) {
          const factor = rowFactors[y];
          let i = y * width * 4;
          for (let x = 0; x < width; x++, i += 4) {
            data[i] = clampToByte(data[i] * factor);
            data[i + 1] = clampToByte(data[i + 1] * factor);
            data[i + 2] = clampToByte(data[i + 2] * factor);
          }
        }
      };
    }

    case 'shimmer': {
      const denom = Math.max(1, width + height);
      const shimmerScale = PI4 / denom;
      const base = time + seed;
      const colSin = new Float32Array(width);
      const colCos = new Float32Array(width);
      const rowSin = new Float32Array(height);
      const rowCos = new Float32Array(height);
      for (let x = 0; x < width; x++) {
        const angle = base + x * shimmerScale;
        colSin[x] = Math.sin(angle);
        colCos[x] = Math.cos(angle);
      }
      for (let y = 0; y < height; y++) {
        const angle = y * shimmerScale;
        rowSin[y] = Math.sin(angle);
        rowCos[y] = Math.cos(angle);
      }
      return (data) => {
        for (let y = 0; y < height; y++) {
          const rs = rowSin[y];
          const rc = rowCos[y];
          let i = y * width * 4;
          for (let x = 0; x < width; x++, i += 4) {
            const shimmer = colSin[x] * rc + colCos[x] * rs;
            const factor = 0.8 + 0.2 * shimmer;
            data[i] = clampToByte(data[i] * factor);
            data[i + 1] = clampToByte(data[i + 1] * factor);
            data[i + 2] = clampToByte(data[i + 2] * factor);
          }
        }
      };
    }

    case 'drift': {
      const driftX = Math.sin(time + seed) * 0.1;
      const driftY = Math.cos(time + seed) * 0.1;
      const phase = (driftX + driftY) * TAU;
      const colSin = new Float32Array(width);
      const colCos = new Float32Array(width);
      const rowSin = new Float32Array(height);
      const rowCos = new Float32Array(height);
      const invWidth = width > 0 ? 1 / width : 0;
      const invHeight = height > 0 ? 1 / height : 0;
      for (let x = 0; x < width; x++) {
        const angle = x * invWidth * TAU + phase;
        colSin[x] = Math.sin(angle);
        colCos[x] = Math.cos(angle);
      }
      for (let y = 0; y < height; y++) {
        const angle = y * invHeight * TAU;
        rowSin[y] = Math.sin(angle);
        rowCos[y] = Math.cos(angle);
      }
      return (data) => {
        for (let y = 0; y < height; y++) {
          const rs = rowSin[y];
          const rc = rowCos[y];
          let i = y * width * 4;
          for (let x = 0; x < width; x++, i += 4) {
            const drift = colSin[x] * rc + colCos[x] * rs;
            const factor = 0.9 + 0.1 * drift;
            data[i] = clampToByte(data[i] * factor);
            data[i + 1] = clampToByte(data[i + 1] * factor);
            data[i + 2] = clampToByte(data[i + 2] * factor);
          }
        }
      };
    }

    case 'color_cycle': {
      const angle = progress * speed * TAU;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return (data) => {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = clampToByte(r * cos + g * sin);
          data[i + 1] = clampToByte(g * cos + b * sin);
          data[i + 2] = clampToByte(b * cos + r * sin);
        }
      };
    }

    default:
      return () => {};
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
  const applyForFrame = buildPatternFrameApplier(pattern, progress, speed, seed, width, height);
  applyForFrame(data);
}

// Default export for the module
export default {
  generateAnimationPatternFrames,
  interpolateAnimationFramesWithEasing,
};
