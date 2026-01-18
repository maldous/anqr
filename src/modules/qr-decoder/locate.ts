/**
 * QR Finder Pattern Location
 * Detects the 3 finder patterns in a QR code image
 */

import type { Point, FinderPattern } from './types';

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

interface ScanResult {
  center: number;
  moduleSize: number;
}

/**
 * Check if the state counts represent a valid finder pattern (1:1:3:1:1 ratio)
 * Note: This is different from qr-spec's isFinderPattern which checks coordinates.
 * This function validates the pixel ratio pattern during scanning.
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
    const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
    const isDark = gray < threshold;

    if (isDark) {
      // We're in a dark pixel
      if (state === 1 || state === 3) {
        // Was in white, transition to next dark
        state++;
      }
      counts[state]++;
    } else {
      // We're in a light pixel
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
          state = 3;
        } else {
          state++;
          counts[state]++;
        }
      } else {
        counts[state]++;
      }
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
  let state = 2; // Start at center (black)

  // Scan up from center
  for (let row = Math.floor(y); row >= 0; row--) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
    const isDark = gray < threshold;

    if (state === 2) {
      if (isDark) counts[2]++;
      else { state = 1; counts[1]++; }
    } else if (state === 1) {
      if (!isDark) counts[1]++;
      else { state = 0; counts[0]++; }
    } else if (state === 0) {
      if (isDark) counts[0]++;
      else break;
    }
  }

  state = 2;

  // Scan down from center
  for (let row = Math.floor(y) + 1; row < height; row++) {
    const idx = (row * width + Math.floor(x)) * 4;
    const gray = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
    const isDark = gray < threshold;

    if (state === 2) {
      if (isDark) counts[2]++;
      else { state = 3; counts[3]++; }
    } else if (state === 3) {
      if (!isDark) counts[3]++;
      else { state = 4; counts[4]++; }
    } else if (state === 4) {
      if (isDark) counts[4]++;
      else break;
    }
  }

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
 */
export function findFinderPatterns(
  imageData: ImageData
): FinderPattern[] {
  const { data: pixels, width, height } = imageData;

  log('locate', 'Finding finder patterns', { width, height });

  // Calculate threshold using Otsu's method (simplified)
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    count++;
  }
  const threshold = sum / count;

  log('locate', 'Calculated threshold', { threshold: threshold.toFixed(1) });

  const candidates: Map<string, FinderPattern> = new Map();

  // Scan every few rows for efficiency
  const step = Math.max(1, Math.floor(height / 100));

  for (let y = step; y < height - step; y += step) {
    const rowResults = scanRow(pixels, width, y, threshold);

    for (const result of rowResults) {
      // Verify vertically
      const vertical = verifyVertical(
        pixels, width, height,
        result.center, y,
        result.moduleSize, threshold
      );

      if (vertical.valid) {
        // Use grid key to deduplicate nearby patterns
        const gridSize = vertical.moduleSize * 5;
        const gridX = Math.round(result.center / gridSize);
        const gridY = Math.round(vertical.center / gridSize);
        const key = `${gridX},${gridY}`;

        const existing = candidates.get(key);
        if (!existing || existing.count < 10) {
          candidates.set(key, {
            center: { x: result.center, y: vertical.center },
            moduleSize: vertical.moduleSize,
            count: (existing?.count || 0) + 1,
          });
        }
      }
    }
  }

  // Convert to array and filter by count
  const patterns = Array.from(candidates.values())
    .filter(p => p.count >= 1)
    .sort((a, b) => b.count - a.count);

  log('locate', 'Found finder pattern candidates', { 
    count: patterns.length,
    patterns: patterns.slice(0, 5).map(p => ({
      x: p.center.x.toFixed(1),
      y: p.center.y.toFixed(1),
      moduleSize: p.moduleSize.toFixed(2),
      hitCount: p.count
    }))
  });

  return patterns;
}

interface ScoredTriplet {
  ordered: [FinderPattern, FinderPattern, FinderPattern];
  score: number;
  squareness: number;
  moduleSizeVariance: number;
}

/**
 * Select the 3 finder patterns that form the QR code corners
 * Returns [topLeft, topRight, bottomLeft] or null if not found
 */
