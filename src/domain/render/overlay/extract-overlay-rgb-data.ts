import { fitOverlayImage } from './fit-overlay-image';

export function extractOverlayRGBData(
  canvas: HTMLCanvasElement,
  targetSize: number
): { r: Float32Array; g: Float32Array; b: Float32Array } {
  const resized = fitOverlayImage(canvas, targetSize, targetSize, 'cover');
  const ctx = resized.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;
  const size = targetSize * targetSize;

  const r = new Float32Array(size);
  const g = new Float32Array(size);
  const b = new Float32Array(size);

  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    r[idx] = data[i] / 255;
    g[idx] = data[i + 1] / 255;
    b[idx] = data[i + 2] / 255;
  }

  return { r, g, b };
}
