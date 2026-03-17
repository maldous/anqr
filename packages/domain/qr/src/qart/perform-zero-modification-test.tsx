import type { ECCLevel } from "./bit-mapping";
import { log } from "./log";
import { scanMatrixWithJsQR } from "./scan-matrix-with-js-qr";
import { regenerateQRFromModifiedData } from "./regenerate-qr-from-modified-data";

export function performZeroModificationTest(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  encodedData: string,
): void {
  const zeroModMatrix = regenerateQRFromModifiedData(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask,
  );
  const zeroModScan = scanMatrixWithJsQR(zeroModMatrix);
  if (zeroModScan.success) {
    const matchesData = zeroModScan.data === encodedData;
    if (matchesData) {
      log.debug("Zero-modification test PASSED - decoded data matches exactly", {
        decodedData: zeroModScan.data,
      });
    } else {
      log.warn("Zero-modification test FAILED - decoded data mismatch!", {
        decodedData: zeroModScan.data,
        expectedData: encodedData,
      });
    }
  } else {
    log.warn("ZERO-MODIFICATION TEST FAILED - regeneration itself is broken!", {
      error: zeroModScan.error,
    });
  }
}
