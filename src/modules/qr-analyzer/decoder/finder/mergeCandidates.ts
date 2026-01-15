import {candidates, distance, moduleSize, x, y} from '../shared';
/**
 * Merge/cluster nearby finder pattern candidates to reduce duplicates.
 * Sorts by proximity and merges candidates within 0.75*moduleSize distance.
 */
export function mergeCandidates(
  cands: Array<{ x: number; y: number; moduleSize: number }

