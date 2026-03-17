import { type ECCLevel, verifyMatrixFormatInfo } from "./validation";
import { validateByteExactPrefix } from "./validate-byte-exact-prefix";
import type { CandidateValidation } from "./candidate-validation";

export function validateCandidate(
  scan: { success: boolean; data?: string },
  matrix: boolean[][],
  expectedData: string,
  expectedEcc: ECCLevel | undefined,
  expectedMask: number | undefined,
  strictSuffix: boolean,
): CandidateValidation {
  if (!scan.success) {
    return {
      isValid: false,
      validation: {
        valid: false,
        reason: "SCAN_FAILED",
        description: "not scanned",
        hardGateFailed: true,
      },
    };
  }

  const validation = validateByteExactPrefix(scan.data, expectedData, strictSuffix);
  if (!validation.valid) {
    return { isValid: false, validation };
  }

  if (expectedEcc !== undefined && expectedMask !== undefined) {
    const formatVerification = verifyMatrixFormatInfo(matrix, expectedEcc, expectedMask);
    if (!formatVerification.valid) {
      return {
        isValid: false,
        validation: {
          valid: false,
          reason: formatVerification.reason || "ECC_MISMATCH",
          description: `Format info mismatch: ECC ${formatVerification.extractedEcc} vs ${expectedEcc}, mask ${formatVerification.extractedMask} vs ${expectedMask}`,
          hardGateFailed: true,
        },
        formatVerification,
      };
    }
    return { isValid: true, validation, formatVerification };
  }

  return { isValid: true, validation };
}
