export type {
  EncoderDerivedLayout,
  QArtPerformanceProfile,
  FullQArtConfig,
  FullQArtResult,
} from "./generate.types";
export { matrixToQRLike } from "./matrix-to-qr-like";
export { generateFullQArt } from "./generate-full-q-art";
export { generateFullQArtBestMask } from "./generate-full-q-art-best-mask";
export { generateFullQArtBestRotation } from "./generate-full-q-art-best-rotation";
export { generateFullQArtOptimal } from "./generate-full-q-art-optimal";

// Re-export BitRange for use in EncoderDerivedLayout
export type { BitRange } from "./semantic-layout";
// Re-export validation utilities for backwards compatibility
export {
  type ECCLevel,
  eccNumericToLevel,
  extractFormatInfo,
  extractMaskFromMatrix,
  type FormatVerificationResult,
  type RejectionReason,
  readFormatInfoFromDecoder,
  type SemanticValidationResult,
  VALID_SUFFIX_CHARS,
  validateNumericSuffix,
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from "./validation";
