import { calculateECCDamage } from "./calculate-ecc-damage";
import { log } from "./log";

export function estimateBlockECCDamage(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockEccCounts: number[],
): { anyBlockOverBudget: boolean; blockDamage: Array<{ changed: number; safeLimit: number }> } {
  let anyBlockOverBudget = false;
  const blockDamage: Array<{ changed: number; safeLimit: number }> = [];

  for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
    const eccDamage = calculateECCDamage(
      blockDataArrays[blockIdx],
      modifiedBlockData[blockIdx],
      blockEccCounts[blockIdx],
    );

    blockDamage.push({ changed: eccDamage.changedCodewords, safeLimit: eccDamage.safeLimit });

    if (eccDamage.isOverBudget) {
      anyBlockOverBudget = true;
    }

    log.info("ECC DAMAGE ESTIMATE", {
      blockIndex: blockIdx,
      eccCount: blockEccCounts[blockIdx],
      changedDataCodewords: eccDamage.changedCodewords,
      changedTotalCodewords: eccDamage.changedCodewords,
      safeLimit: eccDamage.safeLimit,
      isOverBudget: eccDamage.isOverBudget,
      percentOfBudget:
        eccDamage.safeLimit > 0
          ? `${((eccDamage.changedCodewords / eccDamage.safeLimit) * 100).toFixed(1)}%`
          : "N/A",
    });
  }

  return { anyBlockOverBudget, blockDamage };
}
