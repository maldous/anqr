/**
 * Reed-Solomon Error Correction Decoder for QR Codes
 *
 * Implements full RS decoding with:
 * - Syndrome calculation
 * - Berlekamp-Massey algorithm for error locator polynomial
 * - Chien search for error locations
 * - Forney algorithm for error magnitudes
 */

import { qrDecoderLog as log } from '../qr-analyzer/logger';

// ============================================
// Galois Field GF(256) Arithmetic
// ============================================

// GF(256) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11d)
// Same as used by the encoder

const GF_EXP = new Uint8Array(512); // α^i for i = 0 to 511 (double size for easy mod)
const GF_LOG = new Uint8Array(256); // log_α(i) for i = 1 to 255

// Initialize GF tables
(function initGFTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    // Multiply by α (which is 2 in this field)
    x <<= 1;
    if (x & 0x100) {
      x ^= 0x11d; // Reduce by primitive polynomial
    }
  }
  // Duplicate for easier mod 255 operations
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
  // GF_LOG[0] is undefined (log of 0 doesn't exist)
  GF_LOG[0] = 0; // Set to 0 for convenience, but should never be used
})();

/**
 * GF(256) addition (XOR)
 * Note: In GF(2^n), addition and subtraction are both XOR
 */
function gfAdd(a: number, b: number): number {
  return a ^ b;
}

/**
 * GF(256) multiplication using log/exp tables
 */
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/**
 * GF(256) division using log/exp tables
 */
function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero in GF(256)');
  if (a === 0) return 0;
  return GF_EXP[(GF_LOG[a] - GF_LOG[b] + 255) % 255];
}

/**
 * GF(256) power: a^n
 * Handles negative exponents and large positive exponents
 */
function gfPow(a: number, n: number): number {
  if (a === 0) return n === 0 ? 1 : 0;
  // Normalize exponent to positive range
  let exp = (GF_LOG[a] * n) % 255;
  if (exp < 0) exp += 255;
  return GF_EXP[exp];
}

/**
 * GF(256) inverse: a^(-1)
 */
function gfInv(a: number): number {
  if (a === 0) throw new Error('Inverse of zero in GF(256)');
  return GF_EXP[255 - GF_LOG[a]];
}

// ============================================
// Polynomial Operations in GF(256)
// Using HIGH-TO-LOW convention like ZXing GenericGFPoly:
// - coefficients[0] = coefficient of highest degree term
// - coefficients[length-1] = constant term (x^0)
// ============================================

/**
 * Get degree of polynomial (high-to-low convention)
 */
function polyDegree(poly: number[]): number {
  if (poly.length === 0) return 0;
  // First non-zero coefficient determines degree
  for (let i = 0; i < poly.length; i++) {
    if (poly[i] !== 0) return poly.length - 1 - i;
  }
  return 0; // Zero polynomial
}

/**
 * Get coefficient of x^degree (high-to-low convention)
 */
function polyGetCoeff(poly: number[], degree: number): number {
  // In high-to-low: coefficient of x^degree is at index (length-1-degree)
  const idx = poly.length - 1 - degree;
  if (idx < 0 || idx >= poly.length) return 0;
  return poly[idx];
}

/**
 * Check if polynomial is zero
 */
function polyIsZero(poly: number[]): boolean {
  return poly.every((c) => c === 0);
}

/**
 * Evaluate polynomial at x (high-to-low convention)
 * Uses Horner's method
 */
function polyEval(poly: number[], x: number): number {
  if (poly.length === 0) return 0;
  if (x === 0) {
    // Return constant term (last coefficient in high-to-low)
    return poly[poly.length - 1];
  }
  // Horner's method for high-to-low: start from highest degree
  let result = poly[0];
  for (let i = 1; i < poly.length; i++) {
    result = gfAdd(gfMul(result, x), poly[i]);
  }
  return result;
}

/**
 * Add/subtract two polynomials (same in GF(2^m))
 * Both in high-to-low convention
 */
