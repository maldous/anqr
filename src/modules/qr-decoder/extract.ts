/**
 * QR Grid Extraction
 * Extracts the module matrix from an image using perspective transformation
 * Includes ZXing-style HybridBinarizer adaptive local thresholding for robust decoding
 */

// Shared logger
import { qrDecoderLog as log } from '../qr-analyzer/logger';

// ============================================================================
// Adaptive Local Thresholding (ZXing HybridBinarizer style)
// ============================================================================

// Block size for local thresholding (8x8 pixels per block)
const BLOCK_SIZE_POWER = 3;
const BLOCK_SIZE = 1 << BLOCK_SIZE_POWER; // 8
const BLOCK_SIZE_MASK = BLOCK_SIZE - 1; // 7
const MIN_DYNAMIC_RANGE = 24; // Minimum contrast to consider a block as having real data

/**
 * Calculate per-block black point thresholds for the entire image.
 * This is the core of ZXing's HybridBinarizer algorithm.
 * 
 * @param pixels - RGBA pixel data
 * @param width - Image width
 * @param height - Image height
 * @returns 2D array of threshold values per 8x8 block
 */
function calculateBlackPoints(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): number[][] {
  const subWidth = (width >> BLOCK_SIZE_POWER) + ((width & BLOCK_SIZE_MASK) !== 0 ? 1 : 0);
  const subHeight = (height >> BLOCK_SIZE_POWER) + ((height & BLOCK_SIZE_MASK) !== 0 ? 1 : 0);
  
  const maxYOffset = height - BLOCK_SIZE;
  const maxXOffset = width - BLOCK_SIZE;
  
  // First pass: calculate raw black points for each block
  const blackPoints: number[][] = [];
  
  for (let y = 0; y < subHeight; y++) {
    blackPoints[y] = [];
    let yoffset = y << BLOCK_SIZE_POWER;
    if (yoffset > maxYOffset) {
      yoffset = maxYOffset;
    }
    
    for (let x = 0; x < subWidth; x++) {
      let xoffset = x << BLOCK_SIZE_POWER;
      if (xoffset > maxXOffset) {
        xoffset = maxXOffset;
      }
      
      let sum = 0;
      let min = 255;
      let max = 0;
      
      // Process block pixels
      for (let yy = 0; yy < BLOCK_SIZE; yy++) {
        for (let xx = 0; xx < BLOCK_SIZE; xx++) {
          const px = xoffset + xx;
          const py = yoffset + yy;
          const idx = (py * width + px) * 4;
          
          // Convert to grayscale, compositing over white for transparent pixels
          const a = pixels[idx + 3] / 255;
          let gray: number;
          if (a <= 0) {
            gray = 255;
          } else if (a >= 1) {
            gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
          } else {
            const inv = 1 - a;
            const r = pixels[idx] * a + 255 * inv;
            const g = pixels[idx + 1] * a + 255 * inv;
            const b = pixels[idx + 2] * a + 255 * inv;
            gray = (r + g + b) / 3;
          }
          
          sum += gray;
          if (gray < min) min = gray;
          if (gray > max) max = gray;
        }
      }
      
      // Calculate threshold for this block
      let average = sum / (BLOCK_SIZE * BLOCK_SIZE);
      
      if (max - min <= MIN_DYNAMIC_RANGE) {
        // Low contrast block - assume it's background (light)
        // Use half the min as threshold, so it classifies as light
        average = min / 2;
        
        if (y > 0 && x > 0) {
          // Use neighbor info to correct if this might actually be dark region
          const averageNeighborBlackPoint = (
            blackPoints[y - 1][x] + 
            2 * blackPoints[y][x - 1] + 
            blackPoints[y - 1][x - 1]
          ) / 4;
          
          if (min < averageNeighborBlackPoint) {
            average = averageNeighborBlackPoint;
          }
        }
      }
      
      blackPoints[y][x] = average;
    }
  }
  
  return blackPoints;
}

/**
 * Get the adaptive threshold for a specific pixel coordinate.
 * Uses 5x5 block neighborhood smoothing for more robust thresholds.
 * 
 * @param blackPoints - Pre-computed block thresholds
 * @param x - Pixel x coordinate
 * @param y - Pixel y coordinate
 * @param width - Image width
 * @param height - Image height
 * @returns Threshold value to use at this position
 */
