/**
 * Generate a full QR-Art code using RS basis manipulation
 *
 * STRATEGY 2 Implementation:
 * - Encode ONLY the provided data (no suffix modification)
 * - Select a version with enough padding codewords for QR-Art control
 * - Only padding codewords (after terminator+pad-to-byte) are controllable
 * - The decoded message is ALWAYS preserved exactly
 *
 * Algorithm:
 * 1. Calculate semantic bit layout to find padding codeword region
 * 2. Build RS basis vectors ONLY for padding bits (protected regions excluded)
 * 3. Map bits to pixels via zigzag traversal
 * 4. Gauss-Jordan elimination to assign pixel control
 * 5. Select vectors to flip pixels toward target
 * 6. Regenerate QR with modified data
 */

export type BasisVectorViolation = {
  vectorIndex: number;
  dataBitIndex: number;
  blockIndex: number;
  localBitIndex: number;
  linearBit: number;
  violationType: "ORIGINAL_DATA" | "TERMINATOR_GAP";
};
