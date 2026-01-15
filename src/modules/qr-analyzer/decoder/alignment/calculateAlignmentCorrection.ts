import {DetectedAlignmentPattern, align, dx, dy, patterns} from '../shared';
/**
 * Calculate a grid offset correction based on detected alignment patterns
 * Returns the average offset that should be applied to better align the grid
 */
export function calculateAlignmentCorrection(
  alignments: DetectedAlignmentPattern[]
): { dx: number; dy: number }

