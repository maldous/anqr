import type { ECCLevel } from './bit-mapping';

/**
 * Rejection reason codes for candidate acceptance
 * These are used for comprehensive logging and debugging
 */
export type RejectionReason =
  | 'SCAN_FAILED'
  | 'DECODER_INVALID'
  | 'LENGTH_TOO_SHORT'
  | 'BYTE_MISMATCH'
  | 'ECC_MISMATCH'
  | 'MASK_MISMATCH'
  | 'EXTRA_SEGMENT'
  | 'SEGMENT_PLAN_MISMATCH'
  | 'TERMINATOR_CORRUPT'
  | 'BLOCK_BUDGET_EXCEEDED'
  | 'RS_LINEARITY_BROKEN'
  | 'PROTECTED_BYTE_VIOLATION'
  | 'SUFFIX_CHARSET_INVALID';

/**
 * Result of semantic validation
 */
export interface SemanticValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Rejection reason if not valid */
  reason?: RejectionReason;
  /** Human-readable description */
  description?: string;
  /** Details about the failure */
  details?: {
    mismatchIndex?: number;
    expectedByte?: number;
    actualByte?: number;
    expectedLength?: number;
    actualLength?: number;
    expectedEcc?: string;
    actualEcc?: string;
    expectedMask?: number;
    actualMask?: number;
    segmentCount?: number;
  };
}

/**
 * Result of format info verification
 *
 * Exported for use in binary search fallback validation.
 */
export interface FormatVerificationResult {
  /** Whether verification passed (both ECC and mask match) */
  valid: boolean;
  /** Extracted ECC level from format info */
  extractedEcc: ECCLevel;
  /** Extracted mask from format info */
  extractedMask: number;
  /** Whether ECC matches expected */
  eccMatch: boolean;
  /** Whether mask matches expected */
  maskMatch: boolean;
  /** Rejection reason if not valid */
  reason?: RejectionReason;
}