function polyAddOrSubtract(p1: number[], p2: number[]): number[] {
  if (polyIsZero(p1)) return [...p2];
  if (polyIsZero(p2)) return [...p1];

  // Smaller degree goes first
  let smaller = p1.length < p2.length ? p1 : p2;
  let larger = p1.length < p2.length ? p2 : p1;

  const result = [...larger];
  const offset = larger.length - smaller.length;
  for (let i = 0; i < smaller.length; i++) {
    result[offset + i] = gfAdd(result[offset + i], smaller[i]);
  }

  // Remove leading zeros
  return polyTrimLeadingZeros(result);
}

/**
 * Remove leading zeros from polynomial (high-to-low convention)
 */
function polyTrimLeadingZeros(poly: number[]): number[] {
  let firstNonZero = 0;
  while (firstNonZero < poly.length - 1 && poly[firstNonZero] === 0) {
    firstNonZero++;
  }
  if (firstNonZero === 0) return poly;
  return poly.slice(firstNonZero);
}

/**
 * Multiply two polynomials (high-to-low convention)
 */
function polyMultiply(p1: number[], p2: number[]): number[] {
  if (polyIsZero(p1) || polyIsZero(p2)) return [0];

  const result = new Array(p1.length + p2.length - 1).fill(0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] = gfAdd(result[i + j], gfMul(p1[i], p2[j]));
    }
  }
  return result;
}

/**
 * Multiply polynomial by scalar (high-to-low convention)
 */
function polyMultiplyScalar(poly: number[], scalar: number): number[] {
  if (scalar === 0) return [0];
  return poly.map((c) => gfMul(c, scalar));
}

/**
 * Multiply polynomial by monomial x^degree * coefficient (high-to-low convention)
 * This shifts the polynomial and scales it
 */
function polyMultiplyByMonomial(poly: number[], degree: number, coeff: number): number[] {
  if (coeff === 0) return [0];
  const result = new Array(poly.length + degree).fill(0);
  for (let i = 0; i < poly.length; i++) {
    result[i] = gfMul(poly[i], coeff);
  }
  return result;
}

/**
 * Build monomial: coefficient * x^degree (high-to-low convention)
 */
function buildMonomial(degree: number, coeff: number): number[] {
  if (coeff === 0) return [0];
  const result = new Array(degree + 1).fill(0);
  result[0] = coeff; // Leading coefficient
  return result;
}

/**
 * Zero polynomial
 */
const POLY_ZERO: number[] = [0];

/**
 * One polynomial (constant 1)
 */
const POLY_ONE: number[] = [1];

// ============================================
// Syndrome Calculation
// ============================================

/**
 * Calculate syndromes for received codeword and build syndrome polynomial
 *
 * For QR codes, the generator polynomial has roots α^0, α^1, ..., α^(numEcc-1)
 * So we calculate S_j = r(α^j) for j = 0 to numEcc-1
 *
 * Following ZXing exactly:
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
function calculateSyndromePolynomial(codeword: number[], numEcc: number): number[] {
  // Treat codeword as polynomial coefficients (high-to-low)
  const syndromeCoeffs = new Array(numEcc).fill(0);
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

    // ZXing stores syndromes in reversed order: S_0 at last index
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

/**
 * Check if syndrome polynomial indicates no errors
 */
function isSyndromeZero(syndromePoly: number[]): boolean {
  return polyIsZero(syndromePoly);
}

// ============================================
// Euclidean Algorithm (ZXing-style)
// ============================================

/**
 * Find error locator (sigma) and error evaluator (omega) polynomials
 * using the Euclidean algorithm, following ZXing's implementation exactly.
 *
 * This is more robust than Berlekamp-Massey as it naturally handles
 * the case of too many errors.
 *
 * @param syndromePoly Syndrome polynomial (high-to-low coefficients)
 * @param numEcc Number of ECC symbols (R = 2t)
 * @returns {sigma, omega} or null if uncorrectable
 */
