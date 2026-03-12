import { createElement } from 'react';

export function applyCropTransform(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  cropRegion: { x: number; y: number; size: number }
): HTMLCanvasElement | null {
  const { x, y, size } = cropRegion;
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) return null;

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  const minEdge = Math.min(srcWidth, srcHeight);
  const cropSizePx = Math.max(1, Math.round(minEdge * size));
  const halfCrop = cropSizePx / 2;

  const centerX = x * srcWidth;
  const centerY = y * srcHeight;
  const cropX = Math.max(0, Math.min(srcWidth - cropSizePx, centerX - halfCrop));
  const cropY = Math.max(0, Math.min(srcHeight - cropSizePx, centerY - halfCrop));

  cropCanvas.width = cropSizePx;
  cropCanvas.height = cropSizePx;

  cropCtx.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropSizePx,
    cropSizePx,
    0,
    0,
    cropSizePx,
    cropSizePx
  );
  return cropCanvas;
}