function getAdaptiveThreshold(
  blackPoints: number[][],
  x: number,
  y: number
): number {
  const subWidth = blackPoints[0]?.length ?? 1;
  const subHeight = blackPoints.length;
  
  // Convert pixel coordinate to block coordinate, clamping to valid range
  const blockX = Math.max(0, Math.min(Math.floor(x / BLOCK_SIZE), subWidth - 1));
  const blockY = Math.max(0, Math.min(Math.floor(y / BLOCK_SIZE), subHeight - 1));
  
  // Use 5x5 neighborhood average for smoother thresholds
  // Clamp center to ensure full 5x5 neighborhood fits (when possible)
  const centerX = Math.max(2, Math.min(blockX, subWidth - 3));
  const centerY = Math.max(2, Math.min(blockY, subHeight - 3));
  
  let sum = 0;
  let count = 0;
  
  for (let dy = -2; dy <= 2; dy++) {
    const by = centerY + dy;
    if (by < 0 || by >= subHeight) continue;
    
    for (let dx = -2; dx <= 2; dx++) {
      const bx = centerX + dx;
      if (bx < 0 || bx >= subWidth) continue;
      
      sum += blackPoints[by][bx];
      count++;
    }
  }
  
  return count > 0 ? sum / count : 128;
}
import type { FinderPattern, Point, QRLocation } from './types';
import { pointDistance } from './utils';

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
    moduleCount,
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

/**
 * Sample a single pixel from the image at the given coordinates
 * Composites over white for transparent pixels
 */
