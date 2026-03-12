import type { ECCLevel } from './bit-mapping';
import type { RejectionReason } from './validation';
import type { EncoderDerivedLayout } from './generate.types';

/**
 * Result of base QR generation with data extraction
 */
export interface BaseQRResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Rejection reason if failed */
  rejectionReason?: RejectionReason;
  /** Details about the failure (e.g., expected vs actual values) */
  errorDetails?: {
    expectedEcc?: ECCLevel;
    actualEcc?: ECCLevel;
    expectedMask?: number;
    actualMask?: number;
  };
  matrix: boolean[][];
  actualVersion: number;
  actualMask: number;
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  /** Encoder-derived semantic layout with ACTUAL bit positions */
  encoderLayout: EncoderDerivedLayout;
}
