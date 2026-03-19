import { createLogger } from "@/domain/logging";
import { readCodewords } from "./decode";
import { unmaskMatrix } from "./format";
import { rsRootabilityFor } from "./rs-rootability";
import type { ECCLevelChar } from "../qr-decoder/types";

const qrDecoderLog = createLogger("DECODER");

export function runMaskRootabilitySweep(
  rawMatrix: boolean[][],
  moduleCount: number,
  versionRounded: number,
  diagEccChar: ECCLevelChar,
): void {
  const maskSweep: Array<{
    mask: number;
    codewords: number;
    blocks: Array<{ b: number; nz: number; deg: number; roots: number }>;
  }> = [];
  for (let m = 0; m <= 7; m++) {
    const unmasked = unmaskMatrix(rawMatrix, m, moduleCount);
    const cw = readCodewords(unmasked, moduleCount);
    const rs = rsRootabilityFor(cw, versionRounded, diagEccChar);
    maskSweep.push({
      mask: m,
      codewords: cw.length,
      blocks: rs.map((b) => ({
        b: b.blockIndex,
        nz: b.syndromeNonZeroCount,
        deg: b.bmDegree,
        roots: b.chienRootsFound,
      })),
    });
  }
  qrDecoderLog.trace("diag: RS rootability sweep (masks 0..7)", {
    version: versionRounded,
    ecc: diagEccChar,
    maskSweep,
  });
}
