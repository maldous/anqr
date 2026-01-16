/**
 * Pattern Helper Functions
 * Format info, version info, and alignment pattern position detection
 */

import { getAlignmentPatternCenters } from '../qr-core.ts';
import { alignmentCache } from './cache.js';

/**
 * Check if a module is part of format information area
 * @param {number} row - Module row
 * @param {number} col - Module column
 * @param {number} moduleCount - Total module count
 * @returns {boolean}
 */
export function isFormatInfo(row, col, moduleCount) {
  // Format info is around finder patterns
  // Horizontal: row 8, cols 0-8 and moduleCount-8 to moduleCount-1
  // Vertical: col 8, rows 0-8 and moduleCount-7 to moduleCount-1
  if (row === 8 && (col <= 8 || col >= moduleCount - 8)) return true;
  if (col === 8 && (row <= 8 || row >= moduleCount - 7)) return true;
  return false;
}

/**
 * Check if a module is part of version information area (version 7+)
 * @param {number} row - Module row
 * @param {number} col - Module column
 * @param {number} moduleCount - Total module count
 * @param {number} version - QR version
 * @returns {boolean}
 */
export function isVersionInfo(row, col, moduleCount, version) {
  if (version < 7) return false;
  // Version info is in two 6x3 blocks
  // Bottom-left: rows moduleCount-11 to moduleCount-9, cols 0-5
  // Top-right: rows 0-5, cols moduleCount-11 to moduleCount-9
  if (row >= moduleCount - 11 && row <= moduleCount - 9 && col <= 5) return true;
  if (col >= moduleCount - 11 && col <= moduleCount - 9 && row <= 5) return true;
  return false;
}

/**
 * Get alignment pattern positions with caching
 * Uses qr-core's getAlignmentPatternCenters but adds caching layer
 * @param {number} version - QR version
 * @param {number} moduleCount - Total module count
 * @returns {Array<{row: number, col: number}>}
 */
export function getAlignmentPositions(version, moduleCount) {
  if (version < 2) return [];

  // Check cache first (called multiple times per render)
  const cacheKey = `${version}:${moduleCount}`;
  const cached = alignmentCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // Get positions from qr-core
  const positions = getAlignmentPatternCenters(version, moduleCount);

  // Cache the result
  alignmentCache.set(cacheKey, positions);
  return positions;
}
