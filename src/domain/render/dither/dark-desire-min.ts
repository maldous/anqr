import { DARK_DESIRE_MAX } from './dark-desire-max';

// ============================================
// QR SCANNABILITY DESIRE RANGES
// ============================================

/**
 * Soft-clamp ranges for QR scannability in dithered output.
 * Dark modules are clamped to [DARK_DESIRE_MIN, DARK_DESIRE_MAX] so the
 * majority of sub-pixels stay dark. Light modules use the LIGHT_* pair.
 *
 * These tight ranges are used by module-level dithering (scale=1, dithering-matrix.ts)
 * where each module is a single pixel and there is no sub-pixel safety net.
 */
export const DARK_DESIRE_MIN = 0.55;
