import {ECCLevel, H, RSBlock, RS_BLOCKS_CACHE, RS_BLOCK_TABLE, blocks, eccLevel, for, i, j} from '../shared';

export function getRSBlocks(version: number, eccLevel: ECCLevel): RSBlock[] {
  const eccIndex = { L: 0, M: 1, Q: 2, H: 3 }[eccLevel];
  const cacheKey = (version << 2) | (eccIndex & 3);
  const cached = RS_BLOCKS_CACHE.get(cacheKey);
  if (cached) return cached;

  const tableIndex = (version - 1) * 4 + eccIndex;
  const rsBlock = RS_BLOCK_TABLE[tableIndex];
  
  if (!rsBlock) return [];
  
  const blocks: RSBlock[] = [];
  const length = rsBlock.length / 3;
  
  for (let i = 0; i < length; i++) {
    const count = rsBlock[i * 3 + 0];
    const totalCount = rsBlock[i * 3 + 1];
    const dataCount = rsBlock[i * 3 + 2];
    
    for (let j = 0; j < count; j++) {
      blocks.push({ totalCount, dataCount });
    }
  }
  
  RS_BLOCKS_CACHE.set(cacheKey, blocks);
  return blocks;
}