export function selectFinderPatterns(
  patterns: FinderPattern[]
): [FinderPattern, FinderPattern, FinderPattern] | null {
  if (patterns.length < 3) {
    log('select', 'Not enough patterns found', { count: patterns.length });
    return null;
  }

  const candidates: ScoredTriplet[] = [];

  // Try combinations of 3 patterns and score them
  for (let i = 0; i < Math.min(patterns.length, 10); i++) {
    for (let j = i + 1; j < Math.min(patterns.length, 10); j++) {
      for (let k = j + 1; k < Math.min(patterns.length, 10); k++) {
        const p1 = patterns[i];
        const p2 = patterns[j];
        const p3 = patterns[k];

        // Check module sizes are similar
        const avgSize = (p1.moduleSize + p2.moduleSize + p3.moduleSize) / 3;
        const sizeVariance = (
          Math.abs(p1.moduleSize - avgSize) +
          Math.abs(p2.moduleSize - avgSize) +
          Math.abs(p3.moduleSize - avgSize)
        ) / avgSize;
        
        if (sizeVariance > 0.3) {
          continue;
        }

        // Find the pattern that forms the right angle (top-left corner)
        const ordered = orderFinderPatterns(p1, p2, p3);
        if (!ordered) continue;

        const [topLeft, topRight, bottomLeft] = ordered;
        
        // Calculate squareness: the two sides from topLeft should be equal
        const topDist = distance(topLeft.center, topRight.center);
        const leftDist = distance(topLeft.center, bottomLeft.center);
        const avgDist = (topDist + leftDist) / 2;
        const squareness = Math.abs(topDist - leftDist) / avgDist;

        // Calculate angle at topLeft - should be close to 90 degrees
        const vecRight = {
          x: topRight.center.x - topLeft.center.x,
          y: topRight.center.y - topLeft.center.y
        };
        const vecDown = {
          x: bottomLeft.center.x - topLeft.center.x,
          y: bottomLeft.center.y - topLeft.center.y
        };
        const dotProduct = vecRight.x * vecDown.x + vecRight.y * vecDown.y;
        const magRight = Math.sqrt(vecRight.x ** 2 + vecRight.y ** 2);
        const magDown = Math.sqrt(vecDown.x ** 2 + vecDown.y ** 2);
        const cosAngle = dotProduct / (magRight * magDown);
        const angleDev = Math.abs(cosAngle); // Should be 0 for 90 degrees

        // Score: lower is better
        // Weight factors:
        // - squareness: how square the triplet is (lower = better)
        // - angleDev: how close to 90° the angle is (lower = better)
        // - sizeVariance: how consistent module sizes are (lower = better)
        // - hitCount: higher hit count = more confident detection
        // - span: larger spans indicate patterns at actual corners (better)
        
        // Use MINIMUM hit count - the weakest link matters most
        const minHits = Math.min(p1.count, p2.count, p3.count);
        const totalHits = p1.count + p2.count + p3.count;
        
        // Penalty for low minimum hit count
        const hitCountPenalty = Math.max(0, (8 - minHits) / 8);
        
        // IMPORTANT: Prefer larger spans - real finder patterns are at the CORNERS
        // of the QR code, not inside it. False positives tend to be inside,
        // resulting in smaller spans.
        // Normalize by module size: avgDist / moduleSize gives us the span in modules
        const spanInModules = avgDist / avgSize;
        
        // Direct bonus for larger spans (larger span = lower score = better)
        // Normalize to reasonable range: span of 22 modules = spanBonus of 0
        // span of 20 modules = spanBonus of 0.09 (small penalty)
        const referenceSpan = 22;
        const spanBonus = (referenceSpan - spanInModules) / referenceSpan;
        
        const score = squareness * 5 + angleDev * 5 + sizeVariance + hitCountPenalty * 2 + spanBonus * 2;

        log('select', 'Evaluating triplet', {
          topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
          topRight: { x: topRight.center.x.toFixed(1), y: topRight.center.y.toFixed(1) },
          bottomLeft: { x: bottomLeft.center.x.toFixed(1), y: bottomLeft.center.y.toFixed(1) },
          topDist: topDist.toFixed(1),
          leftDist: leftDist.toFixed(1),
          squareness: squareness.toFixed(3),
          angleDev: angleDev.toFixed(3),
          spanInModules: spanInModules.toFixed(1),
          hitCounts: `${p1.count}/${p2.count}/${p3.count}`,
          score: score.toFixed(3)
        });

        // Only accept triplets that are reasonably square (< 10% difference)
        if (squareness > 0.1) {
          log('select', 'Rejecting: not square enough', { squareness: squareness.toFixed(3) });
          continue;
        }

        // Only accept triplets with angles close to 90 degrees (< 15 degrees off)
        if (angleDev > 0.26) { // cos(75°) ≈ 0.26
          log('select', 'Rejecting: angle not close to 90°', { angleDev: angleDev.toFixed(3) });
          continue;
        }

        candidates.push({
          ordered,
          score,
          squareness,
          moduleSizeVariance: sizeVariance
        });
      }
    }
  }

  if (candidates.length === 0) {
    log('select', 'Could not find valid pattern triplet');
    return null;
  }

  // Sort by score and pick the best
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];

  log('select', 'Selected finder patterns', {
    topLeft: { x: best.ordered[0].center.x.toFixed(1), y: best.ordered[0].center.y.toFixed(1) },
    topRight: { x: best.ordered[1].center.x.toFixed(1), y: best.ordered[1].center.y.toFixed(1) },
    bottomLeft: { x: best.ordered[2].center.x.toFixed(1), y: best.ordered[2].center.y.toFixed(1) },
    score: best.score.toFixed(3),
    squareness: best.squareness.toFixed(3),
    candidatesEvaluated: candidates.length
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
  const d12 = distance(p1.center, p2.center);
  const d13 = distance(p1.center, p3.center);
  const d23 = distance(p2.center, p3.center);

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

/** Calculate Euclidean distance between two points (local helper) */
function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
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

  log('select', 'Cross product calculation', {
    topLeft: { x: topLeft.center.x.toFixed(1), y: topLeft.center.y.toFixed(1) },
    a: { x: a.center.x.toFixed(1), y: a.center.y.toFixed(1) },
    b: { x: b.center.x.toFixed(1), y: b.center.y.toFixed(1) },
    cross: cross.toFixed(1),
    aIsTopRight: cross > 0
  });

  if (cross > 0) {
    return [a, b]; // a is top-right, b is bottom-left
  } else {
    return [b, a]; // b is top-right, a is bottom-left
  }
}
