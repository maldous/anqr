import type { ECCLevel } from './bit-mapping';
import { extractFormatInfo, verifyMatrixFormatInfo } from './validation';
import { log } from './log-2';
import { validateTimingPatterns } from './validate-timing-patterns';
import { validateFinderPatterns } from './validate-finder-patterns';
import { analyzeMatrixDiff } from './analyze-matrix-diff';

export function validateFinalMatrixDiagnostics(
  finalMatrix: boolean[][],
  baseMatrix: boolean[][],
  ecc: ECCLevel,
  actualMask: number,
  moduleCount: number
): {
  structuralDiffCount: number;
  dataDiffCount: number;
  finderValidation: ReturnType<typeof validateFinderPatterns>;
  timingValidation: ReturnType<typeof validateTimingPatterns>;
  baseFormatInfo: ReturnType<typeof extractFormatInfo>;
  finalFormatInfo: ReturnType<typeof extractFormatInfo>;
} {
  const finalFormatVerification = verifyMatrixFormatInfo(finalMatrix, ecc, actualMask);
  if (finalFormatVerification.valid) {
    log.info('Final matrix format verification passed (diagnostic)', {
      ecc,
      mask: actualMask,
      eccMatch: finalFormatVerification.eccMatch,
      maskMatch: finalFormatVerification.maskMatch,
    });
  } else {
    log.warn(
      'FORMAT_PARSER_DISAGREEMENT: Final matrix format verification disagreement (diagnostic)',
      {
        expectedEcc: ecc,
        extractedEcc: finalFormatVerification.extractedEcc,
        eccMatch: finalFormatVerification.eccMatch,
        expectedMask: actualMask,
        extractedMask: finalFormatVerification.extractedMask,
        maskMatch: finalFormatVerification.maskMatch,
        parserDisagreement: finalFormatVerification.reason,
        action: 'CONTINUE_TO_SEMANTIC_VALIDATION',
        note: 'Encoder is authoritative. Semantic scan validation is the real gate.',
      }
    );
  }

  const matrixDiff = analyzeMatrixDiff(baseMatrix, finalMatrix, moduleCount);
  const { diffCount, structuralDiffCount, dataDiffCount, sampleDiffs } = matrixDiff;

  log.info('Matrix diff between base and final', {
    diffCount,
    structuralDiffCount,
    dataDiffCount,
    moduleCount,
    totalModules: moduleCount * moduleCount,
    diffPercent: `${((diffCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    sampleDiffs: sampleDiffs.slice(0, 5),
  });

  if (structuralDiffCount > 0) {
    log.warn('CRITICAL: Structural patterns modified!', {
      structuralDiffCount,
      structuralDiffs: sampleDiffs.filter((d) => d.isStructural),
    });
  }

  const finderValidation = validateFinderPatterns(finalMatrix);
  if (finderValidation.allValid) {
    log.debug('Finder patterns validated OK');
  } else {
    log.warn('FINDER PATTERNS CORRUPTED', {
      topLeft: finderValidation.topLeft,
      topRight: finderValidation.topRight,
      bottomLeft: finderValidation.bottomLeft,
      errors: finderValidation.errors,
    });
  }

  const timingValidation = validateTimingPatterns(finalMatrix);
  if (timingValidation.allValid) {
    log.debug('Timing patterns validated OK');
  } else {
    log.warn('TIMING PATTERNS CORRUPTED', {
      horizontal: timingValidation.horizontal,
      vertical: timingValidation.vertical,
      errors: timingValidation.errors,
    });
  }

  const baseFormatInfo = extractFormatInfo(baseMatrix);
  const finalFormatInfo = extractFormatInfo(finalMatrix);

  log.info('Format info comparison', {
    base: {
      vertical: baseFormatInfo.vertical.toString(2).padStart(15, '0'),
      horizontal: baseFormatInfo.horizontal.toString(2).padStart(15, '0'),
      match: baseFormatInfo.match,
    },
    final: {
      vertical: finalFormatInfo.vertical.toString(2).padStart(15, '0'),
      horizontal: finalFormatInfo.horizontal.toString(2).padStart(15, '0'),
      match: finalFormatInfo.match,
    },
    formatInfoUnchanged:
      baseFormatInfo.vertical === finalFormatInfo.vertical &&
      baseFormatInfo.horizontal === finalFormatInfo.horizontal,
  });

  if (
    baseFormatInfo.vertical !== finalFormatInfo.vertical ||
    baseFormatInfo.horizontal !== finalFormatInfo.horizontal
  ) {
    log.warn('FORMAT INFO CHANGED - This will break scanning!');
  }

  return {
    structuralDiffCount,
    dataDiffCount,
    finderValidation,
    timingValidation,
    baseFormatInfo,
    finalFormatInfo,
  };
}