function runEuclideanAlgorithm(
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
      log('rs-decoder', 'Euclidean: r_{i-1} was zero');
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
      log('rs-decoder', 'Euclidean: Division algorithm failed to reduce polynomial');
      return null;
    }
  }

  // sigma(0) must not be zero
  const sigmaTildeAtZero = polyGetCoeff(t, 0); // Constant term of t
  if (sigmaTildeAtZero === 0) {
    log('rs-decoder', 'Euclidean: sigmaTilde(0) was zero');
    return null;
  }

  // Normalize so that sigma(0) = 1
  const inverse = gfInv(sigmaTildeAtZero);
  const sigma = polyMultiplyScalar(t, inverse);
  const omega = polyMultiplyScalar(r, inverse);

  log('rs-decoder', 'Euclidean algorithm completed', {
    sigmaDegree: polyDegree(sigma),
    omegaDegree: polyDegree(omega),
    sigmaCoeffs: sigma.map((s) => s.toString(16).padStart(2, '0')).join(' '),
    omegaCoeffs: omega.map((o) => o.toString(16).padStart(2, '0')).join(' '),
  });

  return { sigma, omega };
}

// ============================================
// Chien Search (ZXing-style)
// ============================================

/**
 * Find error locations using Chien search
 *
 * Following ZXing's findErrorLocations exactly:
 * 1. Get number of errors from sigma's degree
 * 2. Evaluate sigma at all non-zero field elements (1, 2, ..., 255)
 * 3. When sigma(i) = 0, store inverse(i) as error locator
 *
 * @param sigma Error locator polynomial (high-to-low coefficients from Euclidean)
 * @param n Length of codeword
 * @returns Array of error locator values, or null if wrong number of roots found
 */
function findErrorLocations(sigma: number[], n: number): number[] | null {
  const numErrors = polyDegree(sigma);

  // Shortcut for single error
  if (numErrors === 1) {
    // For sigma = a + bx (high-to-low: [b, a]), root is -a/b = a/b (in GF)
    // The coefficient of x^1 is sigma[0] (high-to-low), constant is sigma[1]
    const coeff1 = polyGetCoeff(sigma, 1); // Coefficient of x^1
    return [coeff1];
  }

  const result: number[] = [];

  log('rs-decoder', 'Chien search starting (ZXing-style)', {
    numErrors,
    n,
    sigmaCoeffs: sigma.map((s) => s.toString(16).padStart(2, '0')).join(' '),
  });

  // Evaluate sigma at all non-zero field elements
  for (let i = 1; i < 256 && result.length < numErrors; i++) {
    if (polyEval(sigma, i) === 0) {
      // Found a root at i, error locator is inverse(i)
      result.push(gfInv(i));

      log('rs-decoder', 'Chien: found root', {
        i,
        errorLocator: gfInv(i).toString(16).padStart(2, '0'),
      });
    }
  }

  if (result.length !== numErrors) {
    log('rs-decoder', 'Chien search: wrong number of roots', {
      expected: numErrors,
      found: result.length,
    });
    return null;
  }

  log('rs-decoder', 'Chien search: found all roots', {
    errorLocators: result.map((e) => e.toString(16).padStart(2, '0')).join(' '),
  });

  return result;
}

// ============================================
// Forney Algorithm (ZXing-style)
// ============================================

