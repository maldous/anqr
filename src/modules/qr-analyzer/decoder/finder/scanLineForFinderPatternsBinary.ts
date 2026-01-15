import {candidates, center, dark, for, moduleSize, of, row, runs} from '../shared';
/**
 * Scan a single row or column for finder pattern candidates using binary image
 * 
 * FINDER PATTERN: 1:1:3:1:1 ratio of dark:light:dark:light:dark modules
 * We track runs of consecutive same-colored pixels and check for this ratio.
 */
export function scanLineForFinderPatternsBinary(
  binary: boolean[],
  width: number,
  lineIndex: number,
  isHorizontal: boolean,
  length: number
): Array<{ center: number; moduleSize: number }

