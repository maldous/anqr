/**
 * QR Finder Pattern Location
 * Detects the 3 finder patterns in a QR code image
 */

import { createLogger } from '../../lib/logger';

const qrDecoderLog = createLogger('DECODER');

import type { FinderPattern, FinderPatternResult } from './types';
import { pointDistance } from './utils';

interface ScanResult {
  center: number;
  moduleSize: number;
}

/**
 * Convert RGBA pixel to grayscale, composited over white.
 *
 * Canvas pixels may be transparent (e.g. background set to 'transparent'
 * or left unpainted). In ImageData those appear as transparent black
 * (0,0,0,0), but visually they render over the page background.
 * For QR detection, treat transparency as light modules by compositing
 * over white.
 */
function grayAt(pixels: Uint8ClampedArray, idx: number): number {
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
 * Check if the state counts represent a valid finder pattern (1:1:3:1:1 ratio)
 * Note: This is different from qr-spec's isFinderPattern which checks coordinates.
 * This function validates the pixel ratio pattern during scanning.
 */
/**
 * Check if edge counts match finder pattern ratio (1:1:3:1:1)
 * Note: This is different from qr-spec's isFinderPattern which checks position
 */
function isFinderPatternRatio(counts: number[]): boolean {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total < 7) return false;

  const moduleSize = total / 7;
  const tolerance = moduleSize * 0.5;

  return (
    Math.abs(counts[0] - moduleSize) < tolerance &&
    Math.abs(counts[1] - moduleSize) < tolerance &&
    Math.abs(counts[2] - 3 * moduleSize) < tolerance &&
    Math.abs(counts[3] - moduleSize) < tolerance &&
    Math.abs(counts[4] - moduleSize) < tolerance
  );
}

/**
 * Handle a dark pixel during row scanning, advancing the state machine.
 * Returns the new state.
 */
function handleDarkPixel(state: number, counts: number[]): number {
  if (state === 1 || state === 3) {
    // Was in white, transition to next dark
    state++;
  }
  counts[state]++;
  return state;
}

/**
 * Handle a light pixel during row scanning, advancing the state machine.
 * If a complete pattern is found (state 4 → light), it is checked and
 * potentially pushed to results. Returns the new state.
 */
function handleLightPixel(
  state: number,
  counts: number[],
  x: number,
  results: ScanResult[]
): number {
  if (state === 0 || state === 2 || state === 4) {
    // Was in dark, transition to next light
    if (state === 4) {
      // Check if we have a valid pattern
      if (isFinderPatternRatio(counts)) {
        const total = counts.reduce((a, b) => a + b, 0);
        const center = x - total / 2;
        results.push({
          center,
          moduleSize: total / 7,
        });
      }
      // Shift counts and continue looking
      counts[0] = counts[2];
      counts[1] = counts[3];
      counts[2] = counts[4];
      counts[3] = 1;
      counts[4] = 0;
      return 3;
    } else {
      state++;
      counts[state]++;
      return state;
    }
  } else {
    counts[state]++;
    return state;
  }
}

/**
 * Scan a row for potential finder patterns
 */
function scanRow(
  pixels: Uint8ClampedArray,
  width: number,
  y: number,
  threshold: number
): ScanResult[] {
  const results: ScanResult[] = [];
  const counts = [0, 0, 0, 0, 0];
  let state = 0;

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;

    if (isDark) {
      state = handleDarkPixel(state, counts);
    } else {
      state = handleLightPixel(state, counts, x, results);
    }
  }

  // Check final state
  if (state === 4 && isFinderPatternRatio(counts)) {
    const total = counts.reduce((a, b) => a + b, 0);
    const center = width - total / 2;
    results.push({
      center,
      moduleSize: total / 7,
    });
  }

  return results;
}

/**
 * Scan upward from startY, populating counts[2], counts[1], counts[0].
 * Scans the center dark region, then the white ring, then the outer dark border.
 */
