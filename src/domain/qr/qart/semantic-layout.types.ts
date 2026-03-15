import { type ECCLevel } from './bit-mapping';
import type { BitRange } from './bit-range';
export type { BitRange } from './bit-range';

/**
 * Exact bit positions for QR semantic boundaries
 * All positions are in the PRE-INTERLEAVED data stream (before RS block interleaving)
 */
export interface SemanticBitLayout {
  /** Mode indicator: 4 bits identifying encoding mode */
  modeIndicator: BitRange;

  /** Character count: variable length depending on version and mode */
  characterCount: BitRange;

  /** Data content: the actual encoded payload */
  dataContent: BitRange;

  /** Terminator: 0000 pattern (up to 4 bits if room) */
  terminator: BitRange;

  /** Pad-to-byte: zero bits to reach byte boundary */
  padToByte: BitRange;

  /** Pad codewords: 0xEC 0x11 pattern to fill remaining capacity */
  padCodewords: BitRange & { byteCount: number };

  /** Total data bits (excluding ECC) */
  totalDataBits: number;

  /** Total data bytes */
  totalDataBytes: number;

  /** Version used */
  version: number;

  /** ECC level used */
  ecc: ECCLevel;

  /** Original data length in characters */
  dataLength: number;
}
