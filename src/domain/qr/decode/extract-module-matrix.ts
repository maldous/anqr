import type { Point, QRLocation } from "../../../modules/qr-decoder/types";
import { qrDecoderLog } from "./qr-decoder-log";
import { sampleSinglePixel } from "./sample-single-pixel";
import { validateFinderRegion } from "./validate-finder-region";

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
  globalThreshold: number,
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
  const topDist = Math.hypot(
    location.topRight.x - location.topLeft.x,
    location.topRight.y - location.topLeft.y,
  );
  const leftDist = Math.hypot(
    location.bottomLeft.x - location.topLeft.x,
    location.bottomLeft.y - location.topLeft.y,
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

  qrDecoderLog.trace("extract: Unified pitch calculation", {
    topDist: topDist.toFixed(2),
    leftDist: leftDist.toFixed(2),
    avgDist: avgDist.toFixed(2),
    moduleSpan,
    unifiedPitch: unifiedPitch.toFixed(3),
    originalRightMag: (topDist / moduleSpan).toFixed(3),
    originalDownMag: (leftDist / moduleSpan).toFixed(3),
    driftPerModule: Math.abs(topDist / moduleSpan - leftDist / moduleSpan).toFixed(4),
    totalDriftOver29Modules: (Math.abs(topDist / moduleSpan - leftDist / moduleSpan) * 29).toFixed(
      2,
    ),
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
  const topLeftError = Math.hypot(
    verifyTopLeft.x - location.topLeft.x,
    verifyTopLeft.y - location.topLeft.y,
  );

  // The finder center at module position (moduleCount-3.5, 3.5) should map to topRight
  const verifyTopRight = {
    x: origin.x + (moduleCount - finderOffset) * rightVec.x + finderOffset * downVec.x,
    y: origin.y + (moduleCount - finderOffset) * rightVec.y + finderOffset * downVec.y,
  };
  const topRightError = Math.hypot(
    verifyTopRight.x - location.topRight.x,
    verifyTopRight.y - location.topRight.y,
  );

  // The finder center at module position (3.5, moduleCount-3.5) should map to bottomLeft
  const verifyBottomLeft = {
    x: origin.x + finderOffset * rightVec.x + (moduleCount - finderOffset) * downVec.x,
    y: origin.y + finderOffset * rightVec.y + (moduleCount - finderOffset) * downVec.y,
  };
  const bottomLeftError = Math.hypot(
    verifyBottomLeft.x - location.bottomLeft.x,
    verifyBottomLeft.y - location.bottomLeft.y,
  );

  qrDecoderLog.trace("extract: Origin validation", {
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
    qrDecoderLog.debug("extract: Finder center mapping errors detected", {
      topLeftError: topLeftError.toFixed(2),
      topRightError: topRightError.toFixed(2),
      bottomLeftError: bottomLeftError.toFixed(2),
    });
  }

  // Note: Adaptive local thresholding (HybridBinarizer) infrastructure is kept
  // but not used - the global threshold from finder patterns is more reliable.

  qrDecoderLog.trace("extract: Sampling configuration", {
    moduleSize: location.moduleSize.toFixed(1),
    samplingMode: "global threshold (from finder patterns)",
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

  qrDecoderLog.trace("extract: Extracted matrix", {
    moduleCount,
    thresholdMode: "global (from finder patterns)",
    threshold: globalThreshold.toFixed(1),
    darkModules: totalDarkModules,
    lightModules: totalLightModules,
    darkRatio: `${((totalDarkModules / (totalDarkModules + totalLightModules)) * 100).toFixed(1)}%`,
  });

  // Validate matrix by checking finder patterns (reuse finderPattern defined above)
  const tlResult = validateFinderRegion(matrix, finderPattern, 0, 0);

  qrDecoderLog.trace("extract: Top-left finder pattern validation", {
    matches: tlResult.matches,
    mismatches: tlResult.mismatches,
    accuracy: `${((tlResult.matches / 49) * 100).toFixed(1)}%`,
    errors: tlResult.errors.length > 0 ? tlResult.errors : "none",
  });

  // Validate top-right finder pattern (at columns moduleCount-7 to moduleCount-1)
  const trColOffset = moduleCount - 7;
  const trResult = validateFinderRegion(matrix, finderPattern, 0, trColOffset);

  qrDecoderLog.trace("extract: Top-right finder pattern validation", {
    matches: trResult.matches,
    mismatches: trResult.mismatches,
    accuracy: `${((trResult.matches / 49) * 100).toFixed(1)}%`,
    errors: trResult.errors.length > 0 ? trResult.errors : "none",
  });

  // Check for potential 180° rotation: if top-right is very wrong but top-left is ok,
  // or if both are wrong in complementary ways
  const tlMismatches = tlResult.mismatches;
  const trMismatches = trResult.mismatches;
  const tlAccuracy = tlResult.matches / 49;
  const trAccuracy = trResult.matches / 49;

  if (tlMismatches > 20 || trMismatches > 20) {
    qrDecoderLog.debug("extract: Finder pattern accuracy very low - matrix may be mis-oriented", {
      topLeftAccuracy: `${(tlAccuracy * 100).toFixed(1)}%`,
      topRightAccuracy: `${(trAccuracy * 100).toFixed(1)}%`,
    });
  }

  // Detect 180° rotation: top-left looks good but top-right is garbage (or vice versa)
  if (tlAccuracy > 0.8 && trAccuracy < 0.5) {
    qrDecoderLog.debug(
      "extract: Possible 180° rotation detected - top-left OK but top-right wrong",
    );
  } else if (trAccuracy > 0.8 && tlAccuracy < 0.5) {
    qrDecoderLog.debug(
      "extract: Possible 180° rotation detected - top-right OK but top-left wrong",
    );
  }

  return matrix;
}
