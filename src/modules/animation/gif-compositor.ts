/**
 * GIF Compositor - Optimal patch-only decode
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

import { decompressFrames, parseGIF } from 'gifuct-js';
import type { GifCompositor } from './types';

/**
 * Create a GIF compositor from an ArrayBuffer.
 * Uses patch-only decode for minimal memory usage.
 */
export function createGifCompositor(arrayBuffer: ArrayBuffer): GifCompositor {
  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true);
  const { width, height } = gif.lsd;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context for GIF compositor canvas');
  }

  let maxPatchW = 0;
  let maxPatchH = 0;
  for (const f of frames) {
    maxPatchW = Math.max(maxPatchW, f.dims.width);
    maxPatchH = Math.max(maxPatchH, f.dims.height);
  }
  const patchCanvas = document.createElement('canvas');
  patchCanvas.width = maxPatchW;
  patchCanvas.height = maxPatchH;
  const patchCtx = patchCanvas.getContext('2d');

  let restoreData: { x: number; y: number; w: number; h: number; data: ImageData } | null = null;

  function apply(i: number): void {
    if (i < 0 || i >= frames.length) return;

    // Clear canvas on first frame to ensure clean slate and prevent ghosting
    // from previous animation cycles or stale content
    if (i === 0) {
      ctx.clearRect(0, 0, width, height);
      restoreData = null;
    }

    const f = frames[i];
    const { left, top, width: w, height: h } = f.dims;

    if (f.disposalType === 3) {
      restoreData = {
        x: left,
        y: top,
        w,
        h,
        data: ctx.getImageData(left, top, w, h),
      };
    } else {
      restoreData = null;
    }

    if (patchCtx) {
      patchCtx.clearRect(0, 0, w, h);
      const imageData = new ImageData(new Uint8ClampedArray(f.patch), w, h);
      patchCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(patchCanvas, 0, 0, w, h, left, top, w, h);
    }
  }

  function dispose(i: number): void {
    if (i < 0 || i >= frames.length) return;

    const f = frames[i];
    const { left, top, width: w, height: h } = f.dims;

    switch (f.disposalType) {
      case 2:
        ctx.clearRect(left, top, w, h);
        break;
      case 3:
        if (restoreData) {
          ctx.putImageData(restoreData.data, restoreData.x, restoreData.y);
        }
        break;
    }
  }

  function reset(): void {
    ctx.clearRect(0, 0, width, height);
    restoreData = null;
  }

  /**
   * Get a snapshot (copy) of the current canvas state.
   * Use this when you need to store or pass the frame to avoid reference issues.
   */
  function getSnapshot(): HTMLCanvasElement {
    const snapshot = document.createElement('canvas');
    snapshot.width = width;
    snapshot.height = height;
    const snapshotCtx = snapshot.getContext('2d');
    if (snapshotCtx) {
      snapshotCtx.drawImage(canvas, 0, 0);
    }
    return snapshot;
  }

  return {
    canvas,
    frameCount: frames.length,
    width,
    height,
    delayMs: (i: number) => Math.max(frames[i]?.delay || 10, 1) * 10,
    apply,
    dispose,
    reset,
    getSnapshot,
  };
}
