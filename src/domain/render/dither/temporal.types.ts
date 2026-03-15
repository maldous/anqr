// ============================================================================
// Temporal Dither Mode Types and Utilities
// ============================================================================

/**
 * Temporal dithering modes:
 * - 'off': No temporal dithering (static pattern)
 * - 'blue_noise': Uses golden ratio-based offsets for optimal temporal distribution
 * - 'flicker_safe': Uses carefully chosen offsets that minimize perceived flicker
 */
export type TemporalDitherMode = 'off' | 'blue_noise' | 'flicker_safe';
