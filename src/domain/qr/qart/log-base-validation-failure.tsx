import { log } from "./log";
import type { BinarySearchValidationResult } from "./binary-search-validation-result";

export function logBaseValidationFailure(
  decodedData: string | undefined,
  expectedData: string,
  baseValidation: BinarySearchValidationResult,
): void {
  const decoded = decodedData || "";
  const expectedHexDump = Array.from(expectedData.slice(0, 32))
    .map((c) => c.codePointAt(0)!.toString(16).padStart(2, "0"))
    .join(" ");
  const decodedHexDump = Array.from(decoded.slice(0, 32))
    .map((c) => c.codePointAt(0)!.toString(16).padStart(2, "0"))
    .join(" ");

  log.warn("Base matrix (0 vectors) validation FAILED - encoding bug!", {
    rejectionReason: baseValidation.reason,
    description: baseValidation.description,
    expectedData,
    expectedDataLength: expectedData.length,
    decodedData,
    decodedLength: decodedData?.length,
    mismatchIndex: baseValidation.mismatchIndex,
    expectedByte: baseValidation.expectedByte?.toString(16),
    actualByte: baseValidation.actualByte?.toString(16),
  });

  log.warn("BYTE-LEVEL COMPARISON (first 32 bytes)", {
    expectedHex: expectedHexDump,
    decodedHex: decodedHexDump,
    mismatchIndex: baseValidation.mismatchIndex,
  });
}
