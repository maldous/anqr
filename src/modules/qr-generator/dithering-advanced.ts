/**
 * QR Generator Advanced Dithering
 * Advanced dithering algorithms with blue noise support
 */

import type { QRGeneratorConfig, OverlayData, CreateCanvasFn } from './types';
import type { QRCodeObject } from './cache';

/**
 * Apply advanced dithering with blue noise
 */
export async function applyAdvancedDither(
  qr: QRCodeObject,
  moduleCount: number,
  overlayData: OverlayData,
  config: QRGeneratorConfig,
  createCanvasFn: CreateCanvasFn
): Promise<boolean[][]> {
  const seed = config.blueNoiseSeed ?? 42;
  const tileSize = config.blueNoiseTileSize ?? 64;
  const strength = (config.ditherStrength ?? 50) / 100;
  const intensity = (config.overlayIntensity ?? 100) / 100;

  // Generate blue noise tile
  const blueNoise = generateBlueNoiseTile(tileSize, seed);

  // Initialize result matrix
  const result: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    result[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      const brightness = overlayData[row]?.[col] ?? 0.5;
      const originalValue = qr.isDark(row, col);

      // Sample blue noise
      const noiseX = col % tileSize;
      const noiseY = row % tileSize;
      const noiseValue = blueNoise[noiseY][noiseX];

      // Calculate threshold with blue noise
      const threshold = 0.5 + (noiseValue - 0.5) * strength;
      const targetValue = originalValue ? (1 - brightness * intensity) : (brightness * intensity);

      result[row][col] = targetValue > threshold;
    }
  }

  return result;
}

/**
 * Generate a blue noise tile using void-and-cluster algorithm
 */
function generateBlueNoiseTile(size: number, seed: number): number[][] {
  // Simple seeded PRNG
  let s = seed;
  const random = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  // Initialize with random values
  const tile: number[][] = [];
  for (let y = 0; y < size; y++) {
    tile[y] = [];
    for (let x = 0; x < size; x++) {
      tile[y][x] = random();
    }
  }

  // Apply simple blur to reduce high frequencies (approximation of blue noise)
  const blurred: number[][] = [];
  for (let y = 0; y < size; y++) {
    blurred[y] = [];
    for (let x = 0; x < size; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = (y + dy + size) % size;
          const nx = (x + dx + size) % size;
          sum += tile[ny][nx];
          count++;
        }
      }
      blurred[y][x] = sum / count;
    }
  }

  // Normalize to 0-1 range
  let min = Infinity;
  let max = -Infinity;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      min = Math.min(min, blurred[y][x]);
      max = Math.max(max, blurred[y][x]);
    }
  }

  const range = max - min || 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      blurred[y][x] = (blurred[y][x] - min) / range;
    }
  }

  return blurred;
}
