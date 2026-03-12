import { log } from './log-2';
import { countDataDiffs } from './count-data-diffs';
import { countChangedBytes } from './count-changed-bytes';

export function logBlockModificationSummary(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockEccArrays: Uint8Array[],
  modifiedBlockEcc: Uint8Array[]
): void {
  for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
    const origData = blockDataArrays[blockIdx];
    const modData = modifiedBlockData[blockIdx];
    const origEcc = blockEccArrays[blockIdx];
    const modEcc = modifiedBlockEcc[blockIdx];

    const { bytesChanged, bitsChanged } = countDataDiffs(origData, modData);
    const eccBytesChanged = countChangedBytes(origEcc, modEcc);

    if (bytesChanged > 0 || eccBytesChanged > 0) {
      log.debug('Block modification summary', {
        blockIndex: blockIdx,
        dataBytesChanged: bytesChanged,
        dataBitsChanged: bitsChanged,
        eccBytesChanged,
        totalDataBytes: origData.length,
        totalEccBytes: origEcc.length,
      });
    }
  }
}
