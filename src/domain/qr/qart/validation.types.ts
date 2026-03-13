import type { ECCLevel } from './bit-mapping';
export type { SemanticValidationResult } from './semantic-validation-result';
export type { FormatVerificationResult } from './format-verification-result';

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
