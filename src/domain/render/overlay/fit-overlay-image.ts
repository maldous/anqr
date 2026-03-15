import type { FitMode } from './processor.types';

export function fitOverlayImage(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  mode: FitMode
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const sourceAspect = source.width / source.height;
  const targetAspect = targetWidth / targetHeight;

  let drawX = 0;
  let drawY = 0;
  let drawWidth = targetWidth;
  let drawHeight = targetHeight;

  switch (mode) {
    case 'contain': {
      if (sourceAspect > targetAspect) {
        drawHeight = targetWidth / sourceAspect;
        drawY = (targetHeight - drawHeight) / 2;
      } else {
        drawWidth = targetHeight * sourceAspect;
        drawX = (targetWidth - drawWidth) / 2;
      }
      break;
    }
    case 'cover': {
      if (sourceAspect > targetAspect) {
        drawWidth = targetHeight * sourceAspect;
        drawX = (targetWidth - drawWidth) / 2;
      } else {
        drawHeight = targetWidth / sourceAspect;
        drawY = (targetHeight - drawHeight) / 2;
      }
      break;
    }
    case 'none': {
      drawWidth = source.width;
      drawHeight = source.height;
      drawX = (targetWidth - drawWidth) / 2;
      drawY = (targetHeight - drawHeight) / 2;
      break;
    }
    // 'fill' uses the default values (stretch to fill)
  }

  ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
  return canvas;
}
