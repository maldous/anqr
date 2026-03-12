/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Simple canvas clone without extra processing.
 */

import { createElement } from 'react';


export function cloneCanvasSimple(
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas
): HTMLCanvasElement | OffscreenCanvas {
  const cloned = document.createElement('canvas');
  cloned.width = sourceCanvas.width;
  cloned.height = sourceCanvas.height;
  const clonedCtx = cloned.getContext('2d');
  if (clonedCtx) {
    clonedCtx.drawImage(sourceCanvas, 0, 0);
  }
  return cloned;
}

