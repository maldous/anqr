import { log } from "./log";
import { checkBlockByteViolations } from "./check-block-byte-violations";

export function verifyProtectedBytes(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockAllowedBits: Map<number, Set<number>>,
): {
  valid: boolean;
  violations: Array<{
    blockIdx: number;
    byteIdx: number;
    original: number;
    modified: number;
    localBitStart: number;
  }>;
} {
  const violations: Array<{
    blockIdx: number;
    byteIdx: number;
    original: number;
    modified: number;
    localBitStart: number;
  }> = [];

  for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
    const originalData = blockDataArrays[blockIdx];
    const modifiedData = modifiedBlockData[blockIdx];
    const allowedBitsInBlock = blockAllowedBits.get(blockIdx) || new Set<number>();

    checkBlockByteViolations(blockIdx, originalData, modifiedData, allowedBitsInBlock, violations);

    const firstProtectedBytes = Math.min(24, originalData.length);
    log.debug("BLOCK HEAD BYTES (orig vs mod)", {
      blockIdx,
      blockDataBytes: originalData.length,
      allowedBitsCount: allowedBitsInBlock.size,
      origHead: Array.from(originalData.slice(0, firstProtectedBytes)),
      modHead: Array.from(modifiedData.slice(0, firstProtectedBytes)),
    });
  }

  return { valid: violations.length === 0, violations };
}
