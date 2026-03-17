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