function scanUpward(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  startY: number,
  threshold: number,
  counts: number[]
): void {
  let state = 2; // Start at center (black)

  for (let row = startY; row >= 0; row--) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;

    if (state === 2) {
      if (isDark) counts[2]++;
      else {
        state = 1;
        counts[1]++;
      }
    } else if (state === 1) {
      if (!isDark) counts[1]++;
      else {
        state = 0;
        counts[0]++;
      }
    } else if (state === 0) {
      if (isDark) counts[0]++;
      else break;
    }
  }
}

/**
 * Scan downward from startY, populating counts[2], counts[3], counts[4].
 * Scans the center dark region, then the white ring, then the outer dark border.
 */
function scanDownward(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  startY: number,
  threshold: number,
  counts: number[]
): void {
  let state = 2; // Start at center (black)

  for (let row = startY; row < height; row++) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = grayAt(pixels, idx);
    const isDark = gray < threshold;

    if (state === 2) {
      if (isDark) counts[2]++;
      else {
        state = 3;
        counts[3]++;
      }
    } else if (state === 3) {
      if (!isDark) counts[3]++;
      else {
        state = 4;
        counts[4]++;
      }
    } else if (state === 4) {
      if (isDark) counts[4]++;
      else break;
    }
  }
}

/**
 * Verify a potential finder pattern by checking vertically
 */
function verifyVertical(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  expectedModuleSize: number,
  threshold: number
): { valid: boolean; center: number; moduleSize: number } {
  const counts = [0, 0, 0, 0, 0];

  // Scan up from center
  scanUpward(pixels, width, x, Math.floor(y), threshold, counts);

  // Scan down from center (start one row below to avoid double-counting the center row)
  scanDownward(pixels, width, height, x, Math.floor(y) + 1, threshold, counts);

  if (!isFinderPatternRatio(counts)) {
    return { valid: false, center: y, moduleSize: expectedModuleSize };
  }

  const total = counts.reduce((a, b) => a + b, 0);
  const moduleSize = total / 7;
  const moduleSizeError = Math.abs(moduleSize - expectedModuleSize);

  if (moduleSizeError > expectedModuleSize * 0.5) {
    return { valid: false, center: y, moduleSize: expectedModuleSize };
  }

  const newCenter = y + (counts[3] + counts[4] - counts[0] - counts[1]) / 2;

  return { valid: true, center: newCenter, moduleSize };
}

/**
 * Find all finder patterns in the image
 * Returns both the patterns and the threshold used for detection
 */
