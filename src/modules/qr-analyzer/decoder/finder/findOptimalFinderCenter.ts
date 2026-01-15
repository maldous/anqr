import {best, center, for, moduleSize, of, score, x, y} from '../shared';
/**
 * Find the optimal center position for a finder pattern within a search region
 * Searches a grid of positions around the initial estimate and returns the best one
 */
export function findOptimalFinderCenter(
  binary: boolean[],
  width: number,
  height: number,
  initialX: number,
  initialY: number,
  moduleSize: number
): { x: number; y: number; score: number }

