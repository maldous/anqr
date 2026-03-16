import { qrDecoderLog } from "./qr-decoder-log";
import { GF_LOG } from "./gf-log";
import { gfAdd } from "./gf-add";

// ============================================
// Error Application
// ============================================

/**
 * Apply computed error corrections to the codeword.
 * Returns the corrected codeword, or null if any error position is invalid.
 */
export function applyErrorCorrections(
  codeword: number[],
  n: number,
  errorLocators: number[],
  magnitudes: number[],
): number[] | null {
  const corrected = [...codeword];
  for (let i = 0; i < errorLocators.length; i++) {
    const position = n - 1 - GF_LOG[errorLocators[i]];
    if (position < 0) {
      qrDecoderLog.debug("rs-decoder: Bad error location", {
        position,
        errorLocator: errorLocators[i],
      });
      return null;
    }
    corrected[position] = gfAdd(corrected[position], magnitudes[i]);

    qrDecoderLog.trace(`rs-decoder: Corrected position ${position}`, {
      original: codeword[position].toString(16).padStart(2, "0"),
      magnitude: magnitudes[i].toString(16).padStart(2, "0"),
      corrected: corrected[position].toString(16).padStart(2, "0"),
    });
  }
  return corrected;
}
