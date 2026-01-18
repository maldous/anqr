/**
 * Apply Animation Pattern
 * Apply visual effects to animation frames
 */

import type { AnimationOptions, AnimationPattern } from './types';

/**
 * Apply animation pattern to a frame
 */
export function applyAnimationPattern(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  frameIndex: number,
  totalFrames: number,
  pattern: AnimationPattern,
  options: Partial<AnimationOptions> = {}
): HTMLCanvasElement {
  if (pattern === 'none') return canvas as HTMLCanvasElement;

  const result = document.createElement('canvas');
  result.width = canvas.width;
  result.height = canvas.height;
  const ctx = result.getContext('2d');
  if (!ctx) return canvas as HTMLCanvasElement;

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
