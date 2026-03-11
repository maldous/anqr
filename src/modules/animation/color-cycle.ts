/**
 * Color Cycling
 * Apply color cycling effect to animation frames
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

import { hslToRgb } from '../core';

function clampToByte(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}

/**
 * Apply color cycling effect to a frame
 */
export function applyColorCycle(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  frameIndex: number,
  totalFrames: number,
  targetCanvas?: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  let result: HTMLCanvasElement | OffscreenCanvas;
  if (targetCanvas) {
    result = targetCanvas;
    if (result.width !== canvas.width) result.width = canvas.width;
    if (result.height !== canvas.height) result.height = canvas.height;
  } else if (typeof OffscreenCanvas === 'undefined') {
    result = document.createElement('canvas');
    result.width = canvas.width;
    result.height = canvas.height;
  } else {
    result = new OffscreenCanvas(canvas.width, canvas.height);
  }

  const ctx =
    (result.getContext('2d', {
      willReadFrequently: true,
      desynchronized: true,
    } as CanvasRenderingContext2DSettings | undefined) as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null) ??
    (result.getContext('2d') as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null);
  if (!ctx) return canvas;

  if (result !== canvas) {
    ctx.drawImage(canvas as CanvasImageSource, 0, 0);
  }
  const imageData = ctx.getImageData(0, 0, result.width, result.height);
  const data = imageData.data;

  const progress = frameIndex / Math.max(1, totalFrames);
  const baseHue = progress * 360;

  const tintColor = hslToRgb(baseHue, 80, 50);
  const complementHue = (baseHue + 180) % 360;
  const complementColor = hslToRgb(complementHue, 30, 70);
  const darkTintR = tintColor.r * 0.7;
  const darkTintG = tintColor.g * 0.7;
  const darkTintB = tintColor.b * 0.7;
  const lightTintR = (255 - complementColor.r) * 0.15;
  const lightTintG = (255 - complementColor.g) * 0.15;
  const lightTintB = (255 - complementColor.b) * 0.15;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      data[i] = clampToByte(r + darkTintR);
      data[i + 1] = clampToByte(g + darkTintG);
      data[i + 2] = clampToByte(b + darkTintB);
    } else {
      data[i] = clampToByte(r - lightTintR);
      data[i + 1] = clampToByte(g - lightTintG);
      data[i + 2] = clampToByte(b - lightTintB);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}
