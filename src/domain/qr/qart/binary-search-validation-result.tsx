import type { RejectionReason } from './validation';

/**
 * Result of binary search validation
 */
export interface BinarySearchValidationResult {
  valid: boolean;
  /** Rejection reason if hard gate failed */
  reason?: RejectionReason | 'SUFFIX_CHARSET_INVALID';
  description?: string;
  mismatchIndex?: number;
  expectedByte?: number;
  actualByte?: number;
  /** Soft penalty for suffix charset violations (0 = no penalty, higher = worse) */
  suffixCharsetPenalty?: number;
  /** Whether this was a hard gate failure vs soft penalty */
  hardGateFailed?: boolean;
}
