import { isFinderPattern } from './is-finder-pattern';
import { isTimingPattern } from './is-timing-pattern';
import { isAlignmentPattern } from './is-alignment-pattern';
import { isFormatInfo } from './is-format-info';
import { isVersionInfo } from './is-version-info';
import { isQuietZoneSeparator } from './qr-patterns._internal';

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
  if (isQuietZoneSeparator(row, col, moduleCount)) return true;

  return false;
}
