import type { RejectionHistogram } from "./scan-fallback.types";
/**
 * Create an empty rejection histogram
 */
export function createRejectionHistogram(): RejectionHistogram {
  return {
    SCAN_FAILED: 0,
    LENGTH_TOO_SHORT: 0,
    BYTE_MISMATCH: 0,
    ECC_MISMATCH: 0,
    MASK_MISMATCH: 0,
    SUFFIX_CHARSET_INVALID: 0,
    ACCEPTED: 0,
    total: 0,
  };
}
