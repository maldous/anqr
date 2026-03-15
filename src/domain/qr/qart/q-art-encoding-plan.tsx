/**
 * Encode a string to data bytes using the QR encoder's bit buffer
 * This gives us the actual encoded bytes that would go into the QR code
 * Also computes and returns the ECC bytes for each block (needed for RS linearity)
 *
 * CRITICAL: Also returns the EncoderDerivedLayout which captures the ACTUAL
 * bit positions from the encoder. This is essential for HYBRID protection
 * as it tells us exactly where the original data ends and suffix begins.
 *
 * HYBRID STRATEGY:
 * - originalDataLength: length of the original URL/text (PROTECTED)
 * - suffixLength: length of the suffix (CONTROLLABLE)
 * - The full encoded data is: originalData + suffix
 * - Protection boundary is at: mode + charCount + originalData
 * - Controllable region is: suffix + padding
 */
export type QArtEncodingPlan =
  | {
      mode: 'byte';
      fullData: string;
      originalDataLength: number;
      suffixLength: number;
    }
  | {
      mode: 'numeric';
      prefix: string;
      suffix: string;
      originalDataLength: number;
      suffixLength: number;
    };