export function findFinderPatterns(imageData: ImageData): FinderPatternResult {
  const { data: pixels, width, height } = imageData;

  qrDecoderLog.trace('locate: Finding finder patterns', { width, height });

  // Calculate threshold (simple mean). We composite transparency over white
  // so a transparent background is treated as light modules.
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += grayAt(pixels, i);
    count++;
  }
  const threshold = sum / count;

  qrDecoderLog.trace('locate: Calculated threshold', { threshold: threshold.toFixed(1) });

  const candidates: Map<string, FinderPattern> = new Map();

  // Scan every few rows for efficiency
  const step = Math.max(1, Math.floor(height / 100));

  for (let y = step; y < height - step; y += step) {
    const rowResults = scanRow(pixels, width, y, threshold);

    for (const result of rowResults) {
      // Verify vertically
      const vertical = verifyVertical(
        pixels,
        width,
        height,
        result.center,
        y,
        result.moduleSize,
        threshold
      );

      if (vertical.valid) {
        // Refine the center position by sampling the expected finder pattern structure
        const refined = refineFinderPatternCenter(
          pixels,
          width,
          height,
          result.center,
          vertical.center,
          vertical.moduleSize,
          threshold
        );

        // Use grid key to deduplicate nearby patterns
        const gridSize = vertical.moduleSize * 5;
        const gridX = Math.round(refined.x / gridSize);
        const gridY = Math.round(refined.y / gridSize);
        const key = `${gridX},${gridY}`;

        const existing = candidates.get(key);
        if (!existing || existing.count < 10) {
          candidates.set(key, {
            center: { x: refined.x, y: refined.y },
            moduleSize: vertical.moduleSize,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    }
  }

  // Convert to array and filter by count
  const patterns = Array.from(candidates.values())
    .filter((p) => p.count >= 1)
    .sort((a, b) => b.count - a.count);

  qrDecoderLog.trace('locate: Found finder pattern candidates', {
    count: patterns.length,
    patterns: patterns.slice(0, 5).map((p) => ({
      x: p.center.x.toFixed(1),
      y: p.center.y.toFixed(1),
      moduleSize: p.moduleSize.toFixed(2),
      hitCount: p.count,
    })),
  });

  return { patterns, threshold };
}

// Module positions (col, row) in the 7x7 finder pattern
// Dark 3x3 core: modules (2,2) through (4,4)
const DARK_CORE_MODULES: ReadonlyArray<[number, number]> = [
  [2, 2],
  [3, 2],
  [4, 2],
  [2, 3],
  [3, 3],
  [4, 3],
  [2, 4],
  [3, 4],
  [4, 4],
];

// White ring: modules surrounding the dark core (row 1 and row 5 middle, col 1 and col 5 middle)
const WHITE_RING_MODULES: ReadonlyArray<[number, number]> = [
  [1, 2],
  [1, 3],
  [1, 4], // left column of white ring
  [5, 2],
  [5, 3],
  [5, 4], // right column of white ring
  [2, 1],
  [3, 1],
  [4, 1], // top row of white ring
  [2, 5],
  [3, 5],
  [4, 5], // bottom row of white ring
];

/**
 * Compute the average dark and light values at a candidate finder center.
 * Used for diagnostic logging to verify sampling is hitting module centers.
 */
function computeFinderContrast(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  testX: number,
  testY: number,
  moduleSize: number
): { avgDark: number; avgLight: number; contrast: number } {
  // Calculate finder pattern origin (top-left corner of module 0,0)
  const finderOriginX = testX - 3.5 * moduleSize;
  const finderOriginY = testY - 3.5 * moduleSize;

  // Sample dark core modules
  let darkSum = 0;
  let darkCount = 0;
  for (const [col, row] of DARK_CORE_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      darkSum += grayAt(pixels, idx);
      darkCount++;
    }
  }

  // Sample white ring modules
  let lightSum = 0;
  let lightCount = 0;
  for (const [col, row] of WHITE_RING_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      lightSum += grayAt(pixels, idx);
      lightCount++;
    }
  }

  const avgDark = darkCount > 0 ? darkSum / darkCount : 127;
  const avgLight = lightCount > 0 ? lightSum / lightCount : 127;
  const contrast = avgLight - avgDark;

  return { avgDark, avgLight, contrast };
}

/**
 * Score a candidate finder pattern center position by measuring contrast
 * between expected dark (center 3x3) and light (surrounding ring) areas.
 *
 * The candidate center (testX, testY) is assumed to be at module position (3.5, 3.5)
 * within the finder pattern. We calculate the finder origin and sample at explicit
 * module center positions to avoid landing on module boundaries.
 */
function scoreFinderCenter(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  testX: number,
  testY: number,
  moduleSize: number,
  threshold: number
): number {
  // Calculate finder pattern origin (top-left corner of module 0,0)
  // The center is at module position (3.5, 3.5), so origin is 3.5 modules back
  const finderOriginX = testX - 3.5 * moduleSize;
  const finderOriginY = testY - 3.5 * moduleSize;

  // Sample dark core modules (should be black, gray value ~0)
  // Sample at the CENTER of each module (+0.5 offset)
  let darkSum = 0;
  let darkCount = 0;
  for (const [col, row] of DARK_CORE_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      darkSum += grayAt(pixels, idx);
      darkCount++;
    }
  }

  // Sample white ring modules (should be white, gray value ~255)
  // Sample at the CENTER of each module (+0.5 offset)
  let lightSum = 0;
  let lightCount = 0;
  for (const [col, row] of WHITE_RING_MODULES) {
    const px = Math.round(finderOriginX + (col + 0.5) * moduleSize);
    const py = Math.round(finderOriginY + (row + 0.5) * moduleSize);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      lightSum += grayAt(pixels, idx);
      lightCount++;
    }
  }

  // Need sufficient samples for reliable scoring
  if (darkCount < 5 || lightCount < 5) return -Infinity;

  const avgDark = darkSum / darkCount;
  const avgLight = lightSum / lightCount;

  // Score is the contrast between light and dark
  // Higher score = better finder pattern match
  const contrast = avgLight - avgDark;

  // Also penalize if dark isn't dark enough or light isn't light enough
  const darkPenalty = avgDark > threshold ? (avgDark - threshold) / 255 : 0;
  const lightPenalty = avgLight < threshold ? (threshold - avgLight) / 255 : 0;

  return contrast - darkPenalty * 100 - lightPenalty * 100;
}

