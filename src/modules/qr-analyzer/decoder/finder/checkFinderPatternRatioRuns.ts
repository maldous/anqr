import {for, moduleSize, r0, valid} from '../shared';
/**
 * Check if a run ratio matches the 1:1:3:1:1 finder pattern ratio
 * Allows some tolerance for image distortion
 */
export function checkFinderPatternRatioRuns(
  r0: number,
  r1: number,
  r2: number,
  r3: number,
  r4: number
): { valid: boolean; moduleSize: number }

