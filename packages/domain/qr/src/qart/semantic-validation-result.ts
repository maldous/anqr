import type { RejectionReason } from "./rejection-reason";

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
