import { computeECC } from "./rs-basis";
import { arraysEqual } from "./arrays-equal";
import { log } from "./log";

export function verifyRSLinearityAllBlocks(
  modifiedBlockData: Uint8Array[],
  modifiedBlockEcc: Uint8Array[],
  blockEccCounts: number[],
): boolean {
  let ok = true;
  for (let i = 0; i < modifiedBlockData.length; i++) {
    const expectedEcc = computeECC(modifiedBlockData[i], blockEccCounts[i]);
    const actualEcc = modifiedBlockEcc[i];
    if (arraysEqual(expectedEcc, actualEcc)) {
      log.debug("RS linearity verified for modified block", { blockIndex: i });
    } else {
      ok = false;
      log.warn("RS LINEARITY BROKEN - modified codeword is invalid!", {
        blockIndex: i,
        dataCount: modifiedBlockData[i].length,
        eccCount: blockEccCounts[i],
        expectedEccFirst5: Array.from(expectedEcc.slice(0, 5)),
        actualEccFirst5: Array.from(actualEcc.slice(0, 5)),
        modifiedDataFirst5: Array.from(modifiedBlockData[i].slice(0, 5)),
      });
    }
  }
  if (ok) {
    log.info("RS linearity preserved - all modified codewords are valid");
  } else {
    log.warn("RS LINEARITY CHECK FAILED - QR code will likely not scan!");
  }
  return ok;
}
