import type { OverlayDitherOptions } from './processor.types';
import { applyOverlayDither } from './apply-overlay-dither';

export function applyOverlayDitherForQR(
  source: HTMLCanvasElement,
  options: OverlayDitherOptions
): HTMLCanvasElement {
  if (!options.enabled || options.kind === 'none') {
    return source;
  }

  const ctx = source.getContext('2d');
  if (!ctx) return source;

  const imageData = ctx.getImageData(0, 0, source.width, source.height);
  const dithered = applyOverlayDither(imageData, options);

  const result = document.createElement('canvas');
  result.width = source.width;
  result.height = source.height;
  const resultCtx = result.getContext('2d');
  if (!resultCtx) return source;

  resultCtx.putImageData(dithered, 0, 0);
  return result;
}
