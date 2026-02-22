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
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const sourceData = new Uint8ClampedArray(data);
      const axis = options.waveAxis || 'y';

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const offsetX = Math.sin((y + progress * canvas.height) * 0.1) * 2;
          const offsetY = Math.sin((x + progress * canvas.width) * 0.1) * 2;
          const srcX =
            axis === 'x' ? x : axis === 'xy' ? Math.round(x + offsetX) : Math.round(x + offsetX);
          const srcY =
            axis === 'x' ? Math.round(y + offsetY) : axis === 'xy' ? Math.round(y + offsetY) : y;
          if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
            const srcIdx = (srcY * canvas.width + srcX) * 4;
            const dstIdx = (y * canvas.width + x) * 4;
            data[dstIdx] = sourceData[srcIdx];
            data[dstIdx + 1] = sourceData[srcIdx + 1];
            data[dstIdx + 2] = sourceData[srcIdx + 2];
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
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
      ctx.drawImage(canvas as CanvasImageSource, driftX, driftY);
      break;
    }

    default:
      ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  }

  return result;
}
