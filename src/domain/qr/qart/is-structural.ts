import {
  isAlignmentPattern,
  isFinderPattern,
  isFormatInfo,
  isTimingPattern,
  isVersionInfo,
} from '../spec/qr-patterns';
import { isQuietZoneSeparator } from './is-quiet-zone-separator';

/**
 * Check if a module is structural (not data/ECC)
 */
export function isStructural(row: number, col: number, moduleCount: number, version: number): boolean {
  if (isFinderPattern(row, col, moduleCount)) return true;
  if (isTimingPattern(row, col, moduleCount)) return true;
  if (isAlignmentPattern(row, col, moduleCount, version)) return true;
  if (isFormatInfo(row, col, moduleCount)) return true;
  if (isVersionInfo(row, col, moduleCount, version)) return true;

  // Fixed dark module
  if (row === moduleCount - 8 && col === 8) return true;

  return isQuietZoneSeparator(row, col, moduleCount);
}
