import type { ECCLevel } from "./bit-mapping.types";
import { getRSBlockInfo } from "./get-rs-block-info";

/**
 * Get total codewords (data + ECC) for a version/ECC
 */
export function getTotalCodewords(version: number, ecc: ECCLevel): number {
  const blocks = getRSBlockInfo(version, ecc);
  return blocks.reduce((sum, b) => sum + b.totalCount, 0);
}