function sampleSinglePixel(
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

  // Composite over white so transparent pixels are treated as light modules.
  const a = pixels[idx + 3] / 255;
  if (a <= 0) return 255;
  if (a >= 1) return (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;

  const inv = 1 - a;
  const r = pixels[idx] * a + 255 * inv;
  const g = pixels[idx + 1] * a + 255 * inv;
  const b = pixels[idx + 2] * a + 255 * inv;
  return (r + g + b) / 3;
}

/**
 * Sample a pixel using a 3x3 kernel for more robust detection
 * This helps avoid hitting anti-aliased edges between modules
 */
function samplePixelKernel(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  kernelRadius: number = 1
): number {
  let sum = 0;
  let count = 0;

  for (let dy = -kernelRadius; dy <= kernelRadius; dy++) {
    for (let dx = -kernelRadius; dx <= kernelRadius; dx++) {
      const gray = sampleSinglePixel(pixels, width, height, x + dx, y + dy);
      sum += gray;
      count++;
    }
  }

  return count > 0 ? sum / count : 255;
}

/**
 * Extract the module matrix from the image
 * Uses the finder pattern centers to build a perspective-corrected grid
 * @param imageData - The image data to sample from
 * @param location - The QR code location information
 * @param globalThreshold - The threshold calculated by findFinderPatterns (more reliable than local calculation)
 */
export function extractModuleMatrix(
  imageData: ImageData,
  location: QRLocation,
  globalThreshold: number
): boolean[][] {
  const { data: pixels, width, height } = imageData;
  const { moduleCount } = location;

  // Finder pattern centers are at module positions (3.5, 3.5), (moduleCount-3.5, 3.5), (3.5, moduleCount-3.5)
  const finderOffset = 3.5;
  const moduleSpan = moduleCount - 7;

  // ========================================
  // FIX: Use ONE unified module pitch for both axes to prevent drift
  // ========================================
  // Calculate distances and unified pitch
  const topDist = Math.sqrt(
    (location.topRight.x - location.topLeft.x) ** 2 +
    (location.topRight.y - location.topLeft.y) ** 2
  );
  const leftDist = Math.sqrt(
    (location.bottomLeft.x - location.topLeft.x) ** 2 +
    (location.bottomLeft.y - location.topLeft.y) ** 2
  );
  const avgDist = (topDist + leftDist) / 2;
  const unifiedPitch = avgDist / moduleSpan;

  // Calculate direction vectors (normalized to unit vectors)
  const rightDirX = (location.topRight.x - location.topLeft.x) / topDist;
  const rightDirY = (location.topRight.y - location.topLeft.y) / topDist;
  const downDirX = (location.bottomLeft.x - location.topLeft.x) / leftDist;
  const downDirY = (location.bottomLeft.y - location.topLeft.y) / leftDist;

  // Scale both direction vectors by the SAME unified pitch
  // This prevents drift across the grid that causes sampling at module boundaries
  const rightVec: Point = {
    x: rightDirX * unifiedPitch,
    y: rightDirY * unifiedPitch,
  };

  const downVec: Point = {
    x: downDirX * unifiedPitch,
    y: downDirY * unifiedPitch,
  };

  log('extract', 'Unified pitch calculation', {
    topDist: topDist.toFixed(2),
    leftDist: leftDist.toFixed(2),
    avgDist: avgDist.toFixed(2),
    moduleSpan,
    unifiedPitch: unifiedPitch.toFixed(3),
    originalRightMag: (topDist / moduleSpan).toFixed(3),
    originalDownMag: (leftDist / moduleSpan).toFixed(3),
    driftPerModule: Math.abs(topDist / moduleSpan - leftDist / moduleSpan).toFixed(4),
    totalDriftOver29Modules: (Math.abs(topDist / moduleSpan - leftDist / moduleSpan) * 29).toFixed(2),
  });

  // Calculate origin (module 0,0) by going back from top-left finder center
  const origin: Point = {
    x: location.topLeft.x - finderOffset * rightVec.x - finderOffset * downVec.x,
    y: location.topLeft.y - finderOffset * rightVec.y - finderOffset * downVec.y,
  };

  // ========================================
  // VALIDATION: Verify origin computation by checking finder centers map correctly
  // ========================================
  
  // The finder center at module position (3.5, 3.5) should map back to topLeft
  const verifyTopLeft = {
    x: origin.x + finderOffset * rightVec.x + finderOffset * downVec.x,
    y: origin.y + finderOffset * rightVec.y + finderOffset * downVec.y,
  };
  const topLeftError = Math.sqrt(
    (verifyTopLeft.x - location.topLeft.x) ** 2 + (verifyTopLeft.y - location.topLeft.y) ** 2
  );

  // The finder center at module position (moduleCount-3.5, 3.5) should map to topRight
  const verifyTopRight = {
    x: origin.x + (moduleCount - finderOffset) * rightVec.x + finderOffset * downVec.x,
    y: origin.y + (moduleCount - finderOffset) * rightVec.y + finderOffset * downVec.y,
  };
  const topRightError = Math.sqrt(
    (verifyTopRight.x - location.topRight.x) ** 2 + (verifyTopRight.y - location.topRight.y) ** 2
  );

  // The finder center at module position (3.5, moduleCount-3.5) should map to bottomLeft
  const verifyBottomLeft = {
    x: origin.x + finderOffset * rightVec.x + (moduleCount - finderOffset) * downVec.x,
    y: origin.y + finderOffset * rightVec.y + (moduleCount - finderOffset) * downVec.y,
  };
  const bottomLeftError = Math.sqrt(
    (verifyBottomLeft.x - location.bottomLeft.x) ** 2 +
      (verifyBottomLeft.y - location.bottomLeft.y) ** 2
  );

  log('extract', 'Origin validation', {
    origin: `(${origin.x.toFixed(1)}, ${origin.y.toFixed(1)})`,
    rightVec: `(${rightVec.x.toFixed(2)}, ${rightVec.y.toFixed(2)})`,
    downVec: `(${downVec.x.toFixed(2)}, ${downVec.y.toFixed(2)})`,
    topLeftExpected: `(${location.topLeft.x.toFixed(1)}, ${location.topLeft.y.toFixed(1)})`,
    topLeftComputed: `(${verifyTopLeft.x.toFixed(1)}, ${verifyTopLeft.y.toFixed(1)})`,
    topLeftError: topLeftError.toFixed(2),
    topRightExpected: `(${location.topRight.x.toFixed(1)}, ${location.topRight.y.toFixed(1)})`,
    topRightComputed: `(${verifyTopRight.x.toFixed(1)}, ${verifyTopRight.y.toFixed(1)})`,
    topRightError: topRightError.toFixed(2),
    bottomLeftExpected: `(${location.bottomLeft.x.toFixed(1)}, ${location.bottomLeft.y.toFixed(1)})`,
    bottomLeftComputed: `(${verifyBottomLeft.x.toFixed(1)}, ${verifyBottomLeft.y.toFixed(1)})`,
    bottomLeftError: bottomLeftError.toFixed(2),
  });

  if (topLeftError > 1 || topRightError > 1 || bottomLeftError > 1) {
    log('extract', 'WARNING: Finder center mapping errors detected!', {
      topLeftError: topLeftError.toFixed(2),
      topRightError: topRightError.toFixed(2),
      bottomLeftError: bottomLeftError.toFixed(2),
    });
  }

  // Note: Adaptive local thresholding (ZXing HybridBinarizer) infrastructure is kept
  // but not used - the global threshold from finder patterns is more reliable.

  log('extract', 'Sampling configuration', {
    moduleSize: location.moduleSize.toFixed(1),
    samplingMode: 'global threshold (from finder patterns)',
    globalThreshold: globalThreshold.toFixed(1),
  });

  // The finder pattern structure for validation:
  // 1111111  (row 0)
  // 1000001  (row 1)
  // 1011101  (row 2)
  // 1011101  (row 3)
  // 1011101  (row 4)
  // 1000001  (row 5)
  // 1111111  (row 6)
  const finderPattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  // Extract matrix using global threshold (computed from finder patterns)
  // This is more reliable than adaptive local thresholding which can fail
  // when block boundaries don't align with module centers
  const matrix: boolean[][] = [];
  let totalDarkModules = 0;
  let totalLightModules = 0;

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Sample at center of module
      const x = origin.x + (col + 0.5) * rightVec.x + (row + 0.5) * downVec.x;
      const y = origin.y + (col + 0.5) * rightVec.y + (row + 0.5) * downVec.y;
      
      // Sample the pixel
      const gray = sampleSinglePixel(pixels, width, height, x, y);
      
      // Classify using global threshold (from finder pattern detection)
      const isDark = gray < globalThreshold;
      matrixRow.push(isDark);
      if (isDark) totalDarkModules++;
      else totalLightModules++;
    }
    matrix.push(matrixRow);
  }

  log('extract', 'Extracted matrix', {
    moduleCount,
    thresholdMode: 'global (from finder patterns)',
    threshold: globalThreshold.toFixed(1),
    darkModules: totalDarkModules,
    lightModules: totalLightModules,
    darkRatio: `${((totalDarkModules / (totalDarkModules + totalLightModules)) * 100).toFixed(1)}%`,
  });

  // Validate matrix by checking finder patterns (reuse finderPattern defined above)

  // Validate top-left finder pattern
  let tlMatches = 0;
  let tlMismatches = 0;
  const tlErrors: string[] = [];

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const expected = finderPattern[row][col] === 1;
      const actual = matrix[row]?.[col] ?? false;
      if (expected === actual) {
        tlMatches++;
      } else {
        tlMismatches++;
        if (tlErrors.length < 5) {
          tlErrors.push(
            `(${row},${col}): expected ${expected ? 'dark' : 'light'}, got ${actual ? 'dark' : 'light'}`
          );
        }
      }
    }
  }

  log('extract', 'Top-left finder pattern validation', {
    matches: tlMatches,
    mismatches: tlMismatches,
    accuracy: `${((tlMatches / 49) * 100).toFixed(1)}%`,
    errors: tlErrors.length > 0 ? tlErrors : 'none',
  });

  // Validate top-right finder pattern (at columns moduleCount-7 to moduleCount-1)
  let trMatches = 0;
  let trMismatches = 0;
  const trErrors: string[] = [];
  const trColOffset = moduleCount - 7;

  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 7; col++) {
      const expected = finderPattern[row][col] === 1;
      const actual = matrix[row]?.[trColOffset + col] ?? false;
      if (expected === actual) {
        trMatches++;
      } else {
        trMismatches++;
        if (trErrors.length < 5) {
          trErrors.push(
            `(${row},${trColOffset + col}): expected ${expected ? 'dark' : 'light'}, got ${actual ? 'dark' : 'light'}`
          );
        }
      }
    }
  }

  log('extract', 'Top-right finder pattern validation', {
    matches: trMatches,
    mismatches: trMismatches,
    accuracy: `${((trMatches / 49) * 100).toFixed(1)}%`,
    errors: trErrors.length > 0 ? trErrors : 'none',
  });

  // Check for potential 180° rotation: if top-right is very wrong but top-left is ok,
  // or if both are wrong in complementary ways
  const tlAccuracy = tlMatches / 49;
  const trAccuracy = trMatches / 49;

  if (tlMismatches > 20 || trMismatches > 20) {
    log('extract', 'WARNING: Finder pattern accuracy very low - matrix may be mis-oriented', {
      topLeftAccuracy: `${(tlAccuracy * 100).toFixed(1)}%`,
      topRightAccuracy: `${(trAccuracy * 100).toFixed(1)}%`,
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
export {
  getModuleCountForVersion as getModuleCountFromVersion,
  getVersionFromModuleCount,
} from '../qr-spec';
