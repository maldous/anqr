import type { RSBlockInfo } from './bit-mapping.types';
import type { InterleavingEntry } from './interleaving-entry';

export function buildInterleavingMap(rsBlockInfo: RSBlockInfo[]): InterleavingEntry[] {
  const map: InterleavingEntry[] = [];
  const maxDataCount = Math.max(...rsBlockInfo.map((b) => b.dataCount));
  const maxEccCount = Math.max(...rsBlockInfo.map((b) => b.eccCount));

  for (let i = 0; i < maxDataCount; i++) {
    for (let blockIdx = 0; blockIdx < rsBlockInfo.length; blockIdx++) {
      if (i < rsBlockInfo[blockIdx].dataCount) {
        map.push({ rsBlockIndex: blockIdx, posInBlock: i, isData: true });
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let blockIdx = 0; blockIdx < rsBlockInfo.length; blockIdx++) {
      if (i < rsBlockInfo[blockIdx].eccCount) {
        map.push({
          rsBlockIndex: blockIdx,
          posInBlock: rsBlockInfo[blockIdx].dataCount + i,
          isData: false,
        });
      }
    }
  }

  return map;
}
