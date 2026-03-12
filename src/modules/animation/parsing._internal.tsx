import { createLogger } from '../../infra/logging/logger';
import { createGifCompositor } from '../../domain/render/animation/gif-compositor';
import type { AnimationFrame } from './types';

export const log = createLogger('ANIMATION');

export function asClampedRgbaView(pixels: Uint8Array): Uint8ClampedArray<ArrayBuffer> {
  if (pixels instanceof Uint8ClampedArray) {
    return pixels as Uint8ClampedArray<ArrayBuffer>;
  }
  return new Uint8ClampedArray(
    pixels.buffer as ArrayBuffer,
    pixels.byteOffset,
    pixels.byteLength
  ) as Uint8ClampedArray<ArrayBuffer>;
}

export async function decodeBlobToCanvasViaBitmap(blob: Blob): Promise<HTMLCanvasElement | null> {
  if (typeof createImageBitmap !== 'function') {
    return null;
  }

  try {
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(bitmap, 0, 0);
    }
    if (typeof bitmap.close === 'function') {
      bitmap.close();
    }
    return canvas;
  } catch {
    return null;
  }
}

/**
 * Parse WebP as a single frame (fallback)
 */
async function parseWebPAsSingleFrame(source: ArrayBuffer): Promise<AnimationFrame[]> {
  const blob = new Blob([source], { type: 'image/webp' });
  const bitmapCanvas = await decodeBlobToCanvasViaBitmap(blob);
  if (bitmapCanvas) {
    return [
      {
        canvas: bitmapCanvas,
        delay: 100,
        disposalType: 0,
      },
    ];
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);

      resolve([
        {
          canvas,
          delay: 100,
          disposalType: 0,
        },
      ]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load WebP image'));
    };

    img.src = url;
  });
}

/**
 * Parse any static image as a single animation frame
 */
async function parseStaticImageAsFrame(source: ArrayBuffer): Promise<AnimationFrame[]> {
  const blob = new Blob([source]);
  const bitmapCanvas = await decodeBlobToCanvasViaBitmap(blob);
  if (bitmapCanvas) {
    return [
      {
        canvas: bitmapCanvas,
        delay: 100,
        disposalType: 0,
      },
    ];
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      URL.revokeObjectURL(url);

      resolve([
        {
          canvas,
          delay: 100,
          disposalType: 0,
        },
      ]);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export function extractGifFramesViaCompositor(
  compositor: ReturnType<typeof createGifCompositor>,
  disposalHandling: 'respect' | 'simplify'
): AnimationFrame[] {
  const animationFrames: AnimationFrame[] = [];
  for (let i = 0; i < compositor.frameCount; i++) {
    compositor.apply(i);
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = compositor.width;
    frameCanvas.height = compositor.height;
    const frameCtx = frameCanvas.getContext('2d');
    if (frameCtx) {
      frameCtx.drawImage(compositor.canvas, 0, 0);
    }
    const srcDisposal = compositor.disposalType(i);
    const effectiveDisposal =
      disposalHandling === 'simplify' && srcDisposal === 3 ? 2 : srcDisposal;
    animationFrames.push({
      canvas: frameCanvas,
      delay: compositor.delayMs(i),
      disposalType: effectiveDisposal,
    });
    compositor.dispose(i);
  }
  return animationFrames;
}

export { parseWebPAsSingleFrame, parseStaticImageAsFrame };
