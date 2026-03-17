import { createLogger } from "../../../../observability/logging/src";
import { readCodewords } from "./decode";
import { unmaskMatrix } from "./format";
import { correctRSCodewords } from "./rs-decoder";

const qrDecoderLog = createLogger("DECODER");

export function attemptRSCorrectionWithFallback(
  rawMatrix: boolean[][],
  moduleCount: number,
  rsBlocks: number[][],
  formatMaskPattern: number,
): { rsResult: { dataCodewords: number[]; correctionsMade: number }; usedMask: number } | null {
  const matrix = unmaskMatrix(rawMatrix, formatMaskPattern, moduleCount);
  const codewords = readCodewords(matrix, moduleCount);
  qrDecoderLog.trace("main: Read codewords", { count: codewords.length });

  let rsResult = correctRSCodewords(codewords, rsBlocks);
  let usedMask = formatMaskPattern;

  if (rsResult === null) {
    qrDecoderLog.trace("main: RS error correction failed with detected mask, trying fallback");

    for (let testMask = 0; testMask < 8; testMask++) {
      if (testMask === formatMaskPattern) continue;

      const testMatrix = unmaskMatrix(rawMatrix, testMask, moduleCount);
      const testCodewords = readCodewords(testMatrix, moduleCount);
      const testRsResult = correctRSCodewords(testCodewords, rsBlocks);

      if (testRsResult !== null) {
        qrDecoderLog.trace("main: Mask fallback SUCCESS", {
          originalMask: formatMaskPattern,
          workingMask: testMask,
          corrections: testRsResult.correctionsMade,
        });
        rsResult = testRsResult;
        usedMask = testMask;
        break;
      }
    }

    if (rsResult === null) {
      qrDecoderLog.trace(
        "main: Failed - RS error correction failed (too many errors, all masks tried)",
      );
      return null;
    }
  }

  return { rsResult, usedMask };
}
