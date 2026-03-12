import type { BitPixelMapping } from './bit-mapping';

export function buildBlockBitToPixelTables(mappings: BitPixelMapping[]): Array<Int32Array | undefined> {
  const blockMaxBitKeys: number[] = [];
  for (const mapping of mappings) {
    const bitKey = mapping.posInBlock * 8 + mapping.bitInByte;
    const existing = blockMaxBitKeys[mapping.rsBlockIndex];
    if (existing === undefined || bitKey > existing) {
      blockMaxBitKeys[mapping.rsBlockIndex] = bitKey;
    }
  }

  const tables: Array<Int32Array | undefined> = new Array(blockMaxBitKeys.length);
  for (let blockIndex = 0; blockIndex < blockMaxBitKeys.length; blockIndex++) {
    const maxBitKey = blockMaxBitKeys[blockIndex];
    if (maxBitKey === undefined) continue;
    const table = new Int32Array(maxBitKey + 1);
    table.fill(-1);
    tables[blockIndex] = table;
  }
  for (const mapping of mappings) {
    const table = tables[mapping.rsBlockIndex];
    if (!table) continue;
    table[mapping.posInBlock * 8 + mapping.bitInByte] = mapping.pixelIndex;
  }

  return tables;
}
