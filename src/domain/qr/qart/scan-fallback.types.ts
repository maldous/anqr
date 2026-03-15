export type { FlattenedSelection } from './flattened-selection';
export type { BinarySearchResult } from './binary-search-result';

/**
 * Rejection histogram for tracking why candidates were rejected.
 * Used for debugging and diagnosing acceptance policy issues.
 */
export interface RejectionHistogram {
  SCAN_FAILED: number;
  LENGTH_TOO_SHORT: number;
  BYTE_MISMATCH: number;
  ECC_MISMATCH: number;
  MASK_MISMATCH: number;
  SUFFIX_CHARSET_INVALID: number;
  ACCEPTED: number;
  total: number;
}

/**
 * A flattened selection entry that combines block info with vector info
 * and includes importance for sorting
 */
