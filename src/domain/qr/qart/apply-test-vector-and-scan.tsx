import type { ECCLevel } from "./bit-mapping";
import { scanMatrixWithJsQR } from "./scan-matrix-with-js-qr";
import { regenerateQRFromModifiedData } from "./regenerate-qr-from-modified-data";
import type { ScanResult } from "./scan-result";

export function applyTestVectorAndScan(
  testVector: { rsBlockIndex: number; blockBits: Uint8Array },
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
): ScanResult {
  const testBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
  const testBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));

  const blockIdx = testVector.rsBlockIndex;
  for (let byteIdx = 0; byteIdx < testBlockData[blockIdx].length; byteIdx++) {
    testBlockData[blockIdx][byteIdx] ^= testVector.blockBits[byteIdx];
  }
  for (let byteIdx = 0; byteIdx < testBlockEcc[blockIdx].length; byteIdx++) {
    testBlockEcc[blockIdx][byteIdx] ^= testVector.blockBits[blockDataCounts[blockIdx] + byteIdx];
  }

  const testMatrix = regenerateQRFromModifiedData(
    testBlockData,
    testBlockEcc,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask,
  );
  return scanMatrixWithJsQR(testMatrix);
}