/**
 * Search a grid of candidate positions around a center point, scoring each one.
 * Returns the best position and score found within the grid.
 */
function searchGrid(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number,
  threshold: number,
  radius: number,
  step: number
): { bestX: number; bestY: number; bestScore: number } {
  let bestX = centerX;
  let bestY = centerY;
  let bestScore = -Infinity;

  for (let dy = -radius; dy <= radius; dy += step) {
    for (let dx = -radius; dx <= radius; dx += step) {
      const testX = centerX + dx;
      const testY = centerY + dy;
      const score = scoreFinderCenter(pixels, width, height, testX, testY, moduleSize, threshold);

      if (score > bestScore) {
        bestScore = score;
        bestX = testX;
        bestY = testY;
      }
    }
  }

  return { bestX, bestY, bestScore };
}

/**
 * Refine a finder pattern center by sampling the expected finder pattern structure
 * and finding the offset that maximizes correlation.
 *
 * The finder pattern is 7x7 modules with structure:
 *   1111111  (row 0)
 *   1000001  (row 1)
 *   1011101  (row 2)
 *   1011101  (row 3)
 *   1011101  (row 4)
 *   1000001  (row 5)
 *   1111111  (row 6)
 *
 * We sample the center 3x3 (should be dark) and surrounding ring (should be light)
 * and find the offset that maximizes the contrast between them.
 */
function refineFinderPatternCenter(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  moduleSize: number,
  threshold: number
): { x: number; y: number; score: number } {
  // Search radius in pixels (about 2.5 modules to correct for potential larger offsets)
  const searchRadius = Math.ceil(moduleSize * 2.5);
  const step = Math.max(1, Math.floor(moduleSize / 4));

  const initialScore = scoreFinderCenter(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize,
    threshold
  );

  // Coarse pass: search the area around the detected center
  let { bestX, bestY, bestScore } = searchGrid(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize,
    threshold,
    searchRadius,
    step
  );

  // Use the initial score if the grid search didn't beat it
  if (initialScore > bestScore) {
    bestScore = initialScore;
    bestX = centerX;
    bestY = centerY;
  }

  // Fine pass: refine with smaller steps around best position (skip if step is already 1)
  if (step > 1) {
    const fineStep = Math.max(1, Math.floor(step / 2));
    const fineRadius = step * 2;

    const fineResult = searchGrid(
      pixels,
      width,
      height,
      bestX,
      bestY,
      moduleSize,
      threshold,
      fineRadius,
      fineStep
    );

    if (fineResult.bestScore > bestScore) {
      bestScore = fineResult.bestScore;
      bestX = fineResult.bestX;
      bestY = fineResult.bestY;
    }
  }

  // Log refinement result with diagnostic avgDark/avgLight values
  const deltaX = bestX - centerX;
  const deltaY = bestY - centerY;
  const refined = bestScore > initialScore;

  // Compute contrast values at the best position for diagnostic purposes
  const bestContrast = computeFinderContrast(pixels, width, height, bestX, bestY, moduleSize);
  const originalContrast = computeFinderContrast(
    pixels,
    width,
    height,
    centerX,
    centerY,
    moduleSize
  );

  qrDecoderLog.trace('locate: Finder center refinement', {
    original: `(${centerX.toFixed(1)}, ${centerY.toFixed(1)})`,
    refined: `(${bestX.toFixed(1)}, ${bestY.toFixed(1)})`,
    delta: `(${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`,
    moduleSize: moduleSize.toFixed(1),
    searchRadius,
    step,
    initialScore: initialScore.toFixed(1),
    bestScore: bestScore.toFixed(1),
    scoreImprovement: (bestScore - initialScore).toFixed(1),
    refinementHelped: refined,
    originalAvgDark: originalContrast.avgDark.toFixed(1),
    originalAvgLight: originalContrast.avgLight.toFixed(1),
    bestAvgDark: bestContrast.avgDark.toFixed(1),
    bestAvgLight: bestContrast.avgLight.toFixed(1),
    bestContrast: bestContrast.contrast.toFixed(1),
    note:
      bestContrast.avgDark > 80 || bestContrast.avgLight < 180
        ? 'WARNING: Poor contrast suggests finder center still not accurate'
        : 'OK - good contrast detected',
  });

  return { x: bestX, y: bestY, score: bestScore };
}

