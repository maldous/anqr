/**
 * QR Generator Dithering Constants
 * Shared constants for high-contrast B&W detection and QR scannability desire ranges.
 * Used by pixel-matrix-dithered.ts, dithering-matrix.ts, and filters-preprocess.ts.
 */

// ============================================
// HIGH-CONTRAST B&W DETECTION
// ============================================

/** Number of histogram buckets for luminance analysis (5-bit, like QR decoder's GlobalHistogramBinarizer). */
export const HISTOGRAM_BUCKETS = 32;
/** Bit shift to convert 8-bit gray to bucket index. */
export const BUCKET_SHIFT = 3;
/** Buckets 0..DARK_REGION_END-1 are considered "dark". */
export const DARK_REGION_END = 8;
/** Buckets LIGHT_REGION_START..31 are considered "light". */
export const LIGHT_REGION_START = 24;
/** Each peak must contain at least this fraction of total pixels. */
export const MIN_PEAK_RATIO = 0.12;
/** Valley (middle region) must contain less than this fraction. */
export const MAX_VALLEY_RATIO = 0.2;
/** Minimum bucket separation between dark and light peaks. */
export const MIN_PEAK_SEPARATION = 16;

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
export const DARK_DESIRE_MAX = 0.95;
export const LIGHT_DESIRE_MIN = 0.05;
export const LIGHT_DESIRE_MAX = 0.45;
