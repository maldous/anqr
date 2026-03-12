import type { ScanResult } from './scanner.types';
import { scanImageData } from './scan-image-data';

/**
 * Scan a canvas for QR code
 */
export function scanCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): ScanResult {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
  if (!ctx) {
    return { data: null, location: null };
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return scanImageData(imageData);
}
