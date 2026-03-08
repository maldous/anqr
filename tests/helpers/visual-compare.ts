/**
 * Visual Comparison Utilities for Cross-Platform QR Parity Testing
 *
 * Uses pixelmatch + pngjs to compare PNG images pixel-by-pixel.
 * Designed for verifying QR codes are visually consistent across:
 *   - Browser (Playwright canvas capture)
 *   - API (Netlify Function /api/qr response)
 *   - iOS (Appium WebView canvas capture)
 *   - Android (Appium WebView canvas capture)
 */

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface CompareResult {
  /** Number of pixels that differ beyond threshold */
  diffPixels: number;
  /** Total pixel count in the compared area */
  totalPixels: number;
  /** Percentage of differing pixels (0-100) */
  diffPercent: number;
  /** Width of compared images */
  width: number;
  /** Height of compared images */
  height: number;
  /** Whether the images matched within the given tolerance */
  match: boolean;
  /** PNG buffer of the diff visualization (red = different) */
  diffImage: Buffer;
}

export interface CompareOptions {
  /** Per-pixel color distance threshold 0-1 (default: 0.1) */
  threshold?: number;
  /** Maximum allowed diff percentage to consider a "match" (default: 5) */
  maxDiffPercent?: number;
  /** Include anti-aliased pixels in diff (default: false) */
  includeAA?: boolean;
}

/**
 * Compare two PNG buffers pixel-by-pixel using pixelmatch.
 * Both images must be the same dimensions.
 *
 * @throws Error if images have different dimensions
 */
export function comparePngBuffers(
  buf1: Buffer,
  buf2: Buffer,
  options: CompareOptions = {}
): CompareResult {
  const { threshold = 0.1, maxDiffPercent = 5, includeAA = false } = options;

  const img1 = PNG.sync.read(buf1);
  const img2 = PNG.sync.read(buf2);

  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error(
      `Image dimensions differ: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`
    );
  }

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold,
    includeAA,
  });

  const totalPixels = width * height;
  const diffPercent = (diffPixels / totalPixels) * 100;

  return {
    diffPixels,
    totalPixels,
    diffPercent,
    width,
    height,
    match: diffPercent <= maxDiffPercent,
    diffImage: PNG.sync.write(diff),
  };
}

/**
 * Convert a data:image/png;base64 data URL to a raw PNG Buffer.
 */
export function dataUrlToPngBuffer(dataUrl: string): Buffer {
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if (!match) {
    throw new Error('Expected a data:image/png;base64 data URL');
  }
  return Buffer.from(match[1], 'base64');
}

/**
 * Get dimensions of a PNG buffer without fully decoding pixel data.
 */
export function getPngDimensions(buf: Buffer): { width: number; height: number } {
  const png = PNG.sync.read(buf);
  return { width: png.width, height: png.height };
}

/**
 * Check that a buffer is a valid PNG image.
 */
export function isValidPng(buf: Buffer): boolean {
  try {
    const png = PNG.sync.read(buf);
    return png.width > 0 && png.height > 0;
  } catch {
    return false;
  }
}

/**
 * Check that a buffer starts with a valid image signature.
 * Supports PNG, GIF, and WebP.
 */
export function detectImageFormat(buf: Buffer): 'png' | 'gif' | 'webp' | 'unknown' {
  if (buf.length < 4) return 'unknown';

  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'png';
  }
  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return 'gif';
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return 'webp';
  }

  return 'unknown';
}
