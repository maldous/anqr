import { decodeGif } from '../../domain/render/animation/gif-codec';
import type { AnimationFrame } from './types';
import { asClampedRgbaView } from './as-clamped-rgba-view';
import { log } from './log';

/**
 * Parse a GIF file and extract frames as canvas elements
 * @deprecated Use createGifCompositor for optimal performance
 */
export async function parseGifFrames(source: string | ArrayBuffer): Promise<AnimationFrame[]> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const { width, height, frames } = decodeGif(arrayBuffer);

  if (frames.length === 0) {
    throw new Error('No frames found in GIF');
  }

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compositeCtx =
    (compositeCanvas.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
    compositeCanvas.getContext('2d');
  if (!compositeCtx) {
    throw new Error('Failed to get 2D context for GIF composite canvas');
  }

  const animationFrames: AnimationFrame[] = [];

  log.debug('parseGifFrames: decoding', {
    frameCount: frames.length,
    width,
    height,
    sampleDelays: frames.slice(0, 5).map((f) => f.delay),
  });

  for (const frame of frames) {
    const { dims, patch, disposalType, delay } = frame;

    // Save region before patch for disposal type 3 (restore previous)
    let restoreData: ImageData | null = null;
    if (disposalType === 3) {
      restoreData = compositeCtx.getImageData(dims.left, dims.top, dims.width, dims.height);
    }

    const imageData = new ImageData(asClampedRgbaView(patch), dims.width, dims.height);

    const patchCanvas = document.createElement('canvas');
    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchCtx =
      (patchCanvas.getContext('2d', {
        willReadFrequently: true,
        desynchronized: true,
      } as CanvasRenderingContext2DSettings | undefined) as CanvasRenderingContext2D | null) ??
      patchCanvas.getContext('2d');
    if (patchCtx) {
      patchCtx.putImageData(imageData, 0, 0);
    }

    compositeCtx.drawImage(patchCanvas, dims.left, dims.top);

    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = width;
    outputCanvas.height = height;
    const outputCtx = outputCanvas.getContext('2d');
    if (outputCtx) {
      outputCtx.drawImage(compositeCanvas, 0, 0);
    }

    animationFrames.push({
      canvas: outputCanvas,
      delay,
      disposalType,
    });

    if (disposalType === 2) {
      compositeCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (disposalType === 3 && restoreData) {
      compositeCtx.putImageData(restoreData, dims.left, dims.top);
    }
  }

  return animationFrames;
}