interface ScoredTriplet {
  ordered: [FinderPattern, FinderPattern, FinderPattern];
  score: number;
  squareness: number;
  moduleSizeVariance: number;
}

function evaluateCandidateTriplet(
  p1: FinderPattern,
  p2: FinderPattern,
  p3: FinderPattern
): ScoredTriplet | null {
  const avgSize = (p1.moduleSize + p2.moduleSize + p3.moduleSize) / 3;
  const sizeVariance =
    (Math.abs(p1.moduleSize - avgSize) +
      Math.abs(p2.moduleSize - avgSize) +
      Math.abs(p3.moduleSize - avgSize)) /
    avgSize;

  if (sizeVariance > 0.3) return null;

  const ordered = orderFinderPatterns(p1, p2, p3);
  if (!ordered) return null;

  const [topLeft, topRight, bottomLeft] = ordered;

  const topDist = pointDistance(topLeft.center, topRight.center);
  const leftDist = pointDistance(topLeft.center, bottomLeft.center);
  const avgDist = (topDist + leftDist) / 2;
  const squareness = Math.abs(topDist - leftDist) / avgDist;

  const vecRight = {
    x: topRight.center.x - topLeft.center.x,
    y: topRight.center.y - topLeft.center.y,
  };
  const vecDown = {
    x: bottomLeft.center.x - topLeft.center.x,
    y: bottomLeft.center.y - topLeft.center.y,
  };
  const dotProduct = vecRight.x * vecDown.x + vecRight.y * vecDown.y;
  const magRight = Math.sqrt(vecRight.x ** 2 + vecRight.y ** 2);
  const magDown = Math.sqrt(vecDown.x ** 2 + vecDown.y ** 2);
  const cosAngle = dotProduct / (magRight * magDown);
  const angleDev = Math.abs(cosAngle);

  const minHits = Math.min(p1.count, p2.count, p3.count);
  const _totalHits = p1.count + p2.count + p3.count;
  const hitCountPenalty = Math.max(0, (8 - minHits) / 8);

  const spanInModules = avgDist / avgSize;
  const referenceSpan = 22;
  const spanBonus = (referenceSpan - spanInModules) / referenceSpan;

  const score = squareness * 5 + angleDev * 5 + sizeVariance + hitCountPenalty * 2 + spanBonus * 2;

  qrDecoderLog.trace('select: Evaluating triplet', {
    topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
    topRight: { x: topRight.center.x.toFixed(1), y: topRight.center.y.toFixed(1) },
    bottomLeft: { x: bottomLeft.center.x.toFixed(1), y: bottomLeft.center.y.toFixed(1) },
    topDist: topDist.toFixed(1),
    leftDist: leftDist.toFixed(1),
    squareness: squareness.toFixed(3),
    angleDev: angleDev.toFixed(3),
    spanInModules: spanInModules.toFixed(1),
    hitCounts: `${p1.count}/${p2.count}/${p3.count}`,
    score: score.toFixed(3),
  });

  if (squareness > 0.1) {
    qrDecoderLog.trace('select: Rejecting - not square enough', {
      squareness: squareness.toFixed(3),
    });
    return null;
  }

  if (angleDev > 0.26) {
    qrDecoderLog.trace('select: Rejecting - angle not close to 90°', {
      angleDev: angleDev.toFixed(3),
    });
    return null;
  }

  return { ordered, score, squareness, moduleSizeVariance: sizeVariance };
}

/**
 * Select the 3 finder patterns that form the QR code corners
 * Returns [topLeft, topRight, bottomLeft] or null if not found
 */
