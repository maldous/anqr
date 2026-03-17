import type { FormatInfo } from "@/modules/qr-decoder/types";
import { ECC_LEVEL_MAP } from "@/modules/qr-decoder/types";
import { findBestFormatMatch } from "./find-best-format-match";
import { initFormatTable } from "./init-format-table";
import { qrDecoderLog } from "./qr-decoder-log";
import { readFormatBitsCopy1 } from "./read-format-bits-copy1";
import { readFormatBitsCopy2 } from "./read-format-bits-copy2";

/**
 * Read format info from the matrix
 * Format info is stored in two locations for redundancy
 *
 * The encoder writes format bits as follows (from setupTypeInfo in encoder.ts):
 *
 * Copy 1 (around top-left finder):
 *   - Vertical (column 8): bits 0-5 at rows 0-5, bits 6-7 at rows 7-8
 *   - Horizontal (row 8): bit 8 at col 7, bits 9-14 at cols 5-0
 *
 * Copy 2 (around top-right and bottom-left finders):
 *   - Horizontal (row 8): bits 0-7 at cols N-1 to N-8
 *   - Vertical (column 8): bits 8-14 at rows N-7 to N-1
 */
export function readFormatInfo(matrix: boolean[][], moduleCount: number): FormatInfo | null {
  initFormatTable();

  const copy1 = readFormatBitsCopy1(matrix);
  const copy2 = readFormatBitsCopy2(matrix, moduleCount);
  const bits1 = copy1.bits;
  const bits2 = copy2.bits;

  qrDecoderLog.trace("format: Read format bits with trace", {
    bits1: bits1.toString(2).padStart(15, "0"),
    bits2: bits2.toString(2).padStart(15, "0"),
    bits1Hex: `0x${bits1.toString(16).padStart(4, "0")}`,
    bits2Hex: `0x${bits2.toString(16).padStart(4, "0")}`,
    moduleCount,
    trace1: copy1.trace.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(" "),
    trace2: copy2.trace.map((t) => `bit${t.bit}:(${t.row},${t.col})=${t.value ? 1 : 0}`).join(" "),
  });

  const best = findBestFormatMatch(bits1, bits2);

  if (best.match) {
    const eccChar = ECC_LEVEL_MAP[best.match.eccLevel];
    qrDecoderLog.trace("format: Decoded format info", {
      eccLevel: best.match.eccLevel,
      eccChar,
      maskPattern: best.match.maskPattern,
      hammingDistance: best.distance,
      hammingDistCopy1: best.distCopy1,
      hammingDistCopy2: best.distCopy2,
      usedCopy: best.fromCopy,
    });
  } else {
    qrDecoderLog.trace("format: Failed to decode format info", {
      bits1: bits1.toString(2).padStart(15, "0"),
      bits2: bits2.toString(2).padStart(15, "0"),
      bits1Hex: `0x${bits1.toString(16).padStart(4, "0")}`,
      bits2Hex: `0x${bits2.toString(16).padStart(4, "0")}`,
    });
  }

  return best.match;
}
