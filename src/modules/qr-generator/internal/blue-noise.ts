/**
 * Blue Noise Dithering Module for QR Codes
 *
 * Uses blue noise thresholding instead of Floyd-Steinberg error diffusion.
 * Follows the same structure as generate.ts to preserve QR scannability:
 * - Data points (center of each module) MUST preserve QR values
 * - Only "free points" (non-locked, non-data) can be dithered
 * - Blue noise provides better visual quality than ordered dithering
 */

import { qrcode } from '../../qr-encoder';

// Import from canonical sources
import { rgbToGray } from '../../core';
import {
  isStructuralModule,
  getVersionFromModuleCount,
  type ECCLevel,
} from '../../qr-encoder';

// Error correction level mapping
const ECC_MAP: Record<string, ECCLevel> = {
  L: 'L',
  M: 'M',
  Q: 'Q',
  H: 'H',
  low: 'L',
  medium: 'M',
  quartile: 'Q',
  high: 'H',
};

// Import blue noise from canonical source
import {
  generateBlueNoiseTile as generateTile,
  sampleBlueNoise as sampleNoise,
} from '../../dither-algorithms';

// Pre-computed 64x64 blue noise tile (normalized 0-1)
const BLUE_NOISE_TILE_SIZE = 64;
const BLUE_NOISE_64: number[] = generateTile(BLUE_NOISE_TILE_SIZE, 0);

export type ColorMode = 'color' | 'grayscale' | 'bw';

/**
 * Canvas factory interface for environment-agnostic canvas creation.
 * Allows blue-noise dithering to work in both browser and Node.js.
 */
export interface CanvasFactory {
  createCanvas: (width: number, height: number) => Promise<HTMLCanvasElement | OffscreenCanvas>;
}

/**
 * Default browser canvas factory using DOM APIs
 */
export const defaultBrowserCanvasFactory: CanvasFactory = {
  createCanvas: (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return Promise.resolve(canvas);
  },
};

export interface BlueNoiseOptions {
  text: string;
  ecc: string;
  version?: number;
  scale: number;
  overlayCanvas?: HTMLCanvasElement;
  overlayIntensity?: number;
  colorMode?: ColorMode;
  canvasFactory?: CanvasFactory;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface BlueNoiseResult {
  matrix: boolean[][];
  colors: RGB[][];
}

/**
 * Sample the blue noise tile at position (x, y)
 * Uses the canonical implementation from dither-algorithms
 */
function sampleBlueNoise(x: number, y: number): number {
  return sampleNoise(x, y, BLUE_NOISE_64, BLUE_NOISE_TILE_SIZE);
}

/**
 * Check if a pixel position is locked (structural module)
 * Pixel-level wrapper that converts to module coordinates and delegates to qr-encoder's isStructuralModule
 * Note: This is NOT a duplicate of qr-spec's isLocked - it has a different signature for pixel operations
 */
function isLockedPixel(moduleCount: number, x: number, y: number, scale: number): boolean {
  const moduleX = Math.floor(x / scale);
  const moduleY = Math.floor(y / scale);
  const version = getVersionFromModuleCount(moduleCount / scale);
  return isStructuralModule(moduleY, moduleX, version);
}

/**
 * Check if a pixel position is a data point (center of module)
 * Pixel-level helper for determining if a pixel should preserve QR data values
 * Note: This is NOT a duplicate of qr-spec's isData - it has a different signature for pixel operations
 */
function isDataPixel(x: number, y: number, scale: number): boolean {
  // Data points are at the center of each module
  const centerOffset = Math.floor(scale / 2);
  return (x % scale) === centerOffset && (y % scale) === centerOffset;
}

/**
 * Load image data from canvas as RGB values (0-1 range)
 * Async to support both browser and server-side canvas factories
 */
async function loadImageDataRGB(
  canvas: HTMLCanvasElement,
  size: number,
  canvasFactory: CanvasFactory = defaultBrowserCanvasFactory
): Promise<{ r: number; g: number; b: number }[][]> {
  const tempCanvas = await canvasFactory.createCanvas(size, size);
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(canvas, 0, 0, size, size);
  const imgData = ctx.getImageData(0, 0, size, size);

  const output: { r: number; g: number; b: number }[][] = [];
  for (let y = 0; y < size; y++) {
    const row: { r: number; g: number; b: number }[] = [];
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      row.push({
        r: imgData.data[i] / 255,
        g: imgData.data[i + 1] / 255,
        b: imgData.data[i + 2] / 255,
      });
    }
    output.push(row);
  }

  return output;
}

// rgbToGray imported from core

/**
 * Convert RGB image data to grayscale
 */
function convertToGrayscale(imageData: { r: number; g: number; b: number }[][]): void {
  for (const row of imageData) {
    for (let x = 0; x < row.length; x++) {
      const { r, g, b } = row[x];
      const gray = rgbToGray(r, g, b);
      row[x] = { r: gray, g: gray, b: gray };
    }
  }
}

/**
 * Apply blue noise dithering to free points
 * Uses blue noise threshold instead of Floyd-Steinberg error diffusion
 * Note: Image preprocessing (brightness, contrast, etc.) is applied in qr-generator.js
 * before calling generateBlueNoiseDithered.
 */
