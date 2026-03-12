import { createElement } from 'react';

export function imageBitmapToCanvas(
  bitmap: ImageBitmap,
  targetCanvas?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = targetCanvas ?? document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create drawing context for worker-rendered QR-Art bitmap');
  }
  ctx.clearRect(0, 0, bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, 0, 0);
  return canvas;
}
