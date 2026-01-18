/**
 * Animation Parsing
 */

/// <reference path="../../types/image-decoder.d.ts" />

import { decompressFrames, parseGIF } from 'gifuct-js';
import type { AnimationFrame } from './types';
import { detectImageFormat, isAnimatedWebP } from './format-detection';
import { createGifCompositor } from './gif-compositor';

/**
 * Parse animated WebP using ImageDecoder API
 */
export async function parseWebPFrames(source: ArrayBuffer): Promise<AnimationFrame[]> {
  if (typeof ImageDecoder === 'undefined') {
    return parseWebPAsSingleFrame(source);
  }

  try {
    const decoder = new ImageDecoder({
      type: 'image/webp',
      data: source,
    });

    await decoder.completed;

    const frameCount = decoder.tracks.selectedTrack?.frameCount || 1;
    const frames: AnimationFrame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const result = await decoder.decode({ frameIndex: i });
      const { image, duration } = result;

      const canvas = document.createElement('canvas');
      canvas.width = image.displayWidth;
      canvas.height = image.displayHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);
      }
      image.close();

      frames.push({
        canvas,
        delay: duration ? duration / 1000 : 100,
        disposalType: 0,
      });
    }

    decoder.close();
    return frames;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: Fallback warning for ImageDecoder
    console.warn('ImageDecoder failed, falling back to single frame:', err);
    return parseWebPAsSingleFrame(source);
  }
}

/**
 * Parse WebP as a single frame (fallback)
 */
async function parseWebPAsSingleFrame(source: ArrayBuffer): Promise<AnimationFrame[]> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([source], { type: 'image/webp' });
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
  return new Promise((resolve, reject) => {
    const blob = new Blob([source]);
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

/**
 * Parse any animated image (GIF or WebP) and extract frames
 */
export async function parseAnimatedImage(source: string | ArrayBuffer): Promise<AnimationFrame[]> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const format = detectImageFormat(arrayBuffer);

  if (format === 'gif') {
    const compositor = createGifCompositor(arrayBuffer);
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
      animationFrames.push({
        canvas: frameCanvas,
        delay: compositor.delayMs(i),
        disposalType: 0,
      });
      compositor.dispose(i);
    }
    return animationFrames;
  }

  if (format === 'webp') {
    if (isAnimatedWebP(arrayBuffer)) {
      return parseWebPFrames(arrayBuffer);
    }
    return parseWebPAsSingleFrame(arrayBuffer);
  }

  return parseStaticImageAsFrame(arrayBuffer);
}

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

  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true);

  if (frames.length === 0) {
    throw new Error('No frames found in GIF');
  }
  const { width, height } = gif.lsd;

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const compositeCtx = compositeCanvas.getContext('2d');
  if (!compositeCtx) {
    throw new Error('Failed to get 2D context for GIF composite canvas');
  }

  const animationFrames: AnimationFrame[] = [];

  for (const frame of frames) {
    const { dims, patch, disposalType, delay } = frame;

    const imageData = new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height);

    const patchCanvas = document.createElement('canvas');
    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchCtx = patchCanvas.getContext('2d');
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
      delay: delay * 10,
      disposalType,
    });

    if (disposalType === 2) {
      compositeCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    }
  }

  return animationFrames;
}

/**
 * Get frame delays from a GIF
 */
export async function getGifDelays(source: string | ArrayBuffer): Promise<number[]> {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = source;
  }

  const gif = parseGIF(arrayBuffer);
  const frames = decompressFrames(gif, true);

  return frames.map((frame) => frame.delay * 10);
}
