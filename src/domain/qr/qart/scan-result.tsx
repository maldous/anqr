import type { DecodedSegmentInfo } from "../decode";

// DecodedSegmentInfo is imported from '../qr-decoder'

/**
 * Result of scanning a QR matrix
 */
export interface ScanResult {
  /** Whether the scan succeeded and produced valid data */
  success: boolean;
  /** The decoded data (if successful) */
  data?: string;
  /** Error message (if failed) */
  error?: string;
  /** Number of scan attempts made */
  attempts?: number;
  /** Whether the decoder reported fully valid structure (no truncated/fake segments) */
  structurallyValid?: boolean;
  /** Number of segments decoded (including terminator if found) */
  segmentCount?: number;
  /** Array of segment info for each decoded segment */
  segments?: DecodedSegmentInfo[];
}
