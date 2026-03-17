import { getRSBlocks } from "../encode/rs-blocks";
import type { ECCLevel, RSBlockInfo } from "./bit-mapping.types";
import { eccToNumeric } from "./ecc-to-numeric";

/**
 * Get RS block information for a version and ECC level
 */
export function getRSBlockInfo(version: number, ecc: ECCLevel): RSBlockInfo[] {
  const rsBlocks = getRSBlocks(version, eccToNumeric(ecc));
  return rsBlocks.map((block, index) => ({
    blockIndex: index,
    dataCount: block.dataCount,
    eccCount: block.totalCount - block.dataCount,
    totalCount: block.totalCount,
  }));
}
