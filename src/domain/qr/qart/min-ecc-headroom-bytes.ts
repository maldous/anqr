/**
 * Minimum number of ECC headroom bytes to reserve.
 * This ensures we don't run at 100% ECC correction capacity,
 * which would cause any small error to break decoding.
 *
 * Set low (2) because the binary search fallback in scan-fallback.ts
 * automatically finds the maximum safe vector count for phone cameras.
 */
export const MIN_ECC_HEADROOM_BYTES = 2;
