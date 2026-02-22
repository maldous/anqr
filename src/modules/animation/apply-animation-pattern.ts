/**
 * Apply Animation Pattern
 * Apply visual effects to animation frames
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

import type { AnimationOptions, AnimationPattern } from './types';

function resetCanvas2D(
  canvas: HTMLCanvasElement | OffscreenCanvas
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  if ('setTransform' in ctx && typeof ctx.setTransform === 'function') {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  if ('filter' in ctx) {
    (ctx as CanvasRenderingContext2D).filter = 'none';
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function createCanvasLike(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  if (targetCanvas) {
    if (targetCanvas.width !== sourceCanvas.width) targetCanvas.width = sourceCanvas.width;
    if (targetCanvas.height !== sourceCanvas.height) targetCanvas.height = sourceCanvas.height;
    return targetCanvas;
  }

  if (
    typeof OffscreenCanvas !== 'undefined' &&
    sourceCanvas instanceof OffscreenCanvas &&
    typeof sourceCanvas.width === 'number'
  ) {
    return new OffscreenCanvas(sourceCanvas.width, sourceCanvas.height);
  }

  const result = document.createElement('canvas');
  result.width = sourceCanvas.width;
  result.height = sourceCanvas.height;
  return result;
}

function resolveEffectBounds(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  options: Partial<AnimationOptions>
): { x: number; y: number; width: number; height: number } {
  const raw = options.effectBounds;
  if (!raw) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }

  const x = Math.max(0, Math.min(canvas.width, Math.floor(raw.x)));
  const y = Math.max(0, Math.min(canvas.height, Math.floor(raw.y)));
  const width = Math.max(0, Math.min(canvas.width - x, Math.floor(raw.width)));
  const height = Math.max(0, Math.min(canvas.height - y, Math.floor(raw.height)));
  if (width === 0 || height === 0) {
    return { x: 0, y: 0, width: canvas.width, height: canvas.height };
  }
  return { x, y, width, height };
}

/**
 * Apply animation pattern to a frame
 */
export function applyAnimationPattern(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  frameIndex: number,
  totalFrames: number,
  pattern: AnimationPattern,
  options: Partial<AnimationOptions> = {},
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  if (pattern === 'none') return canvas;

  const result = createCanvasLike(canvas, targetCanvas);
  const ctx = resetCanvas2D(result);
  if (!ctx) return canvas;

  const progress = frameIndex / Math.max(1, totalFrames - 1);
  const seed = options.seed ?? 0;
  const bounds = resolveEffectBounds(canvas, options);

  switch (pattern) {
    case 'pulse': {
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
      const offset = ((1 - scale) * canvas.width) / 2;
      ctx.drawImage(
        canvas as CanvasImageSource,
        offset,
        offset,
        canvas.width * scale,
        canvas.height * scale
      );
      break;
    }

    case 'wave': {
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      const axis = options.waveAxis || 'y';
      const amplitude = 2;
      const waveScale = 0.1;

      if (axis === 'y' || axis === 'xy') {
        for (let y = bounds.y; y < bounds.y + bounds.height; y++) {
          const offsetX = Math.round(
            Math.sin((y + progress * canvas.height + seed) * waveScale) * amplitude
          );
          ctx.drawImage(
            canvas as CanvasImageSource,
            bounds.x,
            y,
            bounds.width,
            1,
            bounds.x + offsetX,
            y,
            bounds.width,
            1
          );
        }
      }

      if (axis === 'x' || axis === 'xy') {
        for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
          const offsetY = Math.round(
            Math.sin((x + progress * canvas.width + seed) * waveScale) * amplitude
          );
          ctx.drawImage(
            canvas as CanvasImageSource,
            x,
            bounds.y,
            1,
            bounds.height,
            x,
            bounds.y + offsetY,
            1,
            bounds.height
          );
        }
      }
      break;
    }

    case 'scanline': {
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      const scanY = Math.floor(progress * canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, scanY - 2, canvas.width, 4);
      break;
    }

    case 'shimmer': {
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
      const bandWidth = Math.max(16, Math.floor(bounds.width * 0.2));
      const sweep =
        ((progress * 1.2 + (Math.sin(seed * 0.1234) + 1) * 0.5) % 1) *
          (bounds.width + bandWidth * 2) -
        bandWidth;
      const gradient = ctx.createLinearGradient(
        bounds.x + sweep - bandWidth,
        bounds.y,
        bounds.x + sweep + bandWidth,
        bounds.y + bounds.height
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.5, 'rgba(255,255,255,0.24)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.globalCompositeOperation = 'source-over';
      break;
    }

    case 'drift': {
      const driftX = Math.sin(progress * Math.PI * 2) * 3;
      const driftY = Math.cos(progress * Math.PI * 2) * 3;
      ctx.drawImage(canvas as CanvasImageSource, driftX, driftY);
      break;
    }

    default:
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  }

  return result;
}
