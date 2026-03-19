import type { ECCLevelChar } from "../qr-decoder/types";
import { ECC_LEVEL_MAP } from "../qr-decoder/types";

/**
 * Get ECC level character from format info
 */
export function getECCLevelChar(eccLevel: number): ECCLevelChar {
  return ECC_LEVEL_MAP[eccLevel] || "M";
}
