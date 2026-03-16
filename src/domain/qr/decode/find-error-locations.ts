import { qrDecoderLog } from "./qr-decoder-log";
import { gfInv } from "./gf-inv";
import { polyDegree } from "./poly-degree";
import { polyGetCoeff } from "./poly-get-coeff";
import { polyEval } from "./poly-eval";

// ============================================
// Chien Search
// ============================================

/**
 * Find error locations using Chien search
 *
 * Algorithm:
 * 1. Get number of errors from sigma's degree
 * 2. Evaluate sigma at all non-zero field elements (1, 2, ..., 255)
 * 3. When sigma(i) = 0, store inverse(i) as error locator
 *
 * @param sigma Error locator polynomial (high-to-low coefficients from Euclidean)
 * @param n Length of codeword
 * @returns Array of error locator values, or null if wrong number of roots found
 */
export function findErrorLocations(sigma: number[], n: number): number[] | null {
  const numErrors = polyDegree(sigma);

  // Shortcut for single error
  if (numErrors === 1) {
    // For sigma = a + bx (high-to-low: [b, a]), root is -a/b = a/b (in GF)
    // The coefficient of x^1 is sigma[0] (high-to-low), constant is sigma[1]
    const coeff1 = polyGetCoeff(sigma, 1); // Coefficient of x^1
    return [coeff1];
  }

  const result: number[] = [];

  qrDecoderLog.trace("rs-decoder: Chien search starting", {
    numErrors,
    n,
    sigmaCoeffs: sigma.map((s) => s.toString(16).padStart(2, "0")).join(" "),
  });

  // Evaluate sigma at all non-zero field elements
  for (let i = 1; i < 256 && result.length < numErrors; i++) {
    if (polyEval(sigma, i) === 0) {
      // Found a root at i, error locator is inverse(i)
      result.push(gfInv(i));

      qrDecoderLog.trace("rs-decoder: Chien found root", {
        i,
        errorLocator: gfInv(i).toString(16).padStart(2, "0"),
      });
    }
  }

  if (result.length !== numErrors) {
    qrDecoderLog.trace("rs-decoder: Chien search wrong number of roots", {
      expected: numErrors,
      found: result.length,
    });
    return null;
  }

  qrDecoderLog.trace("rs-decoder: Chien search found all roots", {
    errorLocators: result.map((e) => e.toString(16).padStart(2, "0")).join(" "),
  });

  return result;
}
