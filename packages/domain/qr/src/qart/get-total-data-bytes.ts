import type { ECCLevel } from "./bit-mapping.types";
import { getRSBlockInfo } from "./get-rs-block-info";

/**
 * Get total data capacity in bytes for a version/ECC
 */
export function getTotalDataBytes(version: number, ecc: ECCLevel): number {
  const blocks = getRSBlockInfo(version, ecc);
  return blocks.reduce((sum, b) => sum + b.dataCount, 0);
}
