/**
 * QR Code Pattern Detection
 * Functions to identify structural elements in QR codes
 */

import { createLogger } from '../../lib/logger';
import { ALIGNMENT_POSITIONS } from './constants';

const _log = createLogger('SPEC');

/**
 * Check if position is within a finder pattern
 * Finder patterns are 7x7 at corners (0,0), (0, size-7), (size-7, 0)
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
 * Check if position is on a timing pattern
 * Timing patterns are at row 6 and column 6
 */
export function isTimingPattern(row: number, col: number, moduleCount: number): boolean {
  // Horizontal timing (row 6, between finders)
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  // Vertical timing (col 6, between finders)
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}

/**
 * Get alignment pattern center positions for a given version
 */
export function getAlignmentPatternCenters(
  version: number,
  moduleCount: number
): { row: number; col: number }[] {
  if (version < 2) return [];

  const positions = ALIGNMENT_POSITIONS[version - 1] || [];
  const centers: { row: number; col: number }[] = [];

  for (const row of positions) {
    for (const col of positions) {
      // Skip if overlapping with finder patterns
      if (isFinderPattern(row, col, moduleCount)) continue;
      // Check 5x5 area around center
      let overlapsWithFinder = false;
      for (let dr = -2; dr <= 2 && !overlapsWithFinder; dr++) {
        for (let dc = -2; dc <= 2 && !overlapsWithFinder; dc++) {
          if (isFinderPattern(row + dr, col + dc, moduleCount)) {
            overlapsWithFinder = true;
          }
        }
      }
      if (!overlapsWithFinder) {
        centers.push({ row, col });
      }
    }
  }

  return centers;
}

/**
 * Check if position is within an alignment pattern
 * Alignment patterns are 5x5 centered at specific positions
 */
export function isAlignmentPattern(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  if (version < 2) return false;

  const centers = getAlignmentPatternCenters(version, moduleCount);

  for (const center of centers) {
    if (Math.abs(row - center.row) <= 2 && Math.abs(col - center.col) <= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Check if position is in format information area
 * Format info is around finder patterns
 */
export function isFormatInfo(row: number, col: number, moduleCount: number): boolean {
  // Format information modules (15 bits, duplicated).
  // Important: exclude timing modules at (8,6) and (6,8).
  // Top-left group (around top-left finder)
  // - row 8, col 0..5 and 7..8
  // - col 8, row 0..5 and 7..8
  if (row === 8) {
    if (col <= 5) return true;
    if (col === 7 || col === 8) return true;
    // Top-right group
    if (col >= moduleCount - 8) return true;
  }
  if (col === 8) {
    if (row <= 5) return true;
    if (row === 7 || row === 8) return true;
    // Bottom-left group
    if (row >= moduleCount - 7) return true;
  }
  return false;
}

/**
 * Check if position is in version information area
 * Version info exists for version >= 7
 */
export function isVersionInfo(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  if (version < 7) return false;

  // Bottom-left of top-right finder (3x6 area)
  if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
  // Right of bottom-left finder (6x3 area)
  if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;

  return false;
}

/**
 * Check if a module position is "locked" (structural, should not be modified by overlay)
 * Locked positions include: finder patterns, timing, alignment, format info, version info, quiet zone separators
 */
export function isLocked(row: number, col: number, moduleCount: number, version: number): boolean {
  // Finder patterns
  if (isFinderPattern(row, col, moduleCount)) return true;

  // Timing patterns
  if (isTimingPattern(row, col, moduleCount)) return true;

  // Alignment patterns
  if (isAlignmentPattern(row, col, moduleCount, version)) return true;

  // Format information
  if (isFormatInfo(row, col, moduleCount)) return true;

  // Version information
  if (isVersionInfo(row, col, moduleCount, version)) return true;

  // Fixed dark module (scan critical)
  // ISO/IEC 18004: module at (4 * version + 9, 8) which equals (moduleCount - 8, 8)
  if (row === moduleCount - 8 && col === 8) return true;

  // Quiet zone separators (1-module border around finders)
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;

  return false;
}

/**
 * Check if a position is a data module (not structural)
 */
export function isData(row: number, col: number, moduleCount: number, version: number): boolean {
  return !isLocked(row, col, moduleCount, version);
}

/**
 * Check if a module is a structural element
 * Alias for isLocked for semantic clarity in different contexts
 */
export function isStructuralModule(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  return isLocked(row, col, moduleCount, version);
}
