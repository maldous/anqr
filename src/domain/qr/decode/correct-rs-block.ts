import { qrDecoderLog, calculateSyndromePolynomial, isSyndromeZero, runEuclideanAlgorithm, polyDegree, findErrorLocations, findErrorMagnitudes, applyErrorCorrections } from './rs-decoder._internal';

// ============================================
// Main Correction Function
// ============================================

/**
 * Correct errors in a single RS block using Euclidean algorithm
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
    qrDecoderLog.debug('rs-decoder: Codeword length mismatch', {
      n,
      expected: dataCount + eccCount,
    });
    return null;
  }

  qrDecoderLog.trace('rs-decoder: Starting RS error correction', {
    n,
    dataCount,
    eccCount,
    maxCorrectableErrors: Math.floor(eccCount / 2),
  });

  // Step 1: Calculate syndrome polynomial
  const syndromePoly = calculateSyndromePolynomial(codeword, eccCount);

  qrDecoderLog.trace('rs-decoder: Syndromes calculated', {
    syndromes: syndromePoly.map((s) => s.toString(16).padStart(2, '0')).join(' '),
    allZero: isSyndromeZero(syndromePoly),
  });

  // If all syndromes are 0, no errors
  if (isSyndromeZero(syndromePoly)) {
    qrDecoderLog.trace('rs-decoder: No errors detected (all syndromes zero)');
    return codeword.slice(0, dataCount);
  }

  // Step 2: Find error locator and evaluator polynomials using Euclidean algorithm
  const euclideanResult = runEuclideanAlgorithm(syndromePoly, eccCount);

  if (!euclideanResult) {
    qrDecoderLog.debug('rs-decoder: Euclidean algorithm failed');
    return null;
  }

  const { sigma, omega } = euclideanResult;

  qrDecoderLog.trace('rs-decoder: Error locator polynomial found', {
    degree: polyDegree(sigma),
    coeffs: sigma.map((s) => s.toString(16).padStart(2, '0')).join(' '),
  });

  // Step 3: Find error locations using Chien search
  const errorLocators = findErrorLocations(sigma, n);

  if (!errorLocators) {
    qrDecoderLog.debug('rs-decoder: Chien search failed');
    return null;
  }

  // Step 4: Calculate error magnitudes using Forney algorithm
  const magnitudes = findErrorMagnitudes(omega, errorLocators);

  qrDecoderLog.trace('rs-decoder: Error magnitudes calculated', {
    magnitudes: magnitudes.map((m) => m.toString(16).padStart(2, '0')).join(' '),
  });

  // Step 5: Apply corrections
  const corrected = applyErrorCorrections(codeword, n, errorLocators, magnitudes);
  if (!corrected) return null;

  // Step 6: Verify correction by recalculating syndromes
  const verifySyndromes = calculateSyndromePolynomial(corrected, eccCount);
  if (!isSyndromeZero(verifySyndromes)) {
    qrDecoderLog.debug('rs-decoder: Correction verification failed (syndromes not zero)');
    return null;
  }

  qrDecoderLog.trace('rs-decoder: Correction verified successfully', {
    errorsFixed: errorLocators.length,
  });

  return corrected.slice(0, dataCount);
}
