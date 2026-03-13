import { type DecodedSegmentInfo } from '../../../modules/qr-decoder/types';
import type { DecodedEncodingMode } from './decoded-encoding-mode';
export type { DecodedEncodingMode } from './decoded-encoding-mode';

/**
 * Decode the data codewords into text plus raw bytes.
 *
 * Why:
 * - QR byte segments are just bytes. Without ECI, the spec default is ISO-8859-1.
 * - Our generator can also emit raw byte payloads (low-byte stringToBytes).
 * - For analyzer reproduction, we must preserve the exact bytes, not a re-encoded UTF-8 string.
 */
export interface DecodedDataResult {
  text: string;
  bytes: Uint8Array;
  encodingMode: DecodedEncodingMode;
  /** Whether the decode completed successfully without truncation */
  valid: boolean;
  /** Whether the decode was structurally valid (no extra non-terminator segments after primary) */
  structurallyValid: boolean;
  /** Number of segments decoded (including terminator if found) */
  segmentCount: number;
  /** Detailed info for each decoded segment */
  segments: DecodedSegmentInfo[];
}
