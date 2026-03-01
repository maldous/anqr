/**
 * Color Cycling
 * Apply color cycling effect to animation frames
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ANIMATION');

import { hslToRgb } from '../core';

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
  } else {
    result = document.createElement('canvas');
    result.width = canvas.width;
    result.height = canvas.height;
  }

  const ctx = result.getContext('2d');
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

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    const isDark = brightness < 128;

    if (isDark) {
      const tintAmount = 0.7;
      data[i] = Math.min(255, r + tintColor.r * tintAmount);
      data[i + 1] = Math.min(255, g + tintColor.g * tintAmount);
      data[i + 2] = Math.min(255, b + tintColor.b * tintAmount);
    } else {
      const tintAmount = 0.15;
      data[i] = Math.max(0, Math.round(r - (255 - complementColor.r) * tintAmount));
      data[i + 1] = Math.max(0, Math.round(g - (255 - complementColor.g) * tintAmount));
      data[i + 2] = Math.max(0, Math.round(b - (255 - complementColor.b) * tintAmount));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return result;
}
