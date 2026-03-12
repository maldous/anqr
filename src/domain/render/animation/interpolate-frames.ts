/**
 * Frame Interpolation
 * Interpolate between animation frames
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('ANIMATION');

const MAX_MORPH_PIXELS = 512 * 512;

let morphScratchImageData: ImageData | null = null;
let morphScratchWidth = 0;
let morphScratchHeight = 0;

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

function crossfadeIntoContext(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number
): void {
  ctx.globalAlpha = 1 - t;
  ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
  ctx.globalAlpha = t;
  ctx.drawImage(frame2 as CanvasImageSource, 0, 0);
  ctx.globalAlpha = 1;
}

function getMorphScratch(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  width: number,
  height: number
): ImageData {
  if (!morphScratchImageData || morphScratchWidth !== width || morphScratchHeight !== height) {
    morphScratchImageData = ctx.createImageData(width, height);
    morphScratchWidth = width;
    morphScratchHeight = height;
  }
  return morphScratchImageData;
}

/**
 * Interpolate between two frames
 */
export function interpolateFrames(
  frame1: HTMLCanvasElement | OffscreenCanvas,
  frame2: HTMLCanvasElement | OffscreenCanvas,
  t: number,
  mode: 'none' | 'crossfade' | 'morph',
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  if (mode === 'none' || t === 0) return frame1 as HTMLCanvasElement;
  if (t === 1) return frame2 as HTMLCanvasElement;

  const result = createCanvasLike(frame1, targetCanvas);
  const ctx = resetCanvas2D(result);
  if (!ctx) return frame1 as HTMLCanvasElement;

  switch (mode) {
    case 'crossfade': {
      crossfadeIntoContext(ctx, frame1, frame2, t);
      break;
    }

    case 'morph': {
      const pixelCount = frame1.width * frame1.height;
      if (pixelCount > MAX_MORPH_PIXELS) {
        // Keep large-frame interpolation responsive by falling back to fast crossfade.
        crossfadeIntoContext(ctx, frame1, frame2, t);
        break;
      }

      const ctx1 =
        (frame1.getContext('2d', {
          willReadFrequently: true,
          desynchronized: true,
        } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
        frame1.getContext('2d');
      const ctx2 =
        (frame2.getContext('2d', {
          willReadFrequently: true,
          desynchronized: true,
        } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
        frame2.getContext('2d');
      if (!(ctx1 && ctx2)) {
        ctx.drawImage(frame1 as HTMLCanvasElement, 0, 0);
        break;
      }
      const data1 = ctx1.getImageData(0, 0, frame1.width, frame1.height);
      const data2 = ctx2.getImageData(0, 0, frame2.width, frame2.height);
      const resultData = getMorphScratch(ctx, result.width, result.height);
      const out = resultData.data;
      const src1 = data1.data;
      const src2 = data2.data;

      for (let i = 0; i < src1.length; i++) {
        out[i] = Math.round(src1[i] * (1 - t) + src2[i] * t);
      }

      ctx.putImageData(resultData, 0, 0);
      break;
    }

    default:
      ctx.drawImage(frame1 as CanvasImageSource, 0, 0);
  }

  return result;
}
