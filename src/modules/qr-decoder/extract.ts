/**
 * QR Grid Extraction
 * Extracts the module matrix from an image using perspective transformation
 */

// Shared logger
import { qrDecoderLog as log } from '../qr-analyzer/logger';
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

  // ========================================
  // Determine the best threshold for module classification
  // ========================================
  // We'll calculate a local threshold from finder pattern sampling first,
  // then decide whether to use it or the global threshold.

  // Diagnostic: sample finder patterns to verify threshold is appropriate
  // (This doesn't affect the threshold used, just provides debug info)
  const finderPositions = [
    { colOffset: 0, rowOffset: 0 }, // Top-left
    { colOffset: moduleCount - 7, rowOffset: 0 }, // Top-right
    { colOffset: 0, rowOffset: moduleCount - 7 }, // Bottom-left
  ];

  let darkSampleSum = 0;
  let darkSampleCount = 0;
  let lightSampleSum = 0;
  let lightSampleCount = 0;

  // Sample a few points from finder patterns for diagnostic purposes
  const diagnosticFinderPattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];

  for (const fp of finderPositions) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const col = fp.colOffset + c;
        const row = fp.rowOffset + r;
        const x = origin.x + (col + 0.5) * rightVec.x + (row + 0.5) * downVec.x;
        const y = origin.y + (col + 0.5) * rightVec.y + (row + 0.5) * downVec.y;
        const gray = sampleSinglePixel(pixels, width, height, x, y);

        if (diagnosticFinderPattern[r][c] === 1) {
          darkSampleSum += gray;
          darkSampleCount++;
        } else {
          lightSampleSum += gray;
          lightSampleCount++;
        }
      }
    }
  }

  const avgDark = darkSampleCount > 0 ? darkSampleSum / darkSampleCount : 0;
  const avgLight = lightSampleCount > 0 ? lightSampleSum / lightSampleCount : 255;
  const localThreshold = (avgDark + avgLight) / 2;

  // Decide which threshold to use:
  // - If diagnostic sampling shows clean contrast (avgDark < 80 && avgLight > 180),
  //   use the local threshold which is calibrated to the actual QR module values
  // - Otherwise fall back to global threshold from finder detection
  //
  // The global threshold can be biased high by large white margins/quiet zones,
  // causing too many modules to be classified as dark.
  const useLocalThreshold = avgDark < 80 && avgLight > 180;
  const threshold = useLocalThreshold ? localThreshold : globalThreshold;

  // Determine if we have very clean contrast (suitable for single-pixel sampling)
  // When avgDark < 30 and avgLight > 225, the QR code has excellent contrast
  // and single-pixel sampling is more accurate than kernel sampling which can
  // bleed across module boundaries and cause ~6% classification errors.
  const hasCleanContrast = useLocalThreshold && avgDark < 30 && avgLight > 225;

  log('extract', 'Threshold selection', {
    avgDark: avgDark.toFixed(1),
    avgLight: avgLight.toFixed(1),
    localThreshold: localThreshold.toFixed(1),
    globalThreshold: globalThreshold.toFixed(1),
    useLocalThreshold,
    hasCleanContrast,
    selectedThreshold: threshold.toFixed(1),
    reason: useLocalThreshold
      ? 'Clean contrast detected - using local threshold'
      : 'Using global threshold (local values suggest sampling issues)',
  });

  // Calculate kernel radius based on module size
  // For modules ~20 pixels, kernel radius of 2-3 pixels helps avoid edges
  // However, for clean high-contrast QR codes, single-pixel sampling is more accurate
  // because kernel sampling can bleed across module boundaries.
  // For clean contrast, use single-pixel sampling (kernelRadius=0)
  // For intermediate cases, use smaller kernel (moduleSize/10) to reduce boundary bleed
  // Old formula was moduleSize/6 which gave 7x7 kernel for 20px modules - too aggressive
  const kernelRadius = hasCleanContrast ? 0 : Math.max(1, Math.floor(location.moduleSize / 10));

  log('extract', 'Sampling configuration', {
    moduleSize: location.moduleSize.toFixed(1),
    kernelRadius,
    samplingMode: hasCleanContrast ? 'single-pixel (clean contrast)' : 'kernel (anti-aliasing robust)',
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

  // Extract matrix using kernel sampling for robustness against anti-aliasing
  const matrix: boolean[][] = [];
  let totalDarkModules = 0;
  let totalLightModules = 0;

  for (let row = 0; row < moduleCount; row++) {
    const matrixRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      // Sample at center of module
      // Use single-pixel sampling for clean contrast (more accurate)
      // Use kernel sampling for anti-aliasing robustness when needed
      const x = origin.x + (col + 0.5) * rightVec.x + (row + 0.5) * downVec.x;
      const y = origin.y + (col + 0.5) * rightVec.y + (row + 0.5) * downVec.y;
      const gray = kernelRadius === 0
        ? sampleSinglePixel(pixels, width, height, x, y)
        : samplePixelKernel(pixels, width, height, x, y, kernelRadius);
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