/**
 * Calculate error magnitudes using Forney algorithm
 *
 * Following ZXing's findErrorMagnitudes EXACTLY:
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
function findErrorMagnitudes(omega: number[], errorLocators: number[]): number[] {
  const numErrors = errorLocators.length;
  const result: number[] = new Array(numErrors);

  log('rs-decoder', 'Forney: calculating magnitudes (ZXing direct product)', {
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
        // ZXing uses workaround for JVM bug: (term & 0x1) === 0 ? term | 1 : term & ~1
        const termPlus1 = (term & 0x1) === 0 ? term | 1 : term & ~1;
        denominator = gfMul(denominator, termPlus1);
      }
    }

    // Evaluate omega at xiInverse
    const omegaVal = polyEval(omega, xiInverse);

    // magnitude = omega(xiInverse) / denominator
    result[i] = gfMul(omegaVal, gfInv(denominator));

    // For QR codes with generatorBase = 0, NO additional xiInverse multiplication
    // (ZXing only multiplies by xiInverse when generatorBase != 0)

    log('rs-decoder', `Forney: magnitude for error ${i}`, {
      errorLocator: errorLocators[i].toString(16).padStart(2, '0'),
      xiInverse: xiInverse.toString(16).padStart(2, '0'),
      omegaVal: omegaVal.toString(16).padStart(2, '0'),
      denominator: denominator.toString(16).padStart(2, '0'),
      magnitude: result[i].toString(16).padStart(2, '0'),
    });
  }

  return result;
}

// ============================================
// Main Correction Function
// ============================================

/**
 * Correct errors in a single RS block (ZXing-style using Euclidean algorithm)
 *
 * @param codeword The received codeword bytes (data followed by ECC)
 * @param dataCount Number of data codewords
 * @param eccCount Number of ECC codewords
 * @returns Corrected data codewords (without ECC), or null if uncorrectable
 */
export function correctRSBlock(
  codeword: number[],
  dataCount: number,
  eccCount: number
): number[] | null {
  const n = codeword.length;

  if (n !== dataCount + eccCount) {
    log('rs-decoder', 'ERROR: codeword length mismatch', {
      n,
      expected: dataCount + eccCount,
    });
    return null;
  }

  log('rs-decoder', 'Starting RS error correction', {
    n,
    dataCount,
    eccCount,
    maxCorrectableErrors: Math.floor(eccCount / 2),
  });

  // Step 1: Calculate syndrome polynomial (ZXing convention)
  const syndromePoly = calculateSyndromePolynomial(codeword, eccCount);

  log('rs-decoder', 'Syndromes calculated', {
    syndromes: syndromePoly.map((s) => s.toString(16).padStart(2, '0')).join(' '),
    allZero: isSyndromeZero(syndromePoly),
  });

  // If all syndromes are 0, no errors
  if (isSyndromeZero(syndromePoly)) {
    log('rs-decoder', 'No errors detected (all syndromes zero)');
    return codeword.slice(0, dataCount);
  }

  // Step 2: Find error locator and evaluator polynomials using Euclidean algorithm
  const euclideanResult = runEuclideanAlgorithm(syndromePoly, eccCount);

  if (!euclideanResult) {
    log('rs-decoder', 'ERROR: Euclidean algorithm failed');
    return null;
  }

  const { sigma, omega } = euclideanResult;

  log('rs-decoder', 'Error locator polynomial found', {
    degree: polyDegree(sigma),
    coeffs: sigma.map((s) => s.toString(16).padStart(2, '0')).join(' '),
  });

  // Step 3: Find error locations using Chien search
  const errorLocators = findErrorLocations(sigma, n);

  if (!errorLocators) {
    log('rs-decoder', 'ERROR: Chien search failed');
    return null;
  }

  // Step 4: Calculate error magnitudes using Forney algorithm
  const magnitudes = findErrorMagnitudes(omega, errorLocators);

  log('rs-decoder', 'Error magnitudes calculated', {
    magnitudes: magnitudes.map((m) => m.toString(16).padStart(2, '0')).join(' '),
  });

  // Step 5: Apply corrections
  // Position calculation: received.length - 1 - field.log(errorLocator)
  const corrected = [...codeword];
  for (let i = 0; i < errorLocators.length; i++) {
    const position = n - 1 - GF_LOG[errorLocators[i]];
    if (position < 0) {
      log('rs-decoder', 'ERROR: Bad error location', { position, errorLocator: errorLocators[i] });
      return null;
    }

    // In GF(2^m), addition and subtraction are both XOR
    corrected[position] = gfAdd(corrected[position], magnitudes[i]);

    log('rs-decoder', `Corrected position ${position}`, {
      original: codeword[position].toString(16).padStart(2, '0'),
      magnitude: magnitudes[i].toString(16).padStart(2, '0'),
      corrected: corrected[position].toString(16).padStart(2, '0'),
    });
  }

  // Step 6: Verify correction by recalculating syndromes
  const verifySyndromes = calculateSyndromePolynomial(corrected, eccCount);
  if (!isSyndromeZero(verifySyndromes)) {
    log('rs-decoder', 'ERROR: Correction verification failed (syndromes not zero)');
    return null;
  }

  log('rs-decoder', 'Correction verified successfully', {
    errorsFixed: errorLocators.length,
  });

  return corrected.slice(0, dataCount);
}

