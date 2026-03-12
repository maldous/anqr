/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Apply fit mode (cover/contain/stretch) to canvas.
 */

import { createElement } from 'react';


export function applyFitTransform(
  workingCanvas: HTMLCanvasElement,
  fitMode: string
): HTMLCanvasElement | null {
  const fitCanvas = document.createElement('canvas');
  const fitCtx = fitCanvas.getContext('2d');
  if (!fitCtx) return null;
  const srcW = workingCanvas.width;
  const srcH = workingCanvas.height;
  const targetSize = Math.max(srcW, srcH);

  fitCanvas.width = targetSize;
  fitCanvas.height = targetSize;

  let drawX = 0,
    drawY = 0,
    drawW = srcW,
    drawH = srcH;

  if (fitMode === 'cover') {
    const scale = Math.max(targetSize / srcW, targetSize / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = (targetSize - drawW) / 2;
    drawY = (targetSize - drawH) / 2;
  } else if (fitMode === 'contain') {
    const scale = Math.min(targetSize / srcW, targetSize / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = (targetSize - drawW) / 2;
    drawY = (targetSize - drawH) / 2;
    fitCtx.fillStyle = 'transparent';
    fitCtx.fillRect(0, 0, targetSize, targetSize);
  } else if (fitMode === 'stretch') {
    drawW = targetSize;
    drawH = targetSize;
  }

  fitCtx.drawImage(workingCanvas, drawX, drawY, drawW, drawH);
  return fitCanvas;
}