export function selectFinderPatterns(
  patterns: FinderPattern[]
): [FinderPattern, FinderPattern, FinderPattern] | null {
  if (patterns.length < 3) {
    qrDecoderLog.debug('select: Not enough patterns found', { count: patterns.length });
    return null;
  }

  const candidates: ScoredTriplet[] = [];

  // Try combinations of 3 patterns and score them
  for (let i = 0; i < Math.min(patterns.length, 10); i++) {
    for (let j = i + 1; j < Math.min(patterns.length, 10); j++) {
      for (let k = j + 1; k < Math.min(patterns.length, 10); k++) {
        const triplet = evaluateCandidateTriplet(patterns[i], patterns[j], patterns[k]);
        if (triplet) candidates.push(triplet);
      }
    }
  }

  if (candidates.length === 0) {
    qrDecoderLog.debug('select: Could not find valid pattern triplet');
    return null;
  }

  // Sort by score and pick the best
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  qrDecoderLog.trace('select: Selected finder patterns', {
    topLeft: { x: best.ordered[0].center.x.toFixed(1), y: best.ordered[0].center.y.toFixed(1) },
    topRight: { x: best.ordered[1].center.x.toFixed(1), y: best.ordered[1].center.y.toFixed(1) },
    bottomLeft: { x: best.ordered[2].center.x.toFixed(1), y: best.ordered[2].center.y.toFixed(1) },
    score: best.score.toFixed(3),
    squareness: best.squareness.toFixed(3),
    candidatesEvaluated: candidates.length,
  });

  return best.ordered;
}

/**
 * Order 3 finder patterns as [topLeft, topRight, bottomLeft]
 * The top-left pattern is at the right angle of the triangle
 */
function orderFinderPatterns(
  p1: FinderPattern,
  p2: FinderPattern,
  p3: FinderPattern
): [FinderPattern, FinderPattern, FinderPattern] | null {
  // Calculate distances
  const d12 = pointDistance(p1.center, p2.center);
  const d13 = pointDistance(p1.center, p3.center);
  const d23 = pointDistance(p2.center, p3.center);

  let topLeft: FinderPattern;
  let topRight: FinderPattern;
  let bottomLeft: FinderPattern;

  // The longest edge is the diagonal (not adjacent to top-left)
  if (d12 >= d13 && d12 >= d23) {
    // p3 is top-left
    topLeft = p3;
    [topRight, bottomLeft] = orderByAngle(p3, p1, p2);
  } else if (d13 >= d12 && d13 >= d23) {
    // p2 is top-left
    topLeft = p2;
    [topRight, bottomLeft] = orderByAngle(p2, p1, p3);
  } else {
    // p1 is top-left
    topLeft = p1;
    [topRight, bottomLeft] = orderByAngle(p1, p2, p3);
  }

  return [topLeft, topRight, bottomLeft];
}

/**
 * Given top-left and two other patterns, determine which is top-right vs bottom-left
 * based on cross product (right-hand rule)
 *
 * In image coordinates (y increases downward):
 * - If cross product is positive, rotation from a to b (around topLeft) is counterclockwise
 *   meaning a is to the right and b is below → a is top-right, b is bottom-left
 * - If cross product is negative, rotation is clockwise
 *   meaning a is below and b is to the right → b is top-right, a is bottom-left
 */
function orderByAngle(
  topLeft: FinderPattern,
  a: FinderPattern,
  b: FinderPattern
): [FinderPattern, FinderPattern] {
  // Cross product of vectors (topLeft→a) × (topLeft→b)
  const cross =
    (a.center.x - topLeft.center.x) * (b.center.y - topLeft.center.y) -
    (a.center.y - topLeft.center.y) * (b.center.x - topLeft.center.x);

  qrDecoderLog.trace('select: Cross product calculation', {
    topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
    a: { x: a.center.x.toFixed(1), y: a.center.y.toFixed(1) },
    b: { x: b.center.x.toFixed(1), y: b.center.y.toFixed(1) },
    cross: cross.toFixed(1),
    aIsTopRight: cross > 0,
  });

  if (cross > 0) {
    return [a, b]; // a is top-right, b is bottom-left
  } else {
    return [b, a]; // b is top-right, a is bottom-left
  }
}
