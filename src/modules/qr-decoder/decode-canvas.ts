/**
 * Decode from Canvas
 * Decode QR code from canvas element
 */

import { decodeQR } from './decoder-adapter';
import type { DecodeResult } from './types';

/**
 * Decode a QR code from a canvas element
 */
export function decodeFromCanvas(canvas: HTMLCanvasElement): DecodeResult | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
}
