import type { ECCLevel } from './bit-mapping';
import type { RejectionReason } from './validation.types';

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
