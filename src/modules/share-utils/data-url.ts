/**
 * Share Utilities - Data URL Helpers
 * Canvas to data URL/blob conversion and download utilities
 */

import { MAX_SHARE_URL_LENGTH } from './types';

/**
 * Check if a share URL exceeds recommended length limits.
 * Returns warning message if too long, null otherwise.
 */
export function checkShareUrlLength(url: string): string | null {
  if (url.length > MAX_SHARE_URL_LENGTH) {
    return (
      `Share URL is ${url.length} characters (recommended max: ${MAX_SHARE_URL_LENGTH}). ` +
      'Very long URLs may fail in SMS, some social apps, and QR scanners. ' +
      'Consider using fewer custom settings or a URL shortener.'
    );
  }
  return null;
}

/**
 * Convert canvas to data URL
 */
export function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.9
): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

/**
 * Convert canvas to Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.9
): Promise<Blob | null> {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    png: 'image/png',
  };
  const mimeType = mimeTypes[format] || 'image/png';
  return new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

/**
 * Create a download link for a blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Estimate QR code version needed for given text length
 */
export function estimateQRSize(text: string, ecc: 'L' | 'M' | 'Q' | 'H' = 'Q'): number {
  const capacities: Record<string, number[]> = {
    L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520],
    M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412],
    Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292],
    H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220],
  };

  const caps = capacities[ecc];
  const len = text.length;

  for (let v = 0; v < caps.length; v++) {
    if (caps[v] >= len) {
      return v + 1;
    }
  }

  return 40; // Maximum version
}
