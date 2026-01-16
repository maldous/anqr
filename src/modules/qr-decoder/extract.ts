/**
 * QR Grid Extraction
 * Extracts the module matrix from an image using perspective transformation
 */

import type { Point, FinderPattern, QRLocation } from './types';

/**
 * Calculate the QR code location from finder patterns
 */
export function calculateLocation(
  topLeft: FinderPattern,
  topRight: FinderPattern,
  bottomLeft: FinderPattern
): QRLocation {
  // Average module size
  const moduleSize = (topLeft.moduleSize + topRight.moduleSize + bottomLeft.moduleSize) / 3;

  // Distance between finder pattern centers (spans moduleCount - 7 modules)
  const topDist = distance(topLeft.center, topRight.center);
  const leftDist = distance(topLeft.center, bottomLeft.center);
  const avgDist = (topDist + leftDist) / 2;

  // Calculate module count: distance spans (moduleCount - 7) modules
  // Finder centers are at positions 3.5 from each edge
  const moduleSpan = avgDist / moduleSize;
  const moduleCount = Math.round(moduleSpan + 7);

  // Estimate bottom-right corner by extrapolating
  const bottomRight: Point = {
    x: topRight.center.x + (bottomLeft.center.x - topLeft.center.x),
    y: topRight.center.y + (bottomLeft.center.y - topLeft.center.y),
  };

  return {
    topLeft: topLeft.center,
    topRight: topRight.center,
    bottomLeft: bottomLeft.center,
    bottomRight,
    moduleSize,
    moduleCount,
  };
}

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Sample a pixel from the image at the given coordinates
 */
function samplePixel(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number
): number {
  const ix = Math.round(x);
  const iy = Math.round(y);

  if (ix < 0 || ix >= width || iy < 0 || iy >= height) {
    return 255; // Out of bounds = white
  }

  const idx = (iy * width + ix) * 4;
  return (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
}

/**
 * Extract the module matrix from the image
 * Uses the finder pattern centers to build a perspective-corrected grid
 */
export function extractModuleMatrix(
  imageData: ImageData,
  location: QRLocation
): boolean[][] {
  const { data: pixels, width, height } = imageData;
  const { moduleCount } = location;

  // Finder pattern centers are at module positions (3.5, 3.5), (moduleCount-3.5, 3.5), (3.5, moduleCount-3.5)
  const finderOffset = 3.5;
  const moduleSpan = moduleCount - 7;

  // Calculate unit vectors for module grid
  // Vector from top-left to top-right finder center
  const rightVec: Point = {
    x: (location.topRight.x - location.topLeft.x) / moduleSpan,
    y: (location.topRight.y - location.topLeft.y) / moduleSpan,
  };

  // Vector from top-left to bottom-left finder center
  const downVec: Point = {
    x: (location.bottomLeft.x - location.topLeft.x) / moduleSpan,
    y: (location.bottomLeft.y - location.topLeft.y) / moduleSpan,
  };

  // Calculate origin (module 0,0) by going back from top-left finder center
  const origin: Point = {
    x: location.topLeft.x - finderOffset * rightVec.x - finderOffset * downVec.x,
    y: location.topLeft.y - finderOffset * rightVec.y - finderOffset * downVec.y,
  };

  // Calculate threshold from finder pattern regions (known to be dark)
  let darkSum = 0;
  let darkCount = 0;
  let lightSum = 0;
  let lightCount = 0;

  // Sample from known dark regions (finder pattern centers)
  const darkPoints = [
    { col: 3, row: 3 },
    { col: moduleCount - 4, row: 3 },
    { col: 3, row: moduleCount - 4 },
  ];

  for (const p of darkPoints) {
    const x = origin.x + (p.col + 0.5) * rightVec.x + (p.row + 0.5) * downVec.x;
    const y = origin.y + (p.col + 0.5) * rightVec.y + (p.row + 0.5) * downVec.y;
    const gray = samplePixel(pixels, width, height, x, y);
    darkSum += gray;
    darkCount++;
  }

  // Sample from known light regions (finder pattern white rings)
  const lightPoints = [
    { col: 1, row: 3 },
    { col: 5, row: 3 },
    { col: 3, row: 1 },
    { col: 3, row: 5 },
  ];

  for (const p of lightPoints) {
    const x = origin.x + (p.col + 0.5) * rightVec.x + (p.row + 0.5) * downVec.x;
    const y = origin.y + (p.col + 0.5) * rightVec.y + (p.row + 0.5) * downVec.y;
    const gray = samplePixel(pixels, width, height, x, y);
    lightSum += gray;
    lightCount++;
  }

  const avgDark = darkCount > 0 ? darkSum / darkCount : 0;
  const avgLight = lightCount > 0 ? lightSum / lightCount : 255;
  const threshold = (avgDark + avgLight) / 2;

  // Extract matrix
  const matrix: boolean[][] = [];

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Sample at center of module
      const x = origin.x + (col + 0.5) * rightVec.x + (row + 0.5) * downVec.x;
      const y = origin.y + (col + 0.5) * rightVec.y + (row + 0.5) * downVec.y;
      const gray = samplePixel(pixels, width, height, x, y);
      matrixRow.push(gray < threshold);
    }
    matrix.push(matrixRow);
  }

  return matrix;
}

/**
 * Get version from module count
 */
export function getVersionFromModuleCount(moduleCount: number): number {
  return (moduleCount - 17) / 4;
}

/**
 * Get module count from version
 */
export function getModuleCountFromVersion(version: number): number {
  return version * 4 + 17;
}
