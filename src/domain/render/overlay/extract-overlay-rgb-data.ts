import { createRGBMap } from './create-rgb-map';
import { fitOverlayImage } from './fit-overlay-image';

export function extractOverlayRGBData(
  canvas: HTMLCanvasElement,
  targetSize: number
): { r: Float32Array; g: Float32Array; b: Float32Array } {
  const resized = fitOverlayImage(canvas, targetSize, targetSize, 'cover');
  const ctx = resized.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  return createRGBMap(imageData.data);
}
