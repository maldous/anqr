import { rgbToGray } from '../color/color';
import type { CreateCanvasFn, QRGeneratorConfig } from '../../../modules/qr-generator/types';

/**
 * Generate subpixel matrix for overlay modes
 */
export async function getSubpixelOverlayData(
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  _config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<{ brightness: number[][]; colors: { r: number; g: number; b: number }[][] }> {
  const scaledSize = moduleCount * scale;

  // Scale overlay to subpixel size
  const scaledCanvas = await createCanvasFn(scaledSize, scaledSize);
  const ctx = scaledCanvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) {
    return { brightness: [], colors: [] };
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(overlayCanvas, 0, 0, scaledSize, scaledSize);

  const imageData = ctx.getImageData(0, 0, scaledSize, scaledSize);
  const data = imageData.data;

  const brightness: number[][] = [];
  const colors: { r: number; g: number; b: number }[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    brightness[y] = [];
    colors[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      const idx = (y * scaledSize + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      brightness[y][x] = rgbToGray(r, g, b) / 255;
      colors[y][x] = { r, g, b };
    }
  }

  return { brightness, colors };
}
