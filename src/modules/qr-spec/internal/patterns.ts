/**
 * QR Pattern Detection
 * Functions to identify structural elements in a QR code matrix
 * 
 * These are pure coordinate-based functions - NO pixels, canvas, or DOM
 */

import { getAlignmentPositions, getVersionFromModuleCount } from './constants';

/**
 * Check if a position is within a finder pattern (7x7 corner patterns)
 * @param row Module row (0-indexed)
 * @param col Module column (0-indexed)
 * @param moduleCount Total module count
 */
export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= moduleCount - 7) return true;
  // Bottom-left finder
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}

/**
 * Check if a position is a timing pattern (row/col 6)
 * @param row Module row
 * @param col Module column
 * @param moduleCount Optional - if provided, excludes finder overlap areas
 */
export function isTimingPattern(row: number, col: number, moduleCount?: number): boolean {
  if (moduleCount === undefined) {
    return row === 6 || col === 6;
  }
  // Horizontal timing pattern (row 6, between finders)
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  // Vertical timing pattern (col 6, between finders)
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}

/**
 * Check if a position is within an alignment pattern
 * @param row Module row
 * @param col Module column
 * @param moduleCount Total module count
 */
export function isAlignmentPattern(row: number, col: number, moduleCount: number): boolean {
  const version = getVersionFromModuleCount(moduleCount);
  if (version < 2) return false;
  
  const positions = getAlignmentPositions(version);
  if (positions.length === 0) return false;

  for (const py of positions) {
    for (const px of positions) {
      // Skip positions that overlap with finder patterns
      if (py < 9 && px < 9) continue;
      if (py < 9 && px > moduleCount - 9) continue;
      if (py > moduleCount - 9 && px < 9) continue;

      // Check if within 5x5 alignment pattern centered at (py, px)
      if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a position is a locked structural element
 * (finder patterns, timing, alignment - cannot be modified for artistic QR)
 * 
 * @param moduleCount Total module count (can be scaled)
 * @param x X coordinate
 * @param y Y coordinate
 * @param scale Scale factor (default 1)
 */
export function isLocked(moduleCount: number, x: number, y: number, scale: number = 1): boolean {
  const l = moduleCount / scale;
  const sx = Math.floor(x / scale);
  const sy = Math.floor(y / scale);

  // Out of bounds
  if (sx < 0 || sy < 0 || sx >= l || sy >= l) return true;

  // Finder patterns (top-left, top-right, bottom-left) + separators
  if (sx < 8 && sy < 8) return true;
  if (sx < 8 && sy > l - 9) return true;
  if (sx > l - 9 && sy < 8) return true;

  // Timing patterns
  if (sx === 6 || sy === 6) return true;

  // Alignment patterns
  const version = getVersionFromModuleCount(l);
  const positions = getAlignmentPositions(version);

  if (positions.length > 0) {
    for (const px of positions) {
      for (const py of positions) {
        // Skip alignment patterns that overlap with finder patterns
        if (px < 9 && py < 9) continue;
        if (px < 9 && py > l - 9) continue;
        if (px > l - 9 && py < 9) continue;

        if (Math.abs(sx - px) <= 2 && Math.abs(sy - py) <= 2) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if a position is a data point (center of scaled module)
 * Data points must preserve QR values for scannability
 * 
 * @param x X coordinate within scaled module
 * @param y Y coordinate within scaled module
 * @param scale Scale factor
 */
export function isData(x: number, y: number, scale: number): boolean {
  const m = Math.floor(scale / 2);
  const xs = x % scale;
  const ys = y % scale;

  if (xs === m && ys === m) return true;
  if (scale % 2 === 1) return false;

  // For even scales, data occupies 2x2 center
  if (xs === m && ys === m - 1) return true;
  if (xs === m - 1 && ys === m) return true;
  if (xs === m - 1 && ys === m - 1) return true;

  return false;
}

/**
 * Check if a module is a structural element (includes format/version info)
 * More comprehensive than isLocked - includes all non-data modules
 */
export function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  // Finder patterns + separators (8x8 regions)
  if (row < 8 && col < 8) return true;
  if (row < 8 && col >= moduleCount - 8) return true;
  if (row >= moduleCount - 8 && col < 8) return true;

  // Timing patterns
  if (row === 6 || col === 6) return true;

  // Format information
  if (row === 8 && col < 9) return true;
  if (col === 8 && row < 9) return true;
  if (row === 8 && col >= moduleCount - 8) return true;
  if (col === 8 && row >= moduleCount - 8) return true;

  // Dark module (always dark)
  if (row === moduleCount - 8 && col === 8) return true;

  // Version info (version 7+)
  if (version >= 7) {
    if (row >= moduleCount - 11 && row < moduleCount - 8 && col < 6) return true;
    if (col >= moduleCount - 11 && col < moduleCount - 8 && row < 6) return true;
  }

  // Alignment patterns (version 2+)
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const py of positions) {
      for (const px of positions) {
        if (py < 9 && px < 9) continue;
        if (py < 9 && px > moduleCount - 9) continue;
        if (py > moduleCount - 9 && px < 9) continue;
        if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) return true;
      }
    }
  }

  return false;
}

/**
 * Check if a module is part of format information area
 */
export function isFormatInfo(row: number, col: number, moduleCount: number): boolean {
  // Format info around finder patterns
  // Horizontal: row 8, cols 0-8 and moduleCount-8 to moduleCount-1
  // Vertical: col 8, rows 0-8 and moduleCount-7 to moduleCount-1
  if (row === 8 && (col <= 8 || col >= moduleCount - 8)) return true;
  if (col === 8 && (row <= 8 || row >= moduleCount - 7)) return true;
  return false;
}

/**
 * Check if a module is part of version information area (version 7+)
 */
export function isVersionInfo(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  if (version < 7) return false;
  // Version info is in two 6x3 blocks
  // Bottom-left: rows moduleCount-11 to moduleCount-9, cols 0-5
  // Top-right: rows 0-5, cols moduleCount-11 to moduleCount-9
  if (row >= moduleCount - 11 && row <= moduleCount - 9 && col <= 5) return true;
  if (col >= moduleCount - 11 && col <= moduleCount - 9 && row <= 5) return true;
  return false;
}

/**
 * Get all alignment pattern center positions as {row, col} objects
 * Excludes positions that overlap with finder patterns
 */
export function getAlignmentPatternCenters(
  version: number,
  moduleCount: number
): Array<{ row: number; col: number }> {
  if (version < 2) return [];

  const coords = getAlignmentPositions(version);
  const positions: Array<{ row: number; col: number }> = [];

  for (const r of coords) {
    for (const c of coords) {
      // Skip positions that overlap with finder patterns
      if (r < 9 && c < 9) continue;
      if (r < 9 && c > moduleCount - 9) continue;
      if (r > moduleCount - 9 && c < 9) continue;
      positions.push({ row: r, col: c });
    }
  }

  return positions;
}
