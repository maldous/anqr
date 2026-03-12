import { type ECCLevel } from './bit-mapping';
import { type BitRange } from './semantic-layout';

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
export interface EncoderDerivedLayout {
  /** Bits after writing mode indicator (should be 4) */
  bitsAfterMode: number;
  /** Bits after writing character count */
  bitsAfterCharCount: number;
  /** Bits after writing ORIGINAL data only (before suffix) - THIS IS THE PROTECTION BOUNDARY */
  bitsAfterOriginalData: number;
  /** Bits after writing all segment data including suffix (before terminator) */
  bitsAfterData: number;
  /** Bits after adding terminator (0-4 bits) */
  bitsAfterTerminator: number;
  /** Bits after padding to byte boundary */
  bitsAfterPadToByte: number;
  /** Byte index where padding codewords (0xEC 0x11) start */
  paddingStartByte: number;
  /** Total data bytes capacity */
  totalDataBytes: number;
  /** Number of padding codeword bytes */
  paddingByteCount: number;
  /** Length of original data (without suffix) */
  originalDataLength: number;
  /** Length of suffix (0 if no suffix). For numeric mode, this is digits only. */
  suffixLength: number;
  /** Suffix encoding mode */
  suffixMode: 'byte' | 'numeric';
  /** Protected bit range (mode + charCount + original data bytes only) */
  protectedBitEnd: number;

  // =========================================================================
  // TWO-INTERVAL SAFE MUTATION REGIONS (byte-aligned, excludes terminator)
  // =========================================================================

  /** INTERVAL 1: Safe suffix bit range start (byte-aligned, after protection) */
  suffixSafeStartBit: number;
  /** INTERVAL 1: Safe suffix bit range end (byte-aligned, before terminator boundary byte) */
  suffixSafeEndBit: number;
  /** INTERVAL 2: Safe padding bit range start (byte-aligned, after pad-to-byte) */
  paddingSafeStartBit: number;
  /** INTERVAL 2: Safe padding bit range end (byte-aligned, end of data capacity) */
  paddingSafeEndBit: number;

  /** The GAP between suffix and padding that contains terminator + pad-to-byte (PROTECTED) */
  gapStartBit: number;
  /** End of the protected gap */
  gapEndBit: number;
  /** Number of bits in the protected gap (terminator + pad-to-byte) */
  gapBitCount: number;

  /** The two allowed bit ranges for mutation (suffix bytes + padding bytes) */
  allowedBitRanges: BitRange[];

  // Legacy fields (kept for backwards compatibility)
  /** @deprecated Use suffixSafeStartBit instead */
  allowedBitStart: number;
  /** @deprecated Use paddingSafeEndBit instead */
  allowedBitEnd: number;
  /** Number of controllable suffix bits (in safe range only) */
  suffixBits: number;
  /** Number of controllable padding bits */
  paddingBits: number;
}

// EncoderDerivedLayout is already exported via its interface declaration above

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
export type QArtPerformanceProfile = 'quality' | 'balanced';

export interface FullQArtConfig {
  /** The data to encode (URL or text) - the original content that will be protected */
  data: string;
  /** Target image as ImageData, HTMLCanvasElement, or OffscreenCanvas */
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  /** QR version (1-40), 0 for auto with slack calculation */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Mask pattern (0-7), -1 for auto */
  maskPattern: number;
  /** Progress callback */
  onProgress?: (stage: string, percent: number) => void;
  /**
   * Optional suffix to append to the data.
   *
   * For suffixMode = "byte": include the leading '#' (e.g. "#ABC123").
   * For suffixMode = "numeric": provide digits only (e.g. "123456").
   */
  suffix?: string;
  /**
   * Suffix encoding mode.
   * - "numeric": mixed-mode encoding (byte prefix + numeric suffix).
   * - "byte": single byte-mode segment (legacy).
   * - "auto": prefer numeric for URLs, otherwise byte.
   */
  suffixMode?: 'numeric' | 'byte' | 'auto';
  /**
   * Whether to auto-generate a suffix when none is provided (default: true).
   *
   * When true: Automatically adds a fragment suffix to fill QR capacity.
   * When false: Only padding bits are controllable (very limited).
   */
  autoSuffix?: boolean;
  /**
   * Minimum number of padding codewords required for QR-Art manipulation.
   * A larger version will be selected if needed to achieve this many padding bytes.
   * Default: 10 (lower than before since suffix provides most control)
   *
   * More padding = more controllable pixels = better image quality.
   * Set to 0 to use the minimum version that fits the data.
   */
  minPadCodewords?: number;
  /**
   * Force a specific QR version regardless of data size.
   * Overrides minPadCodewords calculation.
   * Useful for consistent sizing or when you know the exact version needed.
   */
  forceVersion?: number;
  /**
   * Target control percentage for auto-suffix generation (default: 100).
   * A larger QR version may be selected to achieve this control level,
   * unless lockVersionToMinimum is enabled.
   * Higher values = more controllable pixels = better image quality.
   */
  targetControlPercent?: number;
  /**
   * Number of full search attempts (different deterministic suffix seeds).
   * Higher values improve chances of cleaner artwork at higher compute cost.
   */
  searchAttempts?: number;
  /**
   * Base seed used when exploring multiple search attempts.
   * Keeps results deterministic for same inputs.
   */
  searchSeed?: number;
  /**
   * If true and version=0, lock to the minimum version that fits the payload
   * and only adjust suffix length within that version (no auto-upgrade).
   */
  lockVersionToMinimum?: boolean;
  /**
   * Whether to enforce strict suffix charset validation (default: true).
   *
   * When true (default, recommended for real-world scanning):
   * - Suffix must contain only URL-safe characters (byte mode)
   * - Numeric mode requires digits only
   *
   * When false:
   * - Suffix bytes can be ANY byte value (including non-printable)
   * - May produce more visually accurate QR-Art
   * - Risk of binary garbage in the decoded URL suffix
   */
  strictSuffix?: boolean;
  /**
   * Performance profile for QR-Art compute.
   * - "quality": maximize visual matching (higher compute cost)
   * - "balanced": reduce compute for faster previews with stable scan quality
   */
  performanceProfile?: QArtPerformanceProfile;
}

/**
 * Result of full QR-Art generation
 */
export interface FullQArtResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The final QR matrix (true = dark) */
  matrix: boolean[][];
  /** Module count (size of matrix) */
  moduleCount: number;
  /** Actual version used */
  version: number;
  /** Actual mask pattern used */
  maskPattern: number;
  /** Number of pixels matching target */
  matchingPixels: number;
  /** Total controllable pixels */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
  /** The full data that was encoded (original + suffix) */
  encodedData: string;
  /** The original data (URL/text) that was protected */
  originalData?: string;
  /** The suffix that was added (if any) */
  suffix?: string;
}
