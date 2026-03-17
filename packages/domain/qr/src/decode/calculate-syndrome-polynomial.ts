import { GF_EXP } from "./gf-exp";
import { gfAdd } from "./gf-add";
import { gfMul } from "./gf-mul";
import { POLY_ZERO } from "./poly-zero";

// ============================================
// Syndrome Calculation
// ============================================

/**
 * Calculate syndromes for received codeword and build syndrome polynomial
 *
 * For QR codes, the generator polynomial has roots α^0, α^1, ..., α^(numEcc-1)
 * So we calculate S_j = r(α^j) for j = 0 to numEcc-1
 *
 * Syndrome calculation:
 * 1. Treat codeword as a polynomial with codeword[0] as highest degree coefficient
 * 2. Evaluate at α^(i + generatorBase) for i = 0 to numEcc-1
 * 3. Store syndromes in REVERSED order (S_0 at last index)
 *
 * This builds the syndrome polynomial S(x) = S_{2t-1}*x^0 + S_{2t-2}*x^1 + ... + S_0*x^{2t-1}
 * in high-to-low representation: [S_0, S_1, ..., S_{2t-1}]
 *
 * @param codeword The received codeword bytes (data + ecc)
 * @param numEcc Number of error correction codewords
 * @returns Syndrome polynomial in high-to-low format
 */
export function calculateSyndromePolynomial(codeword: number[], numEcc: number): number[] {
  // Treat codeword as polynomial coefficients (high-to-low)
  const syndromeCoeffs = Array.from({ length: numEcc }, () => 0);
  let noError = true;

  // For QR codes, generatorBase = 0, so we evaluate at α^0, α^1, ..., α^{numEcc-1}
  for (let i = 0; i < numEcc; i++) {
    // Evaluate received polynomial at α^i
    // Using Horner's method for the received polynomial (codeword is high-to-low)
    const x = GF_EXP[i]; // α^i
    let evalResult = codeword[0];
    for (let j = 1; j < codeword.length; j++) {
      evalResult = gfAdd(gfMul(evalResult, x), codeword[j]);
    }

    // Syndromes stored in reversed order: S_0 at last index
    syndromeCoeffs[numEcc - 1 - i] = evalResult;
    if (evalResult !== 0) {
      noError = false;
    }
  }

  if (noError) {
    return POLY_ZERO; // All zeros means no errors
  }

  return syndromeCoeffs;
}
