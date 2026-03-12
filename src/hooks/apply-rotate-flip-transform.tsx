import { createElement } from 'react';

export function applyRotateFlipTransform(
  workingCanvas: HTMLCanvasElement,
  rotateDeg: number,
  flipX: boolean,
  flipY: boolean
): HTMLCanvasElement | null {
  const processedCanvas = document.createElement('canvas');
  const ctx = processedCanvas.getContext('2d');
  if (!ctx) return null;
  const angle = (rotateDeg * Math.PI) / 180;
  const isRightAngle = rotateDeg === 90 || rotateDeg === 270;

  if (isRightAngle) {
    processedCanvas.width = workingCanvas.height;
    processedCanvas.height = workingCanvas.width;
  } else {
    processedCanvas.width = workingCanvas.width;
    processedCanvas.height = workingCanvas.height;
  }

  ctx.save();
  ctx.translate(processedCanvas.width / 2, processedCanvas.height / 2);

  if (rotateDeg !== 0) {
    ctx.rotate(angle);
  }
  if (flipX) {
    ctx.scale(-1, 1);
  }
  if (flipY) {
    ctx.scale(1, -1);
  }

  ctx.drawImage(workingCanvas, -workingCanvas.width / 2, -workingCanvas.height / 2);
  ctx.restore();
  return processedCanvas;
}
