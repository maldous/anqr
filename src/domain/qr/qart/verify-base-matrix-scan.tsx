import { validateOriginalDataPreserved } from "./validate-original-data-preserved";
import { log } from "./log";
import { scanMatrixWithJsQR } from "./scan-matrix-with-js-qr";

export function verifyBaseMatrixScan(
  baseMatrix: boolean[][],
  data: string,
  originalDataLength: number,
): string | null {
  const baseVerificationScan = scanMatrixWithJsQR(baseMatrix);
  if (baseVerificationScan.success) {
    const baseValidation = validateOriginalDataPreserved(baseVerificationScan.data, data);
    if (baseValidation.valid) {
      log.info("BASE MATRIX VERIFICATION PASSED (byte-exact)", {
        originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
        decodedDataLength: baseVerificationScan.data?.length,
        suffixPresent: (baseVerificationScan.data?.length ?? 0) > originalDataLength,
        validationMethod: "BYTE_EXACT_PREFIX",
      });
      return null;
    }
    log.warn("BASE MATRIX VERIFICATION FAILED - byte-exact validation failed!", {
      expectedOriginal: data,
      actualDecodedData: baseVerificationScan.data,
      validationReason: baseValidation.reason,
      mismatchDetails: baseValidation.mismatch,
    });
    return `Base matrix byte-exact validation failed: ${baseValidation.reason}`;
  }
  log.warn("BASE MATRIX VERIFICATION FAILED - base matrix does not scan!", {
    error: baseVerificationScan.error,
  });
  return `Base matrix does not scan: ${baseVerificationScan.error}`;
}
