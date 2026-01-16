/**
 * QR Finder Pattern Location
 * Detects the 3 finder patterns in a QR code image
 */

import type { Point, FinderPattern } from './types';

interface ScanResult {
  center: number;
  moduleSize: number;
}

/**
 * Check if the state counts represent a valid finder pattern (1:1:3:1:1 ratio)
 */
function isFinderPattern(counts: number[]): boolean {
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
          if (isFinderPattern(counts)) {
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
  if (state === 4 && isFinderPattern(counts)) {
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

  if (!isFinderPattern(counts)) {
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

  // Calculate threshold using Otsu's method (simplified)
  let sum = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    sum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    count++;
  }
  const threshold = sum / count;

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
  return Array.from(candidates.values())
    .filter(p => p.count >= 1)
    .sort((a, b) => b.count - a.count);
}

/**
 * Select the 3 finder patterns that form the QR code corners
 * Returns [topLeft, topRight, bottomLeft] or null if not found
 */
export function selectFinderPatterns(
  patterns: FinderPattern[]
): [FinderPattern, FinderPattern, FinderPattern] | null {
  if (patterns.length < 3) return null;

  // Try combinations of 3 patterns
  for (let i = 0; i < Math.min(patterns.length, 10); i++) {
    for (let j = i + 1; j < Math.min(patterns.length, 10); j++) {
      for (let k = j + 1; k < Math.min(patterns.length, 10); k++) {
        const p1 = patterns[i];
        const p2 = patterns[j];
        const p3 = patterns[k];

        // Check module sizes are similar
        const avgSize = (p1.moduleSize + p2.moduleSize + p3.moduleSize) / 3;
        if (
          Math.abs(p1.moduleSize - avgSize) > avgSize * 0.3 ||
          Math.abs(p2.moduleSize - avgSize) > avgSize * 0.3 ||
          Math.abs(p3.moduleSize - avgSize) > avgSize * 0.3
        ) {
          continue;
        }

        // Find the pattern that forms the right angle (top-left corner)
        const ordered = orderFinderPatterns(p1, p2, p3);
        if (ordered) return ordered;
      }
    }
  }

  return null;
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

function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Given top-left and two other patterns, determine which is top-right vs bottom-left
 * based on cross product (right-hand rule)
 */
function orderByAngle(
  topLeft: FinderPattern,
  a: FinderPattern,
  b: FinderPattern
): [FinderPattern, FinderPattern] {
  // Cross product: if positive, a is to the right of the vector from topLeft to b
  const cross =
    (a.center.x - topLeft.center.x) * (b.center.y - topLeft.center.y) -
    (a.center.y - topLeft.center.y) * (b.center.x - topLeft.center.x);

  if (cross < 0) {
    return [a, b]; // a is top-right, b is bottom-left
  } else {
    return [b, a]; // b is top-right, a is bottom-left
  }
}
