import { qrDecoderLog } from './qr-decoder-log-4';
import { gfMul } from './gf-mul';
import { gfInv } from './gf-inv';
import { polyDegree } from './poly-degree';
import { polyGetCoeff } from './poly-get-coeff';
import { polyIsZero } from './poly-is-zero';
import { polyAddOrSubtract } from './poly-add-or-subtract';
import { polyMultiply } from './poly-multiply';
import { polyMultiplyScalar } from './poly-multiply-scalar';
import { polyMultiplyByMonomial } from './poly-multiply-by-monomial';
import { buildMonomial } from './build-monomial';
import { POLY_ZERO } from './poly-zero';
import { POLY_ONE } from './poly-one';

// ============================================
// Euclidean Algorithm
// ============================================

/**
 * Find error locator (sigma) and error evaluator (omega) polynomials
 * using the Euclidean algorithm.
 *
 * This is more robust than Berlekamp-Massey as it naturally handles
 * the case of too many errors.
 *
 * @param syndromePoly Syndrome polynomial (high-to-low coefficients)
 * @param numEcc Number of ECC symbols (R = 2t)
 * @returns {sigma, omega} or null if uncorrectable
 */
export function runEuclideanAlgorithm(
  syndromePoly: number[],
  numEcc: number
): { sigma: number[]; omega: number[] } | null {
  // a = x^{2t}, b = syndrome polynomial
  // We want to find sigma, omega such that:
  //   omega = sigma * S mod x^{2t}
  //   deg(omega) < t and deg(sigma) <= t

  let a = buildMonomial(numEcc, 1); // x^{2t}
  let b = syndromePoly;

  // Ensure a has higher degree than b
  if (polyDegree(a) < polyDegree(b)) {
    const temp = a;
    a = b;
    b = temp;
  }

  let rLast = a;
  let r = b;
  let tLast = POLY_ZERO;
  let t = POLY_ONE;

  const halfR = Math.floor(numEcc / 2);

  // Run Euclidean algorithm until r's degree is less than R/2
  while (polyDegree(r) >= halfR) {
    const rLastLast = rLast;
    const tLastLast = tLast;
    rLast = r;
    tLast = t;

    // Divide rLastLast by rLast, with quotient in q and remainder in r
    if (polyIsZero(rLast)) {
      // Euclidean algorithm already terminated
      qrDecoderLog.trace('rs-decoder: Euclidean r_{i-1} was zero');
      return null;
    }

    r = rLastLast;
    let q = POLY_ZERO;
    const denominatorLeadingTerm = rLast[0]; // Leading coefficient (high-to-low)
    const dltInverse = gfInv(denominatorLeadingTerm);

    while (polyDegree(r) >= polyDegree(rLast) && !polyIsZero(r)) {
      const degreeDiff = polyDegree(r) - polyDegree(rLast);
      const scale = gfMul(r[0], dltInverse); // r's leading coeff * inverse
      q = polyAddOrSubtract(q, buildMonomial(degreeDiff, scale));
      r = polyAddOrSubtract(r, polyMultiplyByMonomial(rLast, degreeDiff, scale));
    }

    // t = q * tLast + tLastLast
    t = polyAddOrSubtract(polyMultiply(q, tLast), tLastLast);

    if (polyDegree(r) >= polyDegree(rLast)) {
      qrDecoderLog.trace('rs-decoder: Euclidean Division algorithm failed to reduce polynomial');
      return null;
    }
  }

  // sigma(0) must not be zero
  const sigmaTildeAtZero = polyGetCoeff(t, 0); // Constant term of t
  if (sigmaTildeAtZero === 0) {
    qrDecoderLog.trace('rs-decoder: Euclidean sigmaTilde(0) was zero');
    return null;
  }

  // Normalize so that sigma(0) = 1
  const inverse = gfInv(sigmaTildeAtZero);
  const sigma = polyMultiplyScalar(t, inverse);
  const omega = polyMultiplyScalar(r, inverse);

  qrDecoderLog.trace('rs-decoder: Euclidean algorithm completed', {
    sigmaDegree: polyDegree(sigma),
    omegaDegree: polyDegree(omega),
    sigmaCoeffs: sigma.map((s) => s.toString(16).padStart(2, '0')).join(' '),
    omegaCoeffs: omega.map((o) => o.toString(16).padStart(2, '0')).join(' '),
  });

  return { sigma, omega };
}
