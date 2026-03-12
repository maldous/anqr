import type { ECCLevel } from './bit-mapping';
import { verifyMatrixFormatInfo } from './validation';
import { log } from './log-2';

export function logFormatVerificationDiagnostic(
  matrix: boolean[][],
  ecc: ECCLevel,
  actualMask: number
): void {
  const formatVerification = verifyMatrixFormatInfo(matrix, ecc, actualMask);
  if (formatVerification.valid) {
    log.debug('Base matrix format verification passed', { ecc, mask: actualMask });
  } else {
    log.warn(
      'FORMAT_PARSER_DISAGREEMENT: Base matrix format verification disagreement (diagnostic)',
      {
        expectedEcc: ecc,
        extractedEcc: formatVerification.extractedEcc,
        eccMatch: formatVerification.eccMatch,
        expectedMask: actualMask,
        extractedMask: formatVerification.extractedMask,
        maskMatch: formatVerification.maskMatch,
        parserDisagreement: formatVerification.reason,
        action: 'CONTINUE_TO_SCAN_VALIDATION',
        note: 'Encoder is authoritative. Base matrix scan validation is the real gate.',
      }
    );
  }
}
