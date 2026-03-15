import { qrDecoderLog } from './qr-decoder-log';
import { gfMul } from './gf-mul';
import { gfInv } from './gf-inv';
import { polyEval } from './poly-eval';

// ============================================
// Forney Algorithm
// ============================================

/**
 * Calculate error magnitudes using Forney algorithm
 *
 * Uses direct product formula instead of polynomial derivative.
 *
 * For each error i with locator X_i:
 *   xiInverse = X_i^{-1}
 *   denominator = Π_{j≠i} (1 + X_j * xiInverse)
 *   magnitude = omega(xiInverse) / denominator
 *
 * For QR codes with generatorBase = 0, no additional xiInverse multiplication.
 *
 * @param omega Error evaluator polynomial (high-to-low from Euclidean)
 * @param errorLocators Error locator values from Chien search
 * @returns Error magnitudes
 */
export function findErrorMagnitudes(omega: number[], errorLocators: number[]): number[] {
  const numErrors = errorLocators.length;
  const result: number[] = new Array(numErrors);

  qrDecoderLog.trace('rs-decoder: Forney calculating magnitudes (direct product)', {
    numErrors,
    errorLocators: errorLocators.map((e) => e.toString(16).padStart(2, '0')).join(' '),
    omegaCoeffs: omega.map((o) => o.toString(16).padStart(2, '0')).join(' '),
  });

  for (let i = 0; i < numErrors; i++) {
    const xiInverse = gfInv(errorLocators[i]);
    let denominator = 1;

    for (let j = 0; j < numErrors; j++) {
      if (i !== j) {
        // term = X_j * X_i^{-1}
        const term = gfMul(errorLocators[j], xiInverse);
        // termPlus1 = 1 + term (in GF(2^m), this is XOR with 1)
        // Use workaround: (term & 0x1) === 0 ? term | 1 : term & ~1
        const termPlus1 = (term & 0x1) === 0 ? term | 1 : term & ~1;
        denominator = gfMul(denominator, termPlus1);
      }
    }

    // Evaluate omega at xiInverse
    const omegaVal = polyEval(omega, xiInverse);

    // magnitude = omega(xiInverse) / denominator
    result[i] = gfMul(omegaVal, gfInv(denominator));

    // For QR codes with generatorBase = 0, NO additional xiInverse multiplication
    // (Only multiply by xiInverse when generatorBase != 0)

    qrDecoderLog.trace(`rs-decoder: Forney magnitude for error ${i}`, {
      errorLocator: errorLocators[i].toString(16).padStart(2, '0'),
      xiInverse: xiInverse.toString(16).padStart(2, '0'),
      omegaVal: omegaVal.toString(16).padStart(2, '0'),
      denominator: denominator.toString(16).padStart(2, '0'),
      magnitude: result[i].toString(16).padStart(2, '0'),
    });
  }

  return result;
}
