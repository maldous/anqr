import { applyFilters } from './overlay-filters';
import type { OverlayOptions, ProcessedOverlay } from './processor.types';
import { cropOverlayImage } from './crop-overlay-image';
import { rotateOverlayCanvas } from './rotate-overlay-canvas';
import { flipOverlayCanvas } from './flip-overlay-canvas';
import { fitOverlayImage } from './fit-overlay-image';
import { applyOverlayDitherForQR } from './apply-overlay-dither-for-qr';

// ============================================
// MAIN PROCESSOR FUNCTION
// ============================================

export function processOverlay(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  options: OverlayOptions = {}
): ProcessedOverlay {
  let canvas = source;
  const originalWidth = source.width;
  const originalHeight = source.height;

  // Apply crop first
  if (options.crop) {
    canvas = cropOverlayImage(canvas, options.crop);
  }

  // Apply rotation
  if (options.rotation && options.rotation !== 0) {
    canvas = rotateOverlayCanvas(canvas, options.rotation);
  }

  // Apply flip
  if (options.flipX || options.flipY) {
    canvas = flipOverlayCanvas(canvas, !!options.flipX, !!options.flipY);
  }

  // Fit to target size
  canvas = fitOverlayImage(canvas, targetWidth, targetHeight, options.fitMode ?? 'cover');

  // Apply filters
  if (options.filters) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const filtered = applyFilters(imageData, options.filters);
      ctx.putImageData(filtered, 0, 0);
    }
  }

  // Apply dithering
  if (options.dither?.enabled) {
    canvas = applyOverlayDitherForQR(canvas, options.dither);
  }

  return {
    canvas,
    width: canvas.width,
    height: canvas.height,
    originalWidth,
    originalHeight,
  };
}
