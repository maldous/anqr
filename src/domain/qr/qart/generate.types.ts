/**
 * Encoder-derived semantic layout - these are the ACTUAL bit positions
 * from the encoder's bit buffer, NOT calculated from data.length.
 *
 * This is critical because the actual encoder may:
 * - Use different segment modes
 * - Place terminators differently
 * - Have different interleaving patterns
 *
 * We MUST derive protection boundaries from what the encoder actually did.
 *
 * HYBRID STRATEGY: We track BOTH original data and suffix separately:
 * - Original data (URL) is PROTECTED - cannot be modified
 * - Suffix (after #) is CONTROLLABLE - can be freely modified
 * - Padding codewords are also CONTROLLABLE
 *
 * CRITICAL FIX: The mutable region is split into TWO SEPARATE BYTE-ALIGNED INTERVALS:
 * 1. Suffix BYTES only (complete bytes, not including the boundary byte with terminator)
 * 2. Padding codeword BYTES only (the 0xEC 0x11 pattern)
 *
 * The GAP between these intervals (terminator + pad-to-byte) is PROTECTED and NEVER modified.
 * This prevents the decoder from seeing fake mode indicators when terminator bits flip.
 */
export type { EncoderDerivedLayout } from "./encoder-derived-layout.interface";

/**
 * Configuration for full QR-Art generation
 *
 * HYBRID STRATEGY: Original data is protected, suffix + padding are controllable.
 *
 * The algorithm adds a URL fragment suffix (#xxxxxx...) that:
 * - Does NOT affect the URL destination (fragments are client-side only)
 * - Provides many more controllable bits for better image quality
 * - Can be freely modified without corrupting the message
 *
 * Protection boundaries:
 * - PROTECTED: mode indicator + character count + original data bytes
 * - CONTROLLABLE: suffix bytes + padding codewords
 *
 * This ensures the BASE URL is always preserved, while maximizing QR-Art control.
 */
export type { QArtPerformanceProfile } from "./qart-performance-profile.type";
export type { FullQArtConfig } from "./full-qart-config.interface";

/**
 * Result of full QR-Art generation
 */
export type { FullQArtResult } from "./full-qart-result.interface";