/**
 * Correct errors in all RS blocks of a QR code
 *
 * @param codewords All codewords (interleaved data + ECC)
 * @param rsBlocks RS block configuration [[numBlocks, totalCount, dataCount], ...]
 * @returns Corrected and de-interleaved data codewords, or null if any block is uncorrectable
 */
export function correctRSCodewords(
  codewords: number[],
  rsBlocks: number[][]
): { dataCodewords: number[]; correctionsMade: number } | null {
  // Build list of block configurations
  const blockConfigs: Array<{ dataCount: number; eccCount: number }> = [];
  for (const blockGroup of rsBlocks) {
    const numBlocks = blockGroup[0];
    const totalCount = blockGroup[1];
    const dataCount = blockGroup[2];
    const eccCount = totalCount - dataCount;

    for (let i = 0; i < numBlocks; i++) {
      blockConfigs.push({ dataCount, eccCount });
    }
  }

  const numBlocks = blockConfigs.length;

  // De-interleave codewords into individual blocks
  // Data codewords are interleaved first, then ECC codewords

  // Find max data and ECC sizes
  const maxDataCount = Math.max(...blockConfigs.map((b) => b.dataCount));
  const maxEccCount = Math.max(...blockConfigs.map((b) => b.eccCount));

  // De-interleave data codewords
  const blockData: number[][] = blockConfigs.map(() => []);
  let idx = 0;

  for (let pos = 0; pos < maxDataCount; pos++) {
    for (let b = 0; b < numBlocks; b++) {
      if (pos < blockConfigs[b].dataCount && idx < codewords.length) {
        blockData[b].push(codewords[idx++]);
      }
    }
  }

  // De-interleave ECC codewords
  const blockEcc: number[][] = blockConfigs.map(() => []);

  for (let pos = 0; pos < maxEccCount; pos++) {
    for (let b = 0; b < numBlocks; b++) {
      if (pos < blockConfigs[b].eccCount && idx < codewords.length) {
        blockEcc[b].push(codewords[idx++]);
      }
    }
  }

  log('rs-decoder', 'De-interleaved into blocks', {
    numBlocks,
    blockDataLengths: blockData.map((d) => d.length).join(','),
    blockEccLengths: blockEcc.map((e) => e.length).join(','),
  });

  // Correct each block
  const correctedBlocks: number[][] = [];
  let totalCorrections = 0;

  for (let b = 0; b < numBlocks; b++) {
    const blockCodeword = [...blockData[b], ...blockEcc[b]];
    const { dataCount, eccCount } = blockConfigs[b];

    log('rs-decoder', `Processing block ${b}`, {
      dataCount,
      eccCount,
      blockLength: blockCodeword.length,
    });

    const corrected = correctRSBlock(blockCodeword, dataCount, eccCount);

    if (corrected === null) {
      log('rs-decoder', `ERROR: Block ${b} is uncorrectable`);
      return null;
    }

    // Count corrections by comparing with original
    for (let i = 0; i < corrected.length; i++) {
      if (corrected[i] !== blockData[b][i]) {
        totalCorrections++;
      }
    }

    correctedBlocks.push(corrected);
  }

  // Concatenate corrected data from all blocks
  const dataCodewords = correctedBlocks.flat();

  log('rs-decoder', 'RS correction complete', {
    totalDataCodewords: dataCodewords.length,
    totalCorrections,
  });

  return { dataCodewords, correctionsMade: totalCorrections };
}
