/**
 * QR Generator Subpixel Overlay
 * Subpixel rendering for high-quality overlay integration
 */

import type { QRCodeObject } from './cache';
import type { CreateCanvasFn, PixelDecisionMatrix, QRGeneratorConfig, RGBWithMeta } from './types';

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
  const ctx = scaledCanvas.getContext('2d');
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

      brightness[y][x] = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      colors[y][x] = { r, g, b };
    }
  }

  return { brightness, colors };
}

/**
 * Generate subpixel matrix
 */
export async function generateSubpixelMatrix(
  qr: QRCodeObject,
  config: QRGeneratorConfig,
  overlayCanvas: HTMLCanvasElement | OffscreenCanvas,
  moduleCount: number,
  scale: number,
  useHalftoneCenter: boolean,
  createCanvasFn: CreateCanvasFn
): Promise<PixelDecisionMatrix> {
  const scaledSize = moduleCount * scale;
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Get subpixel overlay data
  const { brightness, colors } = await getSubpixelOverlayData(
    overlayCanvas,
    moduleCount,
    scale,
    config,
    createCanvasFn
  );

  const matrix: boolean[][] = [];
  const colorMatrix: (RGBWithMeta | null)[][] = [];

  const subpixelGrid = config.subpixelGrid ?? 3;
  const centerIdx = Math.floor(subpixelGrid / 2);

  for (let y = 0; y < scaledSize; y++) {
    matrix[y] = [];
    colorMatrix[y] = [];

    for (let x = 0; x < scaledSize; x++) {
      // Determine which module this subpixel belongs to
      const moduleRow = Math.floor(y / scale);
      const moduleCol = Math.floor(x / scale);
      const subX = x % scale;
      const subY = y % scale;

      // Check if this is the center subpixel
      const isCenter = subX === centerIdx && subY === centerIdx;

      const qrValue = qr.isDark(moduleRow, moduleCol);
      const overlayBrightness = brightness[y]?.[x] ?? 0.5;
      const overlayColor = colors[y]?.[x];

      if (isCenter) {
        // Center pixel preserves QR data
        matrix[y][x] = qrValue;

        if (useHalftoneCenter && qrValue) {
          // Use halftone sizing based on brightness
          colorMatrix[y][x] = {
            ...overlayColor,
            halftone: true,
            sizeRatio: 0.5 + overlayBrightness * 0.5,
          };
        } else {
          colorMatrix[y][x] = overlayColor ? { ...overlayColor } : null;
        }
      } else {
        // Surrounding pixels show overlay
        const threshold = 0.5 - intensity * 0.3;
        matrix[y][x] = overlayBrightness < threshold;
        colorMatrix[y][x] = overlayColor ? { ...overlayColor } : null;
      }
    }
  }

  return {
    matrix,
    colors: colorMatrix,
    scale,
    overlayData: null,
    effectiveIntensity: intensity * 100, // Return as percentage (0-100) for consistency
  };
}
