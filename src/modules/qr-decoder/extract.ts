/**
 * QR Grid Extraction
 * Extracts the module matrix from an image using perspective transformation
 */

import type { Point, FinderPattern, QRLocation } from './types';

// Logging helper
function log(category: string, message: string, data?: Record<string, unknown>): void {
  const prefix = `[QR-Decoder:${category}]`;
  if (data) {
    // biome-ignore lint/suspicious/noConsole: Debug logging for QR decoder
    console.log(prefix, message, data);
  } else {
    // biome-ignore lint/suspicious/noConsole: Debug logging for QR decoder
    console.log(prefix, message);
  }
}

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
  const topDist = pointDistance(topLeft.center, topRight.center);
  const leftDist = pointDistance(topLeft.center, bottomLeft.center);
  const avgDist = (topDist + leftDist) / 2;

  // Calculate module count: distance spans (moduleCount - 7) modules
  // Finder centers are at positions 3.5 from each edge
  const moduleSpan = avgDist / moduleSize;
  const rawModuleCount = moduleSpan + 7;
  
  // Module count must be 21 + 4*k where k is 0-39 (versions 1-40)
  // Valid module counts: 21, 25, 29, 33, 37, 41, ..., 177
  const version = Math.round((rawModuleCount - 17) / 4);
  const clampedVersion = Math.max(1, Math.min(40, version));
  const moduleCount = clampedVersion * 4 + 17;

  log('extract', 'Calculated location', {
    moduleSize: moduleSize.toFixed(2),
    topDist: topDist.toFixed(1),
    leftDist: leftDist.toFixed(1),
    avgDist: avgDist.toFixed(1),
    moduleSpan: moduleSpan.toFixed(1),
    rawModuleCount: rawModuleCount.toFixed(1),
    version: clampedVersion,
    moduleCount
  });

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

/** Calculate Euclidean distance between two points (local helper) */
// Local geometry helper (intentionally not shared - simple inline function)
function pointDistance(a: Point, b: Point): number {
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
  let darkSampleSum = 0;
  let darkSampleCount = 0;
  let lightSampleSum = 0;
  let lightSampleCount = 0;

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
    darkSampleSum += gray;
    darkSampleCount++;
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
    lightSampleSum += gray;
    lightSampleCount++;
  }

  const avgDark = darkSampleCount > 0 ? darkSampleSum / darkSampleCount : 0;
  const avgLight = lightSampleCount > 0 ? lightSampleSum / lightSampleCount : 255;
  const threshold = (avgDark + avgLight) / 2;

  // Extract matrix
  const matrix: boolean[][] = [];
  let totalDarkModules = 0;
  let totalLightModules = 0;

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Sample at center of module
      const x = origin.x + (col + 0.5) * rightVec.x + (row + 0.5) * downVec.x;
      const y = origin.y + (col + 0.5) * rightVec.y + (row + 0.5) * downVec.y;
      const gray = samplePixel(pixels, width, height, x, y);
      const isDark = gray < threshold;
      matrixRow.push(isDark);
      if (isDark) totalDarkModules++;
      else totalLightModules++;
    }
    matrix.push(matrixRow);
  }

  log('extract', 'Extracted matrix', {
    moduleCount,
    threshold: threshold.toFixed(1),
    darkModules: totalDarkModules,
    lightModules: totalLightModules,
    darkRatio: ((totalDarkModules / (totalDarkModules + totalLightModules)) * 100).toFixed(1) + '%'
  });

  // Validate matrix by checking finder patterns
  // Expected pattern (1=dark, 0=light):
  // 1111111
  // 1000001
  // 1011101
  // 1011101
  // 1011101
  // 1000001
  // 1111111
  const expectedFinder = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  // Validate top-left finder pattern
  let tlMatches = 0;
  let tlMismatches = 0;
  const tlErrors: string[] = [];

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const expected = expectedFinder[row][col] === 1;
      const actual = matrix[row]?.[col] ?? false;
      if (expected === actual) {
        tlMatches++;
      } else {
        tlMismatches++;
        if (tlErrors.length < 5) {
          tlErrors.push(`(${row},${col}): expected ${expected ? 'dark' : 'light'}, got ${actual ? 'dark' : 'light'}`);
        }
      }
    }
  }

  log('extract', 'Top-left finder pattern validation', {
    matches: tlMatches,
    mismatches: tlMismatches,
    accuracy: ((tlMatches / 49) * 100).toFixed(1) + '%',
    errors: tlErrors.length > 0 ? tlErrors : 'none'
  });

  // Validate top-right finder pattern (at columns moduleCount-7 to moduleCount-1)
  let trMatches = 0;
  let trMismatches = 0;
  const trErrors: string[] = [];
  const trColOffset = moduleCount - 7;

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const expected = expectedFinder[row][col] === 1;
      const actual = matrix[row]?.[trColOffset + col] ?? false;
      if (expected === actual) {
        trMatches++;
      } else {
        trMismatches++;
        if (trErrors.length < 5) {
          trErrors.push(`(${row},${trColOffset + col}): expected ${expected ? 'dark' : 'light'}, got ${actual ? 'dark' : 'light'}`);
        }
      }
    }
  }

  log('extract', 'Top-right finder pattern validation', {
    matches: trMatches,
    mismatches: trMismatches,
    accuracy: ((trMatches / 49) * 100).toFixed(1) + '%',
    errors: trErrors.length > 0 ? trErrors : 'none'
  });

  // Check for potential 180° rotation: if top-right is very wrong but top-left is ok,
  // or if both are wrong in complementary ways
  const tlAccuracy = tlMatches / 49;
  const trAccuracy = trMatches / 49;

  if (tlMismatches > 20 || trMismatches > 20) {
    log('extract', 'WARNING: Finder pattern accuracy very low - matrix may be mis-oriented', {
      topLeftAccuracy: (tlAccuracy * 100).toFixed(1) + '%',
      topRightAccuracy: (trAccuracy * 100).toFixed(1) + '%'
    });
  }

  // Detect 180° rotation: top-left looks good but top-right is garbage (or vice versa)
  if (tlAccuracy > 0.8 && trAccuracy < 0.5) {
    log('extract', 'WARNING: Possible 180° rotation detected - top-left OK but top-right wrong');
  } else if (trAccuracy > 0.8 && tlAccuracy < 0.5) {
    log('extract', 'WARNING: Possible 180° rotation detected - top-right OK but top-left wrong');
  }

  return matrix;
}

// Re-export from canonical source
export { getVersionFromModuleCount, getModuleCountForVersion as getModuleCountFromVersion } from '../qr-spec';