function blueNoiseDitherFreePoints(
  imageData: { r: number; g: number; b: number }[][],
  moduleCount: number,
  scale: number,
  colorMode: ColorMode
): void {
  const size = imageData.length;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Only process free points (not locked, not data)
      if (isLockedPixel(moduleCount, x, y, scale)) continue;
      if (isDataPixel(x, y, scale)) continue;

      const pixel = imageData[y][x];
      const threshold = sampleBlueNoise(x, y);

      if (colorMode === 'bw') {
        // Black & white: quantize to 0 or 1 using blue noise threshold
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        const newVal = gray > threshold ? 1 : 0;
        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
      } else if (colorMode === 'grayscale') {
        // Grayscale: quantize using blue noise for each level decision
        const gray = rgbToGray(pixel.r, pixel.g, pixel.b);
        // 4 levels: 0, 0.33, 0.67, 1
        const levels = 4;
        const scaled = gray * (levels - 1);
        const low = Math.floor(scaled);
        const high = Math.min(low + 1, levels - 1);
        const frac = scaled - low;
        // Use blue noise to decide between low and high level
        const newVal = (frac > threshold ? high : low) / (levels - 1);
        imageData[y][x] = { r: newVal, g: newVal, b: newVal };
      } else {
        // Color mode: quantize each channel using blue noise
        const levels = 4;

        function quantizeChannel(val: number, noiseOffset: number): number {
          const t = (threshold + noiseOffset) % 1;
          const scaled = val * (levels - 1);
          const low = Math.floor(scaled);
          const high = Math.min(low + 1, levels - 1);
          const frac = scaled - low;
          return (frac > t ? high : low) / (levels - 1);
        }

        // Use different noise offsets for R, G, B to avoid color banding
        imageData[y][x] = {
          r: quantizeChannel(pixel.r, 0),
          g: quantizeChannel(pixel.g, 0.33),
          b: quantizeChannel(pixel.b, 0.67),
        };
      }
    }
  }
}

/**
 * Generate a blue-noise dithered QR code matrix
 *
 * @param options - Generation options
 * @returns Object containing boolean matrix and RGB color data for each pixel
 */
export async function generateBlueNoiseDithered(
  options: BlueNoiseOptions
): Promise<BlueNoiseResult> {
  // Preprocessing options are now passed through options and used in preprocessImageData
  const {
    text,
    ecc,
    version = 0,
    scale,
    overlayCanvas,
    overlayIntensity = 50,
    colorMode = 'color',
    canvasFactory = defaultBrowserCanvasFactory,
  } = options;

  // Map error correction level
  const eccLevel = ECC_MAP[ecc] || 'Q';

  // Generate base QR code using vendor library
  const typeNumber = version || 0;
  const qr = qrcode(typeNumber, eccLevel);
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const scaledSize = moduleCount * scale;

  // Note: preprocessImageData is called after image data is loaded to apply
  // brightness, contrast, gamma, saturation, hue rotation, and inversion

  // Create scaled QR matrix and initialize colors
  const matrix: boolean[][] = [];
  const colors: RGB[][] = [];

  for (let y = 0; y < scaledSize; y++) {
    const matrixRow: boolean[] = [];
    const colorRow: RGB[] = [];
    for (let x = 0; x < scaledSize; x++) {
      const qrX = Math.floor(x / scale);
      const qrY = Math.floor(y / scale);
      const isDark = qr.isDark(qrY, qrX);
      matrixRow.push(isDark);
      // Default color: black for dark, white for light
      colorRow.push(isDark ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 });
    }
    matrix.push(matrixRow);
    colors.push(colorRow);
  }

  // If no overlay, return the scaled QR with default colors
  if (!overlayCanvas) {
    return { matrix, colors };
  }

  // Load and process overlay image as RGB
  const imageData = await loadImageDataRGB(overlayCanvas, scaledSize, canvasFactory);
  const intensity = overlayIntensity / 100;

  // Convert to grayscale first if needed
  if (colorMode === 'grayscale' || colorMode === 'bw') {
    convertToGrayscale(imageData);
  }

  // Note: Preprocessing (brightness, contrast, etc.) is now applied in qr-generator.js
  // before calling this function, so the overlayCanvas is already preprocessed.

  // Apply blue noise dithering to free points
  blueNoiseDitherFreePoints(imageData, scaledSize, scale, colorMode);

  // Merge image data with QR matrix for free points
  for (let y = 0; y < scaledSize; y++) {
    for (let x = 0; x < scaledSize; x++) {
      // Skip locked areas (finder patterns, timing, alignment)
      if (isLockedPixel(scaledSize, x, y, scale)) continue;

      // Skip data points (must preserve QR data)
      if (isDataPixel(x, y, scale)) continue;

      // Free point: use dithered image data based on intensity
      const pixel = imageData[y][x];
      const brightness = rgbToGray(pixel.r, pixel.g, pixel.b);
      // Use blue noise for intensity blending decision (consistent with the dithering approach)
      const useImage = sampleBlueNoise(x + 17, y + 31) < intensity;

      if (useImage) {
        // For the boolean matrix: dark if brightness < 0.5
        matrix[y][x] = brightness < 0.5;

        // For the color matrix: use the dithered RGB values (convert from 0-1 to 0-255)
        colors[y][x] = {
          r: Math.round(Math.max(0, Math.min(1, pixel.r)) * 255),
          g: Math.round(Math.max(0, Math.min(1, pixel.g)) * 255),
          b: Math.round(Math.max(0, Math.min(1, pixel.b)) * 255),
        };
      }
    }
  }

  return { matrix, colors };
}

// Export types for external use
export type { BlueNoiseOptions as GenerateOptions };
